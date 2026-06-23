import React from "react";
import { AnimatePresence } from "framer-motion";
import { HeroAuth } from "../funs/HeroAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <HeroAuth onClose={onClose} />
        </div>
      )}
    </AnimatePresence>
  );
};
