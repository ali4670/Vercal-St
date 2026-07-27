import React, { useState } from "react";
import { supabase } from "../lib/supabase-code";
import { useLanguage } from "../lib/LanguageContext";
import { useAuth } from "../hooks/use-auth";
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  UserX,
  Database,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DeleteMyAccountCompProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteMyAccountComp: React.FC<DeleteMyAccountCompProps> = ({
  isOpen,
  onClose,
}) => {
  const { isAr } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const username = profile?.username || "";

  const t = {
    title: isAr ? "حذف الحساب" : "DELETE ACCOUNT",
    warningTitle: isAr ? "تحذير خطير" : "DANGER ZONE",
    warningDesc: isAr
      ? "هذا الإجراء لا رجعة فيه. سيتم حذف جميع بياناتك بشكل دائم."
      : "This action is irreversible. All your data will be permanently deleted.",
    consequences: isAr
      ? [
          "حذف جميع بياناتك الشخصية والملف الشخصي",
          "حذف صورة الملف الشخصي من التخزين",
          "إيقاف تسجيل الدخول من جميع الأجهزة",
          "لا يمكن التراجع عن هذا الإجراء",
        ]
      : [
          "Delete all your personal data and profile",
          "Remove your avatar from storage",
          "Sign you out from all devices",
          "This action cannot be undone",
        ],
    nextBtn: isAr ? "أفهم المخاطر" : "I UNDERSTAND THE RISKS",
    confirmTitle: isAr ? "تأكيد الحذف" : "CONFIRM DELETION",
    confirmDesc: isAr
      ? `اكتب "${username}" للتأكيد`
      : `Type "${username}" to confirm`,
    deleteBtn: isAr ? "حذف حسابي نهائياً" : "DELETE MY ACCOUNT PERMANENTLY",
    cancelBtn: isAr ? "إلغاء" : "CANCEL",
    backBtn: isAr ? "رجوع" : "GO BACK",
    deleting: isAr ? "جاري الحذف..." : "DELETING...",
    success: isAr ? "تم حذف الحساب بنجاح" : "Account deleted successfully",
    error: isAr ? "فشل حذف الحساب" : "Failed to delete account",
    matchError: isAr ? "النص غير متطابق" : "Text does not match",
  };

  const isMatch = confirmText.trim() === username;

  const handleDelete = async () => {
    if (!isMatch || !user) return;

    setLoading(true);
    try {
      // 1. Delete avatar from storage
      if (profile?.avatar_url?.includes("/avatars/")) {
        const oldPath = profile.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // 2. Delete profile row (cascading from auth.users ON DELETE CASCADE)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile delete error:", profileError);
      }

      // 3. Delete auth user
      // Note: supabase-js client cannot delete auth users directly.
      // We call the Supabase REST API with the user's JWT.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://hcfqtgydoonpyskxibyt.supabase.co";
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
          },
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error("Auth user delete failed:", errBody);
        }
      }

      toast.success(t.success);
      await signOut();
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("warning");
    setConfirmText("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <div className="bg-card border-2 border-destructive/30 rounded-3xl p-6 shadow-2xl shadow-destructive/5">
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {step === "warning" ? (
                <>
                  {/* Warning Icon */}
                  <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                      <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                  </div>

                  <h2 className="text-center font-black uppercase tracking-widest text-sm text-destructive mb-2">
                    {t.warningTitle}
                  </h2>
                  <p className="text-center text-muted-foreground text-xs mb-6">
                    {t.warningDesc}
                  </p>

                  {/* Consequences List */}
                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-4 mb-6 space-y-3">
                    {t.consequences.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i === 0 ? (
                            <Database className="w-3 h-3 text-destructive" />
                          ) : i === 1 ? (
                            <UserX className="w-3 h-3 text-destructive" />
                          ) : i === 2 ? (
                            <LogOut className="w-3 h-3 text-destructive" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                          )}
                        </div>
                        <span className="text-xs text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-muted border border-border text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => setStep("confirm")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-destructive text-destructive-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-destructive/20"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t.nextBtn}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirm Step */}
                  <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-destructive" />
                    </div>
                  </div>

                  <h2 className="text-center font-black uppercase tracking-widest text-sm text-destructive mb-2">
                    {t.confirmTitle}
                  </h2>
                  <p className="text-center text-muted-foreground text-xs mb-5">
                    {t.confirmDesc}
                  </p>

                  {/* Confirm Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={username}
                      className="w-full bg-muted border-2 border-destructive/20 rounded-2xl py-3.5 px-4 text-foreground font-bold text-sm text-center focus:outline-none focus:border-destructive focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
                      autoFocus
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setStep("warning");
                        setConfirmText("");
                      }}
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-muted border border-border text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                    >
                      {t.backBtn}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={!isMatch || loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-destructive text-destructive-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {loading ? t.deleting : t.deleteBtn}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
