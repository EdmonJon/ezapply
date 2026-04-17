import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppLogoIcon from './app-logo-icon';

interface ApplicantWelcomeModalProps {
  initialDelay?: number;
}

const ApplicantWelcomeModal: React.FC<ApplicantWelcomeModalProps> = ({ initialDelay = 1000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('ezapply_applicant_welcome_seen');
      if (!hasSeenModal) {
        setIsVisible(true);
      }
    }, initialDelay);

    return () => clearTimeout(timer); 
  }, [initialDelay]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('ezapply_applicant_welcome_seen', 'true');
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AppLogoIcon className="w-24 h-auto" />
          </div>
          <DialogTitle className="text-center text-green-700">
            Welcome to EZ Apply PH - Applicant
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            Start your franchise journey today! Complete your profile, explore vetted opportunities, and apply to your dream franchise. We're here to guide you every step of the way.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleClose}>
            Start Application
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Browse Franchises
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantWelcomeModal;

