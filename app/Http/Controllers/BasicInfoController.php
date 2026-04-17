<?php

namespace App\Http\Controllers;

use App\Models\BasicInfo;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BasicInfoController extends Controller
{

    public function getBasicInfo($user)
    {
        $basicInfo = $user->basicInfo;
        $address   = $user->address;

        return [$basicInfo, $address];
    }
    
    /**
     * Display the basic info form.
     */
    public function index()
    {
        $user = Auth::user();
        $basicInfo = $user->basicInfo;
        $address = $user->address;
        
        return Inertia::render('Applicant/BasicInfo', [
            'basicInfo' => $basicInfo,
            'address' => $address
        ]);
    }

    /**
     * Store or update basic info.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'phone' => 'required|string|max:20',
            'Facebook' => 'nullable|string|max:255',
            'LinkedIn' => 'nullable|string|max:255',
            'Viber' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'users_address' => 'required|array',
            'users_address.region_code' => 'required|string',
            'users_address.region_name' => 'required|string',
            'users_address.province_code' => 'required|string',
            'users_address.province_name' => 'required|string',
            'users_address.citymun_code' => 'required|string',
            'users_address.citymun_name' => 'required|string',
            'users_address.barangay_code' => 'required|string',
            'users_address.barangay_name' => 'required|string',
        ]);

        $user = Auth::user();
        
        // Create or update address
        
        $address = UserAddress::updateOrCreate(
            ['user_id' => $user->id],
        
    [
        // You can use user_id if you want one address per user, or a composite key
        'user_id' => $user->id,
        'region_code'   => $request -> input('users_address.region_code'),
        'province_code' => $request -> input('users_address.province_code'),
        'citymun_code'  => $request -> input('users_address.citymun_code'),
        'barangay_code' => $request -> input('users_address.barangay_code'),
        'region_name'   => $request -> input('users_address.region_name'),
        'province_name' => $request -> input('users_address.province_name'),
        'citymun_name'  => $request -> input('users_address.citymun_name'),
        'barangay_name' => $request -> input('users_address.barangay_name'),
    ]
);
        // Create or update basic info
        $basicInfo = $user->basicInfo()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'birth_date' => $request->birth_date,
                'phone' => $request->phone,
                'Facebook' => $request->Facebook,
                'LinkedIn' => $request->LinkedIn,
                'Viber' => $request->Viber,
                'address_id' => $address->id,
            ]
        );

        return redirect()->back()->with('success', 'Basic information saved successfully!');
    }
}
