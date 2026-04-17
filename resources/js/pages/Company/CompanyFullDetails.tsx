import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInitials } from '@/hooks/use-initials';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import type { CompanyDetails } from '@/types/company';
import PermissionGate, { AdminOnly } from '@/components/PermissionGate';

type FormatType = "number" | "currency";

type Agent = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const formatValue = (value: string | number, type: FormatType = "number") => {
  if (type === "currency") {
    const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(num);
  }

  const strValue = String(value);
  const cleaned = strValue.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const renderTable = (rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]) => (
  <table className="w-full text-sm">
    <tbody>
      {rows.map(({ key, label, value, format }) => (
        <tr key={key} className="border-b last:border-b-0">
          <td className="font-medium text-muted-foreground py-3 pr-6 align-top w-1/3">{label}</td>
          <td className="py-3 align-top whitespace-pre-wrap">
            {format === "currency" ? formatValue(value, "currency") : value ?? ""}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const mapCompanyAgentsToAgents = (agents: CompanyDetails['agents']): Agent[] => {
  if (!agents || agents.length === 0) return [];
  return agents.map(agent => ({
    id: agent.id,
    name: agent.basicInfo 
      ? `${agent.basicInfo.first_name} ${agent.basicInfo.last_name}` 
      : agent.email,
    email: agent.email,
    role: 'company',
  }));
};

const getUserDisplayName = (user: any): string => {
  if (!user) return '';
  if (user.basicInfo && (user.basicInfo.first_name || user.basicInfo.last_name)) {
    return `${user.basicInfo.first_name || ''} ${user.basicInfo.last_name || ''}`.trim();
  }
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email || '';
};

const CompanyFullDetails: React.FC = () => {
  const { props } = usePage<{ company: CompanyDetails; allAgents?: Agent[] }>();
  const company = props.company;
  const allAgentsFromProps = props.allAgents || [];
  const getInitials = useInitials();

  const [query, setQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [assignedAgents, setAssignedAgents] = useState<Agent[]>(() => {
    const agentsFromRelation = mapCompanyAgentsToAgents(company.agents || []);
    
    if (company.user) {
      const ownerAgent: Agent = {
        id: company.user.id,
        name: getUserDisplayName(company.user),
        email: company.user.email,
        role: 'company',
      };
      
      const ownerExists = agentsFromRelation.some(a => a.id === ownerAgent.id);
      if (!ownerExists) {
        agentsFromRelation.unshift(ownerAgent); 
      }
    }
    
    console.log('Initializing assignedAgents:', agentsFromRelation);
    return agentsFromRelation;
  });

  const filteredResults = useMemo(() => {
    if (!query) return [];
    const assignedIds = assignedAgents.map(a => a.id);
    return allAgentsFromProps
      .filter(agent => 
        !assignedIds.includes(agent.id) &&
        (agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.email.toLowerCase().includes(query.toLowerCase()))
      );
  }, [query, allAgentsFromProps, assignedAgents]);

  const handleAssign = () => {
    if (!selectedAgent) return;

    const newAssignedAgents = assignedAgents.find(a => a.id === selectedAgent.id)
      ? assignedAgents
      : [...assignedAgents, selectedAgent];

    setAssignedAgents(newAssignedAgents);
    setSelectedAgent(null);
    setQuery("");

    const agentIds = newAssignedAgents.map(agent => agent.id);

    router.post(`/company/${company.id}/assign-agents`, {
      agent_ids: agentIds,
    }, {
      onSuccess: () => {

      },
      onError: (errors) => {
        console.error('Error assigning agents:', errors);
        if (errors?.message) {
          alert(`Error: ${errors.message}`);
        } else if (typeof errors === 'string') {
          alert(`Error: ${errors}`);
        } else {
          alert('Failed to assign agents. Please check your permissions and try again.');
        }
      },
    });
  };

  useEffect(() => {
    const agentsFromRelation = mapCompanyAgentsToAgents(company.agents || []);
    

    if (company.user) {
      const ownerAgent: Agent = {
        id: company.user.id,
        name: getUserDisplayName(company.user),
        email: company.user.email,
        role: 'company',
      };
      
      const ownerExists = agentsFromRelation.some(a => a.id === ownerAgent.id);
      if (!ownerExists) {
        agentsFromRelation.unshift(ownerAgent);
      }
    }
    
    console.log('useEffect: assignedAgents updated:', agentsFromRelation);
    setAssignedAgents(agentsFromRelation);
  }, [company.id, company.user, company.agents]);


  const handleRemoveAgent = (agentId: number) => {
    if (company.user && company.user.id === agentId) {
      alert('Cannot remove the company owner. The owner must always be associated with the company.');
      return;
    }

    const newAgents = assignedAgents.filter(agent => agent.id !== agentId);
    setAssignedAgents(newAgents);

    const agentIds = newAgents.map(agent => agent.id);

    router.post(`/company/${company.id}/assign-agents`, {
      agent_ids: agentIds,
    }, {
      onSuccess: () => {
      },
      onError: (errors) => {
        console.error('Error removing agent:', errors);
        if (errors?.message) {
          alert(`Error: ${errors.message}`);
        } else if (typeof errors === 'string') {
          alert(`Error: ${errors}`);
        } else {
          alert('Failed to remove agent. Please check your permissions and try again.');
        }
      },
    });
  };

  return (
    <>
      <Head title="Company Details" />
      <div className='bg-across-pages min-h-screen p-5'>

        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-300 to-blue-400 text-white rounded-lg shadow-md hover:from-blue-400 hover:to-blue-500 transition-all duration-200 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <AdminOnly>
            <div className="flex gap-2 w-80 relative">
              <input
                type="text"
                placeholder="Search Agents..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Button
                onClick={handleAssign}
                disabled={!selectedAgent}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
              >
                Add
              </Button>

              {filteredResults.length > 0 && (
                <ul className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                  {filteredResults.map(agent => (
                    <li
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setQuery(agent.name);
                      }}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {agent.name} <span className="text-gray-500 text-sm">({agent.email})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminOnly>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 p-6 bg-card rounded-lg border relative">
          <div className="flex items-center gap-6">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 mx-auto md:mx-0">
              <AvatarImage
                className="object-contain"
                src={company.marketing?.logo_path
                  ? company.marketing.logo_path.startsWith('http') || company.marketing.logo_path.startsWith('/storage')
                    ? company.marketing.logo_path
                    : `/storage/${company.marketing.logo_path}`
                  : "/background/default-logo.png"}
                alt={`${company.brand_name} logo`}
                onError={(e) => { (e.target as HTMLImageElement).src = "/storage/logos/default-logo.png"; }}
              />
              <AvatarFallback className="text-3xl">
                {getInitials(company.brand_name || company.company_name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{company.company_name}</h1>
              {company.brand_name && <p className="text-lg text-muted-foreground mb-2">{company.brand_name}</p>}
              {company.company_website && (
                <a
                  href={company.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.company_website}
                </a>
              )}
            </div>
          </div>
          
          <AdminOnly>
          {assignedAgents && assignedAgents.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              <label className="font-medium text-muted-foreground mr-2">Assigned Agents:</label>
              {assignedAgents.map(agent => (
                <span key={agent.id} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                  company.user && company.user.id === agent.id 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {agent.name}
                  {company.user && company.user.id === agent.id && <span className="text-xs font-bold">(Owner)</span>}
                    <button
                      onClick={() => handleRemoveAgent(agent.id)}
                      disabled={company.user && company.user.id === agent.id}
                      className={`font-bold ml-1 ${
                        company.user && company.user.id === agent.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-500 hover:text-red-700'
                      }`}
                    >
                      ×
                    </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No agents assigned yet
            </div>
          )}
          </AdminOnly>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Basic Information</h2>
            {renderTable([
              { key: "description", label: "Description", value: company.description },
              { key: "year_founded", label: "Year Founded", value: company.year_founded },
              { key: "num_franchise_locations", label: "Number of Franchise Locations", value: company.num_franchise_locations },
              { key: "city", label: "City", value: company.city },
              { key: "state_province", label: "State/Province", value: company.state_province },
              { key: "zip_code", label: "Zip Code", value: company.zip_code },
              { key: "country", label: "Country", value: company.country },
            ])}
          </section>

          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Company Background</h2>
            {renderTable([
              { key: "industry_sector", label: "Industry Sector", value: company.background?.industry_sector },
              { key: "years_in_operation", label: "Years in Operation", value: company.background?.years_in_operation },
              { key: "total_revenue", label: "Total Revenue", value: company.background?.total_revenue, format: "currency" },
              { key: "awards", label: "Awards", value: company.background?.awards },
              { key: "company_history", label: "Company History", value: company.background?.company_history },
            ])}
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Franchise Opportunity</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "franchise_type", label: "Franchise Type", value: company.opportunity?.franchise_type },
                { key: "min_investment", label: "Minimum Investment", value: company.opportunity?.min_investment, format: "currency" },
                { key: "franchise_fee", label: "Franchise Fee", value: company.opportunity?.franchise_fee, format: "currency" },
                { key: "royalty_fee_structure", label: "Royalty and Marketing Fee", value: company.opportunity?.royalty_fee_structure },
                { key: "avg_annual_revenue", label: "Projected Annual Revenue", value: company.opportunity?.avg_annual_revenue, format: "currency" },
                { key: "target_markets", label: "Target Markets", value: company.opportunity?.target_markets },
                { key: "training_support", label: "Training Support", value: company.opportunity?.training_support },
                { key: "franchise_term", label: "Franchise Term", value: company.opportunity?.franchise_term },
                { key: "unique_selling_points", label: "Unique Selling Points", value: company.opportunity?.unique_selling_points },
              ])}
            </div>
          </details>

          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Requirements</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "min_net_worth", label: "Minimum Net Worth", value: company.requirements?.min_net_worth, format: "currency" },
                { key: "min_liquid_assets", label: "Minimum Liquid Assets", value: company.requirements?.min_liquid_assets, format: "currency" },
                { key: "prior_experience", label: "Prior Experience", value: company.requirements?.prior_experience ? 'Yes' : 'No' },
                { key: "experience_type", label: "Experience Type", value: company.requirements?.experience_type },
                { key: "other_qualifications", label: "Other Qualifications", value: company.requirements?.other_qualifications },
              ])}
            </div>
          </details>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Marketing Information</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "listing_title", label: "Listing Title", value: company.marketing?.listing_title },
                { key: "listing_description", label: "Listing Description", value: company.marketing?.listing_description },
                { key: "target_profile", label: "Target Profile", value: company.marketing?.target_profile },
                { key: "preferred_contact_method", label: "Preferred Contact Method", value: company.marketing?.preferred_contact_method },
              ])}
            </div>
          </details>
        </div>

        <PermissionGate permission="view_company_dashboard" fallback={null}>
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Documents</h2>
            {company.documents ? (
              <ul className="space-y-3">
                {[
                  { label: "DTI/SBC", path: company.documents.dti_sbc_path },
                  { label: "BIR 2303", path: company.documents.bir_2303_path },
                  { label: "IPO Registration", path: company.documents.ipo_registration_path },
                ].map((doc, index) => (
                  <li key={index} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {doc.path && doc.path.match(/\.(jpg|jpeg|png)$/i) ? (
                        <img
                          src={`/storage/${doc.path}`}
                          alt={doc.label}
                          className="h-12 w-12 object-cover rounded border dark:border-gray-700"
                        />
                      ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc.label}</span>
                      )}
                    </div>
                    {doc.path ? (
                      <Button
                        variant="secondary"
                        onClick={() => window.open(`/storage/${doc.path}`, "_blank")}
                      >
                        View File
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">Not uploaded</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents available</p>
            )}
          </section>
        </PermissionGate>
        <section className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Company Fliers</h2>
          {company.fliers && company.fliers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {company.fliers.map((flier) => (
                <div key={flier.id} className="rounded-lg border overflow-hidden dark:border-gray-700">
                  {flier.file_type === 'pdf' ? (
                    <a
                      href={`/${flier.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center py-8 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <span className="text-4xl mb-2">📄</span>
                      <span className="text-sm text-blue-600 underline">{flier.title || 'View PDF'}</span>
                    </a>
                  ) : (
                    <img
                      src={`/${flier.file_path}`}
                      alt={flier.title || 'Company flier'}
                      className="w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  {(flier.title || flier.description) && (
                    <div className="p-2 text-center">
                      {flier.title && <p className="text-sm font-medium">{flier.title}</p>}
                      {flier.description && <p className="text-xs text-muted-foreground">{flier.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <span className="text-4xl mb-3">🖼️</span>
              <p className="font-medium">No fliers uploaded yet</p>
              <p className="text-sm mt-1">Check back later for promotional materials from this company.</p>
            </div>
          )}
        </section>
      </div>
      </div>
    </>
  );
};

export default CompanyFullDetails;