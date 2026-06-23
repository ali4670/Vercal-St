import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

interface HeroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  loading?: boolean;
}

export const HeroButton: React.FC<HeroButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  loading = false,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-white text-black hover:bg-lime-50 shadow-xl shadow-white/5",
    secondary:
      "bg-lime-500 text-black hover:bg-lime-400 shadow-xl shadow-lime-500/20",
    outline:
      "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-[9px] rounded-xl",
    md: "px-6 py-3 text-[10px] rounded-2xl",
    lg: "px-8 py-4 text-[11px] rounded-[24px]",
    xl: "px-10 py-5 text-[12px] rounded-[32px]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...(props as any)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </motion.button>
  );
};
