import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Trash2, Eye, FileText, Image, Clock } from "lucide-react";

interface Flier {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    file_type: string;
    status: string;
    rejection_reason?: string;
    company: { company_name: string };
    user: { email: string };
    created_at: string;
}

const statusStyles: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
};

export default function FlierAdminIndex() {
    const { fliers } = usePage<{ fliers: Flier[] }>().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Flier Management", href: "/admin/fliers" },
    ];

    const filtered = fliers.filter((f) => {
        const matchStatus = statusFilter === "all" || f.status === statusFilter;
        const matchSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
                            f.company?.company_name.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const counts = {
        total:    fliers.length,
        pending:  fliers.filter(f => f.status === "pending").length,
        approved: fliers.filter(f => f.status === "approved").length,
        rejected: fliers.filter(f => f.status === "rejected").length,
    };

    const handleApprove = (id: number) => {
        router.post(`/admin/fliers/${id}/approve`);
    };

    const handleReject = (id: number) => {
        router.post(`/admin/fliers/${id}/reject`, { reason: rejectReason }, {
            onSuccess: () => { setRejectId(null); setRejectReason(""); }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Permanently delete this flier?")) {
            router.delete(`/admin/fliers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Flier Management" />
            <div className="bg-across-pages min-h-screen p-5 space-y-6">

                {/* Reject Modal */}
                {rejectId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Flier</h3>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Reason (optional)</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Explain why this flier is being rejected..."
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="destructive" onClick={() => handleReject(rejectId)} className="flex-1">
                                    Confirm Reject
                                </Button>
                                <Button variant="outline" onClick={() => { setRejectId(null); setRejectReason(""); }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Fliers",  value: counts.total,    color: "text-blue-600",   bg: "bg-blue-50" },
                        { label: "Pending",        value: counts.pending,  color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "Approved",       value: counts.approved, color: "text-green-600",  bg: "bg-green-50" },
                        { label: "Rejected",       value: counts.rejected, color: "text-red-600",    bg: "bg-red-50" },
                    ].map((s, i) => (
                        <Card key={i} className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">{s.label}</p>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                        <CardTitle className="text-2xl font-bold">Flier Submissions</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px]"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <hr className="border-gray-200 dark:border-neutral-800" />

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-neutral-800">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-600">Flier</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Company</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Type</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Uploaded</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-500">No fliers found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((flier) => (
                                            <tr key={flier.id} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{flier.title}</p>
                                                    <p className="text-xs text-gray-500">{flier.user?.email}</p>
                                                    {flier.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{flier.description}</p>}
                                                    {flier.rejection_reason && <p className="text-xs text-red-500 mt-1">Reason: {flier.rejection_reason}</p>}
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400">
                                                    {flier.company?.company_name}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 capitalize">
                                                        {flier.file_type === "pdf"
                                                            ? <FileText className="h-4 w-4 text-red-500" />
                                                            : <Image className="h-4 w-4 text-blue-500" />
                                                        }
                                                        {flier.file_type}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${statusStyles[flier.status]} border text-xs`}>
                                                        {flier.status.charAt(0).toUpperCase() + flier.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(flier.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1 flex-wrap">
                                                        <a href={`/storage/${flier.file_path}`} target="_blank">
                                                            <Button variant="outline" size="sm" title="Preview">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </a>
                                                        {flier.status === "pending" && (
                                                            <>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(flier.id)} title="Approve">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => setRejectId(flier.id)} title="Reject">
                                                                    <XCircle className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(flier.id)} title="Delete">
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}