import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import ProfileStatusCard from '@/components/ProfileStatusCard';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  const { props: inertiaProps } = usePage();
  const user = inertiaProps.auth?.user;
  const [showCard, setShowCard] = useState(true);

return(
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
    {user && !user.complete && showCard && (
        <div className="fixed top-4 right-4 z-50">
          <ProfileStatusCard
            type={user.hasAnyData ? "warning" : "error"}
            message={
        user.hasAnyData
          ? "Your customer profile is incomplete. Please update your information to continue."
          : "Your customer profile is completely empty. Please fill it out to continue."
      }
            onClose={() => setShowCard(false)}
          />
        </div>
      )}
        {children}
        <Toaster richColors/>
    </AppLayoutTemplate>
);
}