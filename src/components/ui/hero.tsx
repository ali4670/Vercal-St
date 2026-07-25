import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Globe,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/LanguageContext";
import { AuthModal } from "@/components/AuthModal";
import { Spotlight } from "@/components/ui/spotlight";
import { SpotlightCard } from "@/components/SpotlightCard";
import { LeverSwitch } from "@/components/ui/lever-switch";
import { renderCanvas } from "@/components/ui/canvas";
import { cn } from "@/lib/utils";
import { Suspense, lazy } from "react";
import { Link } from "@tanstack/react-router";
import { ImageGallery } from "@/components/ui/carousel-circular-image-gallery";

const SplineScene = lazy(() =>
  import("@/components/ui/splite").then((mod) => ({
    default: mod.SplineScene,
  })),
);

// --- Custom SVG Components for Hand-Drawn Accents ---

const ArrowGreenLeft = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-primary stroke-current overflow-visible"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

const ArrowGreenRight = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-primary stroke-current overflow-visible"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

const CircularBadge = () => (
  <div className="relative w-28 h-28 md:w-36 md:h-36 bg-primary rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-primary/20">
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          id="circlePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text
          className="text-[11px] font-black tracking-[0.18em] uppercase"
          fill="currentColor"
        >
          <textPath href="#circlePath" startOffset="0%">
            INNOVATING THE FUTURE • ROBOTICS •
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center text-primary-foreground">
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 stroke-current overflow-visible"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

import { supabase } from "@/lib/supabase-code";

export const Component = () => {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, isAr } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [spotlight, setSpotlight] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    fetchSpotlight();
    const cleanup = renderCanvas();
    return () => cleanup && cleanup();
  }, []);

  const fetchSpotlight = async () => {
    const { data } = await supabase
      .from("spotlight")
      .select("*, profiles(username)")
      .single();
    if (data) setSpotlight(data);
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <canvas
        id="canvas"
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 max-w-[1440px] mx-auto w-full">
        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Brand & Menu Items */}
        <div className="hidden md:flex items-center gap-8">
          <span className="text-foreground font-black uppercase tracking-widest text-lg">ST<span className="text-primary">-</span>COMPANY<span className="text-primary">.</span></span>
          <button
            onClick={() => document.getElementById("arena-section")?.scrollIntoView({ behavior: "smooth" })}
            className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs transition-colors"
          >
            {isAr ? "الدورات" : "COURSES"}
          </button>
        </div>

        {/* Language & Auth */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted">
            <span className={cn("text-[9px] font-black", !isAr ? "text-foreground" : "text-muted-foreground")}>EN</span>
            <LeverSwitch checked={isAr} onChange={() => setLanguage(language === "en" ? "ar" : "en")} />
            <span className={cn("text-[9px] font-black", isAr ? "text-foreground" : "text-muted-foreground")}>AR</span>
          </div>

          <div className="hidden md:block">
            {user ? (
                <button
                onClick={() => signOut()}
                className="p-2 rounded-full border border-border text-foreground hover:bg-destructive/20 hover:border-destructive/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
                <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 rounded-full border border-border bg-muted backdrop-blur-md text-foreground text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                {isAr ? "دخول النظام" : "Initialize"}
                </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-background/95 p-6 flex flex-col items-center gap-4 md:hidden border-b border-border z-50 backdrop-blur-xl">
            <span className="text-foreground font-black uppercase tracking-widest text-sm">ST<span className="text-primary">-</span>COMPANY</span>
            <button
              onClick={() => {
                document.getElementById("arena-section")?.scrollIntoView({ behavior: "smooth" });
                setIsMobileMenuOpen(false);
              }}
              className="text-foreground text-sm font-semibold uppercase tracking-widest"
            >
              {isAr ? "الدورات" : "COURSES"}
            </button>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-border bg-muted">
              <span className={cn("text-[10px] font-bold", !isAr ? "text-foreground" : "text-muted-foreground")}>EN</span>
              <LeverSwitch checked={isAr} onChange={() => setLanguage(language === "en" ? "ar" : "en")} />
              <span className={cn("text-[10px] font-bold", isAr ? "text-foreground" : "text-muted-foreground")}>AR</span>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-4 pb-16 md:pt-12 md:pb-48 px-2 md:px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto">
        {/* Massive Typography & Elements Container */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-2 mb-8 md:mt-4 md:mb-16">
          {/* Text Stack */}
          <div className="w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4">
            {/* #LEARN */}
            <div className="w-full flex justify-start pl-[10%] md:pl-[25%] relative z-30">
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-primary m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 rgba(0,0,0,0.15), 2px 2px 0 rgba(0,0,0,0.15), 3px 3px 0 rgba(0,0,0,0.15), 4px 4px 0 rgba(0,0,0,0.15), 5px 5px 0 rgba(0,0,0,0.15), 6px 6px 0 rgba(0,0,0,0.15), 7px 7px 0 rgba(0,0,0,0.15), 8px 8px 0 rgba(0,0,0,0.15), 9px 9px 0 rgba(0,0,0,0.15), 10px 10px 0 rgba(0,0,0,0.15), 11px 11px 0 rgba(0,0,0,0.15), 12px 12px 0 rgba(0,0,0,0.15), 13px 13px 0 rgba(0,0,0,0.15), 14px 14px 0 rgba(0,0,0,0.15)",
                }}
              >
                {isAr ? "#تعلم" : "#LEARN"}
              </h1>
            </div>

            {/* ST */}
            <div className="w-full flex justify-center relative z-20">
              <h1
                className="text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-foreground m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.1), 5px 5px 0 rgba(0,0,0,0.1), 6px 6px 0 rgba(0,0,0,0.1), 7px 7px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.1), 9px 9px 0 rgba(0,0,0,0.1), 10px 10px 0 rgba(0,0,0,0.1), 11px 11px 0 rgba(0,0,0,0.1), 12px 12px 0 rgba(0,0,0,0.1), 13px 13px 0 rgba(0,0,0,0.1), 14px 14px 0 rgba(0,0,0,0.1)",
                }}
              >
                ST
              </h1>
            </div>

            {/* COMPANY */}
            <div className="w-full flex justify-start pl-[15%] md:pl-[30%] relative z-10">
              <h1
                className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-foreground m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow:
                    "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.1), 5px 5px 0 rgba(0,0,0,0.1), 6px 6px 0 rgba(0,0,0,0.1), 7px 7px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.1), 9px 9px 0 rgba(0,0,0,0.1), 10px 10px 0 rgba(0,0,0,0.1), 11px 11px 0 rgba(0,0,0,0.1), 12px 12px 0 rgba(0,0,0,0.1), 13px 13px 0 rgba(0,0,0,0.1), 14px 14px 0 rgba(0,0,0,0.1)",
                }}
              >
                {isAr ? "شراكة" : "COMPANY"}
              </h1>
            </div>
          </div>

          {/* Absolute Overlays (Cards, Arrows, Badge) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Original Compact Spline Robot */}
            <div className="absolute -bottom-[10%] -left-[10%] md:left-[5%] w-[200px] h-[200px] md:w-[600px] md:h-[600px] z-30 pointer-events-auto">
              {isClient && (
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                  />
                </Suspense>
              )}
            </div>

            {/* Spotlight Card */}
            <SpotlightCard spotlight={spotlight} />

            {/* Decorative Arrow Left */}
            <div className="absolute bottom-[0%] left-[0%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowGreenLeft />
            </div>

            {/* Decorative Arrow Right */}
            <div className="absolute top-[5%] right-[0%] md:right-[10%] w-24 h-24 md:w-32 md:h-32 z-20">
              <ArrowGreenRight />
            </div>

            {/* Circular Badge */}
            <div className="absolute bottom-[-10%] right-[0%] md:right-[15%] z-40 pointer-events-auto">
              <CircularBadge />
            </div>
          </div>
        </div>
      </main>

      {/* Card Stack Gallery Section */}
      <section className="hidden md:block relative z-20 mt-auto w-full">
        <ImageGallery />
      </section>
    </div>
  );
};
