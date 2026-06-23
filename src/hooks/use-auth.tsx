import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase-code";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "moderator" | "student";

interface Profile {
  id: string;
  username: string;
  score: number;
  xp: number;
  role: UserRole;
  is_admin: boolean;
  is_approved: boolean;
  avatar_url?: string;
  work_duration: number;
  break_duration: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isStudent: boolean;
  isApproved: boolean;
  role: UserRole;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist, create one
          const { data: userData } = await supabase.auth.getUser();
          const email = userData.user?.email;
          const metadata = userData.user?.user_metadata;
          
          const role: UserRole =
            email === "aliahmedsabry8@gmail.com" ? "admin" : "student";

          const newProfile = {
            id: userId,
            username: metadata?.username || email?.split("@")[0] || "Player",
            phone_number: metadata?.phone_number || null,
            score: 0,
            xp: 0,
            role: metadata?.role || role, // Use selected role if available
            is_admin: role === "admin",
            is_approved: role === "admin", // Admins are auto-approved
            work_duration: 25,
            break_duration: 5,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();

          if (!createError) setProfile(createdProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const role: UserRole =
    profile?.role ||
    (user?.email === "aliahmedsabry8@gmail.com" ? "admin" : "student");
  const isAdmin = role === "admin";
  const isModerator = role === "moderator" || role === "admin";
  const isStudent = role === "student";
  const isApproved = profile?.is_approved ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        isModerator,
        isStudent,
        isApproved,
        role,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
