import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import PermissionGate from '@/components/PermissionGate';
import ChatButton from "@/components/ui/chat-button";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Building2, Calendar, Filter, FolderOpen, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from 'react';
import '../../../css/easyApply.css';
 
const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Applied Companies", href: "/applicant/franchise/appliedcompanies" },
];
 
type PageProps = {
    applications?: Application[];
    otherCompanies?: CompanyDetails[];
};
 
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
    status?: string;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    opportunity?: any;
    background?: any;
    requirements?: any;
    marketing?: {
        listing_title?: string;
        listing_description?: string;
        logo_path?: string;
        target_profile?: string;
        preferred_contact_method?: string;
    };
};
 
type Application = {
    id: number;
    status: string;
    desired_location?: string | null;
    deadline_date?: string | null;
    created_at?: string;
    company: CompanyDetails;
};
 
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending:    'bg-yellow-100 text-yellow-800 border-yellow-300',
        approved:   'bg-green-100 text-green-800 border-green-300',
        rejected:   'bg-red-100 text-red-800 border-red-300',
        interested: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const cls = map[status] || map['pending'];
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}
 
// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 dark:bg-neutral-800 rounded-full p-6 mb-4">
                <FolderOpen className="w-12 h-12 text-gray-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-neutral-300 mb-1">
                No companies applied yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500 max-w-xs">
                You haven't applied to any franchise companies yet. Browse available companies and submit an application to get started.
            </p>
           
                href="/applicant/franchise"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
            <a>
                Browse Companies
            </a>
        </div>
    );
}
 
