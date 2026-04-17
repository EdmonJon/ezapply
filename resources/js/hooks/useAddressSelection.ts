import { useState, useEffect } from 'react';

interface AddressData {
  region_code: string;
  region_name: string;
  province_code: string;
  province_name: string;
  citymun_code: string;
  citymun_name: string;
  barangay_code: string;
  barangay_name: string;
}

interface UseAddressSelectionProps {
  initialAddress?: Partial<AddressData>;
  onAddressChange?: (address: AddressData) => void;
}

export const useAddressSelection = ({ initialAddress, onAddressChange }: UseAddressSelectionProps = {}) => {
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

  const [isRegionsLoading, setIsRegionsLoading] = useState(false);
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isBarangaysLoading, setIsBarangaysLoading] = useState(false);

  const [addressCodes, setAddressCodes] = useState<AddressData>({
    region_code: initialAddress?.region_code || '',
    region_name: initialAddress?.region_name || '',
    province_code: initialAddress?.province_code || '',
    province_name: initialAddress?.province_name || '',
    citymun_code: initialAddress?.citymun_code || '',
    citymun_name: initialAddress?.citymun_name || '',
    barangay_code: initialAddress?.barangay_code || '',
    barangay_name: initialAddress?.barangay_name || '',
  });

  useEffect(() => {
    if (regions.length === 0) {
      setIsRegionsLoading(true);
      fetch('/psgc/regions')
        .then((res) => res.json())
        .then(setRegions)
        .catch(() => setRegions([]))
        .finally(() => setIsRegionsLoading(false));
    }
  }, [regions.length]);

  useEffect(() => {
    if (addressCodes.region_code && regions.length > 0) {
      const region = regions.find((r) => r.code === addressCodes.region_code);
      if (region && region.name !== addressCodes.region_name) {
        setAddressCodes(prev => ({ ...prev, region_name: region.name }));
      }
    }
  }, [addressCodes.region_code, regions]);

  useEffect(() => {
    if (addressCodes.province_code && provinces.length > 0) {
      const province = provinces.find((p) => p.code === addressCodes.province_code);
      if (province && province.name !== addressCodes.province_name) {
        setAddressCodes(prev => ({ ...prev, province_name: province.name }));
      }
    }
  }, [addressCodes.province_code, provinces]);

  useEffect(() => {
    if (addressCodes.citymun_code && cities.length > 0) {
      const city = cities.find((c) => c.code === addressCodes.citymun_code);
      if (city && city.name !== addressCodes.citymun_name) {
        setAddressCodes(prev => ({ ...prev, citymun_name: city.name }));
      }
    }
  }, [addressCodes.citymun_code, cities]);

  useEffect(() => {
    if (addressCodes.barangay_code && barangays.length > 0) {
      const barangay = barangays.find((b) => b.code === addressCodes.barangay_code);
      if (barangay && barangay.name !== addressCodes.barangay_name) {
        setAddressCodes(prev => ({ ...prev, barangay_name: barangay.name }));
      }
    }
  }, [addressCodes.barangay_code, barangays]);

  const onRegionChange = (regionCode: string) => {
    const region = regions.find((r) => r.code === regionCode);
    const newAddress = {
      region_code: regionCode,
      region_name: region?.name || '',
      province_code: '',
      province_name: '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    };
    setAddressCodes(newAddress);
    onAddressChange?.(newAddress);
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    if (regionCode) {
      setIsProvincesLoading(true);
      fetch(`/psgc/regions/${regionCode}/provinces`)
        .then(r => r.json())
        .then(setProvinces)
        .catch(() => setProvinces([]))
        .finally(() => setIsProvincesLoading(false));
    }
  };

  const onProvinceChange = (provinceCode: string) => {
    const province = provinces.find((p) => p.code === provinceCode);
    const newAddress = {
      ...addressCodes,
      province_code: provinceCode,
      province_name: province?.name || '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    };
    setAddressCodes(newAddress);
    onAddressChange?.(newAddress);
    setCities([]);
    setBarangays([]);
    if (provinceCode) {
      setIsCitiesLoading(true);
      fetch(`/psgc/provinces/${provinceCode}/cities-municipalities`)
        .then(r => r.json())
        .then(setCities)
        .catch(() => setCities([]))
        .finally(() => setIsCitiesLoading(false));
    }
  };

  const onCityChange = (cityCode: string) => {
    const city = cities.find((c) => c.code === cityCode);
    const newAddress = {
      ...addressCodes,
      citymun_code: cityCode,
      citymun_name: city?.name || '',
      barangay_code: '',
      barangay_name: '',
    };
    setAddressCodes(newAddress);
    onAddressChange?.(newAddress);
    setBarangays([]);
    if (cityCode) {
      setIsBarangaysLoading(true);
      fetch(`/psgc/cities-municipalities/${cityCode}/barangays`)
        .then(r => r.json())
        .then(setBarangays)
        .catch(() => setBarangays([]))
        .finally(() => setIsBarangaysLoading(false));
    }
  };

  const onBarangayChange = (barangayCode: string) => {
    const barangay = barangays.find((b) => b.code === barangayCode);
    const newAddress = {
      ...addressCodes,
      barangay_code: barangayCode,
      barangay_name: barangay?.name || '',
    };
    setAddressCodes(newAddress);
    onAddressChange?.(newAddress);
  };

  return {
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
  };
};
