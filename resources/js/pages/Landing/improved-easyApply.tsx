import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Search, Filter, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Services from "./services";
import About from "./about";
import Contact from "./contact";
import EzNav from "./ezapply-nav";
import CompanyCard from "@/components/CompanyCard";
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import ApplyModal from '@/components/ApplyModal';
import axios from 'axios';
import WelcomeModal from "@/components/WelcomeModal";
import AdBanner from "@/components/AdBanner";
interface Ad {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    file_type: string;
    placement: string;
}
interface Company {
  id: number;
  company_name: string;
  brand_name?: string;
  city?: string;
  state_province?: string;
  country?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status: string;
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
  };
  marketing?: {
    listing_description?: string;
    logo_path?: string;
  };
}

export default function ImprovedEasyApplyLanding() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<number[]>(() => {
    const saved = localStorage.getItem("pendingApplications");
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        return Array.isArray(ids) ? ids : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [type, setType] = useState("all");
  const [amount, setAmount] = useState("all");

  const [open, setOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { auth } = usePage().props as { auth?: { user?: { id: number; name: string; email: string } } };
  const { ads = [] } = usePage<{ ads: Ad[] }>().props;
  const users = auth?.user;

  const { isProfileComplete } = useProfileStatus();

  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const [budget, setBudget] = useState<number | ''>('');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applied, setApplied] = useState<number[]>([]);

  const [applyModal, setApplyModal] = useState<{open: boolean; companyId: number | null}>({ open: false, companyId: null });
  const [bulkModal, setBulkModal] = useState<{open: boolean}>({ open: false });
  const [numberToShow, setNumberToShow] = useState(3);


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

  const handleCheck = (companyId: number) => {
    setChecked(prev => {
      const updated = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      localStorage.setItem("pendingApplications", JSON.stringify(updated));
      return updated;
    });
  };



  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
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

    localStorage.removeItem("profileRedirect");
  }, []);

  useEffect(() => {
    if (users) {
      axios.get("/api/applied-company-ids")
        .then((res) => {
          setApplied(res.data);
          setChecked(prev => prev.filter(id => !res.data.includes(id)));
        })
        .catch((err) => {
          console.error("Error fetching applied company IDs:", err);
        });
    }
  }, [users]);

  const franchiseTypes = Array.from(
    new Set(companies.map((c) => c.opportunity?.franchise_type).filter(Boolean))
  );

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

  if (amount !== "all") {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      if (amount === "10m") return value <= 10000000;
      if (amount === "35m") return value <= 35000000;
      if (amount === "1m") return value <= 1000000;
      return true;
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

  // Store total filtered before slicing
  const totalFiltered = filtered.length;

  // Limit to numberToShow companies for landing page
  filtered = filtered.slice(0, numberToShow);



  return (
    <ErrorBoundary>
      <Head title="EZ Apply PH" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <EzNav user={users} />
        <WelcomeModal />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-white to-blue-200"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-48 translate-x-48 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full translate-y-40 -translate-x-40 opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto text-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight mt-2">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-indigo-500">Franchise</span> Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover vetted franchise opportunities and grow your business with confidence. 
              Join thousands of successful entrepreneurs who found their perfect match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/list-companies" className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Browse All Companies
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold border-2 hover:bg-blue-50 transition-all duration-300">
                <Link href="#services" className="flex items-center gap-2">
                  Our Services
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Franchise Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Successful Entrepreneurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </section>
       {/* Homepage Hero Banner Ads */}
  {ads.filter(a => a.placement === 'homepage_hero').length > 0 && (
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white">
          <div className="max-w-7xl mx-auto">
              <p className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wide">Advertisement</p>
              <AdBanner ads={ads} placement="homepage_hero" />
          </div>
      </div>
  )}
        {/* Filter Section */}
        <section  className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-5 to-blue-200 border border-black-600 inset-shadow-sm" id="filters" >
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Franchise</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Use our advanced filters to discover franchise opportunities that match your investment goals and business interests
              </p>
            </div>
            
            <Card className="shadow-lg border-0">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search companies by name, industry, or location..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Franchise Type
                      </label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select franchise type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                        {franchiseTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t || 'Unknown'}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Investment Range
                      </label>
                      <Select value={amount} onValueChange={setAmount}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select investment range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Amounts</SelectItem>
                          <SelectItem value="1m">₱1,000,000 - ₱5,000,000</SelectItem>
                          <SelectItem value="10m">₱5,000,000 - ₱15,000,000</SelectItem>
                          <SelectItem value="35m">₱15,000,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {totalFiltered} companies found
                  </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch('');
                        setType('all');
                        setAmount('all');
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
  {/* Search Results Ads */}
  {ads.filter(a => a.placement === 'search_results').length > 0 && (
      <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
              <AdBanner ads={ads} placement="search_results" />
          </div>
      </div>
  )}
        {/* Companies Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 inset-shadow-sm" id="companies">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Available Franchise Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover vetted franchise opportunities from established companies across various industries
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalFiltered}</div>
                  <div className="text-sm text-gray-600">Companies Found</div>
                </div>
                {checked.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{checked.length}</div>
                    <div className="text-sm text-gray-600">Selected</div>
                  </div>
                )}
              </div>
              
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

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="loader scale-75"></div>
                <span className="ml-2 text-gray-600">Loading companies...</span>
              </div>
            ) : error ? (
              <Card>
                <div className="py-12 text-center">
                  <div className="text-destructive mb-4">
                    <Filter className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Failed to load companies</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <div className="py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No companies found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </div>
              </Card>
            ) : (
    <>
        <div className="flex gap-6">
            {/* Main Company Grid */}
            <div className="flex-1">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

    {/* Show More Button */}
    {totalFiltered > numberToShow && (
        <div className="text-center mt-6">
            <button
                onClick={() => setNumberToShow(prev => prev + 3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Show More Companies
            </button>
        </div>
    )}
</div>

            {/* Sidebar Ads */}
            {ads.filter(a => a.placement === 'sidebar').length > 0 && (
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="sticky top-4 space-y-4">
                        <p className="text-xs text-gray-400 text-center uppercase tracking-wide">Advertisement</p>
                        <AdBanner ads={ads} placement="sidebar" />
                    </div>
                </div>
            )}
        </div>
              </>
            )}
          </div>
        </section>

        <Services />
        <About />
        <Contact />

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
    </ErrorBoundary>
  );
}
