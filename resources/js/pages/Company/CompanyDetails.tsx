import { Badge } from "@/components/ui/badge";

interface Company {
  id: number;
  company_name: string;
  description?: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function CompanyDetails({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      <p><strong>ID:</strong> {company.id}</p>
      <p><strong>Name:</strong> {company.company_name}</p>
      <p><strong>Description:</strong> {company.description || "No description available."} </p>
      <p><strong>Created At:</strong> {new Date(company.created_at).toLocaleDateString()}</p>
    </div>
  );
}