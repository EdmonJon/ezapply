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

interface CompanyWelcomeModalProps {
  initialDelay?: number;
}

const CompanyWelcomeModal: React.FC<CompanyWelcomeModalProps> = ({ initialDelay = 1000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('ezapply_company_welcome_seen');
      if (!hasSeenModal) {
        setIsVisible(true);
      }
    }, initialDelay);

    return () => clearTimeout(timer); 
  }, [initialDelay]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('ezapply_company_welcome_seen', 'true');
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
          <DialogTitle className="text-center text-blue-700">
            Mabuhay! Your Dashboard is Ready
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            Accelerate your business growth! This platform is your dedicated hub to manage franchise opportunities, streamline application reviews, and expand your network. Start making progress now—we've credited your account with a bonus ₱200 EZ Credit as a thank you for your commitment to growth.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">    
          <Button variant="default" onClick={handleClose}>
            Explore Dashboard
          </Button>
          <Button variant="outline" onClick={handleClose}>
            View Applications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyWelcomeModal;
