import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase-code";
import { useLanguage } from "../lib/LanguageContext";
import { useAuth } from "../hooks/use-auth";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Video,
  FileText,
  ArrowLeft,
  ArrowRight,
  Zap,
  Lock,
  Settings,
  FileDown,
  Monitor,
  Brain,
  Check,
  X,
  Play,
  GraduationCap,
} from "lucide-react";
import { HeroButton } from "../funs/HeroButton";
import { AcademicReviewer } from "../components/AcademicReviewer";
import { LectureExam } from "../components/LectureExam";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const Route = createFileRoute("/lecture/$lectureId")({
  component: LecturePage,
});

interface ContentBlock {
  id: string;
  type:
    | "text"
    | "code"
    | "image"
    | "pdf"
    | "download"
    | "word"
    | "canvas"
    | "quiz";
  content: string;
  metadata?: {
    filename?: string;
    filesize?: string;
    quiz?: {
      question: string;
      options: string[];
      correctOptionIndex: number;
    };
  };
}

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  level_id: string;
  slot_number: number;
  content_blocks?: ContentBlock[];
  quiz_data?: any[];
  is_big_exam?: boolean;
}

function WordDocumentViewer({ url }: { url: string }) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("mammoth").then((mammoth) => {
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
        .then((result) => {
          setHtml(result.value);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    });
  }, [url]);

  if (loading) return <div className="text-white/50">Loading document...</div>;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose prose-invert max-w-none"
    />
  );
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-0.5 rounded-2xl bg-white/10 border border-white/20 overflow-hidden group/code mb-6">
      <div className="bg-black/40 rounded-[calc(1rem+4px)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="p-6 overflow-x-auto custom-scrollbar">
          <pre className="text-sm font-mono text-[#00a5cf] selection:bg-white/20">
            <code>{content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function ContentRenderer({
  block,
  onQuizAnswer,
  quizAnswers,
  quizStatus,
  isAr,
}: {
  block: ContentBlock;
  onQuizAnswer: (id: string, idx: number, correct: number) => void;
  quizAnswers: Record<string, number>;
  quizStatus: Record<string, "correct" | "incorrect">;
  isAr: boolean;
}) {
  if (!block || !block.type) return null;

  try {
    switch (block.type) {
      case "text":
        return (
          <p className="text-lg text-white/70 leading-relaxed whitespace-pre-wrap selection:bg-white/20">
            {block.content}
          </p>
        );
      case "code":
        return <CodeBlock content={block.content} />;
      case "image":
        return (
          <img
            src={block.content}
            className="w-full rounded-3xl border border-white/10 shadow-2xl"
            alt=""
          />
        );
      case "pdf":
        return (
          <iframe
            src={block.content}
            className="w-full h-[600px] rounded-3xl"
            title="PDF"
          />
        );
      case "download":
        return (
          <a
            href={block.content}
            className="flex items-center gap-4 p-6 bg-[#00a5cf]/10 rounded-2xl border border-[#00a5cf]/20 text-[#00a5cf] hover:bg-[#00a5cf]/20"
            download
          >
            <FileDown className="w-8 h-8" />
            <div>
              <p className="font-black uppercase">
                {block.metadata?.filename || "Download File"}
              </p>
              <p className="text-xs text-lime-500/60">
                {block.metadata?.filesize || ""}
              </p>
            </div>
          </a>
        );
      case "canvas":
        return (
          <iframe
            src={block.content}
            className="w-full h-[500px] rounded-3xl"
            title="Interactive"
          />
        );
      case "word":
        return <WordDocumentViewer url={block.content} />;
      case "quiz":
        if (!block.metadata?.quiz) return null;
        return (
          <div className="p-6 bg-[#00a5cf]/10 border border-[#00a5cf]/20 rounded-2xl">
            <p className="font-bold mb-4">{block.metadata.quiz.question}</p>
            <div className="space-y-2">
              {block.metadata.quiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onQuizAnswer(
                      block.id,
                      idx,
                      block.metadata!.quiz!.correctOptionIndex,
                    )
                  }
                  className={`w-full text-left p-3 rounded-lg border ${quizAnswers[block.id] === idx ? (quizStatus[block.id] === "correct" ? "bg-green-500/20 border-green-500" : "bg-red-500/20 border-red-500") : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-white/20 p-4 border border-dashed border-white/10 rounded-xl">
            Unsupported block type: {block.type}
          </div>
        );
    }
  } catch (e) {
    console.error("Error rendering block:", e);
    return <div className="text-red-500 p-4">Error rendering content</div>;
  }
}

function LecturePage() {
  const { lectureId } = Route.useParams();
  const { isAr } = useLanguage();
  const { user, profile, isApproved, isAdmin, isModerator, refreshProfile } =
    useAuth();
  const navigate = useNavigate();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLockedBySequence, setIsLockedBySequence] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [nextLectureId, setNextLectureId] = useState<string | null>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);

  // Video player restrictions
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);

  const contentScrollRef = useRef<HTMLDivElement>(null);

  const handleVideoEnded = useCallback(() => {
    setIsVideoFinished(true);
    toast.success(
      isAr
        ? "اكتمل الفيديو! يمكنك الآن إكمال المهمة"
        : "Video completed! You can now execute the mission",
    );
  }, [isAr]);

  // Load YouTube API
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      lecture?.video_url &&
      (lecture.video_url.includes("youtube.com") ||
        lecture.video_url.includes("youtu.be"))
    ) {
      // @ts-ignore
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, [lecture?.video_url]);

  const fetchLecture = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .eq("id", lectureId)
        .single();

      if (error) throw error;
      if (data) {
        setLecture(data);
      }

      if (user) {
        const [progressDataRes, levelAccessRes, canAccessRes] =
          await Promise.all([
            supabase
              .from("student_progress")
              .select("*")
              .eq("student_id", user.id)
              .eq("lecture_id", lectureId)
              .single(),
            supabase
              .from("level_access")
              .select("level_id")
              .eq("user_id", user.id)
              .eq("level_id", data.level_id),
            supabase.rpc("can_student_access_level", {
              u_id: user.id,
              target_level_id: data.level_id,
            }),
          ]);

        setIsCompleted(!!progressDataRes.data);
        const manual = !!(levelAccessRes.data && levelAccessRes.data.length > 0);

        if (!manual && canAccessRes.data !== true && !isAdmin && !isModerator) {
          navigate({ to: "/levels" });
          return;
        }

        const { data: allLecturesInLevel } = await supabase
          .from("lectures")
          .select("id, slot_number")
          .eq("level_id", data.level_id)
          .order("slot_number", { ascending: true });

        if (allLecturesInLevel) {
          const idx = allLecturesInLevel.findIndex((l) => l.id === lectureId);
          if (idx < allLecturesInLevel.length - 1) {
            setNextLectureId(allLecturesInLevel[idx + 1].id);
          }
        }
      }
    } catch (err) {
      navigate({ to: "/levels" });
    } finally {
      setLoading(false);
    }
  }, [lectureId, user, isAdmin, isModerator, navigate]);

  useEffect(() => {
    fetchLecture();
    setMaxTimeWatched(0);
    setIsVideoFinished(false);
  }, [lectureId, user, fetchLecture]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentScrollRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 50) setHasScrolledToEnd(true);
      }
    };
    const currentRef = contentScrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
      if (currentRef.scrollHeight <= currentRef.clientHeight) setHasScrolledToEnd(true);
    }
    return () => currentRef?.removeEventListener("scroll", handleScroll);
  }, [lecture, loading]);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizStatus, setQuizStatus] = useState<Record<string, "correct" | "incorrect">>({});

  const handleQuizAnswer = (blockId: string, idx: number, correct: number) => {
    setQuizAnswers((p) => ({ ...p, [blockId]: idx }));
    setQuizStatus((p) => ({ ...p, [blockId]: idx === correct ? "correct" : "incorrect" }));
  };

  const handleCompleteRequest = () => {
    if (!hasScrolledToEnd && !isAdmin && !isModerator) {
      toast.error(isAr ? "يرجى قراءة المهمة بالكامل" : "Please read the full mission briefing");
      return;
    }
    if (!isVideoFinished && lecture?.video_url && !isAdmin && !isModerator) {
      toast.error(isAr ? "يرجى إنهاء الفيديو أولاً" : "Please finish the video first");
      return;
    }

    if (lecture?.quiz_data && lecture.quiz_data.length > 0 && !isCompleted) {
      setIsExamOpen(true);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc("complete_lecture_secure", { p_lecture_id: lectureId });
      if (rpcError) throw rpcError;

      await supabase.from("profiles").update({
        xp: (profile?.xp || 0) + 50,
        score: (profile?.score || 0) + 10,
      }).eq("id", user?.id);

      setIsCompleted(true);
      refreshProfile();
      toast.success(isAr ? "تم إكمال المهمة! +50 XP" : "Mission accomplished! +50 XP");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !lecture) {
    return (
      <div className="min-h-screen bg-[#004e64] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00a5cf] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#004e64] text-white flex flex-col relative overflow-hidden font-sans selection:bg-[#9fffcb]/30">
      <div className="fixed inset-0 bg-[#004e64] z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-[#00a5cf]/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-[#25a18e]/15 blur-[120px] rounded-full"></div>
      </div>

      <LectureExam
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
        lectureId={lectureId}
        questions={lecture?.quiz_data || []}
        isBigExam={lecture?.is_big_exam}
        onPassed={() => {
          setIsExamOpen(false);
          handleComplete();
        }}
      />

      <div ref={contentScrollRef} className="flex-1 relative z-20 pt-32 pb-32 px-6 max-w-[900px] mx-auto w-full overflow-y-auto h-screen">
        <header className="mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <span className="text-primary text-[9px] font-black uppercase tracking-[0.3em]">Module {lecture.slot_number}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 leading-[0.9] uppercase">{lecture.title}</motion.h1>
        </header>

        <div className="space-y-12">
          {lecture.video_url && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
              <div className="aspect-video rounded-[calc(2.5rem-0.25rem)] bg-black overflow-hidden border border-white/5 relative group">
                <iframe src={lecture.video_url.includes("youtube.com") ? lecture.video_url.replace("watch?v=", "embed/") : lecture.video_url} className="w-full h-full" allowFullScreen />
              </div>
            </motion.div>
          )}

          <div className="space-y-8">
            {lecture.content_blocks?.map((block, i) => (
              <motion.div key={block.id || i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-1 rounded-[2.5rem] bg-white/10 border border-white/20 hover:border-white/40 transition-all group">
                <div className="bg-white/5 border border-white/5 rounded-[calc(2.5rem-0.375rem)] p-8 md:p-10">
                  <ContentRenderer block={block} onQuizAnswer={handleQuizAnswer} quizAnswers={quizAnswers} quizStatus={quizStatus} isAr={isAr} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-12">
            <AcademicReviewer title={lecture.title} content={lecture.description} isAr={isAr} />
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-1.5 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl mt-24">
            <div className="bg-primary text-black p-8 md:p-10 rounded-[calc(2.5rem-0.375rem)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-black/10 rounded-2xl border border-black/5"><Zap className="w-6 h-6 text-black" /></div>
                <div>
                  <p className="font-black uppercase tracking-[0.5em] text-[9px] opacity-60 mb-0.5">MISSION CLEARANCE</p>
                  <p className="font-black italic text-2xl md:text-3xl tracking-tighter leading-none">DATA SYNCHRONIZED</p>
                </div>
              </div>

              <div className="w-full md:w-auto relative z-10">
                <HeroButton
                  onClick={isCompleted ? () => (nextLectureId ? navigate({ to: `/lecture/${nextLectureId}` }) : navigate({ to: "/levels" })) : handleCompleteRequest}
                  disabled={isSubmitting || (!isCompleted && !hasScrolledToEnd && !isAdmin && !isModerator)}
                  className="w-full md:w-auto bg-black text-white px-10 h-16 rounded-2xl font-black uppercase tracking-widest italic"
                >
                  <span className="flex items-center gap-3">
                    {isCompleted ? (nextLectureId ? "NEXT MODULE" : "FINISH LEVEL") : (lecture.quiz_data?.length ? "START EXAM" : "COMPLETE MISSION")}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </HeroButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
