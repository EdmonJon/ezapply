import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { CheckCircle, XCircle, Clock, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Top-Up Requests", href: "/admin/topup-requests" },
];

interface TopupRequest {
    id: number;
    user_email: string;
    amount: number;
    proof_url: string;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    created_at: string;
    reviewed_at: string | null;
}

const statusStyle = {
    pending:  { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200", icon: Clock,        label: "Pending"  },
    approved: { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  icon: CheckCircle,  label: "Approved" },
    rejected: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    icon: XCircle,      label: "Rejected" },
};

export default function TopupRequests() {
    const { requests = [] } = usePage<{ requests: TopupRequest[] }>().props;

    const [reviewingId, setReviewingId]   = useState<number | null>(null);
    const [action, setAction]             = useState<"approved" | "rejected" | null>(null);
    const [adminNote, setAdminNote]       = useState("");
    const [isLoading, setIsLoading]       = useState(false);
    const [proofModal, setProofModal]     = useState<string | null>(null);

    const openReview = (id: number, act: "approved" | "rejected") => {
        setReviewingId(id);
        setAction(act);
        setAdminNote("");
    };

    const submitReview = () => {
        if (!reviewingId || !action) return;
        setIsLoading(true);
        router.post(`/admin/topup-requests/${reviewingId}/review`, {
            action,
            admin_note: adminNote,
        }, {
            onSuccess: () => { setReviewingId(null); setAction(null); setAdminNote(""); setIsLoading(false); },
            onError:   () => setIsLoading(false),
        });
    };

    const pending  = requests.filter(r => r.status === 'pending');
    const reviewed = requests.filter(r => r.status !== 'pending');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Top-Up Requests" />

            <div className="p-6 bg-gray-50 min-h-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Top-Up Requests</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and approve user credit top-up requests</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-yellow-700">{pending.length}</div>
                            <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-green-700">{requests.filter(r => r.status === 'approved').length}</div>
                            <div className="text-xs text-green-600">Approved</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-red-700">{requests.filter(r => r.status === 'rejected').length}</div>
                            <div className="text-xs text-red-600">Rejected</div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                {pending.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">⏳ Pending Approval</h2>
                        <div className="grid gap-4">
                            {pending.map((req) => (
                                <Card key={req.id} className="border border-yellow-200 shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-800">{req.user_email}</span>
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mb-1">{req.amount.toLocaleString()} <span className="text-sm font-normal text-gray-500">credits</span></p>
                                                <p className="text-xs text-gray-400">Submitted {req.created_at}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setProofModal(req.proof_url)}
                                                    className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Proof
                                                </button>
                                                <button
                                                    onClick={() => openReview(req.id, 'approved')}
                                                    className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => openReview(req.id, 'rejected')}
                                                    className="flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {pending.length === 0 && (
                    <div className="text-center py-12 text-gray-400 mb-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                        <p className="font-medium">All caught up! No pending requests.</p>
                    </div>
                )}

                {/* Reviewed Requests */}
                {reviewed.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">📋 Reviewed</h2>
                        <div className="grid gap-3">
                            {reviewed.map((req) => {
                                const s = statusStyle[req.status];
                                const Icon = s.icon;
                                return (
                                    <div key={req.id} className={`flex items-center justify-between p-4 rounded-xl border ${s.bg} ${s.border}`}>
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${s.text}`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{req.user_email}</p>
                                                <p className="text-xs text-gray-500">{req.amount.toLocaleString()} credits · {req.created_at}</p>
                                                {req.admin_note && <p className="text-xs text-gray-600 italic mt-0.5">Note: "{req.admin_note}"</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setProofModal(req.proof_url)} className="text-xs text-blue-600 hover:underline">View Proof</button>
                                            <span className={`text-xs font-bold uppercase ${s.text}`}>{s.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Review Modal ── */}
            {reviewingId && action && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${action === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                                {action === 'approved' ? '✅ Approve Request' : '❌ Reject Request'}
                            </h3>
                            <button onClick={() => setReviewingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            {action === 'approved'
                                ? 'The credits will be immediately added to the user\'s wallet and they will be notified via email.'
                                : 'The user will be notified via email with your reason.'}
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Note <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder={action === 'approved' ? 'e.g. Payment verified via GCash.' : 'e.g. Receipt is unclear, please resubmit.'}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setReviewingId(null)}>Cancel</Button>
                            <Button
                                className={`flex-1 text-white ${action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
                                onClick={submitReview}
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : action === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Proof of Payment Modal ── */}
            {proofModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setProofModal(null)}>
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setProofModal(null)} className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-lg text-gray-600 hover:text-gray-900 z-10">
                            <X className="w-5 h-5" />
                        </button>
                        {proofModal.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                            <img src={proofModal} alt="Proof of Payment" className="rounded-2xl w-full shadow-2xl" />
                        ) : (
                            <iframe src={proofModal} className="w-full h-[80vh] rounded-2xl shadow-2xl" />
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}