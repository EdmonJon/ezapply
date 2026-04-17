import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import PermissionGate from '@/components/PermissionGate';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import CompanyCard from '@/components/CompanyCard';
import ApplyModal from '@/components/ApplyModal';
import '../../../css/easyApply.css';



const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Franchise Application", href: "/applicant/franchise" },
];


type CompanyDetails = {
  id: number;
  company_name: string;
  brand_name?: string;
  city?: string;
  state_province?: string;
  zip_code?: string;
  country?: string;
  company_website?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status: string;
  minimumInvestment?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
    royalty_fee_structure?: string;
    avg_annual_revenue?: number;
    target_markets?: string;
    training_support?: string;
    franchise_term?: string;
    unique_selling_points?: string;
  };
  background?: {
    industry_sector?: string;
    years_in_operation?: number;
    total_revenue?: number;
    awards?: string;
    company_history?: string;
  };
  requirements?: {
    min_net_worth?: number;
    min_liquid_assets?: number;
    prior_experience?: boolean;
    experience_type?: string;
    other_qualifications?: string;
  };
  marketing?: {
    listing_title?: string;
    listing_description?: string;
    logo_path?: string;
    target_profile?: string;
    preferred_contact_method?: string;
  };
};

type Company = CompanyDetails;


const FranchiseForm = () => {
  const { props } = usePage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companies: Company[] = Array.isArray((props as any).companies) ? (props as any).companies : [];

  const { isProfileComplete } = useProfileStatus();
  
  // const [companies, setCompanies] = useState<Company[]>([]);
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | ''>('');
  const [type, setType] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applied, setApplied] = useState<number[]>([]);
  const [applying, setApplying] = useState<number | null>(null);
  const [applyModal, setApplyModal] = useState<{open: boolean; companyId: number | undefined}>({ open: false, companyId: undefined });
  // Bulk apply modal
  const [bulkModal, setBulkModal] = useState<{open: boolean}>({ open: false });
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [wishlisted, setWishlisted] = useState<number[]>([]);

  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [avgRatings, setAvgRatings] = useState<Record<string, { avg_rating: number; total: number }>>({});

  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    // Fetch companies
    setLoadingCompanies(true);
    setTimeout(() => setLoadingCompanies(false), 1000); 

    // Fetch applied company IDs
    axios.get("/api/applied-company-ids")
    .then((res) => {
      setApplied(res.data);
    })
    .catch((err) => {
      console.error("Error fetching applied company IDs:", err);
    });

    axios.get('/api/wishlist/ids')
    .then((res) => setWishlisted(res.data))
    .catch((err) => console.error('Error fetching wishlist IDs:', err));

    axios.get('/api/company-ratings').then((res) => {
      setUserRatings(res.data.userRatings);
      setAvgRatings(res.data.averages);
    }).catch(() => {});

  }, []);
  


  useEffect(() => {
    // Restore form state if coming back from profile
    const savedState = localStorage.getItem("franchiseFormState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setChecked(state.checked || []);
      setBudget(state.budget || '');
      setType(state.type || 'all');
      setApplicationFilter(state.applicationFilter || 'all');
      localStorage.removeItem("franchiseFormState");
    }

    // Restore pending applications
    const saved = localStorage.getItem("pendingApplications");
    if (saved) {
      const ids = JSON.parse(saved);
      if (Array.isArray(ids) && ids.length > 0) {
        // Filter out already applied companies
        const filteredIds = ids.filter((id: number) => !applied.includes(id));
        setChecked(filteredIds); // restore previously selected companies, excluding applied ones
      }
    }
    // Cleanup profile redirect flag if it exists
    localStorage.removeItem("profileRedirect");
  }, [applied]);


  const handleCheck = (companyId: number) => {
    setChecked(prev => {
      const updated = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      localStorage.setItem("pendingApplications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleWishlistToggle = (companyId: number) => {
        axios.post('/api/wishlist/toggle', { company_id: companyId }).then((res) => {
          setWishlisted((prev) =>
            res.data.wishlisted ? [...prev, companyId] : prev.filter((id) => id !== companyId)
          );
        });
      };

  const handleRate = (companyId: number, rating: number) => {
        axios.post('/api/company-ratings', { company_id: companyId, rating }).then((res) => {
          setUserRatings((prev) => ({ ...prev, [companyId]: rating }));
          setAvgRatings((prev) => ({
            ...prev,
            [companyId]: { avg_rating: res.data.avg_rating, total: res.data.total },
          }));
        });
      };


// Start with all companies
let filtered = companies;

filtered = filtered.filter((c) => c.status === 'approved');

// Filter by type
if (type !== 'all') {
  filtered = filtered.filter((c) => c.opportunity?.franchise_type === type);
}
if (budget !== '') {
  filtered = filtered.filter((c) => {
    // Assuming c.opportunity.min_investment is a number
    return (c.opportunity?.min_investment?? Infinity) <= budget;
  });
}

// Filter by investment amount

// Filter by application status
if (applicationFilter === 'applied') {
  filtered = filtered.filter((c) => applied.includes(c.id));
} else if (applicationFilter === 'not-applied') {
  filtered = filtered.filter((c) => !applied.includes(c.id));
}

// Search filter
filtered = filtered.filter((c) =>
  (c.brand_name ?? '').toLowerCase().includes(search.toLowerCase())
);

const franchiseTypes = Array.from(
  new Set(companies.map(c => c.opportunity?.franchise_type).filter((t): t is string => Boolean(t)))
);

  const handleApplySingle = (companyId: number) => {
    if(!isProfileComplete){
      // Save current state before redirecting
      const currentState = {
        checked,
        budget,
        type,
        applicationFilter,
        search,
        scrollPosition: window.scrollY
      };
      localStorage.setItem('franchiseFormState', JSON.stringify(currentState));
      localStorage.setItem('profileRedirect', 'franchise');
      router.get('/applicant/profile?redirect=franchise');
      return;
      }
        setChecked((prev) => prev.filter((id) => id !== companyId)); // Deselect immediately
        if (applying !== null) return;
        setApplying(companyId);
        setApplyModal({ open: true, companyId });
};

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };
  return (
    <PermissionGate permission="apply_for_franchises"  fallback={<div className="p-6">You don't have permission to access franchise applications.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Franchise Application" />

        <div className="p-6 bg-across-pages dark:bg-neutral-900 rounded-xl shadow-md">
          <section className="hero">
        <h1 className="text-2xl font-bold text-white dark:text-neutral-100 mb-4">
          Looking for a Company to Franchise?
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
            <label className="block text-sm font-medium">Brand Name</label>
            <input
              name="brand_name"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 block w-full rounded-lg border px-3 py-2 bg-white text-black"
              placeholder="Search for Brand Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Budget</label>
            <input
              name="budget"
              type="number"
              value={budget}
              onChange={(e) => {
                const value = e.target.value;
                setBudget(value === '' ? '' : Number(value))}}
              className="mt-1 block w-full rounded-lg border px-3 py-2 bg-white text-black"
              placeholder="Enter your budget"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Franchise Type / Category</label>
            <select
              id="ezapply-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="ezapply__filter-select w-full bg-white"
              title="Select company type"
            >
              <option value="all">All Types</option>
              {franchiseTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Application Status</label>
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="ezapply__filter-select w-full bg-white"
              title="Filter by application status"
            >
              <option value="all">All Companies</option>
              <option value="applied">Applied</option>
              <option value="not-applied">Not Applied</option>
            </select>
          </div>
        </div>
        {checked.length > 0 && (
          !isProfileComplete ? (
            <button
              type="button"
              onClick={() => setShowProfileIncompleteModal(true)}
              className="apply-selected-btn bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Complete Profile to Apply Selected ({checked.length})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBulkModal({ open: true })}
              className="apply-selected-btn"
            >
              Apply Selected ({checked.length})
            </button>
          )
        )}
</section>
        
            
          <div className="all-companies-page">
            <div className="company-list-container">
            {loadingCompanies ? (
              <div className="flex justify-center items-center py-8">
                <div className="loader scale-75"></div>
                <span className="ml-2 text-gray-600">Loading companies...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ezapply__no-companies">No companies found.</div>
            ) : (
            <div className="company-grid">
              {filtered.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  checked={checked.includes(company.id)}
                  onCheck={handleCheck}
                  applied={applied.includes(company.id)}
                  onApply={handleApplySingle}
                  onCancelApply={(companyId) => setApplied((prev) => prev.filter((id) => id !== companyId))}
                  onViewDetails={handleViewDetails}
                  isProfileComplete={isProfileComplete}
                  onProfileIncomplete={() => setShowProfileIncompleteModal(true)}
                  onLoginRequired={() => {}}
                  variant="default"
                  showApplyButtons={true}
                  showCancelButton={true}
                  isLoggedIn={true}
                  wishlisted={wishlisted.includes(company.id)}
                  onWishlistToggle={handleWishlistToggle}
                  userRating={userRatings[company.id] || 0}
                  avgRating={avgRatings[company.id]?.avg_rating || 0}
                  totalRatings={avgRatings[company.id]?.total || 0}
                  onRate={handleRate}
                />
              ))}
                  </div>
               )}
          </div>
          
            

            {/* Apply modal */}
            {applyModal.open && (
              <ApplyModal
                isOpen={applyModal.open}
                onClose={() => {
                  setApplyModal({ open: false, companyId: undefined });
                  setApplying(null);
                }}
                companyId={applyModal.companyId}
                onApplySuccess={(appliedIds) => {
                  setApplied((prev) => [...prev, ...appliedIds]);
                  setChecked((prev) => prev.filter((id) => !appliedIds.includes(id)));
                  setApplying(null);
                }}
              />
            )}
            {/* Bulk Apply modal */}
            {bulkModal.open && (
              <ApplyModal
                isOpen={bulkModal.open}
                onClose={() => setBulkModal({ open: false })}
                companyIds={checked}
                onApplySuccess={(appliedIds) => {
                  setApplied((prev) => [...prev, ...appliedIds]);
                  setChecked((prev) => prev.filter((id) => !appliedIds.includes(id)));
                }}
              />
            )}
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
                    router.get('/applicant/profile');
                  }}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                 Fill Up Profile
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
        <CompanyDetailsModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </AppLayout>
    </PermissionGate>
  );
};

export default FranchiseForm;
