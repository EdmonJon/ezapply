<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            // Optionally, pass the 'redirect' parameter to the Inertia page
            // so your login component could also display it or use it for client-side redirects if needed.
            'redirect' => $request->query('redirect'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // 1. Check for the 'redirect' query parameter first
        $redirectUrl = $request->query('redirect');

        if ($redirectUrl) {
            // Decode the URL in case it contains special characters
            return redirect(urldecode($redirectUrl));
        }

        // 2. If no 'redirect' parameter, then use your role-based logic
        $user = Auth::user();
        if ($user->role === 'customer') {
            return redirect()->intended('/'); // Fallback for customers
        }

        return redirect()->intended(route('dashboard', absolute: false)); // Fallback for others
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}