import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Wallet, History, PlusCircle, ArrowUp, ArrowDown, Upload, Clock, CheckCircle, XCircle, ClipboardList, Eye, Copy } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { usePage, router } from "@inertiajs/react";
import { SharedData, Transactions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions } from "@/hooks/use-permissions";
import { Label } from "@/components/ui/label";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Credits", href: "/credit-balance" },
];

interface Company {
    id: number;
    name: string;
    email: string;
}

interface TopupRequest {
    id: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_note: string | null;
    created_at: string;
    proof_url: string;
}

const paymentMethods = [
    {
        id: "gcash",
        name: "GCash",
        number: "0966 180 5665",
        accountName: "Ceasar B. Laro Jr.",
        color: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        textColor: "text-blue-700",
        logo: "💙",
    },
    {
        id: "bpi",
        name: "BPI",
        number: "9499287019",
        accountName: "Ceasar B. Laro Jr.",
        color: "from-red-500 to-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        textColor: "text-red-700",
        logo: "🏦",
    },
];

const statusIcon: Record<string, any> = {
    pending:  { icon: Clock,       color: "text-yellow-500", bg: "bg-yellow-50", label: "Pending"  },
    approved: { icon: CheckCircle, color: "text-green-500",  bg: "bg-green-50",  label: "Approved" },
    rejected: { icon: XCircle,     color: "text-red-500",    bg: "bg-red-50",    label: "Rejected" },
};

