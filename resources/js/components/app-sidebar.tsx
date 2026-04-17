import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import React from 'react';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Lock, LockKeyhole, UserIcon, Building2, MessageCircle, Banknote, List, BarChart2, CreditCard, Coins, Heart, BarChart3, Megaphone, FileImage } from 'lucide-react';
import AppLogo from './app-logo';
import PermissionGate from './PermissionGate';
import { usePermissions } from '@/hooks/use-permissions';
import AdBanner from '@/components/AdBanner';
import { useSidebar } from '@/components/ui/sidebar';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view_dashboard',
    },
    {
        title: 'Customer Profile',
        href: '/applicant/profile',
        icon: UserIcon,
        permission: 'view_customer_dashboard',
    },
    {
        title: 'Applied Companies',
        href: '/applicant/franchise/appliedcompanies',
        icon: MessageCircle,
        permission: 'view_customer_dashboard',
    },

    {
        title: 'My Wishlist',
        href: '/applicant/wishlist',
        icon: Heart,
        permission: 'view_customer_dashboard',
    },

    {
        title: 'My Companies',
        href: '/my-companies',
        icon: Building2,
        permission: 'view_company_dashboard',
    },
    {
        title: 'Applicants',
        href: '/company-applicants',
        icon: UserIcon,
        permission: 'view_applications',
    },
    {
        title: 'My Ads',
        href: '/advertisements',
        icon: Megaphone,
        permission: 'view_company_dashboard',
    },
    {
        title: 'Ad Management',
        href: '/admin/advertisements',
        icon: Megaphone,
        permission: 'view_request_companies',
    },
    {
        title: 'My Fliers',
        href: '/fliers',
        icon: FileImage,
        permission: 'view_company_dashboard',
    },
    {
        title: 'Flier Management',
        href: '/admin/fliers',
        icon: FileImage,
        permission: 'view_request_companies',
    },
    {
        title: 'Reports',
        href: '/company/reports',
        icon: BarChart3,
        permission: 'view_applications',
    },
    {
        title: 'Your Chats',
        href: '/view-chats',
        icon: MessageCircle,
        permission: 'view_chats',
    },
    {
        title: 'Credit Balance',
        href: '/credit-balance',
        icon: Banknote,
        permission: 'view_balance',
    },

    // Admin only
    {
        title: 'Users',
        href: '/users',
        icon: UserIcon,
        permission: 'view_users',
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: LockKeyhole,
        permission: 'view_roles',
    },
    {
        title: 'Permissions',
        href: '/permissions',
        icon: Lock,
        permission: 'view_permissions',
    },
    {
        title: 'Company Requests',
        href: '/company-requests',
        icon: List,
        permission: 'view_request_companies',
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart2,
        permission: 'view_users',
    },
    {
        title: 'EZCoin',
        href: '/ezcoin',
        icon: Coins,
        permission: 'view_users',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Home Page',
        href: `/`,
        icon: BookOpen,
        permission: 'view home page',
    }
];

function SidebarAds() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const { ads = [] } = usePage<{ ads: any[] }>().props;
    const { isCustomer } = usePermissions();
    const [current, setCurrent] = React.useState(0);
    const [paused, setPaused] = React.useState(false);

    const sidebarAds = ads.filter((a: any) => a.placement === 'sidebar');

    React.useEffect(() => {
        if (sidebarAds.length <= 1 || paused) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % sidebarAds.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [sidebarAds.length, paused]);

    React.useEffect(() => {
        setCurrent(0);
    }, [sidebarAds.length]);

    if (isCollapsed) return null;
    if (!isCustomer()) return null;
    if (sidebarAds.length === 0) return null;

    const ad = sidebarAds[current];
    const prev = () => setCurrent((c) => (c - 1 + sidebarAds.length) % sidebarAds.length);
    const next = () => setCurrent((c) => (c + 1) % sidebarAds.length);

    const renderAdMedia = () => {
        if (ad.file_type === "video") {
            return (
                <video
                    key={ad.id}
                    src={`/storage/${ad.file_path}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-28 object-cover"
                />
            );
        }
        return (
            <div className="relative">
                <img
                    key={ad.id}
                    src={`/storage/${ad.file_path}`}
                    alt={ad.title}
                    className="w-full h-28 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <p className="text-white text-xs font-semibold truncate">{ad.title}</p>
                </div>
            </div>
        );
    };

    const renderControls = () => {
        if (sidebarAds.length <= 1) return null;
        return (
            <div className="flex items-center justify-between mt-1">
                <button
                    onClick={prev}
                    className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                    ‹
                </button>
                <div className="flex gap-1">
                    {sidebarAds.map((_: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-blue-500' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={next}
                    className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                    ›
                </button>
            </div>
        );
    };

    return (
        <div
            className="px-2 pb-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <p className="text-xs text-gray-400 text-center uppercase tracking-wide mb-1">
                Sponsored
            </p>
            <a
                href={`/companies/${ad.company_id}/details`}
                className="block rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
                {renderAdMedia()}
            </a>
            {renderControls()}
        </div>
    );
}
export function AppSidebar() {
    const page = usePage();
    const { isAdmin } = usePermissions();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />


                {/* Browse Franchise — Customer only */}
                <PermissionGate role='customer'>
                    <div className="mt-4">
                        <div className="px-4 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Franchise Application
                        </div>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/applicant/franchise">
                                        <Building2 className="h-4 w-4" />
                                        <span>Browse Franchise Companies</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                </PermissionGate>
            </SidebarContent>

            <SidebarFooter>
    <SidebarAds />
    <NavFooter items={footerNavItems} className="mt-auto" />
    <NavUser />
</SidebarFooter>
        </Sidebar>
    );
}