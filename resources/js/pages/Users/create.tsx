import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Create Users', href: '/users/create' },
];

export default function AddUser({ roles }: { roles: string[] }) {
  const { auth } = usePage().props as any;

  const { data, setData, post, errors, processing } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    Facebook: '',
    LinkedIn: '',
    Viber: '',
    password: '',
    password_confirmation: '',
    roles: [] as string[],
    users_address: {
      region_code: '',
      region_name: '',
      province_code: '',
      province_name: '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    },
  });

  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<{ code: string; name: string }[]>([]);
  const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

  // Fetch regions
  useEffect(() => {
    fetch('/psgc/regions')
      .then(res => res.json())
      .then(data => setRegions(data.map((r: any) => ({ code: r.code, name: r.name }))))
      .catch(err => console.error(err));
  }, []);

  // Fetch provinces
  useEffect(() => {
    if (data.users_address.region_code) {
      fetch(`/psgc/regions/${data.users_address.region_code}/provinces`)
        .then(res => res.json())
        .then(data => setProvinces(data.map((p: any) => ({ code: p.code, name: p.name }))))
        .catch(err => console.error(err));
    } else setProvinces([]);
  }, [data.users_address.region_code]);

  // Fetch cities
  useEffect(() => {
    if (data.users_address.province_code) {
      fetch(`/psgc/provinces/${data.users_address.province_code}/cities-municipalities`)
        .then(res => res.json())
        .then(data => setCitiesMunicipalities(data.map((c: any) => ({ code: c.code, name: c.name }))))
        .catch(err => console.error(err));
    } else setCitiesMunicipalities([]);
  }, [data.users_address.province_code]);

  // Fetch barangays
  useEffect(() => {
    if (data.users_address.citymun_code) {
      fetch(`/psgc/cities-municipalities/${data.users_address.citymun_code}/barangays`)
        .then(res => res.json())
        .then(data => setBarangays(data.map((b: any) => ({ code: b.code, name: b.name }))))
        .catch(err => console.error(err));
    } else setBarangays([]);
  }, [data.users_address.citymun_code]);

  // Handlers for cascading selects
  const handleRegionChange = (code: string) => {
    const selected = regions.find(r => r.code === code);
    setData({
      ...data,
      users_address: {
        region_code: code,
        region_name: selected?.name || '',
        province_code: '',
        province_name: '',
        citymun_code: '',
        citymun_name: '',
        barangay_code: '',
        barangay_name: '',
      },
    });
    setProvinces([]);
    setCitiesMunicipalities([]);
    setBarangays([]);
  };

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find(p => p.code === code);
    setData({
      ...data,
      users_address: {
        ...data.users_address,
        province_code: code,
        province_name: selected?.name || '',
        citymun_code: '',
        citymun_name: '',
        barangay_code: '',
        barangay_name: '',
      },
    });
    setCitiesMunicipalities([]);
    setBarangays([]);
  };

  const handleCityChange = (code: string) => {
    const selected = citiesMunicipalities.find(c => c.code === code);
    setData({
      ...data,
      users_address: {
        ...data.users_address,
        citymun_code: code,
        citymun_name: selected?.name || '',
        barangay_code: '',
        barangay_name: '',
      },
    });
    setBarangays([]);
  };

  const handleBarangayChange = (code: string) => {
    const selected = barangays.find(b => b.code === code);
    setData({
      ...data,
      users_address: {
        ...data.users_address,
        barangay_code: code,
        barangay_name: selected?.name || '',
      },
    });
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/users', {
      onSuccess: () => {
        toast.success('User created successfully.');
      },
      onError: (err) => console.log(err),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Create User</CardTitle>
            <CardAction>
              <Link href="/users">
                <Button>Go Back</Button>
              </Link>
            </CardAction>
          </CardHeader>
          <hr />
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={data.first_name}
                    onChange={e => setData('first_name', e.target.value)}
                    required
                  />
                  <InputError message={errors.first_name} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={data.last_name}
                    onChange={e => setData('last_name', e.target.value)}
                    required
                  />
                  <InputError message={errors.last_name} />
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={data.birth_date}
                  onChange={e => setData('birth_date', e.target.value)}
                  required
                />
                <InputError message={errors.birth_date} />
              </div>

              {/* Contact */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  required
                />
                <InputError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  required
                />
                <InputError message={errors.phone} />
              </div>

              {/* Social Links */}
              <div>
                <Label htmlFor="Facebook">Facebook (Optional)</Label>
                <Input
                  id="Facebook"
                  name="Facebook"
                  value={data.Facebook}
                  onChange={e => setData('Facebook', e.target.value)}
                />
                <InputError message={errors.Facebook} />
              </div>
              <div>
                <Label htmlFor="LinkedIn">LinkedIn (Optional)</Label>
                <Input
                  id="LinkedIn"
                  name="LinkedIn"
                  value={data.LinkedIn}
                  onChange={e => setData('LinkedIn', e.target.value)}
                />
                <InputError message={errors.LinkedIn} />
              </div>
              <div>
                <Label htmlFor="Viber">Viber (Optional)</Label>
                <Input
                  id="Viber"
                  name="Viber"
                  value={data.Viber}
                  onChange={e => setData('Viber', e.target.value)}
                />
                <InputError message={errors.Viber} />
              </div>

              {/* Address */}
              <div>
                <Label>Address</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Select value={data.users_address.region_code} onValueChange={handleRegionChange}>
                      <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                      <SelectContent>
                        {regions.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Select value={data.users_address.province_code} onValueChange={handleProvinceChange} disabled={!data.users_address.region_code}>
                      <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                      <SelectContent>
                        {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City/Municipality</Label>
                    <Select value={data.users_address.citymun_code} onValueChange={handleCityChange} disabled={!data.users_address.province_code}>
                      <SelectTrigger><SelectValue placeholder="Select City/Municipality" /></SelectTrigger>
                      <SelectContent>
                        {citiesMunicipalities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Barangay</Label>
                    <Select value={data.users_address.barangay_code} onValueChange={handleBarangayChange} disabled={!data.users_address.citymun_code}>
                      <SelectTrigger><SelectValue placeholder="Select Barangay" /></SelectTrigger>
                      <SelectContent>
                        {barangays.map(b => <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <InputError message={errors.users_address} />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  required
                />
                <InputError message={errors.password} />
              </div>
              <div>
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  required
                />
                <InputError message={errors.password_confirmation} />
              </div>

              {/* Roles */}
              <div>
                <Label>Select Role(s)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-2">
                  {roles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={data.roles.includes(role)}
                        onCheckedChange={checked => {
                          if (checked) setData('roles', [...data.roles, role]);
                          else setData('roles', data.roles.filter(r => r !== role));
                        }}
                      />
                      <Label htmlFor={`role-${role}`}>{role}</Label>
                    </div>
                  ))}
                </div>
                <InputError message={errors.roles} />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={processing} size="lg">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
