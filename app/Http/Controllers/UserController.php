<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\UserCredit;
use App\Models\CreditTransaction;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
    $search = $request->input('search');
    $roleFilter = $request->input('role');

    $usersQuery = User::with(['roles', 'basicInfo.address'])->latest();

    if ($search) {
        $usersQuery->whereHas('basicInfo', function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%");
        })->orWhere('email', 'like', "%{$search}%");
    }

    if ($roleFilter && $roleFilter !== 'all') {
    $usersQuery->whereHas('roles', function ($q) use ($roleFilter) {
        $q->where('name', $roleFilter);
    });
}

    $users = $usersQuery->paginate(5)->withQueryString()->through(fn($user) => [
        'id'          => $user->id,
        'first_name'  => $user->basicInfo->first_name ?? '',
        'last_name'   => $user->basicInfo->last_name ?? '',
        'email'       => $user->email,
        'phone_number'=> $user->basicInfo->phone ?? '',
        'address'     => $user->basicInfo->address->full_address ?? '',
        'roles'       => $user->roles->pluck('name')->join(', ') ?: '—', 
        'created_at'  => $user->created_at->format('d-m-Y'),
    ]);

    $roles = Role::pluck('name'); 

    return Inertia::render('Users/index', [
        'users'   => $users,
        'roles'   => $roles,
        'filters' => $request->only(['search', 'role']),
    ]);
}



    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/create', [
            'roles' => Role::all()->pluck('name')
        ]);
    }

    /**
     * Store a newly created resource in storage.
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
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|confirmed|min:8',
    ]);

    $user = User::create([
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    $address = UserAddress::create([
        'user_id' => $user->id,
        'region_code' => $request->input('users_address.region_code'),
        'region_name' => $request->input('users_address.region_name'),
        'province_code' => $request->input('users_address.province_code'),
        'province_name' => $request->input('users_address.province_name'),
        'citymun_code' => $request->input('users_address.citymun_code'),
        'citymun_name' => $request->input('users_address.citymun_name'),
        'barangay_code' => $request->input('users_address.barangay_code'),
        'barangay_name' => $request->input('users_address.barangay_name'),
    ]);

    $user->basicInfo()->create([
        'first_name' => $request->first_name,
        'last_name' => $request->last_name,
        'birth_date' => $request->birth_date,
        'phone' => $request->phone,
        'Facebook' => $request->Facebook,
        'LinkedIn' => $request->LinkedIn,
        'Viber' => $request->Viber,
        'address_id' => $address->id,
    ]);

    if ($request->has('roles') && count($request->roles) > 0) {
        $user->syncRoles($request->roles);
    }

    // If the admin created a company user, ensure they receive the signup bonus credits
    if ($user->hasRole('company') && !$user->credit) {
        UserCredit::create([
            'user_id' => $user->id,
            'balance' => 200,
        ]);

        CreditTransaction::create([
            'user_id'    => $user->id,
            'amount'     => 200,
            'type'       => 'signup_bonus',
            'description'=> 'Welcome bonus for new company user (admin-created)',
        ]);
    }

    return to_route('users.index')->with('message', 'User Created Successfully');
}


    /**
     * Display the specified resource.
     */
public function show($id)
{
    $company = Company::with(['agents', 'marketing', 'background', 'requirements', 'opportunity', 'documents', 'user'])
        ->findOrFail($id);

    $users = User::where('role', 'agent')->select('id', 'name', 'email')->get();

    return inertia('Company/CompanyFullDetails', [
        'company' => $company,
        'users' => $users, 
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
        return Inertia::render('Users/edit', [
            'user' => $user->load(['roles', 'basicInfo', 'address']),
            'roles' => Role::all()->pluck('name')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, User $user)
{
    $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'birth_date' => 'required|date',
        'phone_number' => 'required|string|max:20',
        'facebook' => 'nullable|string|max:255',
        'linkedin' => 'nullable|string|max:255',
        'viber' => 'nullable|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'roles' => 'required|array',
        'password' => 'nullable|string|min:6|confirmed',
        'region_code' => 'required|string',
        'region_name' => 'required|string',
        'province_code' => 'required|string',
        'province_name' => 'required|string',
        'citymun_code' => 'required|string',
        'citymun_name' => 'required|string',
        'barangay_code' => 'required|string',
        'barangay_name' => 'required|string',
    ]);

    $user->update([
        'email' => $request->email,
    ]);

    if ($user->basicInfo) {
    $user->basicInfo->update([
        'first_name' => $request->first_name,
        'last_name' => $request->last_name,
        'birth_date' => $request->birth_date,
        'phone' => $request->phone_number,
        'Facebook' => $request->facebook,
        'LinkedIn' => $request->linkedin,
        'Viber' => $request->viber,
    ]);
}

    if ($user->address) {
        $user->address->update([
            'region_code' => $request->region_code,
            'region_name' => $request->region_name,
            'province_code' => $request->province_code,
            'province_name' => $request->province_name,
            'citymun_code' => $request->citymun_code,
            'citymun_name' => $request->citymun_name,
            'barangay_code' => $request->barangay_code,
            'barangay_name' => $request->barangay_name,
        ]);
    }

    if ($request->filled('password')) {
        $user->update([
            'password' => Hash::make($request->password),
        ]);
    }

    $user->syncRoles($request->roles);

    if ($user->hasRole('company') && !$user->credit) {
        UserCredit::create([
            'user_id' => $user->id,
            'balance' => 200,
        ]);

        CreditTransaction::create([
            'user_id'    => $user->id,
            'amount'     => 200,
            'type'       => 'signup_bonus',
            'description'=> 'Welcome bonus for new company user (role change)',
        ]);
    }

    return to_route('users.index')->with('message', 'User updated successfully.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function searchAgents(Request $request)
    {
    $users = User::with('basicInfo', 'roles')
        ->get()
        ->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->basicInfo 
                      ? $user->basicInfo->first_name . ' ' . $user->basicInfo->last_name 
                      : $user->email, 
            'email' => $user->email,
            'role' => $user->getPrimaryRoleAttribute()?->name,
        ]);

    return response()->json($users);
    }
    public function destroy(User $user)
    {
        $user->delete();
        return to_route('users.index')->with('message', 'User Deleted Successfully');
    }
}
