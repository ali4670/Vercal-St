import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase-code";
import { useAuth } from "../hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Award, MessageSquare, ClipboardList, Camera, CheckCircle,
  Bell, Calendar, FolderOpen, BarChart3, Clock, Users, TrendingUp,
  TrendingDown, AlertCircle, ChevronRight, ChevronDown, ChevronUp,
  Star, Target, Flame, Trophy, Download, Send, Search, Filter,
  X, Loader2, GraduationCap, PlayCircle, FileText, Eye,
  MessageCircle, Phone, Mail, Lock, Unlock, CheckSquare,
  XCircle, AlertTriangle, RefreshCw, ArrowUpRight, ArrowDownRight,
  Minus, Image, Paperclip, Smile
} from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from "recharts";

export const Route = createFileRoute("/parent-dashboard")({
  component: ParentDashboard,
});

type Tab = "dashboard" | "grades" | "assignments" | "activity" | "feedback" | "messages";

const COLORS = ["#70e000", "#22c55e", "#f59e0b", "#3b82f6", "#06b6d4", "#a855f7"];

const TAB_LIST: { key: Tab; icon: any; label: string; labelAr: string }[] = [
  { key: "dashboard", icon: BarChart3, label: "OVERVIEW", labelAr: "نظرة عامة" },
  { key: "grades", icon: GraduationCap, label: "GRADES", labelAr: "الدرجات" },
  { key: "assignments", icon: ClipboardList, label: "ASSIGNMENTS", labelAr: "المهام" },
  { key: "activity", icon: Clock, label: "ACTIVITY", labelAr: "النشاط" },
  { key: "feedback", icon: MessageCircle, label: "FEEDBACK", labelAr: "الملاحظات" },
  { key: "messages", icon: MessageSquare, label: "MESSAGES", labelAr: "الرسائل" },
];

