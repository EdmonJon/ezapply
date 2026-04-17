import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import CompanySummaryCard from './CompanySummaryCard';
import type { CompanyDetails } from '@/types/company';
import { router } from '@inertiajs/react';

interface CompanyDetailsModalProps {
  company: CompanyDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyDetailsModal({ company, isOpen, onClose }: CompanyDetailsModalProps) {
  const handleMoreDetails = () => {
    if (company) {
      router.visit(`/companies/${company.id}/details`);
    }
  };

  if (!company) {
     <div className="p-6">Loading...</div>;
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto">
        <CompanySummaryCard company={company} onMoreDetails={handleMoreDetails} />
      </DialogContent>
    </Dialog>
  );
}
