<?php
 
namespace App\Http\Controllers;
 
use App\Models\Advertisement;
use App\Models\Company;
use App\Models\Credit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
 
class AdvertisementController extends Controller
{
    const DAILY_COST_IMAGE = 200;
    const DAILY_COST_VIDEO = 300;
    const DAILY_COST_PDF   = 200;
 
    const PLACEMENTS = [
        'homepage_hero'   => 'Homepage Hero Banner',
        'sidebar'         => 'Sidebar',
        'search_results'  => 'Search Results Top',
        'franchise_list'  => 'Franchise Listings',
    ];
 
    // Company — view their ads
    public function index()
    {
        $user = Auth::user();
        $companyIds = $user->companies()->pluck('id');
 
        $ads = Advertisement::whereIn('company_id', $companyIds)
            ->with('company')
            ->latest()
            ->get();
 
        $balance = $user->credit?->balance ?? 0;
        $companies = $user->companies()->select('id', 'company_name')->get();
 
        return Inertia::render('Advertisement/Index', [
            'ads'        => $ads,
            'balance'    => $balance,
            'companies'  => $companies,
            'placements' => self::PLACEMENTS,
        ]);
    }
 
    // Company — show create form
    public function create()
    {
        $user = Auth::user();
        $balance  = $user->credit?->balance ?? 0;
        $companies = $user->companies()->select('id', 'company_name')->get();
 
        return Inertia::render('Advertisement/Create', [
            'balance'    => $balance,
            'companies'  => $companies,
            'placements' => self::PLACEMENTS,
            'pricing'    => [
                'image' => self::DAILY_COST_IMAGE,
                'video' => self::DAILY_COST_VIDEO,
                'pdf'   => self::DAILY_COST_PDF,
            ],
        ]);
    }
 
    // Company — store new ad
    public function store(Request $request)
    {
        $request->validate([
            'company_id'  => 'required|exists:companies,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'file'        => 'required|file|mimes:jpg,jpeg,png,gif,mp4,pdf|max:51200',
            'placement'   => 'required|string',
            'start_date'  => 'required|date|after_or_equal:today',
            'end_date'    => 'required|date|after:start_date',
        ]);
 
        $file     = $request->file('file');
        $mime     = $file->getMimeType();
        $fileType = str_contains($mime, 'video') ? 'video'
                  : (str_contains($mime, 'pdf')  ? 'pdf' : 'image');
 
        $dailyCost = $fileType === 'video'
            ? self::DAILY_COST_VIDEO
            : self::DAILY_COST_IMAGE;
 
        $days          = now()->parse($request->start_date)->diffInDays($request->end_date) + 1;
        $estimatedCost = $dailyCost * $days;
        $filePath      = $file->store('advertisements', 'public');
 
        Advertisement::create([
            'user_id'              => Auth::id(),
            'company_id'           => $request->company_id,
            'title'                => $request->title,
            'description'          => $request->description,
            'file_path'            => $filePath,
            'file_type'            => $fileType,
            'placement'            => $request->placement,
            'start_date'           => $request->start_date,
            'end_date'             => $request->end_date,
            'daily_cost'           => $dailyCost,
            'estimated_total_cost' => $estimatedCost,
            'status'               => 'pending',
        ]);
 
        return redirect()->route('advertisements.index')
            ->with('success', 'Advertisement submitted for approval.');
    }
 
    // Company — edit ad (only if pending)
    public function edit(Advertisement $advertisement)
    {
        abort_unless($advertisement->user_id === Auth::id(), 403);
        abort_unless($advertisement->status === 'pending', 403, 'Only pending ads can be edited.');
 
        $companies = Auth::user()->companies()->select('id', 'company_name')->get();
 
        return Inertia::render('Advertisement/Edit', [
            'ad'         => $advertisement,
            'companies'  => $companies,
            'placements' => self::PLACEMENTS,
            'pricing'    => [
                'image' => self::DAILY_COST_IMAGE,
                'video' => self::DAILY_COST_VIDEO,
                'pdf'   => self::DAILY_COST_PDF,
            ],
        ]);
    }
 
    // Company — update ad
    public function update(Request $request, Advertisement $advertisement)
    {
        abort_unless($advertisement->user_id === Auth::id(), 403);
        abort_unless($advertisement->status === 'pending', 403);
 
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'file'        => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,pdf|max:51200',
            'placement'   => 'required|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
        ]);
 
        $fileType  = $advertisement->file_type;
        $filePath  = $advertisement->file_path;
        $dailyCost = $advertisement->daily_cost;
 
        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($filePath);
            $file      = $request->file('file');
            $mime      = $file->getMimeType();
            $fileType  = str_contains($mime, 'video') ? 'video'
                       : (str_contains($mime, 'pdf')  ? 'pdf' : 'image');
            $dailyCost = $fileType === 'video'
                ? self::DAILY_COST_VIDEO
                : self::DAILY_COST_IMAGE;
            $filePath  = $file->store('advertisements', 'public');
        }
 
        $days          = now()->parse($request->start_date)->diffInDays($request->end_date) + 1;
        $estimatedCost = $dailyCost * $days;
 
        $advertisement->update([
            'title'                => $request->title,
            'description'          => $request->description,
            'file_path'            => $filePath,
            'file_type'            => $fileType,
            'placement'            => $request->placement,
            'start_date'           => $request->start_date,
            'end_date'             => $request->end_date,
            'daily_cost'           => $dailyCost,
            'estimated_total_cost' => $estimatedCost,
        ]);
 
        return redirect()->route('advertisements.index')
            ->with('success', 'Advertisement updated.');
    }
 
    // Company — delete ad
    public function destroy(Advertisement $advertisement)
    {
        abort_unless($advertisement->user_id === Auth::id(), 403);
        Storage::disk('public')->delete($advertisement->file_path);
        $advertisement->delete();
 
        return back()->with('success', 'Advertisement deleted.');
    }
 
    // Admin — view all ads
    public function adminIndex()
    {
        $ads = Advertisement::with(['company', 'user'])
            ->latest()
            ->get();
 
        return Inertia::render('Advertisement/AdminIndex', [
            'ads' => $ads,
        ]);
    }
 
    // Admin — approve ad
    public function approve(Advertisement $advertisement)
    {
        $advertisement->update(['status' => 'active']);
        return back()->with('success', 'Advertisement approved.');
    }
 
    // Admin — reject ad
    public function reject(Advertisement $advertisement)
    {
        $advertisement->update(['status' => 'rejected']);
        return back()->with('success', 'Advertisement rejected.');
    }
 
    // Admin — remove ad
    public function adminDestroy(Advertisement $advertisement)
    {
        Storage::disk('public')->delete($advertisement->file_path);
        $advertisement->delete();
        return back()->with('success', 'Advertisement removed.');
    }
}