import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Building2 } from 'lucide-react';

// Type-only import for CompanyDetails from the centralized types file
import type { CompanyDetails } from '@/types/company';

type CompanySummaryCardProps = {
  company: CompanyDetails;
  onMoreDetails: () => void;
  className?: string;
  loading?: boolean;
};

const CompanySummaryCard: React.FC<CompanySummaryCardProps> = ({ 
  company, 
  onMoreDetails, 
  className,
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className={`w-full ${className || ''}`}>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = company.brand_name && company.brand_name !== company.company_name
    ? ` ${company.brand_name}(${company.company_name})`
    : company.company_name;

  const displayDescription = company.marketing?.listing_description || company.description || 'No description available';

  const displayLocation = [company.city, company.state_province, company.country]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  const formatInvestment = (amount: number) => {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    }
    return `₱${amount.toLocaleString()}`;
  };

  return (
    <Card className={`w-full hover:shadow-md transition-shadow duration-200 ${className || ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">
              {displayName}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {company.opportunity?.franchise_type || 'Franchise Opportunity'}
            </CardDescription>
          </div>
          {company.status && (
            <Badge 
              variant={company.status === 'approved' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {company.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {displayDescription}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{displayLocation}</span>
          </div>
          
          {company.year_founded && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Est. {company.year_founded}</span>
            </div>
          )}
          
          {company.opportunity?.min_investment && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>From {formatInvestment(company.opportunity.min_investment)}</span>
            </div>
          )}
          
          {company.num_franchise_locations && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{company.num_franchise_locations} locations</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onMoreDetails}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySummaryCard;