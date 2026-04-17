import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, ShieldCheck, AlertTriangle, Pencil, RefreshCw, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'EZCoin Management', href: '/ezcoin' },
];

interface CompanyRow {
    id: number;
    company_name: string;
    brand_name: string | null;
    status: string;
    payment_status: string;
    franchise_fee: number;
    ezcoin_cost: number;
    suggested_cost: number;
    agent_name: string;
    user_balance: number;
    can_afford: boolean;
}

interface LoadHistoryRow {
    id: number;
    company_name: string;
    ezcoin_loaded: number;
    bonus_coins: number;
    total: number;
    loaded_by: string;
    notes: string | null;
    created_at: string;
}

const tabs = [
    { id: 'companies', label: 'Companies',    icon: Coins },
    { id: 'history',   label: 'Load History', icon: History },
];

function formatCurrency(val: number) {
    return '₱' + val.toLocaleString();
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function getTierLabel(fee: number) {
    if (fee <= 150000)  return { label: '150K & Below', color: 'bg-blue-100 text-blue-700' };
    if (fee <= 500000)  return { label: '150K – 500K',  color: 'bg-green-100 text-green-700' };
    if (fee <= 1000000) return { label: '500K – 1M',    color: 'bg-yellow-100 text-yellow-700' };
    return                     { label: '1M & Above',   color: 'bg-red-100 text-red-700' };
}

export default function EzCoinIndex() {
    const { props } = usePage<any>();
    const companies: CompanyRow[]         = props.companies ?? [];
    const loadHistories: LoadHistoryRow[] = props.loadHistories ?? [];

    const [activeTab, setActiveTab]       = useState('companies');

    // Search & filter
    const [search, setSearch]             = useState('');
    const [agentSearch, setAgentSearch]   = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [affordFilter, setAffordFilter] = useState<'all' | 'yes' | 'no'>('all');
    const [histSearch, setHistSearch]     = useState('');

    // Edit modal
    const [editOpen, setEditOpen]         = useState(false);
    const [editCompany, setEditCompany]   = useState<CompanyRow | null>(null);
    const [editAmount, setEditAmount]     = useState('');
    const [editLoading, setEditLoading]   = useState(false);

    const filteredCompanies = companies.filter(c => {
        const matchesCompany = c.company_name.toLowerCase().includes(search.toLowerCase());
        const matchesAgent   = (c.agent_name ?? '').toLowerCase().includes(agentSearch.toLowerCase());
        const matchesStatus  = statusFilter === 'all' || c.status === statusFilter;
        const matchesAfford  = affordFilter === 'all'
            || (affordFilter === 'yes' && c.can_afford)
            || (affordFilter === 'no'  && !c.can_afford);
        return matchesCompany && matchesAgent && matchesStatus && matchesAfford;
    });

    const filteredHistory = loadHistories.filter(h =>
        h.company_name.toLowerCase().includes(histSearch.toLowerCase()) ||
        (h.loaded_by ?? '').toLowerCase().includes(histSearch.toLowerCase())
    );

    function openEdit(company: CompanyRow) {
        setEditCompany(company);
        setEditAmount(String(company.ezcoin_cost));
        setEditOpen(true);
    }

    function submitEdit() {
        if (!editCompany) return;
        setEditLoading(true);
        router.put(`/ezcoin/companies/${editCompany.id}/cost`, { ezcoin_cost: parseInt(editAmount) }, {
            onFinish: () => { setEditLoading(false); setEditOpen(false); },
        });
    }

    function resetToAuto(company: CompanyRow) {
        router.post(`/ezcoin/companies/${company.id}/reset-cost`, {}, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="EZCoin Management" />

            <div className="p-4 md:p-6 space-y-6">

                {/* Tier Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { range: '150K & Below', coin: 200, color: 'border-blue-300 bg-blue-50' },
                        { range: '150K – 500K',  coin: 300, color: 'border-green-300 bg-green-50' },
                        { range: '500K – 1M',    coin: 400, color: 'border-yellow-300 bg-yellow-50' },
                        { range: '1M & Above',   coin: 500, color: 'border-red-300 bg-red-50' },
                    ].map(t => (
                        <div key={t.coin} className={`rounded-xl border-2 p-4 text-center ${t.color}`}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Franchise Fee</p>
                            <p className="font-bold text-gray-800 mt-1">{t.range}</p>
                            <div className="mt-2 flex items-center justify-center gap-1">
                                <Coins className="w-4 h-4 text-amber-500" />
                                <span className="text-xl font-extrabold text-amber-600">{t.coin}</span>
                                <span className="text-xs text-gray-500">EZCoin</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">deducted on approval</p>
                        </div>
                    ))}
                </div>

                {/* Info banner */}
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                    <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>
                        Company pays EZCoin while <strong>pending</strong>. Once paid, admin can see it in
                        the <strong>Load History</strong> tab and approve the company.
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Companies Tab ─────────────────────────────────────── */}
                {activeTab === 'companies' && (
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <CardTitle>Company EZCoin Status</CardTitle>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Search company..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <Input
                                    placeholder="Search agent..."
                                    value={agentSearch}
                                    onChange={e => setAgentSearch(e.target.value)}
                                />
                                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select value={affordFilter} onValueChange={(v) => setAffordFilter(v as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by balance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Balance</SelectLabel>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="yes">Can Afford</SelectItem>
                                            <SelectItem value="no">Needs Top Up</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Agent</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-center">Payment</TableHead>
                                            <TableHead className="text-center">Franchise Fee</TableHead>
                                            <TableHead className="text-center">Tier</TableHead>
                                            <TableHead className="text-center">EZCoin Cost</TableHead>
                                            <TableHead className="text-center">Wallet Balance</TableHead>
                                            <TableHead className="text-center">Can Afford?</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCompanies.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center text-gray-400 py-8">
                                                    No companies found.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredCompanies.map(company => {
                                            const tier     = getTierLabel(company.franchise_fee);
                                            const isCustom = company.ezcoin_cost !== company.suggested_cost;
                                            return (
                                                <TableRow key={company.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{company.company_name}</div>
                                                        {company.brand_name && (
                                                            <div className="text-xs text-gray-400">{company.brand_name}</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">{company.agent_name}</TableCell>
                                                    <TableCell className="text-center">
                                                        {company.status === 'approved' && <Badge variant="success">Approved</Badge>}
                                                        {company.status === 'pending'  && <Badge variant="secondary">Pending</Badge>}
                                                        {company.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {company.payment_status === 'paid' ? (
                                                            <Badge className="bg-green-100 text-green-700 border border-green-300">Paid</Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-100 text-gray-500 border border-gray-300">Unpaid</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">{formatCurrency(company.franchise_fee)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tier.color}`}>
                                                            {tier.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Coins className="w-4 h-4 text-amber-400" />
                                                            <span className="font-bold text-amber-700">{company.ezcoin_cost}</span>
                                                            {isCustom && (
                                                                <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1 rounded">custom</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Coins className="w-4 h-4 text-gray-400" />
                                                            <span className={company.can_afford ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                                                                {company.user_balance}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {company.can_afford ? (
                                                            <div className="flex items-center justify-center gap-1 text-green-600">
                                                                <ShieldCheck className="w-4 h-4" />
                                                                <span className="text-xs font-semibold">Yes</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-1 text-red-500">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                <span className="text-xs font-semibold">No</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(company)}>
                                                                <Pencil className="w-3 h-3" /> Edit
                                                            </Button>
                                                            {isCustom && (
                                                                <Button size="sm" variant="ghost" className="gap-1 text-gray-500" onClick={() => resetToAuto(company)} title="Reset to auto">
                                                                    <RefreshCw className="w-3 h-3" /> Reset
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden space-y-3 mt-4">
                                {filteredCompanies.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">No companies found.</div>
                                ) : filteredCompanies.map(company => {
                                    const tier     = getTierLabel(company.franchise_fee);
                                    const isCustom = company.ezcoin_cost !== company.suggested_cost;
                                    return (
                                        <div key={company.id} className="border rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-semibold">{company.company_name}</p>
                                                    <p className="text-xs text-gray-400">{company.agent_name}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {company.status === 'approved' && <Badge variant="success">Approved</Badge>}
                                                    {company.status === 'pending'  && <Badge variant="secondary">Pending</Badge>}
                                                    {company.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                                    {company.payment_status === 'paid'
                                                        ? <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs">Paid</Badge>
                                                        : <Badge className="bg-gray-100 text-gray-500 border border-gray-300 text-xs">Unpaid</Badge>
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Franchise Fee</span>
                                                <span>{formatCurrency(company.franchise_fee)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Tier</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tier.color}`}>{tier.label}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">EZCoin Cost</span>
                                                <div className="flex items-center gap-1">
                                                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                                                    <span className="font-bold text-amber-700">{company.ezcoin_cost}</span>
                                                    {isCustom && <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">custom</span>}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Wallet Balance</span>
                                                <div className="flex items-center gap-1">
                                                    <Coins className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className={company.can_afford ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                                                        {company.user_balance}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(company)}>
                                                    <Pencil className="w-3 h-3" /> Edit Cost
                                                </Button>
                                                {isCustom && (
                                                    <Button size="sm" variant="ghost" className="gap-1 text-gray-500" onClick={() => resetToAuto(company)}>
                                                        <RefreshCw className="w-3 h-3" /> Reset
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Load History Tab ──────────────────────────────────── */}
                {activeTab === 'history' && (
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <CardTitle>Load History</CardTitle>
                            <Input
                                placeholder="Search company or paid by..."
                                value={histSearch}
                                onChange={e => setHistSearch(e.target.value)}
                                className="w-full md:w-64"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead className="text-center">EZCoin</TableHead>
                                            <TableHead className="text-center">Bonus</TableHead>
                                            <TableHead className="text-center">Total</TableHead>
                                            <TableHead>Paid By</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                                                    No history yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredHistory.map(h => (
                                            <TableRow key={h.id}>
                                                <TableCell className="font-medium">{h.company_name}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>{h.ezcoin_loaded}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-green-600 font-semibold">
                                                        {h.bonus_coins > 0 ? `+${h.bonus_coins}` : '—'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="font-bold text-amber-700">{h.total}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{h.loaded_by}</TableCell>
                                                <TableCell className="text-sm text-gray-500 max-w-xs truncate">{h.notes ?? '—'}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{formatDate(h.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile history */}
                            <div className="md:hidden space-y-3 mt-4">
                                {filteredHistory.map(h => (
                                    <div key={h.id} className="border rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between font-semibold">
                                            <span>{h.company_name}</span>
                                            <div className="flex items-center gap-1 text-amber-700">
                                                <Coins className="w-4 h-4 text-amber-400" />
                                                {h.total}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 flex gap-3">
                                            <span>EZCoin: {h.ezcoin_loaded}</span>
                                            {h.bonus_coins > 0 && <span className="text-green-600">Bonus: +{h.bonus_coins}</span>}
                                        </div>
                                        <div className="text-xs text-gray-400">By {h.loaded_by} · {formatDate(h.created_at)}</div>
                                        {h.notes && <div className="text-xs text-gray-500 italic">{h.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Edit EZCoin Cost Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit EZCoin Cost</DialogTitle>
                    </DialogHeader>
                    {editCompany && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                <p className="font-semibold">{editCompany.company_name}</p>
                                <p className="text-gray-500">
                                    Franchise Fee: <strong>{formatCurrency(editCompany.franchise_fee)}</strong>
                                </p>
                                <p className="text-gray-500">
                                    Auto-suggested: <strong className="text-amber-600">{editCompany.suggested_cost} EZCoin</strong>
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Quick Select</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[200, 300, 400, 500].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setEditAmount(String(v))}
                                            className={`py-2 rounded-md border text-sm font-semibold transition-colors ${
                                                editAmount === String(v)
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'border-gray-200 hover:border-amber-400 text-gray-600'
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-amount">Or enter custom amount</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    min={0}
                                    value={editAmount}
                                    onChange={e => setEditAmount(e.target.value)}
                                    placeholder="Enter EZCoin amount"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={submitEdit}
                            disabled={editLoading || !editAmount}
                        >
                            {editLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
