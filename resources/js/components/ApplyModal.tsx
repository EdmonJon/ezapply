import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import { router } from '@inertiajs/react';
import '../../css/easyApply.css';
interface Region {
  code: string;
  name: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: number;
  companyIds?: number[];
  onApplySuccess?: (appliedIds: number[]) => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyIds,
  onApplySuccess
}) => {
  const { isProfileComplete } = useProfileStatus();
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const [anywhere, setAnywhere] = useState(false);
  const [anytime, setAnytime] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [barangays, setBarangays] = useState<Region[]>([]);

  const [isRegionsLoading, setIsRegionsLoading] = useState(false);
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isBarangaysLoading, setIsBarangaysLoading] = useState(false);

  const [addressCodes, setAddressCodes] = useState<{
    region_code: string;
    region_name: string;
    province_code: string;
    province_name: string;
    citymun_code: string;
    citymun_name: string;
    barangay_code: string;
    barangay_name: string;
  }>({
    region_code: '',
    region_name: '',
    province_code: '',
    province_name: '',
    citymun_code: '',
    citymun_name: '',
    barangay_code: '',
    barangay_name: ''
  });

  const [deadlineDate, setDeadlineDate] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen && regions.length === 0) {
      setIsRegionsLoading(true);
      fetch('/psgc/regions')
        .then((res) => res.json())
        .then(setRegions)
        .catch(() => {})
        .finally(() => setIsRegionsLoading(false));
    }
  }, [isOpen]);

  const onRegionChange = (regionCode: string) => {
    const region = regions.find((r) => r.code === regionCode);
    setAddressCodes({
      region_code: regionCode,
      region_name: region?.name || '',
      province_code: '',
      province_name: '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    });
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    if (regionCode) {
      setIsProvincesLoading(true);
      fetch(`/psgc/regions/${regionCode}/provinces`)
        .then(r => r.json())
        .then(setProvinces)
        .catch(() => {})
        .finally(() => setIsProvincesLoading(false));
    }
  };

  const onProvinceChange = (provinceCode: string) => {
    const province = provinces.find((p) => p.code === provinceCode);
    setAddressCodes((prev) => ({
      ...prev,
      province_code: provinceCode,
      province_name: province?.name || '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    }));
    setCities([]);
    setBarangays([]);
    if (provinceCode) {
      setIsCitiesLoading(true);
      fetch(`/psgc/provinces/${provinceCode}/cities-municipalities`)
        .then(r => r.json())
        .then(setCities)
        .catch(() => {})
        .finally(() => setIsCitiesLoading(false));
    }
  };

  const onCityChange = (cityCode: string) => {
    const city = cities.find((c) => c.code === cityCode);
    setAddressCodes((prev) => ({
      ...prev,
      citymun_code: cityCode,
      citymun_name: city?.name || '',
      barangay_code: '',
      barangay_name: '',
    }));
    setBarangays([]);
    if (cityCode) {
      setIsBarangaysLoading(true);
      fetch(`/psgc/cities-municipalities/${cityCode}/barangays`)
        .then(r => r.json())
        .then(setBarangays)
        .catch(() => {})
        .finally(() => setIsBarangaysLoading(false));
    }
  };

  const onBarangayChange = (barangayCode: string) => {
    const barangay = barangays.find((b) => b.code === barangayCode);
    setAddressCodes((prev) => ({
      ...prev,
      barangay_code: barangayCode,
      barangay_name: barangay?.name || '',
    }));
  };

  const handleApply = () => {
    if (!isProfileComplete) {
      setShowProfileIncompleteModal(true);
      return;
    }

    const locationStr = [addressCodes.region_name, addressCodes.province_name, addressCodes.citymun_name, addressCodes.barangay_name]
      .filter(Boolean)
      .join(' - ');

    if (companyId) {
      // Single apply
      axios.post("/applicant/applications", {
        company_id: companyId,
        desired_location: locationStr,
        deadline_date: deadlineDate
      })
      .then(() => {
        onApplySuccess?.([companyId]);
        onClose();
      })
      .catch((err) => {
        console.error('Apply failed', err);
      });
    } else if (companyIds && companyIds.length > 0) {
      // Bulk apply
      axios.post('/applicant/applications', {
        companyIds,
        desired_location: locationStr,
        deadline_date: deadlineDate
      })
      .then(() => {
        onApplySuccess?.(companyIds);
        onClose();
      })
      .catch((err) => {
        console.error('Bulk apply failed', err);
      });
    }
  };

  const handleProfileRedirect = () => {
    setShowProfileIncompleteModal(false);
    router.get('/applicant/profile');
  };

  if (!isOpen) return null;

  const isBulk = companyIds && companyIds.length > 1;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-4">
            {isBulk ? `Apply to ${companyIds.length} selected companies` : 'Additional Details'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Desired Location</label>
              <label className="flex items-center gap-2 mb-2 text-sm">
                <input
                  type="checkbox"
                  checked={anywhere}
                  onChange={(e) => {
                    setAnywhere(e.target.checked);
                    if (e.target.checked) {
                      setAddressCodes({
                        region_code: "",
                        province_code: "",
                        citymun_code: "",
                        barangay_code: "",
                        region_name: "",
                        province_name: "",
                        citymun_name: "",
                        barangay_name: "",
                      });
                    }
                  }}
                />
                Anywhere
              </label>
              {!anywhere && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Region</label>
                    <div className="relative">
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={addressCodes.region_code}
                      onChange={(e) => onRegionChange(e.target.value)}
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
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Province</label>
                    <div className="relative">
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={addressCodes.province_code}
                      onChange={(e) => onProvinceChange(e.target.value)}
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
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">City / Municipality</label>
                    <div className="relative">
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={addressCodes.citymun_code}
                      onChange={(e) => onCityChange(e.target.value)}
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
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Barangay</label>
                    <div className="relative">
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={addressCodes.barangay_code}
                      onChange={(e) => onBarangayChange(e.target.value)}
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
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Deadline Date</label>
              <label className="flex items-center gap-2 mb-2 text-sm">
                <input
                  type="checkbox"
                  checked={anytime}
                  onChange={(e) => {
                    setAnytime(e.target.checked);
                    if (e.target.checked) {
                      setDeadlineDate("");
                    }
                  }}
                />
                Anytime
              </label>
              {!anytime && (
                <input
                  type="date"
                  className="mt-1 block w-full rounded-lg border px-3 py-2"
                  value={deadlineDate}
                  min={today}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleApply}
            >
              Confirm Apply
            </button>
          </div>
        </div>
      </div>

      {showProfileIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Incomplete Profile
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You cannot apply yet because your profile is incomplete. You need to fill in your Basic Information (first name) and Financial Information (income source).
              Would you like to Fill it now?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProfileIncompleteModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowProfileIncompleteModal(false);
                  handleProfileRedirect();
                }}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
               Fill Up Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyModal;