// ── Fan Carousel ─────────────────────────────────────────────────────────────
function FanCarousel({ companies }: { companies: CompanyDetails[] }) {
    const [active, setActive] = useState(0);
    const total = companies.length;
    const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
    const next = useCallback(() => setActive(i => (i + 1) % total), [total]);
 
    useEffect(() => {
        if (total <= 1) return;
        autoRef.current = setInterval(next, 4000);
        return () => { if (autoRef.current) clearInterval(autoRef.current); };
    }, [next, total]);
 
    const resetAuto = () => {
        if (autoRef.current) clearInterval(autoRef.current);
        autoRef.current = setInterval(next, 4000);
    };
 
    const prev = useCallback(() => {
        setActive(i => (i - 1 + total) % total);
        resetAuto();
    }, [total]);
 
    const nextAndReset = useCallback(() => {
        next();
        resetAuto();
    }, [next]);
 
    if (total === 0) return null;
 
    const getOffset = (idx: number) => {
        let d = idx - active;
        if (d > total / 2) d -= total;
        if (d < -total / 2) d += total;
        return d;
    };
 
    const slotStyle = (d: number): React.CSSProperties => {
        const absD = Math.abs(d);
        if (absD > 2) return { display: 'none' };
        const configs: Record<number, { x: number; scale: number; rotate: number; z: number; opacity: number }> = {
            0: { x: 0,   scale: 1,    rotate: 0,  z: 50, opacity: 1 },
            1: { x: 210, scale: 0.82, rotate: 12, z: 40, opacity: 0.92 },
            2: { x: 360, scale: 0.66, rotate: 22, z: 30, opacity: 0.7 },
        };
        const c = configs[absD];
        const sign = d < 0 ? -1 : 1;
        return {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateX(${sign * c.x}px) scale(${c.scale}) rotate(${sign * c.rotate}deg)`,
            zIndex: c.z,
            opacity: c.opacity,
            transition: 'all 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
        };
    };
 
    return (
        <div className="relative w-full overflow-hidden" style={{ height: 360 }}>
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #60a5fa 100%)' }} />
 
            {/* Sponsored label */}
            <span className="absolute top-3 right-4 z-[70] text-[10px] font-semibold text-white/70 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
                Sponsored
            </span>
 
            {companies.map((company, idx) => {
                const d = getOffset(idx);
                if (Math.abs(d) > 2) return null;
                const logo = company.marketing?.logo_path
                    ? company.marketing.logo_path.startsWith('http')
                        ? company.marketing.logo_path
                        : `/storage/${company.marketing.logo_path}`
                    : '/background/default-logo.png';
                const location = [company.city, company.state_province].filter(Boolean).join(', ') || 'Unknown Location';
                const title = company.marketing?.listing_title || company.company_name;
 
                return (
                    <div key={company.id} style={slotStyle(d)}>
                        <div className="rounded-2xl overflow-hidden shadow-2xl select-none" style={{ width: 200, height: 270, position: 'relative', background: '#1a1a2e' }}>
 
                            {/* Blurred bg for depth */}
                            <img
                                src={logo}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-40"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/background/default-logo.png'; }}
                            />
 
                            {/* Actual logo — centered and contained */}
                            <div className="absolute inset-0 flex items-center justify-center p-4" style={{ bottom: '60px' }}>
                                <img
                                    src={logo}
                                    alt={company.company_name}
                                    className="w-full h-36 object-contain drop-shadow-lg"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/background/default-logo.png'; }}
                                />
                            </div>
 
                            {/* Bottom gradient */}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.0) 65%)' }} />
 
                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                <p className="text-sm font-bold leading-tight mb-1">{title}</p>
                                <p className="text-xs text-gray-300 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />{location}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
 
            {total > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-1.5 transition">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button onClick={nextAndReset} className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-1.5 transition">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </>
            )}
 
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-[60]">
                {companies.map((_, i) => (
                    <button key={i} onClick={() => { setActive(i); resetAuto(); }}
                        className={`rounded-full transition-all ${i === active ? 'bg-white w-4 h-2' : 'bg-white/50 w-2 h-2'}`} />
                ))}
            </div>
        </div>
    );
}
 
// ── Application Card ──────────────────────────────────────────────────────────
function ApplicationCard({ application, handleCompanyClick }: {
    application: Application,
    handleCompanyClick: (company: CompanyDetails, status: string) => void
}) {
    const { company, status } = application;
    const logo = company.marketing?.logo_path
        ? company.marketing.logo_path.startsWith('http')
            ? company.marketing.logo_path
            : `/storage/${company.marketing.logo_path}`
        : '/background/default-logo.png';
    const title = company.marketing?.listing_title || company.company_name;
    const location = application.desired_location || [company.city, company.state_province].filter(Boolean).join(', ') || 'Unknown Location';
 
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-100 dark:border-neutral-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="relative h-32 w-full bg-gray-100 dark:bg-neutral-700">
                <img src={logo} alt={company.company_name} className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = '/background/default-logo.png'; }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 30%, transparent 100%)' }} />
                <div className="absolute top-2 right-2">
                    <StatusBadge status={status || 'pending'} />
                </div>
            </div>
 
            <div className="px-4 -mt-6 flex items-end gap-3">
                <img src={logo} alt={`${company.company_name} logo`}
                    className="h-12 w-12 rounded-full border-2 border-white shadow object-contain bg-white flex-shrink-0"
                    onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = '/background/default-logo.png'; }} />
                <div className="pb-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate drop-shadow">{title}</p>
                </div>
            </div>
 
            <div className="px-4 pt-3 pb-2 flex flex-col gap-1.5 flex-1 text-xs text-gray-500 dark:text-gray-400">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{company.company_name}</p>
                {company.opportunity?.franchise_type && (
                    <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3 flex-shrink-0" />{company.opportunity.franchise_type}</span>
                )}
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{location}</span>
                {application.created_at && (
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3 flex-shrink-0" />Applied {new Date(application.created_at).toLocaleDateString()}</span>
                )}
            </div>
 
            <div className="px-4 pb-4 flex flex-col gap-2 mt-2">
                <button className="view-btn btn-2 w-full text-center py-2 rounded text-sm" onClick={() => handleCompanyClick(company, status)}>
                    View Company Profile
                </button>
                <ChatButton status={status} userId={company.user?.id} className="w-full text-center py-2 text-sm" />
            </div>
        </div>
    );
}
 
// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppliedCompanies() {
    const { props } = usePage<PageProps>();
    const applications: Application[] = props.applications ?? [];
    const otherCompanies: CompanyDetails[] = props.otherCompanies ?? [];
 
    const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [franchiseTypeFilter, setFranchiseTypeFilter] = useState('');
    const [uniqueFranchiseTypes, setUniqueFranchiseTypes] = useState<string[]>([]);
 
    useEffect(() => {
        const types = applications
            .map(app => app.company.opportunity?.franchise_type)
            .filter((type): type is string => Boolean(type))
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();
        setUniqueFranchiseTypes(types);
    }, [applications]);
 
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);
 
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.company.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || app.status === statusFilter;
        const matchesBrand = brandFilter === '' || (app.company.brand_name?.toLowerCase().includes(brandFilter.toLowerCase()) ?? false);
        const matchesFranchiseType = franchiseTypeFilter === '' || (app.company.opportunity?.franchise_type?.toLowerCase().includes(franchiseTypeFilter.toLowerCase()) ?? false);
        const matchesDateRange = (() => {
            if (!app.created_at) return true;
            const normalizeDate = (date: Date) => { const n = new Date(date); n.setHours(0, 0, 0, 0); return n; };
            const normalizedAppDate = normalizeDate(new Date(app.created_at));
            const normalizedStartDate = startDateFilter ? normalizeDate(new Date(startDateFilter)) : null;
            const normalizedEndDate = endDateFilter ? normalizeDate(new Date(endDateFilter)) : null;
            if (normalizedStartDate && normalizedEndDate) return normalizedAppDate >= normalizedStartDate && normalizedAppDate <= normalizedEndDate;
            if (normalizedStartDate) return normalizedAppDate >= normalizedStartDate;
            if (normalizedEndDate) return normalizedAppDate <= normalizedEndDate;
            return true;
        })();
        return matchesSearch && matchesStatus && matchesBrand && matchesFranchiseType && matchesDateRange;
    });
 
    const handleCompanyClick = (company: CompanyDetails, status: string) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };
 
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCompany(null);
    };
 
    return (
        <PermissionGate permission="view_customer_dashboard" fallback={<div className="p-6">You don't have permission to access this page.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Applied Companies" />
                <div className="bg-across-pages min-h-screen p-5">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                            Applied Companies
                        </h1>
 
                        {loading ? (
                            <div className="p-6 flex flex-col items-center justify-center">
                                <div className="loader scale-75"></div>
                                <div className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading company details...</div>
                            </div>
                        ) : (
                            <>
                                {otherCompanies.length > 0 && (
                                    <div className="mb-6">
                                        <FanCarousel companies={otherCompanies} />
                                    </div>
                                )}
 
                                {applications.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    <>
                                        {/* ── Filters ── */}
                                        <div className="mb-5">
                                            <div className="flex flex-col lg:flex-row gap-4">
                                                <div className="flex-1 relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input type="text" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100" />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input type="text" placeholder="Filter by brand..." value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm" />
                                                    </div>
                                                    <div className="relative">
                                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <select value={franchiseTypeFilter} onChange={(e) => setFranchiseTypeFilter(e.target.value)}
                                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm">
                                                            <option value="">All Franchise Types</option>
                                                            {uniqueFranchiseTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="relative">
                                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100">
                                                            <option value="">All Status</option>
                                                            <option value="pending">Pending</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="rejected">Rejected</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-3 md:flex-row md:gap-2 w-full md:w-auto">
                                                        <div className="relative w-full md:w-auto">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                            <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)}
                                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm w-full" />
                                                        </div>
                                                        <div className="relative w-full md:w-auto">
                                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                            <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)}
                                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm w-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
 
                                        {/* ── Card Grid ── */}
                                        {filteredApplications.length === 0 ? (
                                            <div className="py-10 text-center text-gray-500 dark:text-neutral-400">
                                                No companies match your search or filters.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {filteredApplications.map((a) => (
                                                    <ApplicationCard key={a.id} application={a} handleCompanyClick={handleCompanyClick} />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
 
                <CompanyDetailsModal company={selectedCompany} isOpen={isModalOpen} onClose={handleCloseModal} />
            </AppLayout>
        </PermissionGate>
    );
}