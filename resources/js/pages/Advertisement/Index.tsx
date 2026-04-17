import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Plus, Coins, Image, Video, FileText,
    Edit, Trash2, Eye, Calendar, MapPin
} from "lucide-react";

interface Ad {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    file_type: string;
    placement: string;
    start_date: string;
    end_date: string;
    daily_cost: number;
    estimated_total_cost: number;
    status: string;
    company: { company_name: string };
    created_at: string;
}

const statusStyles: Record<string, string> = {
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-300",
    active:   "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    expired:  "bg-gray-100 text-gray-800 border-gray-300",
    stopped:  "bg-orange-100 text-orange-800 border-orange-300",
};

const fileIcon = (type: string) => {
    if (type === "video") return <Video className="h-4 w-4 text-purple-500" />;
    if (type === "pdf")   return <FileText className="h-4 w-4 text-red-500" />;
    return <Image className="h-4 w-4 text-blue-500" />;
};

export default function AdvertisementIndex() {
    const { ads, balance, placements } = usePage<{
        ads: Ad[];
        balance: number;
        placements: Record<string, string>;
    }>().props;

    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Advertisements", href: "/advertisements" },
    ];

    const filtered = ads.filter((ad) => {
        const matchStatus = statusFilter === "all" || ad.status === statusFilter;
        const matchSearch = ad.title.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this advertisement?")) {
            router.delete(`/advertisements/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Advertisements" />
            <div className="bg-across-pages min-h-screen p-5 space-y-6">

                {/* Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Coins className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-100">EZCoin Balance</p>
                                <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Eye className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Ads</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {ads.filter(a => a.status === "active").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-yellow-50 rounded-xl">
                                <Calendar className="h-8 w-8 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Approval</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {ads.filter(a => a.status === "pending").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table */}
                <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                        <CardTitle className="text-2xl font-bold">My Advertisements</CardTitle>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Search ads..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-[200px]"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="stopped">Stopped</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button asChild>
                                <Link href="/advertisements/create">
                                    <Plus className="h-4 w-4 mr-1" /> New Ad
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
                                        <th className="text-left p-4">Ad</th>
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
                                            <td colSpan={7} className="text-center p-8 text-gray-500">
                                                No advertisements found.{" "}
                                                <Link href="/advertisements/create" className="text-blue-600 underline">
                                                    Create one now
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((ad) => (
                                            <tr key={ad.id} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{ad.title}</p>
                                                    <p className="text-xs text-gray-500">{ad.company?.company_name}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 capitalize">
                                                        {fileIcon(ad.file_type)}
                                                        {ad.file_type}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {placements[ad.placement] ?? ad.placement}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                                                    <div>{new Date(ad.start_date).toLocaleDateString()}</div>
                                                    <div>to {new Date(ad.end_date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-gray-500">{ad.daily_cost} /day</div>
                                                    <div className="font-semibold text-yellow-600">~{ad.estimated_total_cost} total</div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${statusStyles[ad.status]} border text-xs`}>
                                                        {ad.status === "stopped" ? "Stopped (Low Balance)" : ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {ad.status === "pending" && (
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={`/advertisements/${ad.id}/edit`}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(ad.id)}
                                                        >
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

                {/* Pricing Info */}
                <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                    <CardHeader className="p-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Coins className="h-5 w-5 text-yellow-500" />
                            EZCoin Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <Image className="h-6 w-6 text-blue-500" />
                                <div>
                                    <p className="font-semibold text-gray-900">Image Ad</p>
                                    <p className="text-sm text-blue-600 font-bold">200 EZCoin / day</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                <Video className="h-6 w-6 text-purple-500" />
                                <div>
                                    <p className="font-semibold text-gray-900">Video Ad</p>
                                    <p className="text-sm text-purple-600 font-bold">300 EZCoin / day</p>
                                    <p className="text-xs text-gray-500">MP4</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                <FileText className="h-6 w-6 text-red-500" />
                                <div>
                                    <p className="font-semibold text-gray-900">PDF Ad</p>
                                    <p className="text-sm text-red-600 font-bold">200 EZCoin / day</p>
                                    <p className="text-xs text-gray-500">PDF</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}