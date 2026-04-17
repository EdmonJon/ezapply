<?php

namespace App\Http\Controllers;

use App\Models\Affiliation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AffiliationController extends Controller
{
    /**
     * Display the affiliations form.
     */
    public function index()
    {
        $user = Auth::user();
        $affiliations = $user->affiliations ?? collect();
        
        return Inertia::render('Applicant/Affiliations', [
            'affiliations' => $affiliations
        ]);
    }

    /**
     * Store or update affiliations.
     */
    public function store(Request $request)
    {
        $request->validate([
            'institution' => 'required|string|max:255',
            'position' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $affiliation = $user->affiliations()->create([
            'institution' => $request->institution,
            'position' => $request->position,
        ]);

        return response()->json($affiliation);
    }

        public function update(Request $request, $id)
    {
        $request->validate([
            'institution' => 'required|string|max:255',
            'position' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $affiliation = $user->affiliations()->findOrFail($id);
        $affiliation->update($request->only('institution', 'position'));

        return response()->json($affiliation);
    }
    
        public function destroy($id)
    {
        $user = Auth::user();

        $affiliation = $user->affiliations()->findOrFail($id);

        $affiliation->delete();

        return response()->json(['message' => 'Affiliation deleted successfully']);
    }
}
