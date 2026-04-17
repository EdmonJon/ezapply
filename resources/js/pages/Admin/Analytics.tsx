import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/admin/analytics' },
];

const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}>
            <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color, fontSize: 12, margin: "2px 0" }}>
                    <span style={{ opacity: .7 }}>{p.name}: </span>
                    <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </p>
            ))}
        </div>
    );
};

const feedIcon: Record<string, string> = { co: "🏢", ok: "✅", cr: "💳", no: "❌", app: "📋", us: "👤", vi: "👁️" };
const feedBg: Record<string, string>   = { co: "#ede9fe", ok: "#dcfce7", cr: "#fef9c3", no: "#fee2e2", app: "#e0e7ff", us: "#fce7f3", vi: "#e0f2fe" };

const Card = ({ children, style = {} }: any) => (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 22, boxShadow: "0 1px 8px rgba(0,0,0,.06)", ...style }}>
        {children}
    </div>
);

const SectionTitle = ({ title, sub }: { title: string; sub: string }) => (
    <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{title}</h3>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>{sub}</p>
    </div>
);

const StatBadge = ({ label, value, color, bg }: any) => (
    <div style={{ background: bg, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{label}</div>
    </div>
);

export default function Analytics() {
    const {
        kpis, registrations, dailyRegistrations, weeklyRegistrations, monthlyRegistrations,
        appsByMonth, appStatusBreakdown, appFunnel, appsByLocation, avgAppsPerCompany,
        companyStatus, userRoles,
        salesKpis, monthlySales, creditsByMonth, creditTypeBreakdown, topSpenders,
        topCompanies, incomes, regions, feed,
    } = usePage().props as any;

    const [regTab, setRegTab]     = useState<'daily'|'weekly'|'monthly'>('monthly');
    const [salesTab, setSalesTab] = useState<'monthly'|'breakdown'>('monthly');

    const kpiCards = [
        { label: "Total Users",       value: kpis.totalUsers,        icon: "👤", color: "#6366f1", bg: "#eef2ff" },
        { label: "Companies",         value: kpis.totalCompanies,    icon: "🏢", color: "#16a34a", bg: "#dcfce7" },
        { label: "Applications",      value: kpis.totalApplications, icon: "📋", color: "#0284c7", bg: "#e0f2fe" },
        { label: "Pending Approvals", value: kpis.pendingApprovals,  icon: "⏳", color: "#d97706", bg: "#fef9c3" },
        { label: "Credits Issued",    value: kpis.creditsIssued,     icon: "💳", color: "#7c3aed", bg: "#ede9fe" },
        { label: "Credits Used",      value: kpis.creditsUsed,       icon: "📊", color: "#db2777", bg: "#fce7f3" },
    ];

    const regChartData = regTab === 'daily' ? dailyRegistrations : regTab === 'weekly' ? weeklyRegistrations : monthlyRegistrations;
    const regChartKey  = regTab === 'daily' ? 'date' : regTab === 'weekly' ? 'week' : 'month';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="p-6 bg-gray-50">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');
                    .kc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.1) !important; }
                    .tr:hover { background: #f9fafb !important; }
                `}</style>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#111827" }}>EzApply</span>
                            <span style={{ fontSize: 10, background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>ADMIN ANALYTICS</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginLeft: 46 }}>Live data from your database</p>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px" }}>
                        🕐 {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* ── KPIs ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 22 }}>
                    {kpiCards.map((k, i) => (
                        <div key={i} className="kc" style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,.05)", transition: "all .2s", cursor: "default" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{k.icon}</div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{(k.value ?? 0).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Registration Summary Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {[
                        { label: "Users",        data: registrations?.users,        color: "#6366f1", bg: "#eef2ff", icon: "👤" },
                        { label: "Companies",    data: registrations?.companies,    color: "#16a34a", bg: "#dcfce7", icon: "🏢" },
                        { label: "Applications", data: registrations?.applications, color: "#0284c7", bg: "#e0f2fe", icon: "📋" },
                    ].map((item, i) => (
                        <Card key={i}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.label} Registrations</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                {[{ period: "Today", value: item.data?.today }, { period: "This Week", value: item.data?.this_week }, { period: "This Month", value: item.data?.this_month }].map((p, j) => (
                                    <div key={j} style={{ background: item.bg, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: item.color }}>{p.value ?? 0}</div>
                                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{p.period}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* ── Registration Trend Chart ── */}
                <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <SectionTitle title="Registration Trends" sub="Users, companies & applications over time" />
                        <div style={{ display: "flex", gap: 6 }}>
                            {(['daily','weekly','monthly'] as const).map(t => (
                                <button key={t} onClick={() => setRegTab(t)} style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 500, textTransform: "capitalize", background: regTab === t ? "#6366f1" : "#fff", color: regTab === t ? "#fff" : "#6b7280" }}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={regChartData ?? []} barSize={12}>
                            <CartesianGrid stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey={regChartKey} tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<Tip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                            <Bar dataKey="users"        name="Users"        fill="#6366f1" radius={[4,4,0,0]} />
                            <Bar dataKey="companies"    name="Companies"    fill="#16a34a" radius={[4,4,0,0]} />
                            <Bar dataKey="applications" name="Applications" fill="#0284c7" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* ══════════════════════════════════════════════════
                    APPLICATION DETAILS SECTION
                ══════════════════════════════════════════════════ */}
                <div style={{ marginBottom: 8, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 4, height: 24, borderRadius: 2, background: "linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>📋 Application Details</h2>
                    </div>
                </div>

                {/* Application KPI row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
                    {[
                        { label: "Total Applications", value: kpis.totalApplications, color: "#6366f1", bg: "#eef2ff" },
                        { label: "Approved",           value: (appStatusBreakdown ?? []).find((s:any) => s.name === 'Approved')?.value ?? 0, color: "#16a34a", bg: "#dcfce7" },
                        { label: "Pending",            value: (appStatusBreakdown ?? []).find((s:any) => s.name === 'Pending')?.value ?? 0,  color: "#d97706", bg: "#fef9c3" },
                        { label: "Avg per Company",    value: avgAppsPerCompany,       color: "#0284c7", bg: "#e0f2fe" },
                    ].map((s, i) => (
                        <Card key={i}>
                            <StatBadge {...s} />
                        </Card>
                    ))}
                </div>

                {/* Application Activity + Status Pie */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <SectionTitle title="Application Activity" sub="Monthly breakdown — submitted, approved & rejected" />
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={appsByMonth}>
                                <defs>
                                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={.15}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={.12}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<Tip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fill="url(#ga)" name="Submitted" />
                                <Area type="monotone" dataKey="approvals"    stroke="#16a34a" strokeWidth={2} fill="url(#gb)" name="Approved" />
                                <Area type="monotone" dataKey="rejections"   stroke="#dc2626" strokeWidth={2} fill="url(#gc)" name="Rejected" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card>
                        <SectionTitle title="Application Status" sub="Current status breakdown" />
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={appStatusBreakdown} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {(appStatusBreakdown ?? []).map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                            {(appStatusBreakdown ?? []).map((d: any, i: number) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>{d.name}</span>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Application Funnel + By Location */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <SectionTitle title="Application Funnel" sub="From submission to approval" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                            {(appFunnel ?? []).map((f: any, i: number) => {
                                const max = appFunnel?.[0]?.count || 1;
                                const pct = Math.round((f.count / max) * 100);
                                const colors = ["#6366f1", "#0284c7", "#16a34a"];
                                return (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{f.stage}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{(f.count ?? 0).toLocaleString()} <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span></span>
                                        </div>
                                        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: 5, transition: "width .6s ease" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Applications by Location" sub="Top desired locations from applicants" />
                        {(appsByLocation ?? []).length === 0 ? (
                            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, paddingTop: 40 }}>No location data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={appsByLocation} layout="vertical" barSize={12}>
                                    <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="location" tick={{ fill: "#374151", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="count" name="Applications" radius={[0,4,4,0]}>
                                        {(appsByLocation ?? []).map((_: any, i: number) => <Cell key={i} fill={`hsl(${240 + i * 20},65%,${55 + i * 3}%)`} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </div>

                {/* ══════════════════════════════════════════════════
                    SALES DETAILS SECTION
                ══════════════════════════════════════════════════ */}
                <div style={{ marginBottom: 8, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 4, height: 24, borderRadius: 2, background: "linear-gradient(180deg,#16a34a,#22c55e)" }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>💳 Sales & Credit Details</h2>
                    </div>
                </div>

                {/* Sales KPI row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
                    {[
                        { label: "Total Revenue (Credits)", value: salesKpis?.total_revenue,      color: "#16a34a", bg: "#dcfce7" },
                        { label: "Revenue This Month",      value: salesKpis?.revenue_this_month, color: "#0284c7", bg: "#e0f2fe" },
                        { label: "Avg Top-Up Amount",       value: salesKpis?.avg_topup_amount,   color: "#7c3aed", bg: "#ede9fe" },
                        { label: "Total Purchases",         value: salesKpis?.total_purchases,    color: "#d97706", bg: "#fef9c3" },
                    ].map((s, i) => (
                        <Card key={i}>
                            <StatBadge {...s} />
                        </Card>
                    ))}
                </div>

                {/* Top-Up Request Status */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
                    {[
                        { label: "Pending Top-Up Requests",  value: salesKpis?.pending_topups,  color: "#d97706", bg: "#fef9c3" },
                        { label: "Approved Top-Up Requests", value: salesKpis?.approved_topups, color: "#16a34a", bg: "#dcfce7" },
                        { label: "Credits Still Available",  value: (salesKpis?.credits_issued ?? 0) - (salesKpis?.credits_used ?? 0), color: "#6366f1", bg: "#eef2ff" },
                    ].map((s, i) => (
                        <Card key={i}>
                            <StatBadge {...s} />
                        </Card>
                    ))}
                </div>

                {/* Monthly Sales Chart + Credit Type Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <SectionTitle title="Monthly Sales Overview" sub="Top-ups, usage & net credits over 12 months" />
                            <div style={{ display: "flex", gap: 6 }}>
                                {(['monthly','breakdown'] as const).map(t => (
                                    <button key={t} onClick={() => setSalesTab(t)} style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 500, textTransform: "capitalize", background: salesTab === t ? "#16a34a" : "#fff", color: salesTab === t ? "#fff" : "#6b7280" }}>{t}</button>
                                ))}
                            </div>
                        </div>
                        {salesTab === 'monthly' ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={monthlySales ?? []}>
                                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                    <Line type="monotone" dataKey="topUp"   name="Top-Ups" stroke="#6366f1" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="usage"   name="Usage"   stroke="#16a34a" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="net"     name="Net"     stroke="#0284c7" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                    <Line type="monotone" dataKey="refunds" name="Refunds" stroke="#d97706" strokeWidth={1.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={creditsByMonth ?? []} barSize={10}>
                                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                    <Bar dataKey="topUp"   name="Top-Up" fill="#6366f1" radius={[4,4,0,0]} />
                                    <Bar dataKey="usage"   name="Usage"  fill="#16a34a" radius={[4,4,0,0]} />
                                    <Bar dataKey="refunds" name="Refunds" fill="#d97706" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    <Card>
                        <SectionTitle title="Transaction Types" sub="Volume and totals by type" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                            {(creditTypeBreakdown ?? []).map((d: any, i: number) => (
                                <div key={i} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 10, borderLeft: `3px solid ${d.color}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{d.type}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.total.toLocaleString()} credits</span>
                                    </div>
                                    <span style={{ fontSize: 10, color: "#9ca3af" }}>{d.count.toLocaleString()} transactions</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Top Spenders */}
                <Card style={{ marginBottom: 16 }}>
                    <SectionTitle title="Top Credit Spenders" sub="Companies/users who purchased the most applicant info" />
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", marginBottom: 8 }}>
                        {["User", "Credits Spent", "Transactions"].map(h => (
                            <div key={h} style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em", paddingBottom: 8, fontWeight: 600 }}>{h}</div>
                        ))}
                    </div>
                    {(topSpenders ?? []).length === 0 ? (
                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, padding: "20px 0" }}>No purchase data yet</div>
                    ) : (
                        (topSpenders ?? []).map((s: any, i: number) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderTop: "1px solid #f1f5f9", padding: "10px 0", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 22, height: 22, borderRadius: 6, background: `hsl(${200 + i * 30},70%,92%)`, color: `hsl(${200 + i * 30},70%,40%)`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                                    <span style={{ fontSize: 12, color: "#374151" }}>{s.email}</span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{(s.spent ?? 0).toLocaleString()}</span>
                                <span style={{ fontSize: 12, color: "#6b7280" }}>{s.txns}</span>
                            </div>
                        ))
                    )}
                </Card>

                {/* ── Company Status + User Breakdown ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <SectionTitle title="Company Status" sub="Approval pipeline" />
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={companyStatus} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {(companyStatus ?? []).map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                            {(companyStatus ?? []).map((d: any, i: number) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>{d.name}</span>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="User Breakdown" sub="Distribution by role" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                            {(userRoles ?? []).map((d: any, i: number) => (
                                <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: "#374151" }}>{d.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{(d.value ?? 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${Math.min((d.value / (kpis.totalUsers || 1)) * 100, 100).toFixed(1)}%`, background: d.color, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ── Income Brackets + Regional Distribution ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <SectionTitle title="Applicant Income Brackets" sub="From financial profile data" />
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={incomes} layout="vertical" barSize={14}>
                                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="range" tick={{ fill: "#374151", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                                <Tooltip content={<Tip />} />
                                <Bar dataKey="count" name="Applicants" radius={[0,4,4,0]}>
                                    {(incomes ?? []).map((_: any, i: number) => <Cell key={i} fill={`hsl(${220 + i * 18},70%,${55 + i * 5}%)`} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card>
                        <SectionTitle title="Regional Distribution" sub="Users per region (PSGC address data)" />
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={regions} barSize={20}>
                                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="region" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<Tip />} />
                                <Bar dataKey="u" name="Users" fill="#8b5cf6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* ── Top Companies + Recent Activity ── */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
                    <Card>
                        <SectionTitle title="Top Companies by Applications" sub="Most applied-to franchise brands" />
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
                            {["Company", "Applications", "Profile Views", "Status"].map(h => (
                                <div key={h} style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em", paddingBottom: 10, fontWeight: 600 }}>{h}</div>
                            ))}
                            {(topCompanies ?? []).map((c: any, i: number) => [
                                <div key={`n${i}`} className="tr" style={{ padding: "10px 6px 10px 0", fontSize: 13, color: "#111827", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 22, height: 22, borderRadius: 6, background: `hsl(${200 + i * 30},70%,92%)`, color: `hsl(${200 + i * 30},70%,40%)`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                    {c.name}
                                </div>,
                                <div key={`a${i}`} style={{ padding: "10px 6px", fontSize: 13, fontWeight: 700, color: "#6366f1", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center" }}>{c.apps}</div>,
                                <div key={`v${i}`} style={{ padding: "10px 6px", fontSize: 13, color: "#6b7280", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center" }}>{c.views}</div>,
                                <div key={`s${i}`} style={{ padding: "10px 6px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center" }}>
                                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, background: c.status === 'approved' ? '#dcfce7' : c.status === 'rejected' ? '#fee2e2' : '#fef9c3', color: c.status === 'approved' ? '#16a34a' : c.status === 'rejected' ? '#dc2626' : '#d97706' }}>{c.status}</span>
                                </div>
                            ])}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Recent Activity" sub="Latest system events" />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {(feed ?? []).map((a: any, i: number) => (
                                <div key={i} className="tr" style={{ display: "flex", gap: 12, padding: "11px 6px", borderBottom: i < (feed?.length ?? 0) - 1 ? "1px solid #f1f5f9" : "none", borderRadius: 8 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: feedBg[a.t] ?? "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                                        {feedIcon[a.t] ?? "📌"}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, color: "#111827", marginBottom: 2, fontWeight: 500 }}>{a.event}</div>
                                        <div style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", paddingTop: 2 }}>{a.time}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div style={{ marginTop: 24, textAlign: "center", color: "#d1d5db", fontSize: 11 }}>
                    EzApply Admin Analytics · Live data from <code style={{ color: "#9ca3af" }}>users · companies · applications · credit_transactions · applicant_views · financials</code>
                </div>
            </div>
        </AppLayout>
    );
}