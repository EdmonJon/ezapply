import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes'
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionGate from '@/components/PermissionGate';
import AddressForm from '@/components/AddressForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, ChevronLeft, Building2, DollarSign, Users, FileText, Upload, AlertCircle } from 'lucide-react';

// Steps definition
export const STEPS = [
  'Company Info',
  'Opportunity', 
  'Background',
  'Requirements',
  'Marketing / Listing',
  'Documents',
];

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
  },
];

interface CompanyForm {
  company_name: string;
  brand_name: string;
  region_code: string;
  region_name: string;
  province_code: string;
  province_name: string;
  citymun_code: string;
  citymun_name: string;
  barangay_code: string;
  barangay_name: string;
  postal_code: string;
  country: string;
  city: string;
  state_province: string;
  zip_code: string;
  company_website: string;

  description: string;
  year_founded: string | null;
  num_franchise_locations: string | null;

  franchise_type: string;
  min_investment: string | null;
  franchise_fee: string | null;
  royalty_fee_structure: string;
  avg_annual_revenue: string | null;
  target_markets: string;
  training_support: string;
  franchise_term: string;
  unique_selling_points: string;

  industry_sector: string;
  years_in_operation: string | null;
  total_revenue: string | null;
  awards: string;
  company_history: string;

  min_net_worth: string | null;
  min_liquid_assets: string | null;
  prior_experience: boolean;
  experience_type: string;
  other_qualifications: string;

  listing_title: string;
  listing_description: string;

  target_profile: string;
  logo: File | null;
  existing_logo: string | null;
  preferred_contact_method: string;
  dti_sbc: File | null;
  bir_2303: File | null;
  ipo_registration: File | null;
  existing_dti_sbc: string | null;
  existing_bir_2303: string | null;
  existing_ipo_registration: string | null;
}

