<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'phone' => 'required|string|max:20',
            'Facebook' => 'nullable|string|max:255',
            'LinkedIn' => 'nullable|string|max:255',
            'Viber' => 'nullable|string|max:255',
            'users_address' => 'required|array',
            'users_address.region_code' => 'required|string',
            'users_address.region_name' => 'required|string',
            'users_address.province_code' => 'required|string',
            'users_address.province_name' => 'required|string',
            'users_address.citymun_code' => 'required|string',
            'users_address.citymun_name' => 'required|string',
            'users_address.barangay_code' => 'required|string',
            'users_address.barangay_name' => 'required|string',
        ];
    }
}
