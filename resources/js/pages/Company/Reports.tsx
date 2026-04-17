import React, { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, XCircle, Clock, Star, CreditCard, BarChart3, TrendingUp, Building2 } from "lucide-react";

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    interested: number;
    paid: number;
}
interface MonthlyData { month: string; count: number; }
interface PerCompany { name: string; total: number; pending: number; approved: number; rejected: number; interested: number; paid: number; }

export default function Reports() {
    const { stats, monthly, perCompany } = usePage<{ stats: Stats; monthly: MonthlyData[]; perCompany: PerCompany[]; }>().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Reports", href: "/company/reports" },
    ];

    const statCards = [
        { title: "Total Applicants", value: stats.total, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", badge: null },
        { title: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        { title: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", badge: "bg-green-100 text-green-800 border-green-300" },
        { title: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bgColor: "bg-red-50", badge: "bg-red-100 text-red-800 border-red-300" },
        { title: "Interested", value: stats.interested, icon: Star, color: "text-purple-600", bgColor: "bg-purple-50", badge: "bg-purple-100 text-purple-800 border-purple-300" },
        { title: "Paid", value: stats.paid, icon: CreditCard, color: "text-emerald-600", bgColor: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    ];

    const maxMonthly = Math.max(...monthly.map((m) => m.count), 1);

    const filteredPerCompany = useMemo(() => {
        if (companyFilter === "all") return perCompany;
        return perCompany.filter((c) => c.name === companyFilter);
    }, [perCompany, companyFilter]);

    const filteredStats = useMemo(() => {
        if (statusFilter === "all") return statCards;
        return statCards.filter((s) => s.title.toLowerCase() === statusFilter || s.title === "Total Applicants");
    }, [statusFilter, stats]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Statistics" />
            <div className="bg-across-pages min-h-screen p-5 space-y-6">

                {/* Header */}
                <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Reports & Statistics</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Overview of your franchise applications</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="interested">Interested</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={companyFilter} onValueChange={setCompanyFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Companies</SelectItem>
                                    {perCompany.map((c) => (
                                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                </Card>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {filteredStats.map((stat, i) => (
                        <Card key={i} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-900">
                            <CardContent className="p-4">
                                <div className={`p-2 rounded-xl ${stat.bgColor} w-fit mb-3`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
                                {stat.badge && (
                                    <Badge className={`${stat.badge} text-xs mt-2 border`}>
                                        {Math.round((stat.value / (stats.total || 1)) * 100)}%
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Monthly Bar Chart */}
                <Card className="shadow-lg border-0 bg-white dark:bg-neutral-900">
                    <CardHeader className="p-4 md:p-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-bold">Monthly Applicants ({new Date().getFullYear()})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="flex items-end gap-2 h-48">
                            {monthly.map((m, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 gap-1">
                                    <span className="text-xs text-gray-500 font-medium">{m.count}</span>
                                    <div
                                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-300"
                                        style={{ height: `${(m.count / maxMonthly) * 160}px`, minHeight: m.count > 0 ? '4px' : '0' }}
                                        title={`${m.month}: ${m.count} applicants`}
                                    />
                                    <span className="text-xs text-gray-400">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Per Company Table */}
                <Card className="shadow-lg border-0 bg-white dark:bg-neutral-900">
                    <CardHeader className="p-4 md:p-6">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-bold">Per Company Breakdown</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-neutral-800">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-600">Company</th>
                                        <th className="text-center p-4 font-semibold text-gray-600">Total</th>
                                        <th className="text-center p-4 font-semibold text-yellow-600">Pending</th>
                                        <th className="text-center p-4 font-semibold text-green-600">Approved</th>
                                        <th className="text-center p-4 font-semibold text-red-600">Rejected</th>
                                        <th className="text-center p-4 font-semibold text-purple-600">Interested</th>
                                        <th className="text-center p-4 font-semibold text-emerald-600">Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPerCompany.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center p-6 text-gray-500">No data found.</td></tr>
                                    ) : (
                                        filteredPerCompany.map((c, i) => (
                                            <tr key={i} className="border-t border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                                <td className="p-4 text-center font-bold text-blue-600">{c.total}</td>
                                                <td className="p-4 text-center"><Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">{c.pending}</Badge></td>
                                                <td className="p-4 text-center"><Badge className="bg-green-100 text-green-800 border border-green-300">{c.approved}</Badge></td>
                                                <td className="p-4 text-center"><Badge className="bg-red-100 text-red-800 border border-red-300">{c.rejected}</Badge></td>
                                                <td className="p-4 text-center"><Badge className="bg-purple-100 text-purple-800 border border-purple-300">{c.interested}</Badge></td>
                                                <td className="p-4 text-center"><Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">{c.paid}</Badge></td>
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