export default function BalancePage() {
    const [activeTab, setActiveTab]                 = useState("balance");
    const [topUpAmount, setTopUpAmount]             = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [isLoading, setIsLoading]                 = useState(false);
    const [proofFile, setProofFile]                 = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]               = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment]     = useState<string>("gcash");
    const [copiedId, setCopiedId]                   = useState<string | null>(null);
    const fileInputRef                              = useRef<HTMLInputElement>(null);

    const { props } = usePage<SharedData>();
    const { isAdmin, hasRole, hasPermission, isAdmin: checkIsAdmin } = usePermissions();

    const creditsDisplay                          = props.balance ?? 0;
    const companies: Company[]                    = (props.companies as Company[]) ?? [];
    const creditTransactions: Transactions[]      = props.credit_transactions ?? [];
    const myTopupRequests: TopupRequest[]         = (props.my_topup_requests as TopupRequest[]) ?? [];
    const topupRequests                           = (props.topup_requests as any[]) ?? [];

    // Requests tab only visible to admin
    const tabs = [
        { id: "balance",  label: "Balance",  icon: Wallet },
        { id: "history",  label: "History",  icon: History },
        { id: "topup",    label: "Top Up",   icon: PlusCircle },
        ...(isAdmin() ? [{ id: "requests", label: "Requests", icon: ClipboardList }] : []),
    ];

    const hasAccess = checkIsAdmin() || hasRole('company') || hasPermission('view_balance');

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text.replace(/\s/g, ''));
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProofFile(file);
        setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    };

    const handleAdminTopUp = () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }
        if (!selectedCompanyId) {
            alert("Please select a company to add credits to.");
            return;
        }
        setIsLoading(true);
        router.post('/credits/add', { amount: topUpAmount, user_id: parseInt(selectedCompanyId) }, {
            onSuccess: () => { setTopUpAmount(""); setSelectedCompanyId(""); setIsLoading(false); },
            onError: () => setIsLoading(false),
        });
    };

    const handleUserTopUp = () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }
        if (!proofFile) {
            alert("Please upload your proof of payment.");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('amount', topUpAmount);
        formData.append('proof_of_payment', proofFile);
        router.post('/credits/topup-request', formData, {
            forceFormData: true,
            onSuccess: () => {
                setTopUpAmount("");
                setProofFile(null);
                setPreviewUrl(null);
                setIsLoading(false);
                setActiveTab("balance");
            },
            onError: () => setIsLoading(false),
        });
    };

    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </AppLayout>
        );
    }

    const selectedMethod = paymentMethods.find(p => p.id === selectedPayment) ?? paymentMethods[0];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col min-h-screen bg-gray-50 p-4 md:p-6">

                {/* ── Tabs ── */}
                <div className="flex justify-between relative border-b w-full max-w-lg mx-auto md:max-w-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center relative py-3 flex-1 transition-colors ${
                                    activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-colors ${
                                    activeTab === tab.id ? "bg-blue-100" : "hover:bg-gray-100"
                                }`}>
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <span className="text-xs mt-1">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 flex items-start justify-center pt-8 pb-4">

                    {/* ── Balance Tab ── */}
                    {activeTab === "balance" && (
                        <div className="w-full max-w-lg space-y-4">
                            <Card className="shadow-xl rounded-xl">
                                <CardContent className="p-6 text-center">
                                    <h2 className="text-lg font-semibold text-gray-600 mb-2">
                                        {isAdmin() ? "Admin Credit Management" : "Current Balance"}
                                    </h2>
                                    {!isAdmin() && (
                                        <p className="text-4xl font-bold text-green-600 mb-6">ez {creditsDisplay}</p>
                                    )}
                                    {isAdmin() && (
                                        <p className="text-sm text-gray-500 mb-6">Manage credits from the Top Up tab</p>
                                    )}
                                    <Button className="w-full" onClick={() => setActiveTab("topup")}>
                                        <PlusCircle className="w-4 h-4 mr-2" /> Add Credits
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* User's topup request statuses */}
                            {!isAdmin() && myTopupRequests.length > 0 && (
                                <Card className="shadow-xl rounded-xl">
                                    <CardContent className="p-6">
                                        <h3 className="text-sm font-semibold text-gray-600 mb-4">My Top-Up Requests</h3>
                                        <div className="space-y-3">
                                            {myTopupRequests.map((req) => {
                                                const s = statusIcon[req.status];
                                                const Icon = s.icon;
                                                return (
                                                    <div key={req.id} className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
                                                        <div className="flex items-center gap-3">
                                                            <Icon className={`w-5 h-5 ${s.color}`} />
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">{req.amount} credits</p>
                                                                <p className="text-xs text-gray-500">{req.created_at}</p>
                                                                {req.admin_note && (
                                                                    <p className="text-xs text-gray-600 mt-1 italic">"{req.admin_note}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase ${s.color}`}>{s.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* ── History Tab ── */}
                    {activeTab === "history" && (
                        <Card className="w-full max-w-lg shadow-xl rounded-xl">
                            <CardContent className="p-4 md:p-6">
                                <h2 className="text-lg font-semibold text-gray-600 mb-4">Transaction History</h2>
                                <ul className="divide-y divide-gray-200">
                                    {creditTransactions.length > 0 ? (
                                        creditTransactions.map((transaction) => {
                                            const isUsage = transaction.type === 'usage' || transaction.type === 'purchase_info';
                                            const Icon = isUsage ? ArrowDown : ArrowUp;
                                            return (
                                                <li key={transaction.id} className="py-3 flex items-center space-x-3 md:space-x-4">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUsage ? 'bg-red-100' : 'bg-green-100'}`}>
                                                        <Icon className={`w-5 h-5 ${isUsage ? 'text-red-500' : 'text-green-500'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-800 truncate">{transaction.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                                                        {isAdmin() && transaction.user && (
                                                            <p className="text-xs text-gray-500 mt-1">For: {transaction.user.email}</p>
                                                        )}
                                                    </div>
                                                    <span className={`font-semibold text-sm flex-shrink-0 ${isUsage ? 'text-red-600' : 'text-green-600'}`}>
                                                        {isUsage ? '-' : '+'}{Math.abs(transaction.amount)} credits
                                                    </span>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="text-center text-gray-500 py-4">No transaction history available.</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Top Up Tab ── */}
                    {activeTab === "topup" && (
                        <>
                            {/* ADMIN: direct credit add */}
                            {isAdmin() && (
                                <Card className="w-full max-w-sm shadow-xl rounded-xl">
                                    <CardContent className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-600 mb-4">Add Credits to Agent</h2>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label>Select Agent</Label>
                                                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                                    <SelectTrigger><SelectValue placeholder="Choose an Agent" /></SelectTrigger>
                                                    <SelectContent>
                                                        {companies.length > 0 ? companies.map((c) => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.email})</SelectItem>
                                                        )) : (
                                                            <SelectItem value="none" disabled>No companies available</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Credit Amount</Label>
                                                <Input type="number" placeholder="Enter amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} min="1" />
                                            </div>
                                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleAdminTopUp} disabled={isLoading || !selectedCompanyId}>
                                                {isLoading ? "Processing..." : "Add Credits"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* USER: submit request with proof */}
                            {!isAdmin() && (
                                <div className="w-full max-w-sm space-y-4">

                                    {/* ── Payment Method Selector ── */}
                                    <Card className="shadow-xl rounded-xl">
                                        <CardContent className="p-5">
                                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Select Payment Method</h3>

                                            {/* Method toggle buttons */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                {paymentMethods.map((method) => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setSelectedPayment(method.id)}
                                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                                            selectedPayment === method.id
                                                                ? `${method.border} ${method.bg}`
                                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                        }`}
                                                    >
                                                        <span className="text-xl">{method.logo}</span>
                                                        <span className={`text-[10px] font-semibold ${selectedPayment === method.id ? method.textColor : 'text-gray-500'}`}>
                                                            {method.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Selected method details card */}
                                            <div className={`rounded-xl p-4 ${selectedMethod.bg} border ${selectedMethod.border}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-semibold uppercase tracking-wide ${selectedMethod.textColor}`}>
                                                        {selectedMethod.logo} {selectedMethod.name}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(selectedMethod.number, selectedMethod.id)}
                                                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${selectedMethod.border} ${selectedMethod.textColor} bg-white hover:opacity-80 transition-opacity`}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                        {copiedId === selectedMethod.id ? '✓ Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <p className={`text-xl font-bold tracking-widest mt-1 ${selectedMethod.textColor}`}>
                                                    {selectedMethod.number}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Account Name: <strong className="text-gray-700">{selectedMethod.accountName}</strong>
                                                </p>
                                            </div>

                                            <p className="text-xs text-gray-400 mt-3 text-center">
                                                Send your payment to the number above then fill in the form below.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* ── Top Up Form ── */}
                                    <Card className="shadow-xl rounded-xl">
                                        <CardContent className="p-6">
                                            <h2 className="text-lg font-semibold text-gray-600 mb-1">Request Top Up</h2>
                                            <p className="text-xs text-gray-400 mb-4">Upload your proof of payment after sending.</p>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Amount (Credits)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter amount"
                                                        value={topUpAmount}
                                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                                        min="1"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Proof of Payment</Label>
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                                    >
                                                        {previewUrl ? (
                                                            <img src={previewUrl} alt="Preview" className="max-h-36 mx-auto rounded-lg object-contain" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                                <Upload className="w-8 h-8" />
                                                                <p className="text-sm">{proofFile ? proofFile.name : "Click to upload JPG, PNG, or PDF"}</p>
                                                                <p className="text-xs">Max 5MB</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                                </div>

                                                {proofFile && (
                                                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        {proofFile.name}
                                                    </div>
                                                )}

                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={handleUserTopUp}
                                                    disabled={isLoading || !proofFile || !topUpAmount}
                                                >
                                                    {isLoading ? "Submitting..." : "Submit Request"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Requests Tab (Admin only) ── */}
                    {activeTab === "requests" && isAdmin() && (
                        <div className="w-full max-w-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-700">Top-Up Requests</h2>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                                    {topupRequests.filter((r: any) => r.status === 'pending').length} Pending
                                </span>
                            </div>

                            {topupRequests.length === 0 && (
                                <Card className="shadow-xl rounded-xl">
                                    <CardContent className="p-8 text-center text-gray-400">
                                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-300" />
                                        <p>No top-up requests yet.</p>
                                    </CardContent>
                                </Card>
                            )}

                            {topupRequests.map((req: any) => (
                                <Card key={req.id} className={`shadow-sm rounded-xl border ${
                                    req.status === 'pending'  ? 'border-yellow-200' :
                                    req.status === 'approved' ? 'border-green-200'  : 'border-red-200'
                                }`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-800">{req.user_email}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        req.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                                                        req.status === 'approved' ? 'bg-green-100 text-green-700'  :
                                                        'bg-red-100 text-red-700'
                                                    }`}>{req.status}</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                                    {req.amount.toLocaleString()} <span className="text-sm font-normal text-gray-500">credits</span>
                                                </p>
                                                <p className="text-xs text-gray-400">Submitted {req.created_at}</p>
                                                {req.admin_note && (
                                                    <p className="text-xs text-gray-500 italic mt-1">Note: "{req.admin_note}"</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <a
                                                    href={req.proof_url}
                                                    target="_blank"
                                                    className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Proof
                                                </a>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.post(`/admin/topup-requests/${req.id}/review`, { action: 'approved', admin_note: '' })}
                                                            className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => router.post(`/admin/topup-requests/${req.id}/review`, { action: 'rejected', admin_note: '' })}
                                                            className="flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}