<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class CustomerProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // These depend on your actual relationships or queries
        
        $basicInfoController = new BasicInfoController();
        [$basicInfo, $address] = $basicInfoController->getBasicInfo($user);
        $affiliations = $user->affiliations ?? [];
        $financial = $user->financial ?? null;
        $attachments = $user->attachments ?? [];

        return Inertia::render('Applicant/CustomerProfile', [
            'basicInfo' => $basicInfo,
            'address'   => $address,
            'affiliations'=> $user->affiliations,
            'financial'   => $user->financial,
            'attachments' => $user->attachments,
        ]);
    }
}