function ParentDashboard() {
  const { isAr } = useLanguage();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    if (user) fetchLinkedStudents();
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchLinkedStudents = async () => {
    setLoading(true);
    const { data: links, error } = await supabase
      .from("parent_student_links")
      .select("student:profiles!parent_student_links_student_id_fkey(*)")
      .eq("parent_id", user?.id);

    if (!error && links) {
      const studs = links.map((l: any) => l.student).filter(Boolean);
      setStudents(studs);
      if (studs.length > 0 && !selectedStudent) setSelectedStudent(studs[0]);
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user?.id)
      .eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (loading) return <InitialLoader />;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-0">
      {/* Top Bar — Floating Glass Pill */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[1400px]">
        <div className="h-12 bg-card/70 backdrop-blur-2xl border border-border/30 rounded-full px-4 md:px-6 flex items-center justify-between shadow-[0_2px_20px_-4px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/10">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/70 hidden sm:block">
              {isAr ? "لوحة أولياء الأمور" : "Parent Portal"}
            </h1>
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/8 text-amber-500 text-[8px] font-semibold uppercase tracking-[0.1em] ring-1 ring-amber-500/10">
              <Lock className="w-2.5 h-2.5" />
              {isAr ? "للقراءة فقط" : "Read Only"}
            </span>
            {selectedStudent && (
              <div className="hidden md:flex items-center gap-2 ml-1 px-3 py-1.5 rounded-full bg-muted/40 ring-1 ring-border/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  <span className="text-foreground/50">{isAr ? "متابعة" : "Tracking"}</span>{" "}
                  <span className="font-semibold text-foreground/90">{selectedStudent.username}</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50 transition-all duration-300 active:scale-95"
            >
              <Bell className="w-[18px] h-[18px] text-foreground/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary rounded-full text-[8px] font-bold flex items-center justify-center text-primary-foreground shadow-[0_0_8px_rgba(112,224,0,0.3)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-[68px] flex min-h-screen">
        {/* Student Sidebar — Desktop only */}
        <aside className="w-[220px] border-r border-border/20 bg-background/40 hidden lg:flex lg:flex-col sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto scrollbar-hide">
          <div className="p-3 pt-4 flex-1">
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-muted-foreground/30 mb-3 px-3">
              {isAr ? "الطلاب" : "Students"}
            </p>
            <div className="space-y-1">
              {students.map((student) => {
                const isActive = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => { setSelectedStudent(student); setActiveTab("dashboard"); }}
                    className={`w-full p-2.5 rounded-2xl text-left transition-all duration-300 flex items-center gap-2.5 group ${
                      isActive
                        ? "bg-primary/[0.08] ring-1 ring-primary/15 shadow-[0_0_20px_-8px_rgba(112,224,0,0.15)]"
                        : "text-muted-foreground hover:bg-muted/30 ring-1 ring-transparent hover:ring-border/20"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300 ${
                      isActive ? "bg-primary/15 text-primary shadow-[0_0_12px_-4px_rgba(112,224,0,0.2)]" : "bg-muted/30 text-muted-foreground/50 group-hover:bg-muted/50 group-hover:text-muted-foreground/70"
                    }`}>
                      {student.avatar_url ? (
                        <img src={student.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        student.username?.charAt(0)?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-semibold truncate leading-tight transition-colors ${isActive ? "text-foreground" : "text-foreground/60 group-hover:text-foreground/80"}`}>{student.username}</p>
                      <p className="text-[9px] text-muted-foreground/35 truncate leading-tight mt-0.5">{student.role}</p>
                    </div>
                    {isActive && <div className="w-[3px] h-5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_rgba(112,224,0,0.3)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile student pills — horizontal scroll */}
          {students.length > 1 && (
            <div className="lg:hidden px-4 pt-4 pb-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 w-max">
                {students.map((student) => {
                  const isActive = selectedStudent?.id === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => { setSelectedStudent(student); setActiveTab("dashboard"); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-[11px] font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "bg-muted/30 text-muted-foreground/60 ring-1 ring-border/20 active:scale-95"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden ${
                        isActive ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground/50"
                      }`}>
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.username?.charAt(0)?.toUpperCase() || "?"
                        )}
                      </div>
                      <span className="max-w-[80px] truncate">{student.username}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Navigation — Desktop top bar */}
          <div className="hidden lg:block sticky top-[60px] z-40 bg-background/60 backdrop-blur-2xl border-b border-border/15">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 py-2">
                {TAB_LIST.map(tab => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? "text-primary bg-primary/[0.08] shadow-[0_0_16px_-6px_rgba(112,224,0,0.12)]"
                          : "text-muted-foreground/30 hover:text-muted-foreground/55 hover:bg-muted/25"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
                      <span>{isAr ? tab.labelAr : tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="parentActiveTab"
                          className="absolute inset-x-3 -bottom-2 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(112,224,0,0.4)]"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-5 md:py-8">
            <AnimatePresence mode="wait">
              {!selectedStudent ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {isAr ? "لا يوجد طلاب مرتبطون بحسابك" : "No students linked to your account"}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {isAr ? "تواصل مع الإدارة لربط حسابك" : "Contact admin to link your account"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab + selectedStudent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {activeTab === "dashboard" && <DashboardTab student={selectedStudent} isAr={isAr} />}
                  {activeTab === "grades" && <GradesTab student={selectedStudent} isAr={isAr} />}
                  {activeTab === "assignments" && <AssignmentsTab student={selectedStudent} isAr={isAr} />}
                  {activeTab === "activity" && <ActivityTab student={selectedStudent} isAr={isAr} />}
                  {activeTab === "feedback" && <FeedbackTab student={selectedStudent} isAr={isAr} />}
                  {activeTab === "messages" && <MessagesTab student={selectedStudent} isAr={isAr} userId={user?.id || ""} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-card/80 backdrop-blur-2xl border-t border-border/20 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {TAB_LIST.map(tab => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 min-w-[52px] rounded-xl transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/35"
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 1.6} />
                  {isActive && (
                    <motion.div
                      layoutId="mobileTabDot"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_rgba(112,224,0,0.5)]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.08em]">
                  {isAr ? tab.labelAr : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            onClick={() => setShowNotifPanel(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border/50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
                    {isAr ? "الإشعارات" : "Notifications"}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        {isAr ? "قراءة الكل" : "Mark all read"}
                      </button>
                    )}
                    <button onClick={() => setShowNotifPanel(false)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground/50">{isAr ? "لا إشعارات" : "No notifications"}</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <NotificationItem key={n.id} notification={n} isAr={isAr} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NOTIFICATION ITEM
// ═══════════════════════════════════════════════════════

function NotificationItem({ notification: n, isAr }: { notification: any; isAr: boolean }) {
  const typeColors: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    error: "bg-red-500/10 text-red-500",
    info: "bg-blue-500/10 text-blue-500",
    message: "bg-violet-500/10 text-violet-500",
  };
  const typeIcons: Record<string, any> = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Bell,
    message: MessageSquare,
  };
  const Icon = typeIcons[n.type] || Bell;

  const markRead = async () => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
  };

  return (
    <div
      onClick={markRead}
      className={`p-3 rounded-xl transition-all cursor-pointer ${
        n.is_read
          ? "bg-transparent hover:bg-muted/30"
          : "bg-primary/[0.03] hover:bg-primary/[0.06] border border-primary/10"
      }`}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.info}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-tight">{n.title}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
          <p className="text-[9px] text-muted-foreground/40 mt-1">{new Date(n.created_at).toLocaleString()}</p>
        </div>
        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════

function StatCard({
  label, value, icon: Icon, color = "text-primary", sub, trend, featured,
}: {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="relative overflow-hidden bg-card ring-1 ring-border/25 rounded-[1.25rem] p-4 md:p-6 group hover:ring-border/40 transition-all duration-500 active:scale-[0.98]">
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-[0.05] ${color.replace("text-", "bg-")}`} />
        <div className="relative">
          <div className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4">
            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ring-1 ring-inset ${color.replace("text-", "ring-")}/10 ${color.replace("text-", "bg-")}/[0.06]`}>
              <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${color}`} />
            </div>
            <p className="text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">{label}</p>
          </div>
          <p className="text-2xl md:text-4xl font-extrabold tracking-tight leading-none font-[JetBrains_Mono,monospace]">{value}</p>
          {sub && (
            <div className="flex items-center gap-1.5 mt-2 md:mt-2.5">
              {trend && (
                <span className={`text-[8px] md:text-[9px] font-bold ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
                </span>
              )}
              <p className="text-[9px] md:text-[10px] text-muted-foreground/40">{sub}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card ring-1 ring-border/20 rounded-2xl p-3.5 md:p-4 hover:ring-border/35 transition-all duration-300 active:scale-[0.98]">
      <div className="flex items-center gap-2 mb-2 md:mb-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.replace("text-", "bg-")}/[0.06]`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <p className="text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">{label}</p>
      </div>
      <p className="text-lg md:text-2xl font-extrabold tracking-tight leading-none font-[JetBrains_Mono,monospace]">{value}</p>
      {sub && <p className="text-[8px] md:text-[9px] text-muted-foreground/35 mt-1.5">{sub}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════

function FilterBar({ options, active, onChange, labels }: { options: string[]; active: string; onChange: (v: string) => void; labels: Record<string, string> }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
            active === f ? "bg-primary/10 text-primary" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30"
          }`}
        >
          {labels[f] || f}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INITIAL LOADER
// ═══════════════════════════════════════════════════════

function InitialLoader() {
  const { isAr } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-[1.25rem] bg-primary/[0.06] ring-1 ring-primary/10 flex items-center justify-center shadow-[0_0_32px_-8px_rgba(112,224,0,0.15)]">
          <GraduationCap className="w-7 h-7 text-primary/70" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-card rounded-full flex items-center justify-center ring-1 ring-border/20">
          <Loader2 className="w-3 h-3 animate-spin text-primary/50" />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/25"
      >
        {isAr ? "جاري التحميل" : "Loading"}
      </motion.p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB SKELETON LOADER
// ═══════════════════════════════════════════════════════

function TabSkeleton() {
  return (
    <div className="space-y-4 md:space-y-5 animate-pulse">
      <div className="h-24 md:h-32 bg-muted/10 rounded-[1.5rem] ring-1 ring-border/10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="h-28 md:h-32 bg-muted/10 rounded-[1.5rem] ring-1 ring-border/10" />
        <div className="h-28 md:h-32 bg-muted/10 rounded-[1.5rem] ring-1 ring-border/10" />
        <div className="h-28 md:h-32 bg-muted/10 rounded-[1.5rem] ring-1 ring-border/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5">
        <div className="h-20 md:h-24 bg-muted/10 rounded-2xl ring-1 ring-border/10" />
        <div className="h-20 md:h-24 bg-muted/10 rounded-2xl ring-1 ring-border/10" />
        <div className="h-20 md:h-24 bg-muted/10 rounded-2xl ring-1 ring-border/10" />
        <div className="h-20 md:h-24 bg-muted/10 rounded-2xl ring-1 ring-border/10" />
      </div>
      <div className="h-48 md:h-56 bg-muted/10 rounded-[1.5rem] ring-1 ring-border/10" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════

function DashboardTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [summary, setSummary] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [sumRes, cpRes] = await Promise.all([
      supabase.rpc("get_parent_student_summary", { p_student_id: student.id }),
      supabase.rpc("get_student_course_progress", { p_student_id: student.id }),
    ]);
    if (sumRes.data?.[0]) setSummary(sumRes.data[0]);
    if (cpRes.data) setCourseProgress(cpRes.data);
    setLoading(false);
  };

  if (loading) return <TabSkeleton />;
  if (!summary) return <EmptyState message={isAr ? "لا توجد بيانات" : "No data available"} />;

  const completionPct = summary.total_lectures > 0
    ? Math.round((Number(summary.completed_lectures) / Number(summary.total_lectures)) * 100)
    : 0;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Student Header Card — Mobile compact */}
      <div className="relative overflow-hidden bg-card ring-1 ring-border/20 rounded-[1.5rem] p-4 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.01]" />
        {/* Desktop: large progress circle */}
        <div className="absolute top-5 right-5 md:top-7 md:right-7 hidden md:block">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/10" />
            <circle
              cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="4" fill="none"
              className="text-primary"
              strokeDasharray={`${completionPct * 2.64} 264`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.32,0.72,0,1)" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-primary font-[JetBrains_Mono,monospace]">{completionPct}%</span>
        </div>

        <div className="relative flex items-center gap-3 md:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-[1rem] md:rounded-[1.25rem] bg-primary/[0.08] ring-1 ring-primary/10 flex items-center justify-center text-primary text-lg md:text-3xl font-extrabold overflow-hidden shadow-[0_0_24px_-8px_rgba(112,224,0,0.15)]">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                student.username?.charAt(0)?.toUpperCase()
              )}
            </div>
            {/* Mobile: small inline progress ring on avatar */}
            <div className="md:hidden absolute -bottom-1 -right-1 w-6 h-6 bg-card rounded-full ring-1 ring-border/30 flex items-center justify-center">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted/15" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"
                  className="text-primary"
                  strokeDasharray={`${(completionPct / 100) * 56.5} 56.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[5px] font-extrabold text-primary font-[JetBrains_Mono,monospace]">{completionPct}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 md:pr-32">
            <h2 className="text-base md:text-2xl font-extrabold tracking-tight truncate">{student.username}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 md:mt-2">
              {student.group_name && (
                <span className="text-[9px] md:text-[10px] text-muted-foreground/50">
                  {isAr ? "المجموعة" : "Group"}: <span className="font-semibold text-foreground/75">{student.group_name}</span>
                </span>
              )}
              {student.age && (
                <span className="text-[9px] md:text-[10px] text-muted-foreground/50">
                  {isAr ? "العمر" : "Age"}: <span className="font-semibold text-foreground/75">{student.age}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          label={isAr ? "متوسط الدرجات" : "Average Grade"}
          value={summary.average_grade ? `${summary.average_grade}%` : "—"}
          icon={Target}
          color="text-primary"
          sub={isAr ? "إجمالي المهام" : "All assignments"}
          featured
        />
        <StatCard
          label={isAr ? "ساعات الدراسة" : "Study Hours"}
          value={summary.total_study_hours || "0"}
          icon={Clock}
          color="text-violet-500"
          sub={isAr ? "إجمالي وقت التعلم" : "Total learning time"}
          featured
        />
        <StatCard
          label={isAr ? "متوسط الاختبارات" : "Exam Average"}
          value={summary.average_exam_score ? `${summary.average_exam_score}%` : "—"}
          icon={GraduationCap}
          color="text-cyan-500"
          sub={isAr ? "جميع الاختبارات" : "Across all exams"}
          featured
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
        <StatCard
          label={isAr ? "مكتملة" : "Completed"}
          value={`${summary.completed_lectures}/${summary.total_lectures}`}
          icon={CheckCircle}
          color="text-emerald-500"
          sub={isAr ? "درس" : "lessons"}
        />
        <StatCard
          label={isAr ? "قيد المراجعة" : "Pending"}
          value={summary.pending_assignments || "0"}
          icon={Clock}
          color="text-amber-500"
          sub={isAr ? "مهام" : "assignments"}
        />
        <StatCard
          label={isAr ? "مرفوضة" : "Rejected"}
          value={summary.rejected_assignments || "0"}
          icon={XCircle}
          color="text-red-500"
          sub={isAr ? "مهام" : "assignments"}
        />
        <StatCard
          label={isAr ? "المستويات" : "Levels"}
          value={`${summary.accessible_levels}/${summary.total_levels}`}
          icon={Unlock}
          color="text-blue-500"
          sub={isAr ? "متاحة" : "accessible"}
        />
      </div>

      {/* Course Progress */}
      {courseProgress.length > 0 && (
        <div className="bg-card ring-1 ring-border/20 rounded-[1.25rem] p-5 md:p-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-5">
            {isAr ? "تقدم المقررات" : "Course Progress"}
          </h3>
          <div className="space-y-4">
            {courseProgress.map((cp: any, i: number) => {
              const pct = Number(cp.progress_pct || 0);
              const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-primary" : "bg-amber-500";
              return (
                <div key={cp.level_id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-bold text-muted-foreground/25 w-5 font-[JetBrains_Mono,monospace]">L{cp.level_order}</span>
                      <span className="text-[11px] font-semibold">{cp.level_title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground/45 font-[JetBrains_Mono,monospace]">
                      {cp.completed_lectures}/{cp.total_lectures}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted/15 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.12, ease: [0.32, 0.72, 0, 1] }}
                        className={`h-full ${barColor} rounded-full shadow-[0_0_12px_-4px_rgba(112,224,0,0.3)]`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-primary w-10 text-right font-[JetBrains_Mono,monospace]">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COURSES TAB
// ═══════════════════════════════════════════════════════

function CoursesTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [lessonDetails, setLessonDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_student_course_progress", { p_student_id: student.id });
    if (data) setCourses(data);
    setLoading(false);
  };

  const expandLevel = async (levelId: string) => {
    if (expandedLevel === levelId) { setExpandedLevel(null); return; }
    setExpandedLevel(levelId);
    setDetailLoading(true);
    const { data } = await supabase.rpc("get_student_lesson_detail", { p_student_id: student.id, p_level_id: levelId });
    if (data) setLessonDetails(data);
    setDetailLoading(false);
  };

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold uppercase tracking-tight">{isAr ? "المقررات والدروس" : "Courses & Lessons"}</h2>
      {courses.length === 0 ? <EmptyState message={isAr ? "لا توجد مقررات" : "No courses found"} /> : (
        <div className="space-y-3">
          {courses.map((c: any) => {
            const pct = Number(c.progress_pct || 0);
            const isExpanded = expandedLevel === c.level_id;
            return (
              <div key={c.level_id} className="bg-card ring-1 ring-border/20 rounded-2xl overflow-hidden hover:ring-border/35 transition-all duration-300">
                <button
                  onClick={() => expandLevel(c.level_id)}
                  className="w-full p-4 md:p-5 flex items-center gap-4 hover:bg-muted/[0.03] transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/[0.08] ring-1 ring-primary/10 flex items-center justify-center text-primary font-[JetBrains_Mono,monospace] font-bold text-xs flex-shrink-0">
                    L{c.level_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-[12px] font-bold truncate">{c.level_title}</p>
                      {c.has_access ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase ring-1 ring-emerald-500/15">{isAr ? "متاح" : "Active"}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-bold uppercase ring-1 ring-red-500/15">{isAr ? "مقفل" : "Locked"}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-muted/15 rounded-full overflow-hidden max-w-[200px]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground/40 font-[JetBrains_Mono,monospace]">{c.completed_lectures}/{c.total_lectures}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-primary font-[JetBrains_Mono,monospace]">{pct.toFixed(0)}%</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground/30 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/15 px-4 md:px-5 pb-4 pt-3">
                        {detailLoading ? (
                          <div className="flex items-center gap-2.5 py-5 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-primary/50" />
                            <span className="text-[10px] text-muted-foreground/40 font-medium">{isAr ? "جاري التحميل..." : "Loading..."}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {lessonDetails.map((l: any) => (
                              <div key={l.lecture_id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                l.is_completed ? "bg-emerald-500/[0.03]" : l.is_locked ? "opacity-35" : "hover:bg-muted/[0.04]"
                              }`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  l.is_completed ? "bg-emerald-500/10 text-emerald-500" : l.is_locked ? "bg-muted/25 text-muted-foreground/35" : "bg-primary/[0.08] text-primary"
                                }`}>
                                  {l.is_completed ? <CheckCircle className="w-3.5 h-3.5" /> : l.is_locked ? <Lock className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium truncate">
                                    <span className="text-muted-foreground/25 mr-1.5 font-[JetBrains_Mono,monospace]">#{l.slot_number}</span>
                                    {l.lecture_title}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {l.assignment_required && (
                                      <span className={`text-[7px] font-bold uppercase px-2 py-0.5 rounded-full ring-1 ${
                                        l.assignment_status === "approved" ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15"
                                        : l.assignment_status === "rejected" ? "bg-red-500/10 text-red-500 ring-red-500/15"
                                        : l.assignment_status === "pending" ? "bg-amber-500/10 text-amber-500 ring-amber-500/15"
                                        : "bg-muted/25 text-muted-foreground/45 ring-border/15"
                                      }`}>
                                        {l.assignment_status === "not_submitted" ? (isAr ? "غير مقدم" : "Not Submitted") : l.assignment_status}
                                      </span>
                                    )}
                                    {l.quiz_passed && (
                                      <span className="text-[7px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/15">
                                        {isAr ? "اختبار" : "Quiz Passed"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {l.assignment_grade !== null && (
                                  <span className="text-[11px] font-bold text-primary font-[JetBrains_Mono,monospace]">{l.assignment_grade}%</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ASSIGNMENTS TAB
// ═══════════════════════════════════════════════════════

function AssignmentsTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_student_assignments", { p_student_id: student.id });
    if (data) setAssignments(data);
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
    rejected: "bg-red-500/10 text-red-500 ring-red-500/20",
    not_submitted: "bg-muted/30 text-muted-foreground/50 ring-border/20",
  };
  const statusLabels: Record<string, string> = {
    approved: isAr ? "تمت الموافقة" : "Approved",
    pending: isAr ? "قيد المراجعة" : "Pending",
    rejected: isAr ? "مرفوض" : "Rejected",
    not_submitted: isAr ? "غير مقدم" : "Not Submitted",
  };

  const filtered = assignments.filter(a => filter === "all" || a.status === filter);

  const graded = assignments.filter(a => a.grade !== null);
  const avgGrade = graded.length > 0
    ? Math.round(graded.reduce((sum: number, a: any) => sum + Number(a.grade), 0) / graded.length)
    : null;

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold uppercase tracking-tight">{isAr ? "المهام والتقديمات" : "Assignments & Submissions"}</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard label={isAr ? "إجمالي" : "Total"} value={assignments.length} icon={ClipboardList} color="text-primary" />
        <StatCard label={isAr ? "تمت الموافقة" : "Approved"} value={assignments.filter(a => a.status === "approved").length} icon={CheckCircle} color="text-emerald-500" />
        <StatCard label={isAr ? "قيد المراجعة" : "Pending"} value={assignments.filter(a => a.status === "pending").length} icon={Clock} color="text-amber-500" />
        <StatCard
          label={isAr ? "المتوسط" : "Avg Grade"}
          value={avgGrade !== null ? `${avgGrade}%` : "—"}
          icon={Target}
          color="text-cyan-500"
        />
      </div>

      <FilterBar
        options={["all", "approved", "pending", "rejected", "not_submitted"]}
        active={filter}
        onChange={setFilter}
        labels={{
          all: isAr ? "الكل" : "All",
          approved: isAr ? "تمت الموافقة" : "Approved",
          pending: isAr ? "قيد المراجعة" : "Pending",
          rejected: isAr ? "مرفوض" : "Rejected",
          not_submitted: isAr ? "غير مقدم" : "Not Submitted",
        }}
      />

      {filtered.length === 0 ? <EmptyState message={isAr ? "لا توجد مهام" : "No assignments found"} /> : (
        <div className="space-y-2.5">
          {filtered.map((a: any) => (
            <button
              key={a.submission_id || a.lecture_id}
              onClick={() => setSelectedAssignment(a)}
              className="w-full text-left bg-card ring-1 ring-border/20 rounded-2xl p-4 md:p-5 hover:ring-border/35 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold group-hover:text-foreground/90 transition-colors">{a.lecture_title}</p>
                  <p className="text-[9px] text-muted-foreground/40 mt-1">
                    {isAr ? "المستوى" : "Level"} {a.level_order}: {a.level_title} · {isAr ? "درس" : "Slot"} #{a.slot_number}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {a.grade !== null && (
                    <span className="text-base font-extrabold text-primary font-[JetBrains_Mono,monospace]">{a.grade}%</span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide ring-1 ${statusColors[a.status] || statusColors.not_submitted}`}>
                    {statusLabels[a.status] || a.status}
                  </span>
                </div>
              </div>

              {a.feedback && (
                <div className="mt-3 px-3 py-2 bg-primary/[0.03] rounded-xl border border-primary/[0.06]">
                  <p className="text-[9px] font-semibold text-primary/60 uppercase tracking-wide mb-0.5">{isAr ? "ملاحظات المشرف" : "Feedback"}</p>
                  <p className="text-[10px] text-foreground/60 line-clamp-2 leading-relaxed">{a.feedback}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[9px] text-muted-foreground/35">
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
                {Number(a.submission_count) > 1 && <span>{isAr ? "المحاولات" : "Attempts"}: {a.submission_count}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-card ring-1 ring-border/25 rounded-[1.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-7 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-sm">{selectedAssignment.lecture_title}</h3>
                  <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                    {isAr ? "المستوى" : "Level"} {selectedAssignment.level_order}: {selectedAssignment.level_title}
                  </p>
                </div>
                <button onClick={() => setSelectedAssignment(null)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Grade & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/15 ring-1 ring-border/10 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-extrabold text-primary font-[JetBrains_Mono,monospace] leading-none">
                      {selectedAssignment.grade !== null ? `${selectedAssignment.grade}%` : "—"}
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40 mt-2">{isAr ? "الدرجة" : "Grade"}</p>
                  </div>
                  <div className="bg-muted/15 ring-1 ring-border/10 rounded-2xl p-4 text-center">
                    <p className="text-[11px] font-bold mt-1">
                      {statusLabels[selectedAssignment.status] || selectedAssignment.status}
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40 mt-2">{isAr ? "الحالة" : "Status"}</p>
                  </div>
                </div>

                {selectedAssignment.assignment_description && (
                  <div className="bg-muted/10 ring-1 ring-border/10 rounded-2xl p-4">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground/40 mb-2">{isAr ? "الوصف" : "Description"}</p>
                    <p className="text-[11px] leading-relaxed text-foreground/70">{selectedAssignment.assignment_description}</p>
                  </div>
                )}

                {selectedAssignment.feedback && (
                  <div className="bg-primary/[0.04] ring-1 ring-primary/10 rounded-2xl p-4">
                    <p className="text-[9px] font-bold uppercase text-primary/70 mb-2">{isAr ? "ملاحظات المشرف" : "Moderator Feedback"}</p>
                    <p className="text-[11px] leading-relaxed">{selectedAssignment.feedback}</p>
                    {selectedAssignment.graded_by_name && (
                      <p className="text-[9px] text-muted-foreground/35 mt-3 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                        {selectedAssignment.graded_by_name}
                      </p>
                    )}
                  </div>
                )}

                {selectedAssignment.image_url && (
                  <div>
                    <p className="text-[9px] font-bold uppercase text-muted-foreground/40 mb-2">{isAr ? "الملف المرفق" : "Submitted File"}</p>
                    {selectedAssignment.image_url.match(/\.(pdf|doc|docx)$/i) ? (
                      <a href={selectedAssignment.image_url} target="_blank" rel="noopener"
                        className="flex items-center gap-3 p-3.5 bg-muted/15 ring-1 ring-border/15 rounded-2xl hover:bg-muted/25 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold">{isAr ? "عرض الملف" : "View File"}</p>
                          <p className="text-[9px] text-muted-foreground/40">{isAr ? "افتح في نافذة جديدة" : "Opens in new tab"}</p>
                        </div>
                      </a>
                    ) : (
                      <img src={selectedAssignment.image_url} alt="" className="w-full max-h-[280px] object-contain rounded-2xl ring-1 ring-border/15" />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] text-muted-foreground/35 pt-1">
                  <span>{isAr ? "التاريخ" : "Submitted"}: {new Date(selectedAssignment.created_at).toLocaleString()}</span>
                  {selectedAssignment.graded_at && (
                    <span>{isAr ? "التقييم" : "Graded"}: {new Date(selectedAssignment.graded_at).toLocaleString()}</span>
                  )}
                  <span>{isAr ? "المحاولات" : "Attempts"}: {selectedAssignment.submission_count}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GRADES TAB
// ═══════════════════════════════════════════════════════

function GradesTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [summary, setSummary] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [sumRes, cpRes] = await Promise.all([
      supabase.rpc("get_parent_student_summary", { p_student_id: student.id }),
      supabase.rpc("get_student_course_progress", { p_student_id: student.id }),
    ]);
    if (sumRes.data?.[0]) setSummary(sumRes.data[0]);
    if (cpRes.data) setCourseProgress(cpRes.data);
    setLoading(false);
  };

  if (loading) return <TabSkeleton />;
  if (!summary) return <EmptyState message={isAr ? "لا توجد درجات" : "No grades data"} />;

  const gradeData = courseProgress.map((c: any) => ({
    name: c.level_title,
    progress: Number(c.progress_pct || 0),
  }));

  const completionPct = summary.total_lectures > 0
    ? Math.round((Number(summary.completed_lectures) / Number(summary.total_lectures)) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "الدرجات والأداء" : "Grades & Performance"}</h2>

      {/* Performance Summary - Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative overflow-hidden bg-card border border-border/50 rounded-2xl p-4 md:p-5 text-center active:scale-[0.98] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
          <div className="relative">
            <p className="text-3xl md:text-4xl font-black text-primary leading-none">{summary.average_grade || "—"}%</p>
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mt-2">{isAr ? "متوسط المهام" : "Assignment Avg"}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-card border border-border/50 rounded-2xl p-4 md:p-5 text-center active:scale-[0.98] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] to-transparent" />
          <div className="relative">
            <p className="text-3xl md:text-4xl font-black text-cyan-500 leading-none">{summary.average_exam_score || "—"}%</p>
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mt-2">{isAr ? "متوسط الاختبارات" : "Exam Avg"}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-card border border-border/50 rounded-2xl p-4 md:p-5 text-center active:scale-[0.98] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] to-transparent" />
          <div className="relative">
            <p className="text-3xl md:text-4xl font-black text-emerald-500 leading-none">{completionPct}%</p>
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mt-2">{isAr ? "نسبة الإنجاز" : "Completion"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          label={isAr ? "إجمالي الاختبارات" : "Exam Attempts"}
          value={summary.total_exam_attempts || "0"}
          icon={Target}
          color="text-violet-500"
        />
        <StatCard
          label={isAr ? "المهام المكتملة" : "Completed Tasks"}
          value={summary.completed_assignments || "0"}
          icon={CheckCircle}
          color="text-emerald-500"
        />
      </div>

      {gradeData.length > 0 && (
        <div className="bg-card ring-1 ring-border/20 rounded-[1.25rem] p-5 md:p-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-5">{isAr ? "التقدم حسب المستوى" : "Progress By Level"}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 10 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                  formatter={(val: number) => [`${val}%`, isAr ? "التقدم" : "Progress"]}
                  cursor={{ fill: "rgba(112,224,0,0.04)" }}
                />
                <Bar dataKey="progress" fill="#70e000" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ACTIVITY TAB
// ═══════════════════════════════════════════════════════

function ActivityTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_student_activity", { p_student_id: student.id });
    if (data?.[0]) setActivity(data[0]);
    setLoading(false);
  };

  if (loading) return <TabSkeleton />;
  if (!activity) return <EmptyState message={isAr ? "لا يوجد نشاط" : "No activity data"} />;

  const dailyData = Array.isArray(activity.daily_activity)
    ? activity.daily_activity.map((d: any) => ({
        day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
        minutes: d.minutes,
      }))
    : [];

  const weeklyData = Array.isArray(activity.weekly_activity)
    ? activity.weekly_activity.map((w: any) => ({
        week: new Date(w.week).toLocaleDateString("en", { month: "short", day: "numeric" }),
        minutes: w.minutes,
      }))
    : [];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "النشاط والحضور" : "Activity & Attendance"}</h2>

      {/* Featured stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          label={isAr ? "إجمالي ساعات الدراسة" : "Total Hours"}
          value={activity.total_study_hours || "0"}
          icon={Clock}
          color="text-primary"
          sub={isAr ? "وقت التعلم الكلي" : "Total learning time"}
          featured
        />
        <StatCard
          label={isAr ? "ساعات هذا الأسبوع" : "This Week"}
          value={activity.study_hours_this_week || "0"}
          icon={Flame}
          color="text-orange-500"
          sub={isAr ? "الأسبوع الحالي" : "Current week"}
          featured
        />
        <StatCard
          label={isAr ? "ساعات هذا الشهر" : "This Month"}
          value={activity.study_hours_this_month || "0"}
          icon={TrendingUp}
          color="text-emerald-500"
          sub={isAr ? "الشهر الحالي" : "Current month"}
          featured
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard label={isAr ? "إجمالي الدخول" : "Total Logins"} value={activity.total_logins || "0"} icon={Users} color="text-blue-500" />
        <StatCard label={isAr ? "دخول/أسبوع" : "Logins/Week"} value={activity.logins_this_week || "0"} icon={ArrowUpRight} color="text-cyan-500" />
        <StatCard label={isAr ? "مشاهدات الدروس" : "Lesson Views"} value={activity.total_lesson_views || "0"} icon={Eye} color="text-violet-500" />
        <StatCard label={isAr ? "آخر نشاط" : "Last Active"} value={activity.last_login ? new Date(activity.last_login).toLocaleDateString() : "—"} icon={Clock} color="text-amber-500" />
      </div>

      {/* Daily Activity Chart */}
      {dailyData.length > 0 && (
        <div className="bg-card ring-1 ring-border/20 rounded-[1.25rem] p-5 md:p-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-5">{isAr ? "النشاط اليومي (آخر 14 يوم)" : "Daily Activity (Last 14 Days)"}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, bottom: 5, left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#70e000" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#70e000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} formatter={(v: number) => [`${v} min`, isAr ? "الوقت" : "Time"]} />
                <Area type="monotone" dataKey="minutes" stroke="#70e000" fill="url(#gradGreen)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Activity Chart */}
      {weeklyData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">{isAr ? "النشاط الأسبوعي" : "Weekly Activity"}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, bottom: 5, left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} formatter={(v: number) => [`${v} min`, isAr ? "الوقت" : "Time"]} />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════

function MessagesTab({ student, isAr, userId }: { student: any; isAr: boolean; userId: string }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchThreads(); }, [student?.id]);

  const fetchThreads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("parent_moderator_threads")
      .select(`*, moderator:profiles!parent_moderator_threads_moderator_id_fkey (id, username, avatar_url)`)
      .eq("parent_id", userId)
      .eq("student_id", student.id)
      .order("last_message_at", { ascending: false });
    if (data) setThreads(data);
    setLoading(false);
  };

  const openThread = async (thread: any) => {
    setActiveThread(thread);
    const { data } = await supabase
      .from("parent_moderator_messages")
      .select("*, sender:profiles!parent_moderator_messages_sender_id_fkey (id, username, avatar_url)")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    await supabase.rpc("mark_thread_read", { p_thread_id: thread.id, p_user_id: userId });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    await supabase.rpc("send_parent_message", {
      p_thread_id: activeThread.id,
      p_sender_id: userId,
      p_content: newMessage.trim(),
    });
    setNewMessage("");
    await openThread(activeThread);
    setSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const [moderators, setModerators] = useState<any[]>([]);
  useEffect(() => {
    const fetchMods = async () => {
      const { data } = await supabase.from("profiles").select("id, username, avatar_url").eq("role", "moderator");
      if (data) setModerators(data);
    };
    fetchMods();
  }, []);

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "الرسائل" : "Messages"}</h2>

      {activeThread ? (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
          {/* Thread Header */}
          <div className="p-3.5 border-b border-border/40 flex items-center gap-3">
            <button onClick={() => { setActiveThread(null); setMessages([]); }} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
              {activeThread.moderator?.avatar_url ? (
                <img src={activeThread.moderator.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                activeThread.moderator?.username?.charAt(0)?.toUpperCase() || "M"
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold">{activeThread.moderator?.username || "Moderator"}</p>
              <p className="text-[9px] text-muted-foreground/50">{isAr ? "مشرف" : "Moderator"} · {student.username}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <p className="text-[11px] text-muted-foreground/40">{isAr ? "ابدأ المحادثة" : "Start the conversation"}</p>
              </div>
            )}
            {messages.map((msg: any) => {
              const isMe = msg.sender_id === userId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 text-[11px] leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-2xl rounded-bl-md"
                  }`}>
                    <p dir="auto">{msg.content}</p>
                    <p className={`text-[8px] mt-1 ${isMe ? "text-primary-foreground/40" : "text-muted-foreground/40"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {msg.is_read && isMe ? " ✓✓" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3.5 border-t border-border/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={isAr ? "اكتب رسالة..." : "Type a message..."}
                className="flex-1 bg-muted/30 border border-border/40 rounded-xl px-4 py-2.5 text-[11px] outline-none focus:border-primary/40 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {threads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-xs text-muted-foreground/60 mb-4">{isAr ? "لا توجد محادثات بعد" : "No conversations yet"}</p>
              {moderators.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {moderators.map(mod => (
                    <button
                      key={mod.id}
                      onClick={() => {
                        supabase.rpc("get_or_create_parent_thread", {
                          p_parent_id: userId,
                          p_moderator_id: mod.id,
                          p_student_id: student.id,
                          p_subject: `Regarding ${student.username}`,
                        }).then(async ({ data }) => {
                          if (data) { await fetchThreads(); }
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all text-[11px] font-semibold"
                    >
                      <span>{mod.username}</span>
                      <MessageCircle className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {threads.map((thread: any) => (
                <button
                  key={thread.id}
                  onClick={() => openThread(thread)}
                  className="w-full p-3.5 bg-card border border-border/50 rounded-xl flex items-center gap-3 hover:border-border hover:bg-muted/10 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                    {thread.moderator?.avatar_url ? (
                      <img src={thread.moderator.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      thread.moderator?.username?.charAt(0)?.toUpperCase() || "M"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold">{thread.moderator?.username || "Moderator"}</p>
                    <p className="text-[9px] text-muted-foreground/50 truncate">{thread.subject || student.username}</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground/30 flex-shrink-0">
                    {thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString() : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CALENDAR TAB
// ═══════════════════════════════════════════════════════

function CalendarTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { fetchEvents(); }, [student?.id, currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split("T")[0];
    const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split("T")[0];
    const { data } = await supabase.rpc("get_student_calendar", { p_student_id: student.id, p_from: from, p_to: to });
    if (data) setEvents(data);
    setLoading(false);
  };

  const eventTypeColors: Record<string, string> = {
    assignment_due: "bg-amber-500/10 text-amber-500",
    exam: "bg-red-500/10 text-red-500",
    live_class: "bg-blue-500/10 text-blue-500",
    parent_meeting: "bg-violet-500/10 text-violet-500",
    milestone: "bg-emerald-500/10 text-emerald-500",
    badge_earned: "bg-cyan-500/10 text-cyan-500",
    level_unlocked: "bg-orange-500/10 text-orange-500",
    custom: "bg-muted/40 text-muted-foreground/60",
  };
  const eventTypeDots: Record<string, string> = {
    assignment_due: "bg-amber-500",
    exam: "bg-red-500",
    live_class: "bg-blue-500",
    parent_meeting: "bg-violet-500",
    milestone: "bg-emerald-500",
    badge_earned: "bg-cyan-500",
    level_unlocked: "bg-orange-500",
    custom: "bg-muted-foreground",
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString(isAr ? "ar" : "en", { month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "التقويم" : "Calendar"}</h2>

      <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 rounded-lg hover:bg-muted/40 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <h3 className="text-sm font-bold tracking-tight">{monthName}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 rounded-lg hover:bg-muted/40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {(isAr ? ["ح", "ن", "ث", "أ", "ث", "ج", "س"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map(d => (
            <div key={d} className="text-center text-[8px] font-bold uppercase text-muted-foreground/40 py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter(e => new Date(e.starts_at).toISOString().split("T")[0] === dateStr);
            const isToday = new Date().toISOString().split("T")[0] === dateStr;
            return (
              <div key={day} className={`relative p-1.5 rounded-lg min-h-[36px] ${isToday ? "bg-primary/10" : dayEvents.length > 0 ? "bg-muted/20" : ""}`}>
                <span className={`text-[10px] font-semibold ${isToday ? "text-primary" : "text-foreground/70"}`}>{day}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full ${eventTypeDots[ev.event_type] || eventTypeDots.custom}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 md:p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4">{isAr ? "الأحداث القادمة" : "Upcoming Events"}</h3>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
            <p className="text-[11px] text-muted-foreground/40">{isAr ? "لا أحداث هذا الشهر" : "No events this month"}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()).map((ev: any) => (
              <div key={ev.event_id} className={`flex items-center gap-3 p-2.5 rounded-lg ${ev.is_completed ? "opacity-40" : "hover:bg-muted/20"} transition-colors`}>
                <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wide ${eventTypeColors[ev.event_type] || eventTypeColors.custom}`}>
                  {ev.event_type.replace("_", " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{ev.title}</p>
                  <p className="text-[9px] text-muted-foreground/40">{new Date(ev.starts_at).toLocaleString()}</p>
                </div>
                {ev.is_completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FILES TAB
// ═══════════════════════════════════════════════════════

function FilesTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("student_files")
      .select("*, uploader:profiles!student_files_uploaded_by_fkey (username)")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
    setLoading(false);
  };

  const typeIcons: Record<string, any> = {
    submission: FileText,
    certificate: Award,
    report: BarChart3,
    resource: BookOpen,
    moderator_attachment: Paperclip,
    portfolio: FolderOpen,
  };
  const typeLabels: Record<string, string> = {
    submission: isAr ? "تقديم" : "Submission",
    certificate: isAr ? "شهادة" : "Certificate",
    report: isAr ? "تقرير" : "Report",
    resource: isAr ? "مورد" : "Resource",
    moderator_attachment: isAr ? "مرفق المشرف" : "Moderator Attachment",
    portfolio: isAr ? "محفظة" : "Portfolio",
  };

  const filtered = files.filter(f => filter === "all" || f.file_type === filter);

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "الملفات والمستندات" : "Files & Documents"}</h2>

      <FilterBar
        options={["all", ...Object.keys(typeLabels)]}
        active={filter}
        onChange={setFilter}
        labels={{ all: isAr ? "الكل" : "All", ...typeLabels }}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isAr ? "لا توجد ملفات" : "No files found"} />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((f: any) => {
            const Icon = typeIcons[f.file_type] || FileText;
            return (
              <a
                key={f.id}
                href={f.file_url}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 p-3.5 bg-card border border-border/50 rounded-xl hover:border-border hover:bg-muted/10 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{f.file_name}</p>
                  <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                    {typeLabels[f.file_type]} · {new Date(f.created_at).toLocaleDateString()}
                    {f.uploader?.username && ` · ${f.uploader.username}`}
                  </p>
                </div>
                <Download className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FEEDBACK TAB
// ═══════════════════════════════════════════════════════

function FeedbackTab({ student, isAr }: { student: any; isAr: boolean }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, [student?.id]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_student_feedback", { p_student_id: student.id });
    if (data) setFeedbacks(data);
    setLoading(false);
  };

  const categoryColors: Record<string, string> = {
    assignment_review: "bg-blue-500/10 text-blue-500",
    exam_review: "bg-violet-500/10 text-violet-500",
    moderator_note: "bg-amber-500/10 text-amber-500",
  };
  const categoryLabels: Record<string, string> = {
    assignment_review: isAr ? "مراجعة مهمة" : "Assignment Review",
    exam_review: isAr ? "مراجعة اختبار" : "Exam Review",
    moderator_note: isAr ? "ملاحظة مشرف" : "Moderator Note",
  };

  const filtered = feedbacks.filter(f => {
    if (filter !== "all" && f.source !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.feedback_text?.toLowerCase().includes(q) && !f.lecture_title?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) return <TabSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-black uppercase tracking-tight">{isAr ? "ملاحظات المشرف" : "Moderator Feedback"}</h2>

      <div className="flex gap-2 flex-wrap items-center">
        <FilterBar
          options={["all", "assignment", "exam", "note"]}
          active={filter}
          onChange={setFilter}
          labels={{
            all: isAr ? "الكل" : "All",
            assignment: isAr ? "مراجعة مهمة" : "Assignment",
            exam: isAr ? "مراجعة اختبار" : "Exam",
            note: isAr ? "ملاحظة" : "Note",
          }}
        />
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30" />
          <input
            type="text"
            placeholder={isAr ? "بحث..." : "Search..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 rounded-lg bg-muted/30 border border-border/40 text-[10px] outline-none focus:border-primary/40 transition-colors w-36"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={isAr ? "لا توجد ملاحظات" : "No feedback found"} />
      ) : (
        <div className="space-y-2">
          {filtered.map((f: any) => (
            <div key={f.feedback_id} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wide ${categoryColors[f.category] || categoryColors.moderator_note}`}>
                    {categoryLabels[f.category] || f.category}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40">{new Date(f.created_at).toLocaleString()}</span>
                </div>
                {f.grade !== null && (
                  <span className="text-sm font-bold text-primary tabular-nums">{f.grade}%</span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed mb-2">{f.feedback_text}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-muted-foreground/40">
                {f.lecture_title && <span>{isAr ? "الدرس" : "Lesson"}: {f.lecture_title}</span>}
                {f.level_title && <span>{isAr ? "المستوى" : "Level"}: {f.level_title}</span>}
                {f.created_by_name && <span>{isAr ? "بواسطة" : "By"}: {f.created_by_name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 rounded-[1.25rem] bg-muted/10 ring-1 ring-border/15 flex items-center justify-center mx-auto mb-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)]">
        <FolderOpen className="w-6 h-6 text-muted-foreground/25" />
      </div>
      <p className="text-[11px] text-muted-foreground/40 font-medium max-w-[200px] mx-auto leading-relaxed">{message}</p>
    </motion.div>
  );
}
