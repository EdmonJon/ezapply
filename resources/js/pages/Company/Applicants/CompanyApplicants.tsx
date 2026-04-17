import React, { useEffect, useMemo, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import axios from "axios";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Settings, Building, CheckCircle, XCircle } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import ChatButton from "@/components/ui/chat-button";
import PaymentConfirmationDialog from "../PaymentConfirm";


type CompanyDetails = {
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
        first_name: string;
        last_name: string;
        email: string;
    };
    opportunity?: any; 
    background?: any;
    requirements?: any;
    marketing?: {
        listing_title?: string;
        listing_description?: string;
        logo_path?: string;
        target_profile?: string;
        preferred_contact_method?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Company Applicants", href: "/company/applicants" },
];

const PURCHASE_COST = 1; 
const statusOptions = ["pending", "approved", "rejected", "interested", "paid"]; 

type StatusMessageDialogProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    status: 'success' | 'error';
}

const StatusMessageDialog: React.FC<StatusMessageDialogProps> = ({ open, onClose, title, message, status }) => {
    if (!open) return null;

    const isSuccess = status === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 text-white ${bgColor} flex items-center gap-3`}>
                    <Icon className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                    <div className="flex justify-end">
                        <Button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CompanyApplicants() {
    const { props } = usePage<any>();
    const applicants = props.applicants ?? [];
    const user = props.auth?.user ?? null;
    const userBalance = props.auth?.user?.credit?.balance ?? props.auth?.user?.credits ?? 0;

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [createdAtFilter, setCreatedAtFilter] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const [paidFieldsMap, setPaidFieldsMap] = useState<Record<number, string[]>>({});
    const [visibleMap, setVisibleMap] = useState<Record<number, Record<string, boolean>>>({});

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [toBuyApplicantId, setToBuyApplicantId] = useState<number | null>(null);

    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogStatus, setDialogStatus] = useState<'success' | 'error'>('success');


    useEffect(() => {
        let mounted = true;
        async function loadPaid() {
            if (!applicants?.length) return;
            setLoading(true);
            try {
                const promises = applicants.map(async (a: any) => {
                    const res = await fetch(`/check-applicant-view/${a.id}`);
                    if (!res.ok) return null;
                    const data = await res.json();
                    return { id: a.id, paid_fields: data.paid_fields || [] };
                });
                const results = await Promise.all(promises);
                if (!mounted) return;
                const pf: Record<number, string[]> = {};
                const vm: Record<number, Record<string, boolean>> = {};
                results.forEach((r) => {
                    if (r) {
                        pf[r.id] = r.paid_fields;
                        vm[r.id] = {};
                        r.paid_fields.forEach((f: string) => (vm[r.id][f] = true));
                    }
                });
                setPaidFieldsMap(pf);
                setVisibleMap(vm);
            } catch (err) {
                console.error("Failed to load paid fields", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        loadPaid();
        return () => { mounted = false; };
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        return applicants.filter((a: any) => {
            const firstName = a.user?.basicinfo?.first_name ?? "";
            const lastName = a.user?.basicinfo?.last_name ?? "";
            const email = a.user?.email ?? "";
            const brandName = a.user?.brand_name ?? "";
            const full = `${firstName} ${lastName} ${email} ${brandName}`.toLowerCase();
            const matchesSearch = full.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "" || a.status === statusFilter;
            let matchesCreated = true;
            if (createdAtFilter) {
                matchesCreated = a.created_at ? a.created_at.includes(createdAtFilter) : false;
            }
            return matchesSearch && matchesStatus && matchesCreated;
        });
    }, [applicants, searchTerm, statusFilter, createdAtFilter]);

    const openBuyDialog = (appId: number) => {
        setToBuyApplicantId(appId);
        setConfirmationOpen(true);
    };

    const handleStatusChange = (id: number, status: string) => {
        router.put(`/company/applicants/${id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const handleConfirmBuy = async () => {
        if (!toBuyApplicantId) return;
        setLoading(true);
        setConfirmationOpen(false); // Close confirmation modal immediately

        try {
            const response = await axios.post("/view-applicant", {
                application_id: toBuyApplicantId,
                field_key: "basic_profile", 
            });

            // SUCCESS HANDLER: Set modal state based on JSON response
            const { message, new_balance } = response.data;
            setDialogTitle('Purchase Complete');
            setDialogMessage(message || `Applicant info purchased successfully. Your new balance is ${new_balance} credits.`);
            setDialogStatus('success');
            setIsMessageDialogOpen(true);

            // Reload page data to reflect the purchased field and updated balance
            router.reload({ only: ["applicants", "auth"] });
            
        } catch (err: any) {
            console.error("Buy failed:", err);
            
            // ERROR HANDLER: Set modal state based on error response
            const errorMessage = err.response?.data?.message 
                                || "Purchase failed. Please try again.";
            
            setDialogTitle('Purchase Failed');
            setDialogMessage(errorMessage);
            setDialogStatus('error');
            setIsMessageDialogOpen(true);

        } finally {
            setToBuyApplicantId(null);
            setLoading(false);
        }
    };

    const renderRows = () => {
        if (loading && filteredApplicants.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading...
                    </TableCell>
                </TableRow>
            );
        }
        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
            );
        }
        if (!filteredApplicants.length) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">No applicants found matching your criteria.</TableCell>
                </TableRow>
            );
        }

        return filteredApplicants.map((a: any) => {
            const purchased = Array.isArray(paidFieldsMap[a.id]) && paidFieldsMap[a.id].includes("basic_profile");
            const applicantUserId = a.user?.id ?? null;
            return (
                <TableRow key={a.id}>
                    <TableCell className="font-medium">
                        {a.user?.basicinfo?.first_name ? `${a.user.basicinfo.first_name} ${a.user.basicinfo.last_name}` : "N/A"}
                    </TableCell>
                    <TableCell>{a.company?.brand_name ?? "N/A"}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <select
                                value={a.status}
                                onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-2 py-1.5 w-full min-w-[150px]"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <div className="mt-1">
                                {a.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                {a.status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Approved</Badge>}
                                {a.status === "rejected" && <Badge variant="destructive" className="text-white">Rejected</Badge>}
                                {a.status === "interested" && <Badge variant="outline">Interested</Badge>}
                                {a.status === "paid" && <Badge className="bg-yellow-600">Paid</Badge>}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                            {purchased ? (
                                <a href={`/company/applicants/${a.id}/profile`} className="inline-block">
                                    <Button className="view-btn btn-2">Applicant Profile</Button>
                                </a>
                            ) : (
                                <Button onClick={() => openBuyDialog(a.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                    Buy Info
                                </Button>
                            )}
                            <ChatButton status={a.status} userId={applicantUserId} />
                        </div>
                    </TableCell>
                </TableRow>
            );
        });
    };

    return (
        <PermissionGate permission="view_dashboard" role="company" fallback={<div className="p-6">You don't have permission to access this page.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Company Applicants" />
                <div className="bg-across-pages min-h-screen p-5">
                    <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                            <CardTitle className="text-2xl font-bold">Company Applicants</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-start">
                                <Input placeholder="Search applicant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-auto min-w-[160px]" />
                                <Input type="date" placeholder="Filter by created date..." value={createdAtFilter} onChange={(e) => setCreatedAtFilter(e.target.value)} className="w-full sm:w-auto min-w-[140px]" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-3 py-2 h-10 w-full sm:w-auto min-w-[120px]">
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="interested">Interested</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </CardHeader>

                        <hr className="border-gray-200 dark:border-neutral-800" />

                        <CardContent className="p-0">
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Name</TableHead>
                                            <TableHead className="min-w-[150px]">Brand Name</TableHead>
                                            <TableHead className="min-w-[200px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Applied On</TableHead>
                                            <TableHead className="min-w-[220px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{renderRows()}</TableBody>
                                </Table>
                            </div>

                            {/* for mobile */}
                            <div className="md:hidden p-4 space-y-3">
                                {loading ? (
                                    <div className="text-center text-gray-500 p-4"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />Loading applicants...</div>
                                ) : filteredApplicants.length === 0 ? (
                                    <p className="text-center text-gray-500 p-4">No applicants found matching your criteria.</p>
                                ) : (
                                    filteredApplicants.map((a: any) => {
                                        const purchased = Array.isArray(paidFieldsMap[a.id]) && paidFieldsMap[a.id].includes("basic_profile");
                                        return (
                                            <Card key={a.id} className="mb-3 shadow-sm border-2 dark:border-neutral-700">
                                                <CardHeader className="p-4 flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-blue-500" />
                                                        {a.user?.basicinfo?.first_name ?? "N/A"} {a.user?.basicinfo?.last_name ?? ""}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-2 font-medium"><Building className="h-4 w-4" /> Brand Name</span>
                                                        <strong>{a.company?.brand_name ?? "N/A"}</strong>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1 border-t pt-3">
                                                         <label className="text-xs font-medium">Application Status</label>
                                                         <select
                                                            value={a.status}
                                                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                                            className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-2 py-1.5 w-full"
                                                        >
                                                            {statusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                         <div className="mt-1">
                                                            {a.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                                            {a.status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Approved</Badge>}
                                                            {a.status === "rejected" && <Badge variant="destructive" className="text-white">Rejected</Badge>}
                                                            {a.status === "interested" && <Badge variant="outline">Interested</Badge>}
                                                            {a.status === "paid" && <Badge className="bg-yellow-600">Paid</Badge>}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-3 flex gap-2">
                                                        {purchased ? (
                                                            <a href={`/company/applicants/${a.id}/profile`} className="flex-1"><Button className="w-full">Applicant Profile</Button></a>
                                                        ) : (
                                                            <Button onClick={() => openBuyDialog(a.id)} className="bg-green-600 hover:bg-green-700 text-white flex-1">Buy Info</Button>
                                                        )}
                                                        <ChatButton status={a.status} userId={a.user?.id} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <PaymentConfirmationDialog
                        open={confirmationOpen}
                        onOpenChange={setConfirmationOpen}
                        cost={PURCHASE_COST}
                        balance={userBalance}
                        onConfirm={handleConfirmBuy}
                    />
                    
                    {/* NEW STATUS MESSAGE DIALOG INTEGRATION */}
                    <StatusMessageDialog
                        open={isMessageDialogOpen}
                        onClose={() => setIsMessageDialogOpen(false)}
                        title={dialogTitle}
                        message={dialogMessage}
                        status={dialogStatus}
                    />

                </div>
            </AppLayout>
        </PermissionGate>
    );
}