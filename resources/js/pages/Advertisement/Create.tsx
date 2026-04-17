import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Upload, Image, Video, FileText, AlertCircle } from "lucide-react";

export default function AdvertisementCreate() {
    const { balance, companies, placements, pricing } = usePage<{
        balance: number;
        companies: { id: number; company_name: string }[];
        placements: Record<string, string>;
        pricing: { image: number; video: number; pdf: number };
    }>().props;

    const [form, setForm] = useState({
        company_id: "",
        title: "",
        description: "",
        placement: "",
        start_date: "",
        end_date: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Advertisements", href: "/advertisements" },
        { title: "Create", href: "/advertisements/create" },
    ];

    const dailyCost = fileType === "video" ? pricing.video
                    : fileType === "pdf"   ? pricing.pdf
                    : fileType === "image" ? pricing.image : 0;

    const days = form.start_date && form.end_date
        ? Math.max(0, Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : 0;

    const estimatedTotal = dailyCost * days;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const mime = f.type;
        if (mime.startsWith("video/"))       setFileType("video");
        else if (mime === "application/pdf") setFileType("pdf");
        else                                 setFileType("image");
    };

    const handleSubmit = () => {
        setSubmitting(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (file) data.append("file", file);

        router.post("/advertisements", data, {
            onError: (e) => { setErrors(e); setSubmitting(false); },
            onSuccess: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Advertisement" />
            <div className="bg-across-pages min-h-screen p-5">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Balance */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Coins className="h-8 w-8" />
                            <div>
                                <p className="text-sm text-yellow-100">Your EZCoin Balance</p>
                                <p className="text-2xl font-bold">{balance.toLocaleString()} EZCoins</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl font-bold">Submit Advertisement</CardTitle>
                            <p className="text-sm text-gray-500">Fill in the details below. Your ad will be reviewed before going live.</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-5">

                            {/* Company */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Company *</label>
                                <select
                                    value={form.company_id}
                                    onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 px-3 py-2 text-sm"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.company_name}</option>
                                    ))}
                                </select>
                                {errors.company_id && <p className="text-red-500 text-xs mt-1">{errors.company_id}</p>}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Ad Title *</label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter advertisement title"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe your advertisement..."
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Upload Ad File *</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                                    <input type="file" accept=".jpg,.jpeg,.png,.gif,.mp4,.pdf" onChange={handleFileChange} className="hidden" id="ad-file" />
                                    <label htmlFor="ad-file" className="cursor-pointer">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, MP4, PDF (max 50MB)</p>
                                    </label>
                                    {file && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                                            {fileType === "video" ? <Video className="h-4 w-4" /> : fileType === "pdf" ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                                            {file.name}
                                        </div>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                            </div>

                            {/* Placement */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Ad Placement *</label>
                                <select
                                    value={form.placement}
                                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 px-3 py-2 text-sm"
                                >
                                    <option value="">Select Placement</option>
                                    {Object.entries(placements).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {errors.placement && <p className="text-red-500 text-xs mt-1">{errors.placement}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Start Date *</label>
                                    <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} min={new Date().toISOString().split("T")[0]} />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">End Date *</label>
                                    <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} min={form.start_date} />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            {/* Cost Summary */}
                            {fileType && days > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-4 space-y-2">
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                                        <Coins className="h-4 w-4" /> Cost Summary
                                    </p>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ad Type:</span>
                                            <span className="font-medium capitalize">{fileType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Daily Cost:</span>
                                            <span className="font-medium">{dailyCost} EZCoins</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{days} day{days > 1 ? "s" : ""}</span>
                                        </div>
                                        <hr className="border-yellow-200" />
                                        <div className="flex justify-between font-bold text-yellow-800 dark:text-yellow-400">
                                            <span>Estimated Total:</span>
                                            <span>{estimatedTotal} EZCoins</span>
                                        </div>
                                    </div>
                                    {estimatedTotal > balance && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Insufficient balance! You need {estimatedTotal - balance} more EZCoins.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                                    {submitting ? "Submitting..." : "Submit for Approval"}
                                </Button>
                                <Button variant="outline" onClick={() => router.visit("/advertisements")}>
                                    Cancel
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}