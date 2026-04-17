<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\BasicInfo;
use App\Models\UserAddress;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $basicInfo = $user->basicInfo;
        $address = $user->address;

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'basicInfo' => $basicInfo,
            'address' => $address,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Update user email if changed
        $user->fill($request->only(['email']));
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        // Create or update address
        $address = UserAddress::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_id' => $user->id,
                'region_code' => $request->input('users_address.region_code'),
                'province_code' => $request->input('users_address.province_code'),
                'citymun_code' => $request->input('users_address.citymun_code'),
                'barangay_code' => $request->input('users_address.barangay_code'),
                'region_name' => $request->input('users_address.region_name'),
                'province_name' => $request->input('users_address.province_name'),
                'citymun_name' => $request->input('users_address.citymun_name'),
                'barangay_name' => $request->input('users_address.barangay_name'),
            ]
        );

        // Create or update basic info
        $basicInfo = $user->basicInfo()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'birth_date' => Carbon::parse($request->birth_date)->format('Y-m-d'),
                'phone' => $request->phone,
                'Facebook' => $request->Facebook,
                'LinkedIn' => $request->LinkedIn,
                'Viber' => $request->Viber,
                'address_id' => $address->id,
            ]
        );

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
