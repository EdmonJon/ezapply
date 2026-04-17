import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Trash2, Image, Video, FileText, Eye } from "lucide-react";

interface Ad {
    id: number;
    title: string;
    file_type: string;
    file_path: string;
    placement: string;
    start_date: string;
    end_date: string;
    daily_cost: number;
    estimated_total_cost: number;
    status: string;
    company: { company_name: string };
    user: { email: string };
    created_at: string;
}

const statusStyles: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
    active:   "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    expired:  "bg-gray-100 text-gray-800 border-gray-300",
    stopped:  "bg-orange-100 text-orange-800 border-orange-300",
};

export default function AdvertisementAdminIndex() {
    const { ads } = usePage<{ ads: Ad[] }>().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Ad Management", href: "/admin/advertisements" },
    ];

    const filtered = ads.filter((ad) => {
        const matchStatus = statusFilter === "all" || ad.status === statusFilter;
        const matchSearch = ad.title.toLowerCase().includes(search.toLowerCase()) ||
                            ad.company?.company_name.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleApprove = (id: number) => {
        router.post(`/admin/advertisements/${id}/approve`);
    };

    const handleReject = (id: number) => {
        if (confirm("Reject this advertisement?")) {
            router.post(`/admin/advertisements/${id}/reject`);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Permanently delete this advertisement?")) {
            router.delete(`/admin/advertisements/${id}`);
        }
    };

    const counts = {
        total:   ads.length,
        pending: ads.filter(a => a.status === "pending").length,
        active:  ads.filter(a => a.status === "active").length,
        stopped: ads.filter(a => a.status === "stopped").length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advertisement Management" />
            <div className="bg-across-pages min-h-screen p-5 space-y-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Ads",       value: counts.total,   color: "text-blue-600",   bg: "bg-blue-50" },
                        { label: "Pending Review",  value: counts.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "Active Ads",      value: counts.active,  color: "text-green-600",  bg: "bg-green-50" },
                        { label: "Stopped Ads",     value: counts.stopped, color: "text-orange-600", bg: "bg-orange-50" },
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
                        <CardTitle className="text-2xl font-bold">Advertisement Requests</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px]"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="stopped">Stopped</SelectItem>
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
                                        <th className="text-left p-4">Ad Details</th>
                                        <th className="text-left p-4">Company</th>
                                        <th className="text-left p-4">Type</th>
                                        <th className="text-left p-4">Placement</th>
                                        <th className="text-left p-4">Duration</th>
                                        <th className="text-left p-4">Cost</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-8 text-gray-500">No advertisements found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((ad) => (
                                            <tr key={ad.id} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{ad.title}</p>
                                                    <p className="text-xs text-gray-500">{ad.user?.email}</p>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400">
                                                    {ad.company?.company_name}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 capitalize">
                                                        {ad.file_type === "video" ? <Video className="h-4 w-4 text-purple-500" /> : ad.file_type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> : <Image className="h-4 w-4 text-blue-500" />}
                                                        {ad.file_type}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400 capitalize">
                                                    {ad.placement.replace("_", " ")}
                                                </td>
                                                <td className="p-4 text-xs text-gray-600 dark:text-gray-400">
                                                    <div>{new Date(ad.start_date).toLocaleDateString()}</div>
                                                    <div>to {new Date(ad.end_date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-gray-500">{ad.daily_cost}/day</div>
                                                    <div className="font-semibold text-yellow-600">~{ad.estimated_total_cost}</div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${statusStyles[ad.status]} border text-xs`}>
                                                        {ad.status === "stopped" ? "Stopped" : ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1">
                                                        <a href={`/storage/${ad.file_path}`} target="_blank">
                                                            <Button variant="outline" size="sm" title="Preview">
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                        </a>
                                                        {ad.status === "pending" && (
                                                            <>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(ad.id)} title="Approve">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleReject(ad.id)} title="Reject">
                                                                    <XCircle className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(ad.id)} title="Delete">
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