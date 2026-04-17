import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Calendar, DollarSign, Building2, Heart, Star } from 'lucide-react';
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

interface CompanyCardProps {
  company: Company;
  checked: boolean;
  onCheck: (companyId: number) => void;
  applied?: boolean;
  onApply?: (companyId: number) => void;
  onCancelApply?: (companyId: number) => void;
  onViewDetails: (company: Company) => void;
  isProfileComplete?: boolean;
  onProfileIncomplete?: () => void;
  onLoginRequired?: () => void;
  variant?: 'default' | 'improved'; // For different layouts
  showApplyButtons?: boolean;
  showCancelButton?: boolean;
  isLoggedIn?: boolean;
  wishlisted?: boolean;
  onWishlistToggle?: (companyId: number) => void;
  userRating?: number;
  avgRating?: number;
  totalRatings?: number;
  onRate?: (companyId: number, rating: number) => void;
}

const formatInvestment = (amount?: number) => {
  if (amount == null || isNaN(amount)) return "N/A";
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₱${amount.toLocaleString()}`;
  }
};

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  checked,
  onCheck,
  applied = false,
  onApply,
  onCancelApply,
  onViewDetails,
  isProfileComplete = true,
  onProfileIncomplete,
  onLoginRequired,
  variant = 'default',
  showApplyButtons = true,
  showCancelButton = true,
  isLoggedIn = false,
  wishlisted = false,
  onWishlistToggle,
  userRating = 0,
  avgRating = 0,
  totalRatings = 0,
  onRate,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('input')) {
      onCheck(company.id);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn && onLoginRequired) {
      onLoginRequired();
    } else if (!isProfileComplete && onProfileIncomplete) {
      onProfileIncomplete();
    } else if (onApply) {
      onApply(company.id);
    }
  };

  const handleCancelApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to cancel your application?")) {
      try {
        await axios.delete(`/applicant/applications/${company.id}`);
        if (onCancelApply) onCancelApply(company.id);
      } catch (err) {
        console.error('Cancel application failed', err);
        alert('Failed to cancel application. Please try again.');
      }
    }
  };

  if (variant === 'improved') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={() => onCheck(company.id)}
                className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {company.brand_name}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {company.marketing?.listing_description || company.description || 'No description available'}
            </p>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <span className="truncate font-medium">
                {[company.city, company.state_province, company.country]
                  .filter(Boolean)
                  .join(', ') || 'Location not specified'}
              </span>
            </div>

            {company.year_founded && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">Est. {company.year_founded}</span>
              </div>
            )}

            {company.opportunity?.min_investment !== undefined && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-medium">From {formatInvestment(company.opportunity.min_investment)}</span>
              </div>
            )}

            {company.opportunity?.franchise_type && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">{company.opportunity.franchise_type}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-all duration-200"
              onClick={() => onViewDetails(company)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant (all-companies style)
  return (
    <div
      onClick={handleCardClick}
      className={`group hover:shadow-xl company-card relative transition-all duration-300 shadow-md bg-white/80 backdrop-blur-sm p-0 ${
        applied
          ? 'cursor-not-allowed applied-card'
          : checked
          ? 'cursor-pointer selected-card hover:-translate-y-2'
          : 'cursor-pointer hover:-translate-y-1'
      }`}>
      {applied && (
        <div className="applied-badge">
          <span className="applied-text">✓ Applied</span>
        </div>
      )}

      <div className="company-header">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheck(company.id)}
          disabled={applied}
        />
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <img
            src={
              company.marketing?.logo_path
              ? company.marketing.logo_path.startsWith("http")
              ? company.marketing.logo_path
                : `/storage/${company.marketing.logo_path}`
                : "/background/default-logo.png"
            }
            alt={`${company.company_name} logo`}
            className="h-30 w-30 md:h-22 md:w-22 object-contain rounded-full border-4 border-white shadow-lg bg-gray-50 transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/background/default-logo.png";
            }}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {company.brand_name}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {company.marketing?.listing_description || company.description || "No description available"}
        </p>

        <div className="flex items-center gap-3 text-gray-600">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <span className="truncate font-medium">
            {[company.city, company.state_province, company.country]
              .filter(Boolean)
              .join(", ") || "Location not specified"}
          </span>
        </div>

        {company.year_founded && (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">Est. {company.year_founded}</span>
          </div>
        )}

        {company.opportunity?.min_investment !== undefined && (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="font-medium">
              From {formatInvestment(company.opportunity.min_investment)}
            </span>
          </div>
        )}

        {company.opportunity?.franchise_type && (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium">
              {company.opportunity.franchise_type}
            </span>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm"
        className={`view-details-link ${applied ? 'applied-link' : ''}`}
        onClick={(e) => { e.stopPropagation(); onViewDetails(company); }}>
        View Details
      </Button>

      {showApplyButtons && (
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {!isProfileComplete ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleApplyClick}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Apply
            </Button>
          ) : !applied ? (
            <Button variant="link" size="sm"
              onClick={handleApplyClick}
              disabled={applied}
              className={`apply-button rounded-md text-white transition ${applied ? 'applied' : ''}`}
            >
              {applied ? 'Applied' : 'Apply'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleApplyClick}
                className="apply-button applied bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Applied
              </Button>
              {showCancelButton && (
                <Button variant="destructive" size="sm"
                  onClick={handleCancelApply}
                  className="cancel-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Cancel Apply
                </Button>
              )}
            </>
          )}

          {onWishlistToggle && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onWishlistToggle(company.id); }}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
          )}

          {onRate && (
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRate(company.id, star === userRating ? 0 : star); }}
                    className="transition-transform hover:scale-110"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= (userRating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {totalRatings > 0 && (
                <span className="text-xs text-gray-400">
                  {Number(avgRating).toFixed(1)} / 5 ({totalRatings})
                </span>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CompanyCard;
