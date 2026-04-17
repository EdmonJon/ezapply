<?php

namespace App\Http\Controllers;

use App\Models\CompanyRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyRatingController extends Controller
{
    // Get the current user's ratings and average ratings for all companies
    public function index()
    {
        $userRatings = CompanyRating::where('user_id', Auth::id())
            ->pluck('rating', 'company_id');

        $averages = CompanyRating::selectRaw('company_id, AVG(rating) as avg_rating, COUNT(*) as total')
            ->groupBy('company_id')
            ->get()
            ->keyBy('company_id');

        return response()->json([
            'userRatings' => $userRatings,
            'averages' => $averages,
        ]);
    }

    // Submit or update a rating
    public function rate(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'rating' => 'required|integer|min:0|max:5',
        ]);

        if ($request->rating === 0) {
            CompanyRating::where('user_id', Auth::id())
                ->where('company_id', $request->company_id)
                ->delete();
        } else {
            CompanyRating::updateOrCreate(
                ['user_id' => Auth::id(), 'company_id' => $request->company_id],
                ['rating' => $request->rating]
            );
        }

        $avg = CompanyRating::where('company_id', $request->company_id)->avg('rating');
        $total = CompanyRating::where('company_id', $request->company_id)->count();

        return response()->json(['avg_rating' => $avg ?? 0, 'total' => $total]);
    }
}