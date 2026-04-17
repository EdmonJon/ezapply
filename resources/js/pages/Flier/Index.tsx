import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@inertiajs/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Eye, FileText, Image, Clock, CheckCircle, XCircle } from "lucide-react";

interface Flier {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    file_type: string;
    status: string;
    rejection_reason?: string;
    company: { company_name: string };
    created_at: string;
}

const statusStyles: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
};

const statusIcons: Record<string, React.ReactNode> = {
    pending:  <Clock className="h-3 w-3" />,
    approved: <CheckCircle className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
};

export default function FlierIndex() {
    const { fliers } = usePage<{ fliers: Flier[] }>().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "My Fliers", href: "/fliers" },
    ];

    const filtered = fliers.filter((f) => {
        const matchStatus = statusFilter === "all" || f.status === statusFilter;
        const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this flier?")) {
            router.delete(`/fliers/${id}`);
        }
    };

    const counts = {
        total:    fliers.length,
        pending:  fliers.filter(f => f.status === "pending").length,
        approved: fliers.filter(f => f.status === "approved").length,
        rejected: fliers.filter(f => f.status === "rejected").length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Fliers" />
            <div className="bg-across-pages min-h-screen p-5 space-y-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Fliers",   value: counts.total,    color: "text-blue-600",   bg: "bg-blue-50" },
                        { label: "Pending",         value: counts.pending,  color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "Approved",        value: counts.approved, color: "text-green-600",  bg: "bg-green-50" },
                        { label: "Rejected",        value: counts.rejected, color: "text-red-600",    bg: "bg-red-50" },
                    ].map((s, i) => (
                        <Card key={i} className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                            <CardContent className="p-4">
                                <div className={`p-2 rounded-xl ${s.bg} w-fit mb-2`}>
                                    <FileText className={`h-5 w-5 ${s.color}`} />
                                </div>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Table */}
                <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                        <CardTitle className="text-2xl font-bold">My Fliers</CardTitle>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Search fliers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-[200px]"
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
                            <Button asChild>
                                <Link href="/fliers/create">
                                    <Plus className="h-4 w-4 mr-1" /> Upload Flier
                                </Link>
                            </Button>
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
                                            <td colSpan={6} className="text-center p-8 text-gray-500">
                                                No fliers found.{" "}
                                                <Link href="/fliers/create" className="text-blue-600 underline">
                                                    Upload one now
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((flier) => (
                                            <tr key={flier.id} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{flier.title}</p>
                                                    {flier.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{flier.description}</p>}
                                                    {flier.status === "rejected" && flier.rejection_reason && (
                                                        <p className="text-xs text-red-500 mt-1">Reason: {flier.rejection_reason}</p>
                                                    )}
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
                                                    <Badge className={`${statusStyles[flier.status]} border text-xs flex items-center gap-1 w-fit`}>
                                                        {statusIcons[flier.status]}
                                                        {flier.status.charAt(0).toUpperCase() + flier.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                                                    {new Date(flier.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <a href={`/storage/${flier.file_path}`} target="_blank">
                                                            <Button variant="outline" size="sm" title="Preview">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </a>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(flier.id)} title="Delete">
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

                {/* Info Card */}
                <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📋 How It Works</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                                <Clock className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                <div><p className="font-medium text-yellow-700">1. Upload</p><p>Submit your flier for admin review</p></div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                <Eye className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <div><p className="font-medium text-blue-700">2. Review</p><p>Admin reviews your flier</p></div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <div><p className="font-medium text-green-700">3. Published</p><p>Approved fliers go live on the platform</p></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}