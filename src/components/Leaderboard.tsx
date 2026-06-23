import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase-code";
import { useLanguage } from "../lib/LanguageContext";
import { Trophy, Medal, Star, User, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/use-auth";
import { ProfileEdit } from "./ProfileEdit";
import { HeroButton } from "../funs/HeroButton";

interface Profile {
  id: string;
  username: string;
  score: number;
  avatar_url?: string;
}

export const Leaderboard: React.FC = () => {
  const { isAr } = useLanguage();
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, score, avatar_url, role")
      .eq("role", "student") // Only students in leaderboard
      .order("score", { ascending: false })
      .limit(10);

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard_changes")
      .on(
        "postgres_changes" as any,
        { event: "*", table: "profiles" },
        fetchLeaderboard,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const t = {
    title: isAr ? "لوحة المتصدرين" : "Leaderboard",
    points: isAr ? "نقطة" : "PTS",
  };

  if (loading)
    return <div className="animate-pulse h-64 bg-white/5 rounded-3xl" />;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 relative z-10">
      <div
        className={`flex items-center gap-3 mb-6 ${isAr ? "flex-row-reverse" : ""}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">
          {t.title}
        </h3>
      </div>

      <div className="space-y-3">
        {profiles.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group flex items-center justify-between p-4 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all ${isAr ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}
            >
              <div className="w-6 h-6 flex items-center justify-center font-black text-white/20 text-xs">
                {index === 0 ? (
                  <Medal className="w-5 h-5 text-yellow-500" />
                ) : index === 1 ? (
                  <Medal className="w-5 h-5 text-gray-400" />
                ) : index === 2 ? (
                  <Medal className="w-5 h-5 text-orange-500" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/5">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-bold text-white text-sm ${isAr ? "text-right" : ""}`}
                >
                  {p.username}
                </span>
                <div
                  className={`flex items-center gap-1 ${isAr ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-emerald-400 font-black text-xs leading-none">
                    {p.score}
                  </span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                    {t.points}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <HeroButton
                onClick={() => setEditingProfile(p)}
                variant="outline"
                size="sm"
                className="p-2 rounded-xl border-white/10 opacity-0 group-hover:opacity-100"
              >
                <Settings2 className="w-4 h-4" />
              </HeroButton>
            )}
          </motion.div>
        ))}
      </div>

      {editingProfile && (
        <ProfileEdit
          isOpen={true}
          onClose={() => setEditingProfile(null)}
          targetProfile={editingProfile as any}
          onUpdate={fetchLeaderboard}
        />
      )}
    </div>
  );
};
