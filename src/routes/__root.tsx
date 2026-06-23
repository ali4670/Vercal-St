import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe,
  User as UserIcon,
  LogOut,
  Shield,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { LanguageProvider, useLanguage } from "../lib/LanguageContext";
import { AuthProvider, useAuth } from "../hooks/use-auth";
import { AuthModal } from "../components/AuthModal";
import { ProfileEdit } from "../components/ProfileEdit";
import { HeroButton } from "../funs/HeroButton";
import { Component as Footer } from "../components/ui/footer-taped-design";

function Header() {
  const { language, setLanguage, isAr } = useLanguage();
  const { user, profile, signOut, isAdmin, isModerator } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 md:px-6 py-3 md:py-4 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <Link
          to="/"
          className="text-xl md:text-2xl font-black text-white tracking-tighter italic"
        >
          ROBOTICS-CLUB<span className="text-[#CCFF00]">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/levels">
            <HeroButton
              size="sm"
              variant="outline"
              className="px-4 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Globe className="w-3.5 h-3.5 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isAr ? "الدورات" : "COURSES"}
              </span>
            </HeroButton>
          </Link>
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center gap-2 px-3 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
          >
            <span
              className={`text-[9px] font-black transition-colors ${language === "en" ? "text-[#CCFF00]" : "text-white/20"}`}
            >
              EN
            </span>
            <div className="w-7 h-3.5 rounded-full bg-black/40 border border-white/10 relative">
              <motion.div
                animate={{ x: language === "ar" ? (isAr ? -14 : 14) : 0 }}
                className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.5)]"
              />
            </div>
            <span
              className={`text-[9px] font-black transition-colors ${language === "ar" ? "text-[#CCFF00]" : "text-white/20"}`}
            >
              AR
            </span>
          </button>
          {user ? (
            <div
              className={`flex items-center gap-4 ${isAr ? "flex-row-reverse" : ""}`}
            >
              <div className="flex items-center gap-2">
                {profile?.role === "parent" && (
                  <Link to="/parent-dashboard">
                    <HeroButton
                      size="sm"
                      variant="outline"
                      className="px-4 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      {isAr ? "لوحة أولياء الأمور" : "Parent Dashboard"}
                    </HeroButton>
                  </Link>
                )}
                {isModerator && (
                  <Link to="/moderator">
                    <HeroButton
                      size="sm"
                      variant="outline"
                      className="px-4 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {isAr ? "لوحة التحكم" : "Moderator Panel"}
                    </HeroButton>
                  </Link>
                )}
                <HeroButton
                  onClick={() => setIsProfileEditOpen(true)}
                  size="sm"
                  variant="outline"
                  className="w-11 h-11 p-0 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-sm">
                      {(profile?.username || user.email?.split("@")[0] || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </HeroButton>
                <HeroButton
                  onClick={() => signOut()}
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </HeroButton>
              </div>
            </div>
          ) : (
            <HeroButton
              onClick={() => setIsAuthModalOpen(true)}
              size="md"
              variant="primary"
            >
              <UserIcon className="w-3.5 h-3.5" />
              {isAr ? "دخول النظام" : "Initialize"}
            </HeroButton>
          )}
        </div>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <ProfileEdit
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pt-20 md:pt-24 min-h-screen">
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" theme="dark" richColors />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    errorComponent: ({ error }) => <div>Error: {error.message}</div>,
  },
);
