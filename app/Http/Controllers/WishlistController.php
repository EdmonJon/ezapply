<?php

namespace App\Http\Controllers;
use App\Models\Wishlist;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WishlistController extends Controller
{
    /**
     * Get all wishlisted company IDs for the current user.
     */
    public function getWishlistIds()
    {
        $ids = Wishlist::where('user_id', Auth::id())->pluck('company_id');
        return response()->json($ids);
    }

    /**
     * Toggle wishlist status for a company.
     */
    public function toggle(Request $request)
    {
        $request->validate(['company_id' => 'required|exists:companies,id']);

        $userId = Auth::id();
        $companyId = $request->company_id;

        $existing = Wishlist::where('user_id', $userId)->where('company_id', $companyId)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['wishlisted' => false]);
        }

        Wishlist::create(['user_id' => $userId, 'company_id' => $companyId]);
        return response()->json(['wishlisted' => true]);
    }

    /**
     * Show the wishlist page with all saved companies.
     */
    public function index()
    {
        $companies = Wishlist::where('user_id', Auth::id())
            ->with(['company.opportunity', 'company.marketing', 'company.background', 'company.requirements'])
            ->get()
            ->pluck('company')
            ->filter()
            ->values();

        return Inertia::render('Applicant/Wishlist', [
            'companies' => $companies,
        ]);
    }
}