// Ensure hydrateAddressData outputs strictly string values
function hydrateAddressData(initialData: Partial<CompanyForm>): CompanyForm {
  return {
    company_name: initialData.company_name || '',
    brand_name: initialData.brand_name || '',
    region_code: initialData.region_code || '',
    region_name: initialData.region_name || '',
    province_code: initialData.province_code || '',
    province_name: initialData.province_name || '',
    citymun_code: initialData.citymun_code || '',
    citymun_name: initialData.citymun_name || '',
    barangay_code: initialData.barangay_code || '',
    barangay_name: initialData.barangay_name || '',
    postal_code: initialData.postal_code || '',
    country: initialData.country || 'Philippines',
    city: initialData.city || '',
    state_province: initialData.state_province || '',
    zip_code: initialData.zip_code || '',
    company_website: initialData.company_website || '',

    description: initialData.description || '',
    year_founded: initialData.year_founded || '',
    num_franchise_locations: initialData.num_franchise_locations || '',

    franchise_type: initialData.franchise_type || '',
    min_investment: initialData.min_investment || '',
    franchise_fee: initialData.franchise_fee || '',
    royalty_fee_structure: initialData.royalty_fee_structure || '',
    avg_annual_revenue: initialData.avg_annual_revenue || '',
    target_markets: initialData.target_markets || '',
    training_support: initialData.training_support || '',
    franchise_term: initialData.franchise_term || '',
    unique_selling_points: initialData.unique_selling_points || '',

    industry_sector: initialData.industry_sector || '',
    years_in_operation: initialData.years_in_operation || '',
    total_revenue: initialData.total_revenue || '',
    awards: initialData.awards || '',
    company_history: initialData.company_history || '',

    min_net_worth: initialData.min_net_worth || '',
    min_liquid_assets: initialData.min_liquid_assets || '',
    prior_experience: initialData.prior_experience || false,
    experience_type: initialData.experience_type || '',
    other_qualifications: initialData.other_qualifications || '',

    listing_title: initialData.listing_title || '',
    listing_description: initialData.listing_description || '',

    target_profile: initialData.target_profile || '',
    logo: initialData.logo || null,
    existing_logo: initialData.existing_logo || null,
    preferred_contact_method: initialData.preferred_contact_method || '',
    dti_sbc: initialData.dti_sbc || null,
    bir_2303: initialData.bir_2303 || null,
    ipo_registration: initialData.ipo_registration || null,
    existing_dti_sbc: initialData.existing_dti_sbc || null,
    existing_bir_2303: initialData.existing_bir_2303 || null,
    existing_ipo_registration: initialData.existing_ipo_registration || null,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-black">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}


function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

// Utility functions for currency formatting
function formatCurrency(value: string | number | null): string {
  if (value === null || value === '' || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function parseCurrency(value: string): string {
  if (!value) return '';
  // Remove ₱, commas, and spaces
  const cleaned = value.replace(/[₱,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '' : num.toString();
}

export default function FranchiseRegister({ initialData, companyId }: { initialData?: Partial<CompanyForm>, companyId?: number }) {
  const hydratedData = hydrateAddressData(initialData || {});

  const { data, setData, post, put, processing, errors, reset } = useForm<CompanyForm>(hydratedData);

  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [companyNameLocked, setCompanyNameLocked] = useState(false);

  // Preview state for file uploads
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dtiSbcPreview, setDtiSbcPreview] = useState<string | null>(null);
  const [bir2303Preview, setBir2303Preview] = useState<string | null>(null);
  const [ipoPreview, setIpoPreview] = useState<string | null>(null);
  

  useEffect(() => {
    if (open) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.getElementById('company_name')?.focus(), 200);
    }
  }, [open]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (dtiSbcPreview) URL.revokeObjectURL(dtiSbcPreview);
      if (bir2303Preview) URL.revokeObjectURL(bir2303Preview);
      if (ipoPreview) URL.revokeObjectURL(ipoPreview);
    };
  }, [logoPreview, dtiSbcPreview, bir2303Preview, ipoPreview]);

  useEffect(() => {
    if (companyId) {
        // Only lock when EDITING an existing company
        setCompanyNameLocked(true);
    }
    // Do NOT prefill or lock when creating a new company
}, [companyId]);

  function validateStep(step: number) {
    const requiredFields: Record<number, (keyof typeof data)[]> = {
      0: ['company_name', 'region_code', 'province_code', 'citymun_code', 'barangay_code', 'country', 'description', 'year_founded'],
      1: ['franchise_type', 'min_investment', 'franchise_fee', 'royalty_fee_structure', 'target_markets', 'franchise_term'],
      2: ['industry_sector', 'years_in_operation'],
      3: ['min_net_worth', 'min_liquid_assets'],
      4: [],
      5: companyId ? [] : ['dti_sbc', 'bir_2303', 'ipo_registration'], // Documents not required in edit mode
    };

    for (const field of requiredFields[step] || []) {
      if (field === 'zip_code') {
        // postal_code (zip_code) can be nullable, so skip validation for it
        continue;
      }
      if (data[field] === null || data[field] === '' || data[field] === undefined) return false;
    }
    return true;
  }

  function next() {
    if (validateStep(step)) {
      setCompletedSteps(prev => [...prev, step]);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }
  
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(targetStep: number) {
    if (targetStep <= step || completedSteps.includes(targetStep - 1)) {
      setStep(targetStep);
    }
  }

function doSubmit() {
  // In create mode, ensure all required documents are uploaded
  if (!companyId && (!data.dti_sbc || !data.bir_2303 || !data.ipo_registration)) {
    alert('Please upload all required documents (DTI/SBC, BIR 2303, IPO Registration) before submitting.');
    return;
  }

  // Filter out existing_* fields before sending to backend
  const { existing_logo, existing_dti_sbc, existing_bir_2303, existing_ipo_registration, ...submitData } = data;

  // Convert null values to undefined and exclude null/undefined file fields for Inertia compatibility
  const cleanedData: Record<string, any> = {};
  for (const [key, value] of Object.entries(submitData)) {
    if (value === null) {
      // For file fields, don't send null values - let backend preserve existing files
      if (['logo', 'dti_sbc', 'bir_2303', 'ipo_registration'].includes(key)) {
        continue;
      }
      cleanedData[key] = undefined;
    } else {
      cleanedData[key] = value;
    }
  }

   if (companyId) {
      console.log(data.company_name, cleanedData);
      post(`/companies/${companyId}`, {
        ...cleanedData,
        method: 'put',
        onSuccess: () => {
          window.location.href = '/my-companies';
        },
        onError: (error: unknown) => {
          console.error('Update failed:', error);
          console.error('Request data:', cleanedData);
          console.error('Company ID:', companyId);
          alert('Update failed. Please check console for details.');
        },
      });
    } else {
      post('/companies', {
        ...cleanedData,
        onSuccess: () => {
          reset();
          setStep(0);
          window.location.href = '/my-companies';
        },
        onError: (error: unknown) => {
          console.error('Submission failed:', error);
          console.error('Request data:', cleanedData);
          alert('Submission failed. Please check console for details.');
        },
      });
    }
  }


  const stepIcons = [Building2, DollarSign, Users, FileText, Upload, FileText];
  const stepDescriptions = [
    "Basic company information and location",
    "Franchise opportunity details and investment requirements",
    "Company background and industry information",
    "Franchisee requirements and qualifications",
    "Marketing materials and listing information",
    "Required business documents and certifications"
  ];

  return (
    <PermissionGate permission="create_companies" fallback={<div className="p-6">You don't have permission to register companies.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Company Registration" />

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {companyId ? 'Edit Company Registration' : 'Register Your Company'}
              </h1>
              <p className="text-gray-600 ">
                Complete the registration process to list your franchise opportunity
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Step {step + 1} of {STEPS.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((step + 1) / STEPS.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((stepName, index) => {
                  const Icon = stepIcons[index];
                  const isCompleted = completedSteps.includes(index);
                  const isCurrent = index === step;
                  const isAccessible = index <= step || completedSteps.includes(index - 1);
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <button
                        onClick={() => goToStep(index)}
                        disabled={!isAccessible}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : isAccessible
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </button>
                      <span className={`text-xs mt-2 text-center ${
                        isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}>
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3">
                  {React.createElement(stepIcons[step], { className: "w-6 h-6 text-blue-600" })}
                  {STEPS[step]}
                </CardTitle>
                <p className="text-gray-600 ml-12"> {stepDescriptions[step]}</p>
              </CardHeader>
              <CardContent className="p-6">

                {/* FORM */}
                <form
                  // NEVER allow implicit submit
                  onSubmit={(e) => e.preventDefault()}
                  // Enter on steps 1–4 = Next
                  onKeyDownCapture={(e) => {
                    const last = STEPS.length - 1;
                    if (e.key === 'Enter' && step < last) {
                      e.preventDefault();
                      if (validateStep(step)) next();
                    }
                  }}
                  encType="multipart/form-data"
                  className="space-y-4"
                >
                  {/* Step 1: Company */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">
                            Company Name * {companyNameLocked && <span className="text-sm text-gray-500"></span>}
                          </Label>
                          <Input
                            id="company_name"
                            name="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            placeholder="Enter your company name"
                            required
                            disabled={companyNameLocked}
                          />
                          <ErrorText message={(errors as any).company_name} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="brand_name">Brand Name</Label>
                          <Input
                            name="brand_name"
                            value={data.brand_name ?? ''}
                            onChange={(e) => setData('brand_name', e.target.value)}
                            placeholder="Enter your brand name"
                          />
                          <ErrorText message={(errors as any).brand_name} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Headquarters Address</h3>
                        <AddressForm
                          value={{
                            region_code: data.region_code,
                            region_name: data.region_name,
                            province_code: data.province_code,
                            province_name: data.province_name,
                            citymun_code: data.citymun_code,
                            citymun_name: data.citymun_name,
                            barangay_code: data.barangay_code,
                            barangay_name: data.barangay_name,
                            postal_code: data.zip_code,
                            country: data.country,
                          }}
                          onChange={(address) => {
                            setData('region_code', address.region_code);
                            setData('region_name', address.region_name);
                            setData('province_code', address.province_code);
                            setData('province_name', address.province_name);
                            setData('citymun_code', address.citymun_code);
                            setData('citymun_name', address.citymun_name);
                            setData('barangay_code', address.barangay_code);
                            setData('barangay_name', address.barangay_name);
                            setData('zip_code', address.postal_code);
                            setData('country', address.country);
                          }}
                          errors={{
                            region_code: (errors as any).region_code,
                            province_code: (errors as any).province_code,
                            citymun_code: (errors as any).citymun_code,
                            barangay_code: (errors as any).barangay_code,
                          }}
                          showLoading={true}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_website">Company Website</Label>
                          <Input
                            name="company_website"
                            value={data.company_website ?? ''}
                            onChange={(e) => setData('company_website', e.target.value)}
                            placeholder="https://yourcompany.com"
                            type="url"
                          />
                          <ErrorText message={(errors as any).company_website} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="year_founded">Year Founded *</Label>
                          <Input
                            name="year_founded"
                            type="number"
                            min={1800}
                            max={new Date().getFullYear()}
                            value={data.year_founded ?? ''}
                            onChange={(e) => setData('year_founded', e.target.value)}
                            placeholder="2020"
                            required
                          />
                          <ErrorText message={(errors as any).year_founded} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description *</Label>
                        <Textarea
                          name="description"
                          rows={4}
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          placeholder="Describe your company and what makes it unique..."
                          required
                        />
                        <ErrorText message={(errors as any).description} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num_franchise_locations">Number of Existing Franchise Locations</Label>
                        <Input
                          name="num_franchise_locations"
                          type="number"
                          min={0}
                          value={data.num_franchise_locations ?? ''}
                          onChange={(e) => setData('num_franchise_locations', e.target.value)}
                          placeholder="0"
                        />
                        <ErrorText message={(errors as any).num_franchise_locations} />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Opportunity */}
                  {step === 1 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Franchise Type *">
                          <Select value={data.franchise_type} onValueChange={(value) => setData('franchise_type', value)} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select franchise type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Business Format Franchise">Business Format Franchise</SelectItem>
                              <SelectItem value="Product Distribution Franchise">Product Distribution Franchise (or Trade Name Franchise)</SelectItem>
                              <SelectItem value="Manufacturing Franchise">Manufacturing Franchise</SelectItem>
                              <SelectItem value="Job Franchise">Job Franchise</SelectItem>
                              <SelectItem value="Investment Franchise">Investment Franchise</SelectItem>
                              <SelectItem value="Conversion Franchise">Conversion Franchise</SelectItem>
                              <SelectItem value="Service Franchise">Service Franchise</SelectItem>
                              <SelectItem value="Management Franchise">Management Franchise</SelectItem>
                              <SelectItem value="Single-Unit Franchise">Single-Unit Franchise</SelectItem>
                              <SelectItem value="Multi-Unit Franchise">Multi-Unit Franchise</SelectItem>
                              <SelectItem value="Area Developer Franchise">Area Developer Franchise</SelectItem>
                              <SelectItem value="Master Franchise">Master Franchise (or Regional Developer)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Franchise Term *"><Input name="franchise_term" value={data.franchise_term} onChange={(e) => setData('franchise_term', e.target.value)} required /></Field>
                      <Field label="Minimum Investment Required *"><Input name="min_investment" type="text" value={focusedField === 'min_investment' ? data.min_investment || '' : formatCurrency(data.min_investment || '')} onChange={(e) => setData('min_investment', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱1,000,000.00" required /></Field>
                      <Field label="Franchise Fee *"><Input name="franchise_fee" type="text" value={focusedField === 'franchise_fee' ? data.franchise_fee || '' : formatCurrency(data.franchise_fee || '')} onChange={(e) => setData('franchise_fee', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱500,000.00" required /></Field>
                      <Field label="Royalty Fee Structure*">
                        <Input
                          name="royalty_fee_structure"
                          value={data.royalty_fee_structure}
                          onChange={(e) => setData("royalty_fee_structure", e.target.value)}
                          placeholder="e.g., 5% of revenue or ₱10,000 monthly"
                        />
                        {errors.royalty_fee_structure && (
                          <div className="text-red-500">{errors.royalty_fee_structure}</div>
                        )}
                      </Field>
                      <Field label="Average Annual Revenue per Location (optional)"><Input name="avg_annual_revenue" type="text" value={focusedField === 'avg_annual_revenue' ? data.avg_annual_revenue || '' : formatCurrency(data.avg_annual_revenue || '')} onChange={(e) => setData('avg_annual_revenue', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱5,000,000.00" /></Field>
                      <ErrorText message={(errors as any).avg_annual_revenue} />
                      </div>
                      <Field label="Target Markets/Regions for Expansion *"><Input name="target_markets" value={data.target_markets} onChange={(e) => setData('target_markets', e.target.value)} required /></Field>
                      <Field label="Training and Support Offered (optional)"><Textarea name="training_support" rows={2} value={data.training_support ?? ''} onChange={(e) => setData('training_support', e.target.value)} /></Field>
                      <Field label="Unique Selling Points (optional)"><Textarea name="unique_selling_points" rows={2} value={data.unique_selling_points ?? ''} onChange={(e) => setData('unique_selling_points', e.target.value)} /></Field>
                    </div>
                  )}

                  {/* Step 3: Background */}
                  {step === 2 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Industry Sector *">
                          <Select value={data.industry_sector} onValueChange={(value) => setData('industry_sector', value)} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry sector" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                              <SelectItem value="Home Services">Home Services</SelectItem>
                              <SelectItem value="Business Services">Business Services</SelectItem>
                              <SelectItem value="Retail">Retail</SelectItem>
                              <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                              <SelectItem value="Senior & Healthcare Services">Senior & Healthcare Services</SelectItem>
                              <SelectItem value="Automotive">Automotive</SelectItem>
                              <SelectItem value="Child-Related Services">Child-Related Services</SelectItem>
                              <SelectItem value="Real Estate & Property">Real Estate & Property</SelectItem>
                              <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                              <SelectItem value="Pet Care">Pet Care</SelectItem>
                              <SelectItem value="Travel & Lodging">Travel & Lodging</SelectItem>
                              <SelectItem value="Restoration & Remediation">Restoration & Remediation</SelectItem>
                              <SelectItem value="Computers & Technology">Computers & Technology</SelectItem>
                              <SelectItem value="Vending">Vending</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Years in Operation*">
                        <Input
                          type="number"
                          name="years_in_operation"
                          value={data.years_in_operation}
                          onChange={(e) => setData("years_in_operation", e.target.value)}
                        />
                        {errors.years_in_operation && (
                          <div className="text-red-500">{errors.years_in_operation}
                          </div>
                        )}
                      </Field>
                        <ErrorText message={(errors as any).years_in_operation} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Total Company Revenue (optional)"><Input name="total_revenue" type="text" value={focusedField === 'total_revenue' ? data.total_revenue || '' : formatCurrency(data.total_revenue || '')} onChange={(e) => setData('total_revenue', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱50,000,000.00" /></Field>
                        <Field label="Awards or Recognitions (optional)"><Input name="awards" value={data.awards ?? ''} onChange={(e) => setData('awards', e.target.value)} /></Field>
                        <ErrorText message={(errors as any).total_revenue} />
                      </div>
                      <Field label="Brief Company History/Description (optional)">
                        <Textarea name="company_history" rows={3} value={data.company_history ?? ''} onChange={(e) => setData('company_history', e.target.value)} />
                        <ErrorText message={(errors as any).company_history} />
                      </Field>
                    </div>
                  )}

                  {/* Step 4: Requirements */}
                  {step === 3 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                      <Field label="Minimum Net Worth Required *"><Input name="min_net_worth" type="text" value={focusedField === 'min_net_worth' ? data.min_net_worth || '' : formatCurrency(data.min_net_worth || '')} onChange={(e) => setData('min_net_worth', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱10,000,000.00" required /></Field>
                      <Field label="Minimum Liquid Assets Required *"><Input name="min_liquid_assets" type="text" value={focusedField === 'min_liquid_assets' ? data.min_liquid_assets || '' : formatCurrency(data.min_liquid_assets || '')} onChange={(e) => setData('min_liquid_assets', parseCurrency(e.target.value))} onFocus={(e) => setFocusedField(e.target.name)} onBlur={() => setFocusedField(null)} placeholder="₱5,000,000.00" required /></Field>
                      <ErrorText message={(errors as any).min_net_worth} />
                      <ErrorText message={(errors as any).min_liquid_assets} />
                      </div>

                      <div className="flex items-center gap-2 text-gray-200">
                        <input id="prior_experience" type="checkbox" checked={data.prior_experience} onChange={(e) => setData('prior_experience', e.target.checked)} />
                        <label htmlFor="prior_experience">Prior Business Experience Preferred?</label>
                      </div>

                      <Field label="If Yes, specify Experience Type (optional)">
                        <Input name="experience_type" value={data.experience_type ?? ''} onChange={(e) => setData('experience_type', e.target.value)} />
                        <ErrorText message={(errors as any).experience_type} />
                      </Field>
                      <Field label="Other Qualifications (optional)">
                        <Textarea name="other_qualifications" rows={2} value={data.other_qualifications ?? ''} onChange={(e) => setData('other_qualifications', e.target.value)} />
                        <ErrorText message={(errors as any).other_qualifications} />
                      </Field>
                    </div>
                  )}

                  {/* Step 5: Marketing */}
                  {step === 4 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Preferred Listing Title (optional)"><Input name="listing_title" value={data.listing_title ?? ''} onChange={(e) => setData('listing_title', e.target.value)} /></Field>
                        <Field label="Target Franchisee Profile (optional)"><Input name="target_profile" value={data.target_profile ?? ''} onChange={(e) => setData('target_profile', e.target.value)} /></Field>
                      </div>
                      <Field label="Short Description for Listing (optional)">
                        <Textarea name="listing_description" rows={3} value={data.listing_description ?? ''} onChange={(e) => setData('listing_description', e.target.value)} />
                        <ErrorText message={(errors as any).listing_description} />
                      </Field>
                      <div>
                        <label className="block text-xs text-black">
                          {companyId ? 'Current Logo' : 'Upload Logo or Brand Images (optional)'}
                        </label>
                        {companyId && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">
                              {logoPreview ? 'New logo preview:' : data.existing_logo ? 'Current logo:' : 'No logo uploaded'}
                            </p>
                            {logoPreview || data.existing_logo ? (
                              <img
                                src={logoPreview || `/storage/${data.existing_logo}`}
                                alt="Logo preview"
                                className="max-w-32 max-h-32 object-contain border rounded"
                              />
                            ) : (
                              <p className="text-gray-500">No logo uploaded yet</p>
                            )}
                          </div>
                        )}
                        {!companyId && logoPreview && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">Logo preview:</p>
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="max-w-32 max-h-32 object-contain border rounded"
                            />
                          </div>
                        )}
                        {!companyId && (
                        <input
                          type="file"
                          accept="image/*,.gif,.bmp,.tiff,.svg"
                          className="mt-1 block w-full text-gray-200"
                          name="logo"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0] ?? null;
                            setData('logo', file);
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setLogoPreview(previewUrl);
                            } else {
                              setLogoPreview(null);
                            }
                          }}
                        />
                        )}
                        {companyId && (
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*,.gif,.bmp,.tiff,.svg"
                              className="block w-full text-gray-200"
                              name="logo"
                              onChange={(e) => {
                                const file = e.currentTarget.files?.[0] ?? null;
                                setData('logo', file);
                                if (file) {
                                  const previewUrl = URL.createObjectURL(file);
                                  setLogoPreview(previewUrl);
                                } else {
                                  setLogoPreview(null);
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload a new logo to replace the current one (optional)</p>
                          </div>
                        )}
                        <ErrorText message={(errors as any).logo} />
                      </div>
                      <Field label="Preferred Contact Method for Inquiries (optional)">
                        <Input name="preferred_contact_method" value={data.preferred_contact_method ?? ''} onChange={(e) => setData('preferred_contact_method', e.target.value)} />
                        <ErrorText message={(errors as any).preferred_contact_method} />
                      </Field>
                    </div>
                  )}


                  {/* Step 6: Documents */}
                  {step === 5 && (
                    <div className="grid gap-3">
                      <h3 className="text-md font-semibold">
                        {companyId ? 'Business Documents (Optional - upload new files to replace existing)' : 'Required Business Documents'}
                      </h3>

                      <Field label={`DTI/SBC Certificate ${companyId ? '(Optional)' : '*'}`}>
                        {companyId && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">
                              {dtiSbcPreview ? 'New DTI/SBC preview:' : data.existing_dti_sbc ? 'Current DTI/SBC:' : 'No DTI/SBC uploaded'}
                            </p>
                            {dtiSbcPreview || data.existing_dti_sbc ? (
                              dtiSbcPreview ? (
                                data.dti_sbc?.type === 'application/pdf' ? (
                                  <embed
                                    src={dtiSbcPreview}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={dtiSbcPreview}
                                    alt="DTI/SBC preview"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              ) : (
                                (data.existing_dti_sbc || '').toLowerCase().endsWith('.pdf') ? (
                                  <embed
                                    src={`/storage/${data.existing_dti_sbc}`}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={`/storage/${data.existing_dti_sbc}`}
                                    alt="Current DTI/SBC"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              )
                            ) : (
                              <p className="text-gray-500">No DTI/SBC uploaded yet</p>
                            )}
                          </div>
                        )}
                        {!companyId && dtiSbcPreview && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">DTI/SBC preview:</p>
                            {data.dti_sbc?.type === 'application/pdf' ? (
                              <embed
                                src={dtiSbcPreview}
                                type="application/pdf"
                                width="100%"
                                height="200px"
                                className="border rounded"
                              />
                            ) : (
                              <img
                                src={dtiSbcPreview}
                                alt="DTI/SBC preview"
                                className="max-w-full max-h-48 object-contain border rounded"
                              />
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0] ?? null;
                            setData('dti_sbc', file);
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setDtiSbcPreview(previewUrl);
                            } else {
                              setDtiSbcPreview(null);
                            }
                          }}
                          required={!companyId}
                        />
                        <ErrorText message={(errors as any).dti_sbc} />
                      </Field>

                      <Field label={`BIR 2303 Form ${companyId ? '(Optional)' : '*'}`}>
                        {companyId && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">
                              {bir2303Preview ? 'New BIR 2303 preview:' : data.existing_bir_2303 ? 'Current BIR 2303:' : 'No BIR 2303 uploaded'}
                            </p>
                            {bir2303Preview || data.existing_bir_2303 ? (
                              bir2303Preview ? (
                                data.bir_2303?.type === 'application/pdf' ? (
                                  <embed
                                    src={bir2303Preview}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={bir2303Preview}
                                    alt="BIR 2303 preview"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              ) : (
                                (data.existing_bir_2303 || '').toLowerCase().endsWith('.pdf') ? (
                                  <embed
                                    src={`/storage/${data.existing_bir_2303}`}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={`/storage/${data.existing_bir_2303}`}
                                    alt="Current BIR 2303"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              )
                            ) : (
                              <p className="text-gray-500">No BIR 2303 uploaded yet</p>
                            )}
                          </div>
                        )}
                        {!companyId && bir2303Preview && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">BIR 2303 preview:</p>
                            {data.bir_2303?.type === 'application/pdf' ? (
                              <embed
                                src={bir2303Preview}
                                type="application/pdf"
                                width="100%"
                                height="200px"
                                className="border rounded"
                              />
                            ) : (
                              <img
                                src={bir2303Preview}
                                alt="BIR 2303 preview"
                                className="max-w-full max-h-48 object-contain border rounded"
                              />
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0] ?? null;
                            setData('bir_2303', file);
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setBir2303Preview(previewUrl);
                            } else {
                              setBir2303Preview(null);
                            }
                          }}
                          required={!companyId}
                        />
                        <ErrorText message={(errors as any).bir_2303} />
                      </Field>

                      <Field label={`IPO Registration ${companyId ? '(Optional)' : '*'}`}>
                        {companyId && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">
                              {ipoPreview ? 'New IPO Registration preview:' : data.existing_ipo_registration ? 'Current IPO Registration:' : 'No IPO Registration uploaded'}
                            </p>
                            {ipoPreview || data.existing_ipo_registration ? (
                              ipoPreview ? (
                                data.ipo_registration?.type === 'application/pdf' ? (
                                  <embed
                                    src={ipoPreview}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={ipoPreview}
                                    alt="IPO Registration preview"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              ) : (
                                (data.existing_ipo_registration || '').toLowerCase().endsWith('.pdf') ? (
                                  <embed
                                    src={`/storage/${data.existing_ipo_registration}`}
                                    type="application/pdf"
                                    width="100%"
                                    height="200px"
                                    className="border rounded"
                                  />
                                ) : (
                                  <img
                                    src={`/storage/${data.existing_ipo_registration}`}
                                    alt="Current IPO Registration"
                                    className="max-w-full max-h-48 object-contain border rounded"
                                  />
                                )
                              )
                            ) : (
                              <p className="text-gray-500">No IPO Registration uploaded yet</p>
                            )}
                          </div>
                        )}
                        {!companyId && ipoPreview && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-600 mb-2">IPO Registration preview:</p>
                            {data.ipo_registration?.type === 'application/pdf' ? (
                              <embed
                                src={ipoPreview}
                                type="application/pdf"
                                width="100%"
                                height="200px"
                                className="border rounded"
                              />
                            ) : (
                              <img
                                src={ipoPreview}
                                alt="IPO Registration preview"
                                className="max-w-full max-h-48 object-contain border rounded"
                              />
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0] ?? null;
                            setData('ipo_registration', file);
                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setIpoPreview(previewUrl);
                            } else {
                              setIpoPreview(null);
                            }
                          }}
                          required={!companyId}
                        />
                        <ErrorText message={(errors as any).ipo_registration} />
                      </Field>
                    </div>
                  )}

                </form>

                {/* Form Controls */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={back}
                    disabled={step === 0 || processing}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <div className="flex items-center gap-4">
                    {Object.keys(errors).length > 0 && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Please fix the errors above
                      </div>
                    )}
                    
                    {step < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={next}
                        disabled={!validateStep(step) || processing}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={doSubmit}
                        disabled={!validateStep(step) || processing}
                        className="flex items-center gap-2"
                      >
                        {processing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {companyId ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            {companyId ? 'Update Company' : 'Submit Registration'}
                            <CheckCircle className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
}