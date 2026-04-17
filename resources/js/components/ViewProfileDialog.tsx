import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Application } from "@/types/applicants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
};

export default function ViewProfileDialog({ open, onOpenChange, application }: Props) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [paidFields, setPaidFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const maskValue = (value: any) => "********";

  // Fetch paid fields for this applicant when modal opens
  useEffect(() => {
    async function fetchPaidFields() {
      if (!application) return;
      setLoading(true);
      try {
        const res = await fetch(`/check-applicant-view/${application.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.paid_fields)) {
            setPaidFields(data.paid_fields);

            const revealed: Record<string, boolean> = {};
            data.paid_fields.forEach((f: string) => (revealed[f] = true));
            setVisibleFields(revealed);
          }
        }
      } catch (err) {
        console.error("Failed to fetch paid fields:", err);
      } finally {
        setLoading(false);
      }
    }

    if (open && application) fetchPaidFields();
  }, [open, application]);

  if (!application) return null;

  const handleMoreInfo = () => {
    const url = `/company/applicants/${application.id}/profile`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-md max-w-md mx-auto mt-5 bg-white dark:bg-neutral-800">
        <DialogTitle className="text-lg font-bold mb-2">
          Applicant Profile
        </DialogTitle>
        <hr className="my-2" />

        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading profile...</p>
        ) : (
          <>
            <p>
              <strong>Name:</strong>{" "}
              {visibleFields.first_name || visibleFields.last_name
                ? `${application.user?.basicinfo?.first_name ?? ""} ${application.user?.basicinfo?.last_name ?? ""}`
                : maskValue("name")}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {visibleFields.email
                ? application.user?.email ?? "No email"
                : maskValue("email")}
            </p>

            <p>
              <strong>Desired Location:</strong>{" "}
              {visibleFields.desired_location
                ? application.desired_location ?? "Anywhere"
                : maskValue("desired_location")}
            </p>

            <p>
              <strong>Deadline Date:</strong>{" "}
              {visibleFields.deadline_date
                ? application.deadline_date
                  ? new Date(application.deadline_date).toLocaleDateString()
                  : "Anytime"
                : maskValue("deadline_date")}
            </p>

            <p>
              <strong>Status:</strong> {application.status}
            </p>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={handleMoreInfo}>
                More Information
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
