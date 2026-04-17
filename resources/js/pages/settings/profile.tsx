import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status, basicInfo, address }: { mustVerifyEmail: boolean; status?: string; basicInfo?: any; address?: any }) {
    const { auth } = usePage<SharedData>().props;

    const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
    const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
    const [citiesMunicipalities, setCitiesMunicipalities] = useState<{ code: string; name: string }[]>([]);
    const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

    const [addressData, setAddressData] = useState({
        region_code: address?.region_code || '',
        region_name: address?.region_name || '',
        province_code: address?.province_code || '',
        province_name: address?.province_name || '',
        citymun_code: address?.citymun_code || '',
        citymun_name: address?.citymun_name || '',
        barangay_code: address?.barangay_code || '',
        barangay_name: address?.barangay_name || '',
    });

    useEffect(() => {
        fetch('/psgc/regions')
            .then(res => res.json())
            .then(data => {
                setRegions(data.map((region: any) => ({ code: region.code, name: region.name })));
            })
            .catch(err => console.error('Error fetching regions:', err));
    }, []);

    useEffect(() => {
        if (addressData.region_code) {
            fetch(`/psgc/regions/${addressData.region_code}/provinces`)
                .then(res => res.json())
                .then(data => {
                    setProvinces(data.map((province: any) => ({ code: province.code, name: province.name })));
                })
                .catch(err => console.error('Error fetching provinces:', err));
        } else {
            setProvinces([]);
        }
    }, [addressData.region_code]);

    useEffect(() => {
        if (addressData.province_code) {
            fetch(`/psgc/provinces/${addressData.province_code}/cities-municipalities`)
                .then(res => res.json())
                .then(data => {
                    setCitiesMunicipalities(data.map((city: any) => ({ code: city.code, name: city.name })));
                })
                .catch(err => console.error('Error fetching cities:', err));
        } else {
            setCitiesMunicipalities([]);
        }
    }, [addressData.province_code]);

    useEffect(() => {
        if (addressData.citymun_code) {
            fetch(`/psgc/cities-municipalities/${addressData.citymun_code}/barangays`)
                .then(res => res.json())
                .then(data => {
                    setBarangays(data.map((barangay: any) => ({ code: barangay.code, name: barangay.name })));
                })
                .catch(err => console.error('Error fetching barangays:', err));
        } else {
            setBarangays([]);
        }
    }, [addressData.citymun_code]);

    const handleRegionChange = (regionCode: string) => {
        const selectedRegion = regions.find(region => region.code === regionCode);
        setAddressData({
            ...addressData,
            region_code: regionCode,
            region_name: selectedRegion?.name || '',
            province_code: '',
            province_name: '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
        });
        setProvinces([]);
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleProvinceChange = (provinceCode: string) => {
        const selectedProvince = provinces.find(province => province.code === provinceCode);
        setAddressData({
            ...addressData,
            province_code: provinceCode,
            province_name: selectedProvince?.name || '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
        });
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleCityMunicipalityChange = (cityMunCode: string) => {
        const selectedCity = citiesMunicipalities.find(city => city.code === cityMunCode);
        setAddressData({
            ...addressData,
            citymun_code: cityMunCode,
            citymun_name: selectedCity?.name || '',
            barangay_code: '',
            barangay_name: '',
        });
        setBarangays([]);
    };

    const handleBarangayChange = (barangayCode: string) => {
        const selectedBarangay = barangays.find(barangay => barangay.code === barangayCode);
        setAddressData({
            ...addressData,
            barangay_code: barangayCode,
            barangay_name: selectedBarangay?.name || '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="User Profile" description="Update your name and email address" />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>

                                    <Input
                                        id="first_name"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.first_name || ''}
                                        name="first_name"
                                        required
                                        autoComplete="first-name"
                                        placeholder="First name"
                                    />

                                    <InputError className="mt-2" message={errors.last_name} />
                                </div>

                                    <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>

                                    <Input
                                        id="last_name"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.last_name || ''}
                                        name="last_name"
                                        required
                                        autoComplete="family-name"
                                        placeholder="Last name"
                                    />

                                    <InputError className="mt-2" message={errors.last_name} />
                                </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="birth_date">Birth Date</Label>

                                    <Input
                                        id="birth_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.birth_date ? new Date(basicInfo.birth_date).toISOString().split('T')[0] : ''}
                                        name="birth_date"
                                        required
                                        autoComplete="bday"
                                        placeholder="Birth date"
                                    />

                                    <InputError className="mt-2" message={errors.birth_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>

                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.phone || ''}
                                        name="phone"
                                        required
                                        autoComplete="tel"
                                        placeholder="Phone number"
                                    />

                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="Facebook">Facebook</Label>

                                    <Input
                                        id="Facebook"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.Facebook || ''}
                                        name="Facebook"
                                        autoComplete="url"
                                        placeholder="Facebook profile URL"
                                    />

                                    <InputError className="mt-2" message={errors.Facebook} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="LinkedIn">LinkedIn</Label>

                                    <Input
                                        id="LinkedIn"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.LinkedIn || ''}
                                        name="LinkedIn"
                                        autoComplete="url"
                                        placeholder="LinkedIn profile URL"
                                    />

                                    <InputError className="mt-2" message={errors.LinkedIn} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="Viber">Viber</Label>

                                    <Input
                                        id="Viber"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.Viber || ''}
                                        name="Viber"
                                        autoComplete="tel"
                                        placeholder="Viber number"
                                    />

                                    <InputError className="mt-2" message={errors.Viber} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Address</Label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Region</Label>
                                            <Select
                                                value={addressData.region_code}
                                                onValueChange={handleRegionChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {regions.map(region => (
                                                        <SelectItem key={region.code} value={region.code}>
                                                            {region.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors['users_address.region_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[region_code]"
                                                value={addressData.region_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[region_name]"
                                                value={addressData.region_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>Province</Label>
                                            <Select
                                                value={addressData.province_code}
                                                onValueChange={handleProvinceChange}
                                                disabled={!addressData.region_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Province" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {provinces.map(province => (
                                                        <SelectItem key={province.code} value={province.code}>
                                                            {province.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors['users_address.province_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[province_code]"
                                                value={addressData.province_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[province_name]"
                                                value={addressData.province_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>City/Municipality</Label>
                                            <Select
                                                value={addressData.citymun_code}
                                                onValueChange={handleCityMunicipalityChange}
                                                disabled={!addressData.province_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select City/Municipality" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {citiesMunicipalities.map(city => (
                                                        <SelectItem key={city.code} value={city.code}>
                                                            {city.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors['users_address.citymun_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[citymun_code]"
                                                value={addressData.citymun_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[citymun_name]"
                                                value={addressData.citymun_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>Barangay</Label>
                                            <Select
                                                value={addressData.barangay_code}
                                                onValueChange={handleBarangayChange}
                                                disabled={!addressData.citymun_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Barangay" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {barangays.map(barangay => (
                                                        <SelectItem key={barangay.code} value={barangay.code}>
                                                            {barangay.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors['users_address.barangay_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[barangay_code]"
                                                value={addressData.barangay_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[barangay_name]"
                                                value={addressData.barangay_name}
                                            />
                                        </div>
                                    </div>
                                </div>
                                 
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>

                                <div
                                    id="role"
                                    name="role"
                                    className="border rounded-md px-3 py-2 h-11 border-gray-300 bg-gray-50 text-sm flex items-center"
                                    tabIndex={3}
                                >
                                    <span className="text-gray-700 font-medium">
                                        {auth.user.roles[0]?.name}
                                    </span>
                                </div>

                                <InputError message={(errors as any).role} className="mt-2" />
                            </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError className="mt-2" message={errors.email} />
                                </div>


                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>Save</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
