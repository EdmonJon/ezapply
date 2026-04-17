import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbItem } from "@/types";

interface ApplicantDetailsProps {
  application: {
    id: number;
    status: string;
    user: {
      id: number;
      email: string;
      basicinfo?: {
        first_name: string;
        last_name: string;
        birth_date: string;
        phone: number | string;
        Facebook?: string;
        LinkedIn?: string;
        Viber?: string;
      };
      affiliations?: { institution: string; position: string }[];
      financial?: {
        income_source?: string;
        monthly_income?: number;
        other_income?: string;
        monthly_expenses?: number;
        existing_loans?: number;
      } | null;
      attachments?: { attachment_type?: string }[];
      address?: {
        region_name: string;
        province_name: string;
        citymun_name: string;
        barangay_name: string;
      };
    };
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Company Applicants", href: "/company-applicants" },
  { title: "Applicant Details", href: "#" },
];

export default function ApplicantDetails() {
  const { props } = usePage<{ application: ApplicantDetailsProps["application"] }>();
  const applicant = props.application;

  // Format numbers and currency
  const formatValue = (
    value: string | number | undefined,
    type: "number" | "currency" = "number"
  ) => {
    if (value === undefined || value === null) return "";
    if (type === "currency") {
      const num =
        typeof value === "string"
          ? parseFloat(String(value).replace(/,/g, ""))
          : value;
      if (isNaN(Number(num))) return String(value);
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(Number(num));
    }
    const strValue = String(value);
    const cleaned = strValue.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Render table
  const renderTable = (
    rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]
  ) => (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(({ key, label, value, format }) => (
          <tr key={key} className="border-b">
            <td className="font-medium py-2 pr-4 align-top">{label}</td>
            <td className="py-2 pr-4 align-top">
              {format === "currency"
                ? formatValue(value, "currency")
                : value ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applicant Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader />
          <CardContent>
            {renderTable([
              {
                key: "full_name",
                label: "Full Name",
                value: `${applicant.user?.basicinfo?.first_name} ${applicant.user?.basicinfo?.last_name}`,
              },
              { key: "email", label: "Email", value: applicant.user?.email },
              { key: "phone", label: "Phone", value: applicant.user?.basicinfo?.phone },
              {
                key: "birth_date",
                label: "Birthdate",
                value: applicant.user?.basicinfo?.birth_date
                  ? new Date(
                      applicant.user?.basicinfo?.birth_date
                    ).toLocaleDateString()
                  : "",
              },
              {
                key: "status",
                label: "Status",
                value: <Badge>{applicant.status}</Badge>,
              },
              {
                key: "Facebook",
                label: "Facebook",
                value: applicant.user?.basicinfo?.Facebook,
              },
              {
                key: "LinkedIn",
                label: "LinkedIn",
                value: applicant.user?.basicinfo?.LinkedIn,
              },
              {
                key: "Viber",
                label: "Viber",
                value: applicant.user?.basicinfo?.Viber,
              },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.financial ? (
              renderTable([
                {
                  key: "income_source",
                  label: "Income Source",
                  value: applicant.user.financial.income_source,
                },
                {
                  key: "monthly_income",
                  label: "Monthly Income",
                  value: applicant.user.financial.monthly_income,
                  format: "currency",
                },
                {
                  key: "other_income",
                  label: "Other Income",
                  value: applicant.user.financial.other_income,
                },
                {
                  key: "monthly_expenses",
                  label: "Monthly Expenses",
                  value: applicant.user.financial.monthly_expenses,
                  format: "currency",
                },
                {
                  key: "existing_loans",
                  label: "Existing Loans",
                  value: applicant.user.financial.existing_loans,
                  format: "currency",
                },
              ])
            ) : (
              <p>No financial information</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affiliations</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.affiliations?.length
              ? renderTable(
                  applicant.user.affiliations.map((a, i) => ({
                    key: `affiliation-${i}`,
                    label: a.institution,
                    value: a.position,
                  }))
                )
              : <p>No affiliations</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.address ? (
              renderTable([
                {
                  key: "region",
                  label: "Region",
                  value: applicant.user.address.region_name,
                },
                {
                  key: "province",
                  label: "Province",
                  value: applicant.user.address.province_name,
                },
                {
                  key: "city",
                  label: "City/Municipality",
                  value: applicant.user.address.citymun_name,
                },
                {
                  key: "barangay",
                  label: "Barangay",
                  value: applicant.user.address.barangay_name,
                },
              ])
            ) : (
              <p>No address information</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.attachments?.length
              ? renderTable(
                  applicant.user.attachments.map((att, i) => ({
                    key: `attachment-${i}`,
                    label: `Attachment ${i + 1}`,
                    value: att.attachment_type,
                  }))
                )
              : <p>No attachments</p>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
