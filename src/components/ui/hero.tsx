import React, { useState, useEffect, useMemo } from "react";
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
  <motion.div
    className="relative w-28 h-28 md:w-36 md:h-36 bg-primary rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-primary/20"
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
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
  </motion.div>
);

import { supabase } from "@/lib/supabase-code";

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

function shadowLayers(mobile: boolean) {
  if (mobile) {
    return "1px 1px 0 rgba(0,0,0,0.15), 2px 2px 0 rgba(0,0,0,0.15), 3px 3px 0 rgba(0,0,0,0.15)";
  }
  return "1px 1px 0 rgba(0,0,0,0.15), 2px 2px 0 rgba(0,0,0,0.15), 3px 3px 0 rgba(0,0,0,0.15), 4px 4px 0 rgba(0,0,0,0.15), 5px 5px 0 rgba(0,0,0,0.15), 6px 6px 0 rgba(0,0,0,0.15), 7px 7px 0 rgba(0,0,0,0.15), 8px 8px 0 rgba(0,0,0,0.15)";
}

export const Component = () => {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, isAr } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [spotlight, setSpotlight] = useState<any>(null);
  const mobile = useMobile();

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

  const learnShadow = useMemo(() => shadowLayers(mobile), [mobile]);
  const stShadow = useMemo(
    () =>
      mobile
        ? "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1)"
        : "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.1), 5px 5px 0 rgba(0,0,0,0.1), 6px 6px 0 rgba(0,0,0,0.1), 7px 7px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.1)",
    [mobile],
  );

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
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <span className="text-foreground font-black uppercase tracking-widest text-lg">ST<span className="text-primary">-</span>COMPANY<span className="text-primary">.</span></span>
          <button
            onClick={() => document.getElementById("arena-section")?.scrollIntoView({ behavior: "smooth" })}
            className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs transition-colors"
          >
            {isAr ? "الدورات" : "COURSES"}
          </button>
        </div>

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
      <main className="flex-1 relative z-10 pt-2 pb-12 md:pt-12 md:pb-48 px-2 md:px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto">
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-1 mb-4 md:mt-4 md:mb-16">
          {/* Mobile Hero — bold typography + supporting content */}
          {mobile ? (
            <div className="flex flex-col items-center w-full min-h-[80dvh] justify-center relative overflow-hidden">
              {/* Subtle glow behind text */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

              <div className="flex flex-col items-center gap-0 w-full relative z-10">
                <motion.h1
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 110, damping: 16 }}
                  className="text-[clamp(5rem,16vw,160px)] font-black leading-[0.78] tracking-tighter text-primary m-0 p-0 uppercase w-full text-center"
                  style={{
                    fontFamily: '"Arial Black", Impact, sans-serif',
                    textShadow: "1px 1px 0 rgba(0,0,0,0.15), 2px 2px 0 rgba(0,0,0,0.15), 3px 3px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  {isAr ? "#تعلم" : "#LEARN"}
                </motion.h1>

                <motion.h1
                  initial={{ opacity: 0, scale: 1.3, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.15 }}
                  className="text-[clamp(6.5rem,22vw,220px)] font-black leading-[0.72] tracking-tighter text-foreground m-0 p-0 uppercase w-full text-center -mt-[0.06em]"
                  style={{
                    fontFamily: '"Arial Black", Impact, sans-serif',
                    textShadow: "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  ST
                </motion.h1>

                <motion.h1
                  initial={{ opacity: 0, y: -40, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.3 }}
                  className="text-[clamp(5rem,16vw,160px)] font-black leading-[0.78] tracking-tighter text-foreground m-0 p-0 uppercase w-full text-center -mt-[0.06em]"
                  style={{
                    fontFamily: '"Arial Black", Impact, sans-serif',
                    textShadow: "1px 1px 0 rgba(0,0,0,0.1), 2px 2px 0 rgba(0,0,0,0.1), 3px 3px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  {isAr ? "ذكي" : "SMART"}
                </motion.h1>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.45 }}
                className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground mt-6"
              >
                {isAr ? "روبوتات · ذكاء اصطناعي · هندسة" : "ROBOTICS · AI · ENGINEERING"}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.55 }}
                className="text-[11px] text-muted-foreground/70 max-w-[280px] text-center mt-2 leading-relaxed"
              >
                {isAr
                  ? "منصة متكاملة للتعلم والتدريب على أحدث تقنيات الروبوتات والذكاء الاصطناعي"
                  : "A complete platform for learning and training on the latest robotics and AI technologies"}
              </motion.p>

              {/* Spotlight card — mobile version */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.65 }}
                className="mt-8 relative"
              >
                <div className="w-36 aspect-[3/3.5] bg-muted backdrop-blur-md border border-border rounded-[2rem] p-4 flex flex-col items-center justify-center shadow-2xl mx-auto">
                  <div className="w-14 h-14 bg-[#2C3E50] rounded-full flex items-center justify-center mb-3 shadow-inner border-[3px] border-border overflow-hidden">
                    {spotlight?.avatar_override_url ? (
                      <img src={spotlight.avatar_override_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-white/60">S</div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs text-foreground">{spotlight?.profiles?.username || "cto.robotics"}</p>
                    <p className="text-[8px] text-white/80 mt-1 uppercase">{spotlight?.title || "Core Architecture"}</p>
                    {spotlight?.description && (
                      <p className="text-[7px] mt-2 font-black text-primary uppercase tracking-widest italic">{spotlight.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Desktop Hero — full experience */
            <>
              {/* Text Stack */}
              <div className="w-full flex flex-col items-center relative z-10 space-y-1 md:space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 14 }}
                  viewport={{ once: true }}
                  className="w-full flex justify-start pl-[25%] relative z-30"
                >
                  <h1
                    className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-primary m-0 p-0 uppercase"
                    style={{
                      fontFamily: '"Arial Black", Impact, sans-serif',
                      textShadow: learnShadow,
                    }}
                  >
                    {isAr ? "#تعلم" : "#LEARN"}
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="w-full flex justify-center relative z-20"
                >
                  <h1
                    className="text-[clamp(5rem,15vw,220px)] font-black leading-[0.85] tracking-tighter text-foreground m-0 p-0 uppercase"
                    style={{
                      fontFamily: '"Arial Black", Impact, sans-serif',
                      textShadow: stShadow,
                    }}
                  >
                    ST
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="w-full flex justify-start pl-[30%] relative z-10"
                >
                  <h1
                    className="text-[clamp(4.5rem,12vw,160px)] font-black leading-[0.85] tracking-tighter text-foreground m-0 p-0 uppercase"
                    style={{
                      fontFamily: '"Arial Black", Impact, sans-serif',
                      textShadow: stShadow,
                    }}
                  >
                    {isAr ? "ذكي" : "SMART"}
                  </h1>
                </motion.div>
              </div>

              <div className="absolute inset-0 w-full h-full pointer-events-none">
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

                <SpotlightCard spotlight={spotlight} />

                <div className="absolute bottom-[0%] left-[10%] w-32 h-32 z-20">
                  <ArrowGreenLeft />
                </div>

                <div className="absolute top-[5%] right-[10%] w-32 h-32 z-20">
                  <ArrowGreenRight />
                </div>

                <div className="absolute bottom-[-10%] right-[15%] z-40 pointer-events-auto">
                  <CircularBadge />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <section className="hidden md:block relative z-20 mt-auto w-full">
        <ImageGallery />
      </section>
    </div>
  );
};
