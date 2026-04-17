import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Image, AlertCircle, CheckCircle } from "lucide-react";

export default function FlierCreate() {
    const { companies } = usePage<{
        companies: { id: number; company_name: string }[];
    }>().props;

    const [form, setForm] = useState({ company_id: "", title: "", description: "" });
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "My Fliers", href: "/fliers" },
        { title: "Upload Flier", href: "/fliers/create" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const mime = f.type;
        setFileType(mime === "application/pdf" ? "pdf" : "image");
        if (mime !== "application/pdf") {
            setPreview(URL.createObjectURL(f));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = () => {
        if (!form.company_id) { setErrors({ company_id: "Please select a company" }); return; }
        if (!form.title) { setErrors({ title: "Title is required" }); return; }
        if (!file) { setErrors({ file: "Please upload a flier file" }); return; }

        setSubmitting(true);
        const data = new FormData();
        data.append("company_id", form.company_id);
        data.append("title", form.title);
        data.append("description", form.description);
        data.append("file", file);

        router.post("/fliers", data, {
            onError: (e) => { setErrors(e); setSubmitting(false); },
            onSuccess: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Flier" />
            <div className="bg-across-pages min-h-screen p-5">
                <div className="max-w-2xl mx-auto space-y-6">

                    <Card className="border-0 shadow-lg bg-white dark:bg-neutral-900">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-600" />
                                Upload Flier
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Upload your flier for admin review. Accepted formats: JPG, PNG, GIF, PDF (max 10MB).
                            </p>
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
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Flier Title *</label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter flier title"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description (optional)</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief description of your flier..."
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Upload File *</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="flier-file"
                                    />
                                    <label htmlFor="flier-file" className="cursor-pointer">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, PDF (max 10MB)</p>
                                    </label>
                                    {file && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600">
                                            {fileType === "pdf"
                                                ? <FileText className="h-4 w-4" />
                                                : <Image className="h-4 w-4" />
                                            }
                                            <span>{file.name}</span>
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                            </div>

                            {/* Image Preview */}
                            {preview && (
                                <div className="border rounded-lg overflow-hidden">
                                    <p className="text-xs text-gray-500 p-2 bg-gray-50 border-b">Preview:</p>
                                    <img src={preview} alt="Flier preview" className="w-full max-h-64 object-contain p-2" />
                                </div>
                            )}

                            {/* PDF Notice */}
                            {fileType === "pdf" && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                    <FileText className="h-4 w-4 shrink-0" />
                                    PDF uploaded — preview not available but will be reviewed by admin.
                                </div>
                            )}

                            {/* Notice */}
                            <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                Your flier will be reviewed by an admin before it goes live on the platform.
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                                    {submitting ? "Uploading..." : "Submit for Approval"}
                                </Button>
                                <Button variant="outline" onClick={() => router.visit("/fliers")}>
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