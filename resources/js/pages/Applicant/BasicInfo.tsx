
import React, { useEffect, useState } from "react";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import PermissionGate from '@/components/PermissionGate';
import { useAddressSelection } from '@/hooks/useAddressSelection';
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: dashboard() }];

interface BasicInfoProps {
  basicInfo?: any;
  address?: any;
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

interface FormData {
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  Facebook: string;
  LinkedIn: string;
  Viber: string;
  users_address: {
    region_code: string;
    region_name: string;
    province_code: string;
    province_name: string;
    citymun_code: string;
    citymun_name: string;
    barangay_code: string;
    barangay_name: string;
  };
}

export default function BasicInfo({ basicInfo, address }: BasicInfoProps) {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    first_name: basicInfo?.first_name || "",
    last_name: basicInfo?.last_name || "",
    birth_date: basicInfo?.birth_date || "",
    phone: basicInfo?.phone || "",
    Facebook: basicInfo?.Facebook || "",
    LinkedIn: basicInfo?.LinkedIn || "",
    Viber: basicInfo?.Viber || "",
    users_address: {
      region_code: address?.region_code || "",
      region_name: address?.region_name || "",
      province_code: address?.province_code || "",
      province_name: address?.province_name || "",
      citymun_code: address?.citymun_code || "",
      citymun_name: address?.citymun_name || "",
      barangay_code: address?.barangay_code || "",
      barangay_name: address?.barangay_name || "",
    },
  });

  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    regions,
    provinces,
    cities,
    barangays,
    isRegionsLoading,
    isProvincesLoading,
    isCitiesLoading,
    isBarangaysLoading,
    addressCodes,
    onRegionChange,
    onProvinceChange,
    onCityChange,
    onBarangayChange,
  } = useAddressSelection({
    initialAddress: data.users_address,
    onAddressChange: (address) => setData('users_address', address),
  });
  
  const isNewUser = !basicInfo;



  const handleRegionChange = (regionCode: string) => {
    onRegionChange(regionCode);
  };

  const handleProvinceChange = (provinceCode: string) => {
    onProvinceChange(provinceCode);
  };

  const handleCityChange = (cityCode: string) => {
    onCityChange(cityCode);
  };

  const handleBarangayChange = (barangayCode: string) => {
    onBarangayChange(barangayCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Initial basicInfo prop:", basicInfo);
console.log("Initial address prop:", address);

  console.log("Submitting form:", data);
    setSaved(false);
    post("/applicant/basicinfo", {
      onSuccess: () => {
        setSaved(true);
        setIsEditing(false);
      },
    });
  };

  const findName = (list: any[], code: string) => list.find((x) => x.code === code)?.name || '';
  const regionName = findName(regions, addressCodes.region_code);
  const provinceName = findName(provinces, addressCodes.province_code);
  const cityName = findName(cities, addressCodes.citymun_code);
  const barangayName = findName(barangays, addressCodes.barangay_code);

  const formatDate = (value?: string) => {
    if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  };

type PrimitiveFields = Exclude<
  keyof FormData,
  "users_address"
>;

  const SummaryRow = ({ label, field, type = "text", formatter }: { label: string; field: PrimitiveFields; type?: string; formatter?: (v:any) => string }) => {
  const value = data[field] as string | number | undefined; 
  const displayValue = formatter ? formatter(value) : value;
  return(
    <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {isEditing && !isNewUser ? (
      <Input
        type={type}
        name={field}
        value={value ?? ""}
        onChange={(e) => setData(field, e.target.value)}
        className="max-w-xs"
      />
    ) : (
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayValue || '-'}</span>
    )}
    </div>
  );
  };
  return (
      <div className="p-4">
        {saved && (
          <div className="rounded-md bg-green-600/15 border border-green-700 px-4 py-2 text-green-700 text-sm">
            Basic information saved successfully.
          </div>
        )}

        {!isNewUser ? (
          isEditing ? (
      <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Your Basic Information</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <SummaryRow label="First Name" field="first_name"/>
              <SummaryRow label="Last Name" field="last_name" />
              <SummaryRow label="Birth Date" field="birth_date" type="date" formatter={formatDate} />
              <SummaryRow label="Phone" field="phone" />
              <SummaryRow label="Facebook" field="Facebook" />
              <SummaryRow label="LinkedIn" field="LinkedIn" />
              <SummaryRow label="Viber" field="Viber" />
              <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">Region</span>
                <div className="relative">
                <select
                  value={addressCodes.region_code}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="max-w-xs border rounded px-3 py-2"
                  disabled={isRegionsLoading}
                >
                  {isRegionsLoading ? (
                    <option value="" disabled>Loading regions...</option>
                  ) : (
                    <>
                  <option value="">Select Region</option>
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isRegionsLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">Province</span>
                <div className="relative">
                <select
                  value={addressCodes.province_code}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="max-w-xs border rounded px-3 py-2"
                  disabled={!addressCodes.region_code || isProvincesLoading}
                >
                  {isProvincesLoading ? (
                    <option value="" disabled>Loading Provinces...</option>
                  ) : (
                    <>
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isProvincesLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">City/Municipality</span>
                <div className="relative">
                <select
                  value={addressCodes.citymun_code}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="max-w-xs border rounded px-3 py-2"
                  disabled={!addressCodes.province_code || isCitiesLoading}
                >
                  {isCitiesLoading ? (
                    <option value="" disabled>Loading Cities/Municipalities...</option>
                  ) : (
                    <>
                  <option value="">Select City/Municipality</option>
                  {cities.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isCitiesLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">Barangay</span>
                <div className="relative">
                <select
                  value={addressCodes.barangay_code}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  className="max-w-xs border rounded px-3 py-2"
                  disabled={!addressCodes.citymun_code || isBarangaysLoading}
                >
                  {isBarangaysLoading ? (
                    <option value="" disabled>Loading Barangays...</option>
                  ) : (
                    <>
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isBarangaysLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="ml-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
            ) : (
              <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-3">Your Basic Information</h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <SummaryRow label="First Name" field="first_name" />
                <SummaryRow label="Last Name" field="last_name" />
                <SummaryRow label="Birth Date" field="birth_date" formatter={formatDate} />
                <SummaryRow label="Phone" field="phone" />
                <SummaryRow label="Facebook" field="Facebook" />
                <SummaryRow label="LinkedIn" field="LinkedIn" />
                <SummaryRow label="Viber" field="Viber" />
                {/* static address display */}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Region</span>
                  <span>{data.users_address.region_name || "-"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Province</span>
                  <span>{data.users_address.province_name || "-"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">City/Municipality</span>
                  <span>{data.users_address.citymun_name || "-"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Barangay</span>
                  <span>{data.users_address.barangay_name || "-"}</span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
              
            )
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">First Name *</label>
                <Input
                  name="first_name"
                  value={data.first_name}
                  onChange={(e) => setData("first_name", e.target.value)}
                  required
                />
                <ErrorText message={(errors as any).first_name} />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium">Last Name</label>
                <Input
                  name="last_name"
                  value={data.last_name}
                  onChange={(e) => setData("last_name", e.target.value)}
                />
                <ErrorText message={(errors as any).last_name} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Birth Date *</label>
              <Input
                name="birth_date"
                type="date"
                value={data.birth_date}
                onChange={(e) => setData("birth_date", e.target.value)}
                required
              />
              <ErrorText message={(errors as any).birth_date} />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone *</label>
              <Input
                name="phone"
                value={data.phone}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                  setData("phone", onlyDigits);
                }}
                placeholder="e.g., 09xxxxxxxxx"
                required
              />
              <ErrorText message={(errors as any).phone} />
            </div>

            <div className="flex gap-4" >
            <div className="flex-1">
              <label className="block text-sm font-medium">Facebook</label>
              <Input name="Facebook" value={data.Facebook} onChange={(e) => setData("Facebook", e.target.value)} />
              <ErrorText message={(errors as any).Facebook} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">LinkedIn</label>
              <Input name="LinkedIn" value={data.LinkedIn} onChange={(e) => setData("LinkedIn", e.target.value)} />
              <ErrorText message={(errors as any).LinkedIn} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Viber</label>
              <Input name="Viber" value={data.Viber} onChange={(e) => setData("Viber", e.target.value)} />
              <ErrorText message={(errors as any).Viber} />
            </div>
            </div>

            <h3 className="text-md font-semibold mt-4">Current Address</h3>
            <div className="border p-4 rounded space-y-4">
              <div>
                <label className="block text-sm font-medium">Region</label>
                <div className="relative">
                <select
                  name="users_address.region_code"
                  value={addressCodes.region_code}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={isRegionsLoading}
                >
                  {isRegionsLoading ? (
                    <option value="" disabled>Loading regions...</option>
                  ) : (
                    <>
                  <option value="">Select Region</option>
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isRegionsLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
                <ErrorText message={(errors as any)["users_address.region_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">Province</label>
                <div className="relative">
                <select
                  name="users_address.province_code"
                  value={addressCodes.province_code}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={!addressCodes.region_code || isProvincesLoading}
                >
                  {isProvincesLoading ? (
                    <option value="" disabled>Loading Provinces...</option>
                  ) : (
                    <>
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isProvincesLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
                <ErrorText message={(errors as any)["users_address.province_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">City / Municipality</label>
                <div className="relative">
                <select
                  name="users_address.citymun_code"
                  value={addressCodes.citymun_code}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={!addressCodes.province_code || isCitiesLoading}
                >
                  {isCitiesLoading ? (
                    <option value="" disabled>Loading Cities/Municipalities...</option>
                  ) : (
                    <>
                  <option value="">Select City/Municipality</option>
                  {cities.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isCitiesLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
                <ErrorText message={(errors as any)["users_address.citymun_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">Barangay</label>
                <div className="relative">
                <select
                  name="users_address.barangay_code"
                  value={addressCodes.barangay_code}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={!addressCodes.citymun_code || isBarangaysLoading}
                >
                  {isBarangaysLoading ? (
                    <option value="" disabled>Loading Barangays...</option>
                  ) : (
                    <>
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                  </>
                  )}
                </select>
                {isBarangaysLoading && (
                  <div className="loader absolute right-2 top-1/2 -translate-y-1/2 scale-[0.4]"></div>
                )}
                </div>
                <ErrorText message={(errors as any)["users_address.barangay_code"]} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={processing}
              >
                {processing ? "Saving..." : "Save Basic Info"}
              </button>
            </div>
          </form>
        )}

      </div>
  );
}
