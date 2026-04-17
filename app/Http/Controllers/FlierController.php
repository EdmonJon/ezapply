<?php

namespace App\Http\Controllers;

use App\Models\Flier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FlierController extends Controller
{
    // Company — view their fliers
    public function index()
    {
        $user = Auth::user();
        $companyIds = $user->companies()->pluck('id');

        $fliers = Flier::whereIn('company_id', $companyIds)
            ->with('company')
            ->latest()
            ->get();

        $companies = $user->companies()->select('id', 'company_name')->get();

        return Inertia::render('Flier/Index', [
            'fliers'    => $fliers,
            'companies' => $companies,
        ]);
    }

    // Company — show create form
    public function create()
    {
        $user = Auth::user();
        $companies = $user->companies()->select('id', 'company_name')->get();

        return Inertia::render('Flier/Create', [
            'companies' => $companies,
        ]);
    }

    // Company — store new flier
    public function store(Request $request)
    {
        $request->validate([
            'company_id'  => 'required|exists:companies,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'file'        => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:10240',
        ]);

        $file     = $request->file('file');
        $mime     = $file->getMimeType();
        $fileType = $mime === 'application/pdf' ? 'pdf' : 'image';
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/fliers'), $filename);
        $filePath = 'uploads/fliers/' . $filename;

        Flier::create([
            'user_id'     => Auth::id(),
            'company_id'  => $request->company_id,
            'title'       => $request->title,
            'description' => $request->description,
            'file_path'   => $filePath,
            'file_type'   => $fileType,
            'status'      => 'pending',
        ]);

        return redirect()->route('fliers.index')
            ->with('success', 'Flier submitted for approval.');
    }

    // Company — delete flier
    public function destroy(Flier $flier)
    {
        abort_unless($flier->user_id === Auth::id(), 403);
        Storage::disk('public')->delete($flier->file_path);
        $flier->delete();
        return back()->with('success', 'Flier deleted.');
    }

    // Admin — view all fliers
    public function adminIndex()
    {
        $fliers = Flier::with(['company', 'user'])
            ->latest()
            ->get();

        return Inertia::render('Flier/AdminIndex', [
            'fliers' => $fliers,
        ]);
    }

    // Admin — approve flier
    public function approve(Flier $flier)
    {
        $flier->update(['status' => 'approved', 'rejection_reason' => null]);
        return back()->with('success', 'Flier approved.');
    }

    // Admin — reject flier
    public function reject(Request $request, Flier $flier)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $flier->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        return back()->with('success', 'Flier rejected.');
    }

    // Admin — delete flier
    public function adminDestroy(Flier $flier)
    {
        Storage::disk('public')->delete($flier->file_path);
        $flier->delete();
        return back()->with('success', 'Flier removed.');
    }
}