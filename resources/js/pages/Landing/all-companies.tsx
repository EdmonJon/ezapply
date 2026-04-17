import React, { useState, useEffect } from 'react';
import "../../../css/AllCompanies.css";
import '../../../css/easyApply.css';
import EzNav from './ezapply-nav';
import { usePage, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import ApplyModal from '@/components/ApplyModal';
import CompanyCard from '@/components/CompanyCard';
import axios from 'axios';



interface Company {
  id: number;
  company_name: string;
  brand_name?: string;
  description?: string;
  year_founded?: number;
  city?: string;
  state_province?: string;
  country?: string;
  status: string;
  marketing?: {
    logo_path?: string;
    listing_description?: string;
  };
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
  };
}









const AllCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<number[]>([]);

  const [filterType, setFilterType] = useState("All");
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filterMinInvestment, setFilterMinInvestment] = useState("");
  const [filterMaxInvestment, setFilterMaxInvestment] = useState("");

  const [open, setOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { auth } = usePage().props as { auth?: { user?: { id: number; name: string; email: string } } };
  const users = auth?.user;

  const { isProfileComplete } = useProfileStatus();

  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const [search] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [type, setType] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applied, setApplied] = useState<number[]>([]);

  const [applyModal, setApplyModal] = useState<{open: boolean; companyId: number | null}>({ open: false, companyId: null });
  const [bulkModal, setBulkModal] = useState<{open: boolean}>({ open: false });


  const handleViewDetails = (company: Company) => {
    if (!users) {
      setRedirectUrl(`/companies/${company.id}`);
      setOpen(true);
    } else {
      setSelectedCompany(company);
      setIsModalOpen(true);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && redirectUrl) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        redirectUrl
      )}`;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  useEffect(() => {
    fetch("/companies")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched companies:", data);
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        setLoading(false);
      });
  }, []);



  useEffect(() => {
    const savedState = localStorage.getItem("franchiseFormState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setChecked(state.checked || []);
      setBudget(state.budget || '');
      setType(state.type || 'all');
      setApplicationFilter(state.applicationFilter || 'all');
      localStorage.removeItem("franchiseFormState");
    }

    const saved = localStorage.getItem("pendingApplications");
    if (saved) {
      const ids = JSON.parse(saved);
      if (Array.isArray(ids) && ids.length > 0) {
        const filteredIds = ids.filter((id: number) => !applied.includes(id));
        setChecked(filteredIds);
      }
    }
    localStorage.removeItem("profileRedirect");
  }, [applied]);

  useEffect(() => {
    if (users) {
      axios.get("/api/applied-company-ids")
        .then((res) => {
          setApplied(res.data);
        })
        .catch((err) => {
          console.error("Error fetching applied company IDs:", err);
        });
    }
  }, [users]);

  const handleCheck = (companyId: number) => {
    setChecked(prev => {
      const updated = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      localStorage.setItem("pendingApplications", JSON.stringify(updated));
      return updated;
    });
  };





  const franchiseTypes = [
    "All",
    ...new Set(
      companies.map((c) => c.opportunity?.franchise_type).filter(Boolean)
    ),
  ];

  let filtered = companies;

  filtered = filtered.filter((c) => c.status === 'approved');

  if (type !== 'all') {
    filtered = filtered.filter((c) => c.opportunity?.franchise_type === type);
  }
  if (budget !== '') {
    filtered = filtered.filter((c) => {
      return (c.opportunity?.min_investment?? Infinity) <= budget;
    });
  }

  // Filter by application status
  if (applicationFilter === 'applied') {
    filtered = filtered.filter((c) => applied.includes(c.id));
  } else if (applicationFilter === 'not-applied') {
    filtered = filtered.filter((c) => !applied.includes(c.id));
  }

  // Search filter
  filtered = filtered.filter((c) =>
    (c.company_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Additional filters from original
  if (filterType !== "All") {
    filtered = filtered.filter(
      (c) => c.opportunity?.franchise_type === filterType
    );
  }

  if (filterCompanyName) {
    filtered = filtered.filter((c) =>
      (c.company_name ?? "")
        .toLowerCase()
        .includes(filterCompanyName.toLowerCase())
    );
  }

  if (filterMinInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value >= parseInt(filterMinInvestment, 10);
    });
  }

  if (filterMaxInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value <= parseInt(filterMaxInvestment, 10);
    });
  }

  const handleClearFilters = () => {
    setFilterType("All");
    setFilterCompanyName("");
    setFilterMinInvestment("");
    setFilterMaxInvestment("");
  };

  return (
    <>
      <EzNav user={users} />
      <div className="list-page">
        <div className="header-section">
          <div className="page-header">
            <h2>All Companies</h2>
            <p>Explore our diverse range of investments across various industries.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white">Budget</label>
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
                <label className="block text-sm font-medium text-white">Franchise Type / Category</label>
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
                <label className="block text-sm font-medium text-white">Application Status</label>
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
              <div>
                <label className="block text-sm font-medium text-white">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., Jollibee"
                  value={filterCompanyName}
                  onChange={(e) => setFilterCompanyName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border px-3 py-2 bg-white text-black"
                />
              </div>
            </div>

            <div className="filter-section-container">
              <div className="filter-group">
                <label htmlFor="companyType">Type:</label>
                <select
                  id="companyType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  {franchiseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Investment Amount:</label>
                <div className="investment-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterMinInvestment}
                    onChange={(e) => setFilterMinInvestment(e.target.value)}
                    className="filter-input small"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterMaxInvestment}
                    onChange={(e) => setFilterMaxInvestment(e.target.value)}
                    className="filter-input small"
                  />
                </div>
              </div>

              <button onClick={handleClearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="all-companies-page">
          <div className="company-list-container">
            {loading ? (
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
                    onApply={(companyId) => setApplyModal({ open: true, companyId })}
                    onCancelApply={(companyId) => setApplied((prev) => prev.filter((id) => id !== companyId))}
                    onViewDetails={(company) => handleViewDetails(company)}
                    isProfileComplete={isProfileComplete}
                    onProfileIncomplete={() => setShowProfileIncompleteModal(true)}
                    onLoginRequired={() => setOpen(true)}
                    variant="default"
                    showApplyButtons={true}
                    showCancelButton={true}
                    isLoggedIn={!!users}
                  />
                ))}
                  </div>
               )}

          {checked.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (!users) {
                  setOpen(true);
                } else if (!isProfileComplete) {
                  setShowProfileIncompleteModal(true);
                } else {
                  setBulkModal({ open: true });
                }
              }}
              className={`apply-selected-btn ${
                !users
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : !isProfileComplete
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : ''
              }`}
            >
              Apply Selected ({checked.length})
            </button>
          )}
        </div>
      </div>

      {/* Dialog modal */}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="dialog-content">
          <DialogTitle>Please Log In</DialogTitle>
          <p>You must be logged in to apply for franchises.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setOpen(false);
                router.get('/register');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Register
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.get('/login?redirect=' + encodeURIComponent(redirectUrl || window.location.pathname));
              }}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              Log In
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply modal */}
      <ApplyModal
        isOpen={applyModal.open}
        onClose={() => setApplyModal({ open: false, companyId: null })}
        companyId={applyModal.companyId || undefined}
        onApplySuccess={(appliedIds) => {
          setApplied((prev) => Array.from(new Set([...prev, ...appliedIds])));
        }}
      />

      {/* Bulk Apply modal */}
      <ApplyModal
        isOpen={bulkModal.open}
        onClose={() => setBulkModal({ open: false })}
        companyIds={checked}
        onApplySuccess={(appliedIds) => {
          setApplied((prev) => Array.from(new Set([...prev, ...appliedIds])));
          setChecked([]);
        }}
      />
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

      {/* Company Details Modal */}
      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      </div>
    </>
  );
};

export default AllCompanies;
