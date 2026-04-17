import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useState } from 'react';
import DisplayBalance from '@/components/balance-display';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import ProfileStatusCard from '@/components/ProfileStatusCard';
import AdBanner from '@/components/AdBanner';
import { usePage } from '@inertiajs/react';

function DisplayBalanceWrapper() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return <DisplayBalance isCollapsed={isCollapsed} />;
}

function SidebarAds() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const { ads = [] } = usePage<{ ads: any[] }>().props;

    if (isCollapsed) return null;
    if (!ads || ads.filter((a: any) => a.placement === 'sidebar').length === 0) return null;

    return (
        <div className="px-2 pb-4">
            <p className="text-xs text-gray-400 text-center uppercase tracking-wide mb-2">
                Advertisement
            </p>
            <AdBanner ads={ads} placement="sidebar" />
        </div>
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <SidebarProvider>
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden p-2">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="absolute top-3 right-4">
                <DisplayBalanceWrapper />
                </div>
                {children}
            </AppContent>
            </SidebarProvider>
        </AppShell>
    );
}