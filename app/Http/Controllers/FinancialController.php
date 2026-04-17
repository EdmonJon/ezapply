<?php

namespace App\Http\Controllers;

use App\Models\Financial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinancialController extends Controller
{
    /**
     * Display the financial info form.
     */
    public function index()
    {
        $user = Auth::user();
        $financial = $user->financial;
        
        return Inertia::render('Applicant/FinancialInfo', [
            'financial' => $financial
        ]);
    }

    /**
     * Store or update financial info.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'income_source' => 'required|string|max:255',
            'monthly_income' => 'required|numeric|min:0',
            'other_income'      => 'nullable|string|max:1000',
            'monthly_expenses'  => 'required|numeric|min:0',
            'existing_loans'    => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        
        $user->financial()->updateOrCreate(
            ['user_id' => $user->id],
           $validated
        );

        return redirect()->back()->with('success', 'Financial information saved successfully!');
    }
}
