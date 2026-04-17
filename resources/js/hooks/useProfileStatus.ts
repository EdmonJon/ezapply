import { usePage } from '@inertiajs/react';

export const useProfileStatus = () => {
  const { props } = usePage();
  const user = (props as any).auth?.user;
  const profileComplete = (props as any).profileComplete ?? false;

  // Check if user has basic info and financial data
  const hasBasicInfo = user?.basicInfo && !!(user.basicInfo.first_name);
  const hasFinancial = user?.financial && !!(user.financial.income_source);

  const isProfileComplete = hasBasicInfo && hasFinancial;
  const hasAnyData = hasBasicInfo || hasFinancial;

  return { isProfileComplete, hasAnyData };
};
