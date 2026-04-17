export interface CompanyDetails {
  agents?: Array<{
    id: number;
    email: string;
    basicInfo?: {
      first_name: string;
      last_name: string;
    };
  }>;
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
    first_name?: string;
    last_name?: string;
    email: string;
    basicInfo?: {
      first_name: string;
      last_name: string;
    };
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
  documents?: {
    dti_sbc_path?: string;
    bir_2303_path?: string;
    ipo_registration_path?: string;
  };
  fliers?: Array<{
    id: number;
    file_path: string;
    caption?: string;
}>;
}
