import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import PermissionGate from "@/components/PermissionGate";
import CompanyDetailsModal from "@/components/CompanyDetailsModal";
import CompanyCard from "@/components/CompanyCard";
import ApplyModal from "@/components/ApplyModal";
import { useProfileStatus } from "@/hooks/useProfileStatus";
import { Heart } from "lucide-react";
import "../../../css/easyApply.css";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "My Wishlist", href: "/applicant/wishlist" },
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

const Wishlist = () => {
  const { props } = usePage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialCompanies: CompanyDetails[] = Array.isArray((props as any).companies)
    ? (props as any).companies
    : [];

  const { isProfileComplete } = useProfileStatus();
  const [companies, setCompanies] = useState<CompanyDetails[]>(initialCompanies);
  const [wishlisted, setWishlisted] = useState<number[]>(initialCompanies.map((c) => c.id));
  const [applied, setApplied] = useState<number[]>([]);
  const [applyModal, setApplyModal] = useState<{ open: boolean; companyId: number | undefined }>({
    open: false,
    companyId: undefined,
  });
  const [applying, setApplying] = useState<number | null>(null);
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/api/applied-company-ids")
      .then((res) => setApplied(res.data))
      .catch((err) => console.error("Error fetching applied IDs:", err));
  }, []);

  const handleWishlistToggle = (companyId: number) => {
    axios
      .post("/api/wishlist/toggle", { company_id: companyId })
      .then((res) => {
        if (!res.data.wishlisted) {
          // Remove from this page immediately
          setWishlisted((prev) => prev.filter((id) => id !== companyId));
          setCompanies((prev) => prev.filter((c) => c.id !== companyId));
        }
      })
      .catch((err) => console.error("Wishlist toggle failed:", err));
  };

  const handleApplySingle = (companyId: number) => {
    if (!isProfileComplete) {
      setShowProfileIncompleteModal(true);
      return;
    }
    if (applying !== null) return;
    setApplying(companyId);
    setApplyModal({ open: true, companyId });
  };

  const handleViewDetails = (company: CompanyDetails) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <PermissionGate
      permission="apply_for_franchises"
      fallback={<div className="p-6">You don't have permission to view your wishlist.</div>}
    >
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="My Wishlist" />

        <div className="p-6 bg-across-pages dark:bg-neutral-900 rounded-xl shadow-md">
          <section className="hero">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              <h1 className="text-2xl font-bold text-white dark:text-neutral-100">
                My Wishlist
              </h1>
            </div>
            <p className="text-gray-200 dark:text-gray-400 mb-6">
              {companies.length === 0
                ? "You haven't saved any franchise companies yet."
                : `You have ${companies.length} saved franchise${companies.length !== 1 ? "s" : ""}.`}
            </p>
          </section>

          <div className="all-companies-page">
            <div className="company-list-container">
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No saved franchises yet</h3>
                  <p className="text-gray-400 mb-6">
                    Browse franchise companies and click the heart icon to save them here.
                  </p>
                  <a
                    href="/applicant/franchise"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Browse Franchises
                  </a>
                </div>
              ) : (
                <div className="company-grid">
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      checked={false}
                      onCheck={() => {}}
                      applied={applied.includes(company.id)}
                      onApply={handleApplySingle}
                      onCancelApply={(companyId) =>
                        setApplied((prev) => prev.filter((id) => id !== companyId))
                      }
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
                    />
                  ))}
                </div>
              )}
            </div>

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
                  setApplying(null);
                }}
              />
            )}
          </div>

          {showProfileIncompleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Incomplete Profile</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  You cannot apply yet because your profile is incomplete. Please fill in your Basic
                  Information and Financial Information.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowProfileIncompleteModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                  >
                    Cancel
                  </button>
                  <a
                    href="/applicant/profile"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Fill Up Profile
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <CompanyDetailsModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCompany(null);
          }}
        />
      </AppLayout>
    </PermissionGate>
  );
};

export default Wishlist;
