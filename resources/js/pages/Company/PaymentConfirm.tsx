import React, { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost: number;
  balance: number;
  onConfirm: () => Promise<void> | void;
};

export default function PaymentConfirmationDialog({
  open,
  onOpenChange,
  cost,
  balance,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (balance < cost) {
      alert("Insufficient balance.");
      return;
    }
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-md max-w-md mx-auto mt-5 bg-white dark:bg-neutral-800">
        <DialogTitle className="text-lg font-bold mb-4">Confirm Transaction</DialogTitle>
        <p>This will cost <strong>{cost} credits</strong>. Do you want to proceed?</p>
        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Processing..." : "Proceed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}