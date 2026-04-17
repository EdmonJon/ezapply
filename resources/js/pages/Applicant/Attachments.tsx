// resources/js/Pages/Applicant/Attachments.tsx
import React from "react";
import AppLayout from "@/layouts/app-layout";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { dashboard, applicantAttachments } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PermissionGate from '@/components/PermissionGate';
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: dashboard() },
	{ title: "Attachments", href: applicantAttachments() }
];

interface Attachment {
	id: number;
	attachment_type: string;
	attachment_path: string;
}

interface AttachmentsProps {
	attachments?: Attachment[];
}

export default function Attachments({ attachments = [] }: AttachmentsProps) {
	const { data, setData, post, processing, errors, reset } = useForm<{ attachment_type: string; attachment: File | null }>({
		attachment_type: "Resume/CV",
		attachment: null,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/applicant/attachments", {
			forceFormData: true,
			onSuccess: () => {
				reset();
			},
		});
	};

	const handleDelete = (id: number) => {
		
  if (window.confirm("Are you sure you want to delete this item?")) {

		router.delete(`/applicant/attachments/${id}`);
  }else {
	return;
  }
	};

	return (
			<div className="p-6">
      		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
						<select
							className="w-full rounded-md border border-gray-300 bg-white p-2 dark:bg-gray-800 dark:border-gray-700"
							value={data.attachment_type}
							onChange={(e) => setData("attachment_type", e.target.value)}
						>
							<option value="Resume/CV">Resume/CV</option>
							<option value="Valid ID">Valid ID</option>
							<option value="Proof of Income">Proof of Income</option>
							<option value="Proof of Address">Proof of Address</option>
							<option value="Business Documents">Business Documents</option>
							<option value="other">Other</option>
						</select>
						{errors.attachment_type && <p className="text-red-600 text-sm mt-1">{errors.attachment_type}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
						<Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setData("attachment", e.target.files?.[0] ?? null)} />
						{errors.attachment && <p className="text-red-600 text-sm mt-1">{errors.attachment}</p>}
					</div>
					<div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
						<Button type="submit" disabled={processing} className="px-8">
							{processing ? "Uploading..." : "Upload"}
						</Button>
					</div>
					</form>
					<div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 min-h-[250px]">
				
						<h3 className="text-sm text-gray-600 dark:text-gray-400">Preview:</h3>
					  {data.attachment && data.attachment.type.startsWith("image/") && (
						<img
							src={URL.createObjectURL(data.attachment)}
							alt="preview"
							className="mt-2 max-h-100 rounded border dark:border-gray-700"
						/>
					)}

					{/* If PDF or DOCX show filename */}
					{data.attachment && !data.attachment.type.startsWith("image/") && (
						<p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
						Selected file: {data.attachment.name}
						</p>
					)}
										{!data.attachment && (
						<p className="text-gray-500 text-sm italic">
							No file selected yet.
						</p>
					)}
					</div>
					</div>

				{attachments.length > 0 && (
					<div className="mt-10">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Files</h2>
						<ul className="space-y-3">

							{attachments.map((a) => (
								<li key={a.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
									
 								 <div className="flex items-center gap-3">
    								{a.attachment_path.match(/\.(jpg|jpeg|png)$/i) ? (
									 <img
									 src={`/storage/${a.attachment_path}`} // adjust path if needed
									 alt={a.attachment_type}
									 className="h-12 w-12 object-cover rounded border dark:border-gray-700"
									 />
									) : (
									<span className="text-sm text-gray-700 dark:text-gray-300">{a.attachment_type} — {a.attachment_path}</span>
										)}
										<span className="text-sm text-gray-700 dark:text-gray-300">
										{a.attachment_type}
										 </span>
										 </div>
									 <div className="flex justify-center items-center gap-2">
									 <Button className="view-btn btn-2 cursor-pointer"
									 variant="secondary"
									 onClick={() => window.open(`/storage/${a.attachment_path}`, "_blank")}
									 >
									 View File
									 </Button>
									 <Button className=" cursor-pointer" variant="destructive" onClick={() => handleDelete(a.id)}>Delete</Button>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
	);
}


