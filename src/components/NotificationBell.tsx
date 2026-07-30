import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Info,
  X,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase-code";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "message";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  message: MessageSquare,
};

const colorMap = {
  info: "text-blue-500 bg-blue-500/10",
  success: "text-green-500 bg-green-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  message: "text-purple-500 bg-purple-500/10",
};

export function NotificationItem({
  n,
  onMarkRead,
  onClose,
}: {
  n: AppNotification;
  onMarkRead: (id: string) => void;
  onClose?: () => void;
}) {
  const { isAr } = useLanguage();
  const Icon = iconMap[n.type];

  const handleClick = async () => {
    if (!n.is_read) onMarkRead(n.id);
    onClose?.();
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex gap-3 p-3 rounded-xl cursor-pointer transition-colors",
        n.is_read
          ? "hover:bg-muted/50"
          : "bg-muted/30 hover:bg-muted/50 border-l-2 border-primary",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          colorMap[n.type],
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm truncate",
              n.is_read ? "text-muted-foreground" : "text-foreground font-bold",
            )}
          >
            {n.title}
          </p>
          {!n.is_read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {n.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(n.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );

  if (n.link && !n.is_read) {
    return <Link to={n.link as any} onClick={handleClick}>{content}</Link>;
  }
  if (n.link) {
    return <Link to={n.link as any} onClick={onClose}>{content}</Link>;
  }
  return content;
}

const subscriptions = new Set<string>();

export function NotificationBell() {
  const { user } = useAuth();
  const { isAr } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: AppNotification) => !n.is_read).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    const key = user.id;
    if (subscriptions.has(key)) return;
    subscriptions.add(key);

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      subscriptions.delete(key);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const trigger = (
    <button
      onClick={() => setOpen((p) => !p)}
      className="relative w-9 h-9 rounded-full border border-border bg-muted flex items-center justify-center hover:bg-accent/10 transition-all duration-200"
      aria-label={isAr ? "الإشعارات" : "Notifications"}
    >
      <Bell className="w-4 h-4 text-foreground" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary text-[9px] font-black text-primary-foreground flex items-center justify-center shadow-[0_0_8px_rgba(112,224,0,0.5)]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  const notificationList = (
    <>
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
          {isAr ? "الإشعارات" : "NOTIFICATIONS"}
        </h4>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <CheckCheck className="w-3 h-3" />
            {isAr ? "تحديد الكل كمقروء" : "MARK ALL READ"}
          </button>
        )}
      </div>
      <div className="space-y-1 max-h-[70vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {isAr ? "لا توجد إشعارات" : "NO NOTIFICATIONS"}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              onMarkRead={markAsRead}
              onClose={() => setOpen(false)}
            />
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: Popover */}
      <div className="hidden md:relative md:block" ref={dropdownRef}>
        {trigger}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-[150] p-4">
            {notificationList}
          </div>
        )}
      </div>

      {/* Mobile trigger (navigates to /notifications page) */}
      <button
        onClick={() => navigate({ to: "/notifications" as any })}
        className="md:hidden relative flex flex-col items-center gap-1 px-3 py-1"
        aria-label={isAr ? "الإشعارات" : "Notifications"}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-primary text-[8px] font-black text-primary-foreground flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="text-[9px] font-bold text-muted-foreground">
          {isAr ? "الإشعارات" : "Alerts"}
        </span>
      </button>
    </>
  );
}
