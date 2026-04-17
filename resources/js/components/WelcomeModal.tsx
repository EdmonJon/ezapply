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

interface WelcomeModalProps {
  initialDelay?: number;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ initialDelay = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('ezapply_welcome_seen');
      if (!hasSeenModal) {
        setIsVisible(true);
      }
    }, initialDelay);

    return () => clearTimeout(timer); 
  }, [initialDelay]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('ezapply_welcome_seen', 'true');
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
            Welcome to the Future of EZ Application.
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            We're committed to making your process <strong>seamless and successful</strong>. Inspired by the spirit of the Filipino people, our platform is designed for <strong>efficiency, transparency, and progress</strong>. Begin your journey with us today, and experience how easy it can be to achieve your goals.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleClose}>
            Get Started
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Learn More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
