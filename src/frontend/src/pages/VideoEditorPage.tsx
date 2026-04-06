import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  Crown,
  Film,
  Image,
  Italic,
  Music,
  Pause,
  Play,
  Save,
  Scissors,
  Sparkles,
  Upload,
  Video,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab =
  | "trim"
  | "filters"
  | "music"
  | "text"
  | "stickers"
  | "photos"
  | "speed";
type StickerCategory = "love" | "stars" | "beauty" | "fun" | "nature" | "fire";

interface TextOverlay {
  id: number;
  value: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  position: OverlayPosition;
}

interface StickerOverlay {
  id: number;
  emoji: string;
  position: OverlayPosition;
}

interface PhotoOverlay {
  id: number;
  src: string;
  opacity: number;
  position: OverlayPosition;
}

type OverlayPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// ─── Constants ───────────────────────────────────────────────────────────────

const VIDEO_FILTERS = [
  { name: "Original", css: "none" },
  { name: "Cinematic", css: "contrast(1.2) brightness(0.9) saturate(0.8)" },
  { name: "Vintage", css: "sepia(0.5) contrast(1.1) brightness(0.95)" },
  { name: "Warm", css: "sepia(0.2) saturate(1.3) brightness(1.05)" },
  { name: "Cool", css: "hue-rotate(15deg) saturate(0.9) brightness(1.05)" },
  { name: "B&W", css: "grayscale(1) contrast(1.1)" },
  {
    name: "Rose",
    css: "sepia(0.3) saturate(1.4) hue-rotate(-15deg) brightness(1.1)",
  },
  {
    name: "Glow",
    css: "brightness(1.15) contrast(0.9) saturate(1.2) blur(0.3px)",
  },
  { name: "Dream", css: "brightness(1.2) saturate(0.7) contrast(0.9)" },
  {
    name: "Sunset",
    css: "sepia(0.4) saturate(1.5) hue-rotate(-20deg) brightness(1.1)",
  },
  { name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.8)" },
  { name: "Vivid", css: "saturate(2) contrast(1.1) brightness(1.05)" },
];

const SPEED_OPTIONS = [
  { label: "0.25×", value: 0.25 },
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "1×", value: 1 },
  { label: "1.25×", value: 1.25 },
  { label: "1.5×", value: 1.5 },
  { label: "2×", value: 2 },
];

const MUSIC_CATEGORIES = ["Pop", "Romantic", "Beats", "Chill", "Dance"];

const STICKER_CATEGORIES: Record<StickerCategory, string[]> = {
  love: ["❤️", "💕", "💖", "💗", "💓", "💞", "💘", "💝", "🥰", "😍"],
  stars: ["⭐", "🌟", "✨", "💫", "🌙", "☀️", "🌈", "🌠", "💥", "🔥"],
  beauty: ["💅", "👄", "💋", "🌸", "🌺", "🌷", "🌹", "💐", "🦋", "🌻"],
  fun: ["🎉", "🎊", "🎈", "🥳", "😂", "🤩", "😜", "🎁", "🎀", "🎮"],
  nature: ["🌿", "🍃", "🌊", "🏔️", "🌴", "🦚", "🦜", "🌼", "🍀", "🦋"],
  fire: ["🔥", "⚡", "💎", "👑", "🏆", "💪", "🚀", "💣", "🎯", "⚔️"],
};

const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF69B4",
  "#FF0000",
  "#FFD700",
  "#9B59B6",
  "#2ECC71",
  "#3498DB",
  "#FF6B35",
  "#FF1493",
];

const FONT_FAMILIES = [
  { label: "Sans", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Script", value: "cursive" },
  { label: "Mono", value: "monospace" },
  { label: "Georgia", value: "Georgia" },
  { label: "Arial", value: "Arial" },
];

const POSITION_GRID: OverlayPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function positionToStyle(position: OverlayPosition): React.CSSProperties {
  const map: Record<OverlayPosition, React.CSSProperties> = {
    "top-left": { top: "8%", left: "5%", transform: "none" },
    "top-center": { top: "8%", left: "50%", transform: "translateX(-50%)" },
    "top-right": { top: "8%", right: "5%", transform: "none" },
    "middle-left": { top: "50%", left: "5%", transform: "translateY(-50%)" },
    center: { top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
    "middle-right": { top: "50%", right: "5%", transform: "translateY(-50%)" },
    "bottom-left": { bottom: "8%", left: "5%", transform: "none" },
    "bottom-center": {
      bottom: "8%",
      left: "50%",
      transform: "translateX(-50%)",
    },
    "bottom-right": { bottom: "8%", right: "5%", transform: "none" },
  };
  return map[position];
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VideoEditorPage() {
  const navigate = useNavigate();

  // ── Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ── Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>("filters");

  // ── Filter
  const [selectedFilter, setSelectedFilter] = useState("none");

  // ── Trim
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  // ── Speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // ── Music
  const [musicSrc, setMusicSrc] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string>("No music loaded");
  const [videoVolume, setVideoVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(60);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // ── Text overlay
  const [overlayTexts, setOverlayTexts] = useState<TextOverlay[]>([]);
  const [textDraft, setTextDraft] = useState({
    value: "",
    fontFamily: "sans-serif",
    fontSize: 24,
    color: "#FFFFFF",
    bold: false,
    italic: false,
    position: "center" as OverlayPosition,
  });

  // ── Stickers
  const [overlayStickers, setOverlayStickers] = useState<StickerOverlay[]>([]);
  const [activeStickersCategory, setActiveStickersCategory] =
    useState<StickerCategory>("love");

  // ── Photos
  const [overlayPhotos, setOverlayPhotos] = useState<PhotoOverlay[]>([]);
  const [photoOpacity, setPhotoOpacity] = useState(80);
  const [photoPosition, setPhotoPosition] = useState<OverlayPosition>("center");

  // ── Sync playback speed to video element
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // ── Sync volumes
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = videoVolume / 100;
  }, [videoVolume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume / 100;
  }, [musicVolume]);

  // ── Video load handler
  const handleVideoImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoSrc(url);
      setTrimStart(0);
      setTrimEnd(100);
      setIsPlaying(false);
    },
    [],
  );

  // ── Video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(Math.round(videoRef.current.duration));
    }
  }, []);

  // ── Time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);

  // ── Play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current.play();
      if (musicSrc) audioRef.current?.play();
    }
    setIsPlaying((p) => !p);
  }, [isPlaying, musicSrc]);

  // ── Music toggle preview
  const toggleMusicPreview = useCallback(() => {
    if (!audioRef.current || !musicSrc) return;
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setMusicPlaying((p) => !p);
  }, [musicPlaying, musicSrc]);

  // ── Music import
  const handleMusicImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setMusicSrc(url);
      setMusicName(file.name);
    },
    [],
  );

  // ── Photo import
  const handlePhotoImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newPhotos: PhotoOverlay[] = [];
      Array.from(files).forEach((file, i) => {
        const src = URL.createObjectURL(file);
        newPhotos.push({
          id: Date.now() + i,
          src,
          opacity: photoOpacity,
          position: photoPosition,
        });
      });
      setOverlayPhotos((prev) => [...prev, ...newPhotos]);
    },
    [photoOpacity, photoPosition],
  );

  // ── Add text overlay
  const addTextOverlay = useCallback(() => {
    if (!textDraft.value.trim()) {
      toast.error("Please enter some text!");
      return;
    }
    setOverlayTexts((prev) => [...prev, { id: Date.now(), ...textDraft }]);
    setTextDraft((prev) => ({ ...prev, value: "" }));
    toast.success("Text added to video!");
  }, [textDraft]);

  // ── Remove overlay helpers
  const removeText = useCallback((id: number) => {
    setOverlayTexts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const removeSticker = useCallback((id: number) => {
    setOverlayStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const removePhoto = useCallback((id: number) => {
    setOverlayPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Save video
  const handleSaveVideo = useCallback(() => {
    if (!videoFile) {
      toast.error("No video loaded!");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beauty-pic-video-${Date.now()}.${videoFile.name.split(".").pop() || "mp4"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Video saved! Check your downloads 🎬");
  }, [videoFile]);

  const TABS: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "trim", label: "Trim", icon: "✂️" },
    { id: "filters", label: "Filters", icon: "🎨" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "text", label: "Text", icon: "✍️" },
    { id: "stickers", label: "Stickers", icon: "😍" },
    { id: "photos", label: "Photos", icon: "🖼️" },
    { id: "speed", label: "Speed", icon: "⚡" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFF0F5 0%,#FFE4EE 100%)" }}
    >
      {/* ── Audio element (hidden) */}
      {musicSrc && (
        // biome-ignore lint/a11y/useMediaCaption: background music player
        <audio
          ref={audioRef}
          src={musicSrc}
          loop
          onEnded={() => setMusicPlaying(false)}
        />
      )}

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{
          background: "rgba(255,240,245,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,105,180,0.2)",
          boxShadow: "0 2px 16px rgba(255,105,180,0.1)",
        }}
      >
        <div className="max-w-md mx-auto w-full flex items-center gap-3">
          <button
            type="button"
            data-ocid="video_editor.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(194,24,91,0.1)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#C2185B" }} />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7B2FBE,#C2185B)" }}
            >
              <Film className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: "#C2185B" }}>
              Video Editor
            </h1>
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold text-white"
              style={{ background: "linear-gradient(90deg,#FFD700,#FFA500)" }}
            >
              <Crown className="w-3 h-3" /> PREMIUM
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── Main scroll area ── */}
      <main className="flex-1 pb-40">
        <div className="max-w-md mx-auto px-4 pt-4">
          {/* ── No video: import area ── */}
          <AnimatePresence mode="wait">
            {!videoSrc ? (
              <motion.div
                key="import"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                {/* Big upload card */}
                <div
                  className="rounded-3xl p-8 text-center mb-4 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg,#7B2FBE 0%,#C2185B 100%)",
                    boxShadow: "0 8px 32px rgba(123,47,190,0.35)",
                  }}
                >
                  {/* decorative blobs */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle,white 0%,transparent 70%)",
                      transform: "translate(30%,-30%)",
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2.5,
                      ease: "easeInOut",
                    }}
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <Film className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Import Video
                  </h2>
                  <p className="text-pink-200 text-sm mb-6">
                    MP4, MOV, WebM supported
                  </p>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    data-ocid="video_editor.upload_button"
                    onChange={handleVideoImport}
                  />

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    data-ocid="video_editor.primary_button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full py-3 rounded-2xl font-bold text-base mb-3 flex items-center justify-center gap-2"
                    style={{ background: "white", color: "#C2185B" }}
                  >
                    <Upload className="w-5 h-5" />
                    Choose Video
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    data-ocid="video_editor.camera_button"
                    onClick={() => navigate({ to: "/camera" })}
                    className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <Video className="w-5 h-5" />
                    Record Video
                  </motion.button>
                </div>

                {/* Tips */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 12px rgba(255,105,180,0.1)",
                  }}
                >
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: "#C2185B" }}
                  >
                    ✨ What you can do:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["✂️", "Trim video clips"],
                      ["🎨", "Apply filters"],
                      ["🎵", "Add background music"],
                      ["✍️", "Add text overlays"],
                      ["😍", "Sticker overlays"],
                      ["⚡", "Change speed"],
                    ].map(([icon, label]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <span className="text-xs" style={{ color: "#888" }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── Video preview ── */}
                <div
                  className="rounded-3xl overflow-hidden mb-4 relative"
                  style={{ boxShadow: "0 8px 32px rgba(123,47,190,0.25)" }}
                >
                  <div className="relative bg-black">
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full max-h-64 object-contain"
                      style={{
                        filter:
                          selectedFilter === "none"
                            ? undefined
                            : selectedFilter,
                      }}
                      onLoadedMetadata={handleLoadedMetadata}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      playsInline
                      muted={false}
                    />

                    {/* Overlay container */}
                    <div className="absolute inset-0 pointer-events-none">
                      {overlayTexts.map((t) => (
                        <span
                          key={t.id}
                          className="absolute whitespace-nowrap px-1"
                          style={{
                            ...positionToStyle(t.position),
                            fontFamily: t.fontFamily,
                            fontSize: t.fontSize,
                            color: t.color,
                            fontWeight: t.bold ? "bold" : "normal",
                            fontStyle: t.italic ? "italic" : "normal",
                            textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                          }}
                        >
                          {t.value}
                        </span>
                      ))}
                      {overlayStickers.map((s) => (
                        <span
                          key={s.id}
                          className="absolute text-3xl"
                          style={positionToStyle(s.position)}
                        >
                          {s.emoji}
                        </span>
                      ))}
                      {overlayPhotos.map((p) => (
                        <img
                          key={p.id}
                          src={p.src}
                          alt="overlay"
                          className="absolute w-24 h-24 object-cover rounded-xl"
                          style={{
                            ...positionToStyle(p.position),
                            opacity: p.opacity / 100,
                          }}
                        />
                      ))}
                    </div>

                    {/* Play/pause button */}
                    <button
                      type="button"
                      data-ocid="video_editor.toggle"
                      onClick={togglePlay}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto"
                      style={{
                        background: "rgba(194,24,91,0.85)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Time display + change video */}
                  <div
                    className="flex items-center justify-between px-4 py-2"
                    style={{ background: "rgba(255,240,245,0.95)" }}
                  >
                    <span
                      className="text-xs font-mono"
                      style={{ color: "#C2185B" }}
                    >
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#7B2FBE" }}
                    >
                      {playbackSpeed}× speed
                    </span>
                    <button
                      type="button"
                      data-ocid="video_editor.edit_button"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{
                        background: "rgba(194,24,91,0.1)",
                        color: "#C2185B",
                      }}
                    >
                      Change
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoImport}
                    />
                  </div>
                </div>

                {/* ── Tab bar ── */}
                <div
                  className="rounded-2xl mb-3 overflow-hidden"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 12px rgba(255,105,180,0.1)",
                  }}
                >
                  <div
                    className="flex overflow-x-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {TABS.map((tab) => {
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          data-ocid={`video_editor.${tab.id}_tab`}
                          onClick={() => setActiveTab(tab.id)}
                          className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 transition-all"
                          style={{
                            borderBottom: active
                              ? "2px solid #C2185B"
                              : "2px solid transparent",
                            background: active
                              ? "rgba(194,24,91,0.06)"
                              : "transparent",
                          }}
                        >
                          <span className="text-lg leading-none">
                            {tab.icon}
                          </span>
                          <span
                            className="text-xs font-semibold whitespace-nowrap"
                            style={{ color: active ? "#C2185B" : "#aaa" }}
                          >
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Tab panels ── */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: "white",
                      boxShadow: "0 2px 12px rgba(255,105,180,0.1)",
                    }}
                  >
                    {/* ── TRIM ── */}
                    {activeTab === "trim" && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Scissors
                            className="w-5 h-5"
                            style={{ color: "#C2185B" }}
                          />
                          <h3
                            className="font-bold"
                            style={{ color: "#C2185B" }}
                          >
                            Trim Video
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#888" }}
                              >
                                Start Time
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#C2185B" }}
                              >
                                {formatTime(trimStart)}
                              </span>
                            </div>
                            <Slider
                              data-ocid="video_editor.trim_start_input"
                              value={[trimStart]}
                              min={0}
                              max={Math.max(duration - 1, 1)}
                              step={0.1}
                              onValueChange={([v]) => setTrimStart(v)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#888" }}
                              >
                                End Time
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#C2185B" }}
                              >
                                {formatTime(trimEnd)}
                              </span>
                            </div>
                            <Slider
                              data-ocid="video_editor.trim_end_input"
                              value={[trimEnd]}
                              min={Math.min(trimStart + 1, duration)}
                              max={Math.max(duration, 1)}
                              step={0.1}
                              onValueChange={([v]) => setTrimEnd(v)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div
                          className="rounded-xl p-3 text-center"
                          style={{ background: "rgba(194,24,91,0.06)" }}
                        >
                          <p className="text-xs" style={{ color: "#888" }}>
                            Duration:{" "}
                            <span
                              className="font-bold"
                              style={{ color: "#C2185B" }}
                            >
                              {formatTime(trimEnd - trimStart)}
                            </span>
                          </p>
                        </div>
                        <Button
                          data-ocid="video_editor.trim_submit_button"
                          className="w-full rounded-xl font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg,#C2185B,#880E4F)",
                            color: "white",
                          }}
                          onClick={() => {
                            if (videoRef.current)
                              videoRef.current.currentTime = trimStart;
                            toast.success(
                              `Trim set: ${formatTime(trimStart)} → ${formatTime(trimEnd)}`,
                            );
                          }}
                        >
                          ✂️ Apply Trim
                        </Button>
                      </div>
                    )}

                    {/* ── FILTERS ── */}
                    {activeTab === "filters" && (
                      <div>
                        <p
                          className="text-xs font-bold mb-3"
                          style={{ color: "#C2185B" }}
                        >
                          🎨 Video Filters
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {VIDEO_FILTERS.map((f) => (
                            <button
                              key={f.name}
                              type="button"
                              data-ocid={`video_editor.filter_${f.name.toLowerCase().replace(/[^a-z0-9]/g, "")}_button`}
                              onClick={() => setSelectedFilter(f.css)}
                              className="py-3 rounded-xl text-xs font-semibold transition-all"
                              style={{
                                border:
                                  selectedFilter === f.css
                                    ? "2px solid #C2185B"
                                    : "2px solid transparent",
                                background:
                                  selectedFilter === f.css
                                    ? "rgba(194,24,91,0.12)"
                                    : "rgba(0,0,0,0.03)",
                                color:
                                  selectedFilter === f.css ? "#C2185B" : "#555",
                              }}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── MUSIC ── */}
                    {activeTab === "music" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Music
                            className="w-5 h-5"
                            style={{ color: "#C2185B" }}
                          />
                          <h3
                            className="font-bold"
                            style={{ color: "#C2185B" }}
                          >
                            Background Music
                          </h3>
                        </div>

                        {/* Upload song */}
                        <input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={handleMusicImport}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          data-ocid="video_editor.music_upload_button"
                          onClick={() => audioInputRef.current?.click()}
                          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#FF69B4,#C2185B)",
                            color: "white",
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Upload Song
                        </motion.button>

                        {/* Song name + preview */}
                        <div
                          className="rounded-xl p-3 flex items-center gap-3"
                          style={{ background: "rgba(194,24,91,0.06)" }}
                        >
                          <span className="text-2xl">🎵</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-bold truncate"
                              style={{ color: "#333" }}
                            >
                              {musicName}
                            </p>
                            <p className="text-xs" style={{ color: "#aaa" }}>
                              Audio track
                            </p>
                          </div>
                          {musicSrc && (
                            <button
                              type="button"
                              data-ocid="video_editor.music_toggle"
                              onClick={toggleMusicPreview}
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "#C2185B" }}
                            >
                              {musicPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Volume sliders */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#888" }}
                              >
                                Video Volume
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#C2185B" }}
                              >
                                {videoVolume}%
                              </span>
                            </div>
                            <Slider
                              data-ocid="video_editor.video_volume_input"
                              value={[videoVolume]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([v]) => setVideoVolume(v)}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#888" }}
                              >
                                Music Volume
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#C2185B" }}
                              >
                                {musicVolume}%
                              </span>
                            </div>
                            <Slider
                              data-ocid="video_editor.music_volume_input"
                              value={[musicVolume]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([v]) => setMusicVolume(v)}
                            />
                          </div>
                        </div>

                        {/* Genre chips */}
                        <div>
                          <p
                            className="text-xs font-semibold mb-2"
                            style={{ color: "#888" }}
                          >
                            Browse by Category
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {MUSIC_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                data-ocid={`video_editor.music_${cat.toLowerCase()}_tab`}
                                onClick={() =>
                                  toast("Upload your own music above 🎵", {
                                    icon: "💡",
                                  })
                                }
                                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                                style={{
                                  background: "rgba(194,24,91,0.1)",
                                  color: "#C2185B",
                                  border: "1px solid rgba(194,24,91,0.2)",
                                }}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── TEXT ── */}
                    {activeTab === "text" && (
                      <div className="space-y-3">
                        <p
                          className="text-xs font-bold mb-1"
                          style={{ color: "#C2185B" }}
                        >
                          ✍️ Text Overlay
                        </p>

                        <Input
                          data-ocid="video_editor.text_input"
                          placeholder="Type your text..."
                          value={textDraft.value}
                          onChange={(e) =>
                            setTextDraft((prev) => ({
                              ...prev,
                              value: e.target.value,
                            }))
                          }
                          className="rounded-xl border-pink-200 text-sm"
                        />

                        {/* Font family */}
                        <div>
                          <p
                            className="text-xs font-semibold mb-1.5"
                            style={{ color: "#888" }}
                          >
                            Font
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {FONT_FAMILIES.map((f) => (
                              <button
                                key={f.value}
                                type="button"
                                data-ocid={`video_editor.font_${f.label.toLowerCase()}_button`}
                                onClick={() =>
                                  setTextDraft((prev) => ({
                                    ...prev,
                                    fontFamily: f.value,
                                  }))
                                }
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                  fontFamily: f.value,
                                  border:
                                    textDraft.fontFamily === f.value
                                      ? "2px solid #C2185B"
                                      : "2px solid #eee",
                                  color:
                                    textDraft.fontFamily === f.value
                                      ? "#C2185B"
                                      : "#555",
                                  background:
                                    textDraft.fontFamily === f.value
                                      ? "rgba(194,24,91,0.06)"
                                      : "#fafafa",
                                }}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Font size */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#888" }}
                            >
                              Font Size
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: "#C2185B" }}
                            >
                              {textDraft.fontSize}px
                            </span>
                          </div>
                          <Slider
                            data-ocid="video_editor.font_size_input"
                            value={[textDraft.fontSize]}
                            min={12}
                            max={72}
                            step={2}
                            onValueChange={([v]) =>
                              setTextDraft((prev) => ({ ...prev, fontSize: v }))
                            }
                          />
                        </div>

                        {/* Text color */}
                        <div>
                          <p
                            className="text-xs font-semibold mb-1.5"
                            style={{ color: "#888" }}
                          >
                            Color
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {TEXT_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                data-ocid="video_editor.text_color_button"
                                onClick={() =>
                                  setTextDraft((prev) => ({
                                    ...prev,
                                    color: c,
                                  }))
                                }
                                className="w-8 h-8 rounded-full transition-transform"
                                style={{
                                  background: c,
                                  border:
                                    textDraft.color === c
                                      ? "3px solid #C2185B"
                                      : "2px solid #eee",
                                  transform:
                                    textDraft.color === c
                                      ? "scale(1.2)"
                                      : "scale(1)",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Bold / Italic */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="video_editor.text_bold_toggle"
                            onClick={() =>
                              setTextDraft((prev) => ({
                                ...prev,
                                bold: !prev.bold,
                              }))
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{
                              background: textDraft.bold
                                ? "#C2185B"
                                : "rgba(194,24,91,0.08)",
                              color: textDraft.bold ? "white" : "#C2185B",
                            }}
                          >
                            <Bold className="w-4 h-4" /> Bold
                          </button>
                          <button
                            type="button"
                            data-ocid="video_editor.text_italic_toggle"
                            onClick={() =>
                              setTextDraft((prev) => ({
                                ...prev,
                                italic: !prev.italic,
                              }))
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{
                              background: textDraft.italic
                                ? "#C2185B"
                                : "rgba(194,24,91,0.08)",
                              color: textDraft.italic ? "white" : "#C2185B",
                            }}
                          >
                            <Italic className="w-4 h-4" /> Italic
                          </button>
                        </div>

                        {/* Position grid */}
                        <div>
                          <p
                            className="text-xs font-semibold mb-1.5"
                            style={{ color: "#888" }}
                          >
                            Position
                          </p>
                          <div className="grid grid-cols-3 gap-1.5 w-36">
                            {POSITION_GRID.map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                data-ocid="video_editor.text_position_button"
                                onClick={() =>
                                  setTextDraft((prev) => ({
                                    ...prev,
                                    position: pos,
                                  }))
                                }
                                className="h-9 rounded-lg transition-all"
                                style={{
                                  background:
                                    textDraft.position === pos
                                      ? "#C2185B"
                                      : "rgba(194,24,91,0.1)",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Add text button */}
                        <Button
                          data-ocid="video_editor.text_submit_button"
                          className="w-full rounded-xl font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg,#FF69B4,#C2185B)",
                            color: "white",
                          }}
                          onClick={addTextOverlay}
                        >
                          + Add Text to Video
                        </Button>

                        {/* Active text list */}
                        {overlayTexts.length > 0 && (
                          <div>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: "#888" }}
                            >
                              Added Texts
                            </p>
                            <div className="space-y-1.5">
                              {overlayTexts.map((t, i) => (
                                <div
                                  key={t.id}
                                  data-ocid={`video_editor.text.item.${i + 1}`}
                                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                                  style={{ background: "rgba(194,24,91,0.06)" }}
                                >
                                  <span
                                    className="flex-1 text-sm truncate"
                                    style={{
                                      color: t.color,
                                      fontFamily: t.fontFamily,
                                      fontWeight: t.bold ? "bold" : "normal",
                                    }}
                                  >
                                    {t.value}
                                  </span>
                                  <button
                                    type="button"
                                    data-ocid={`video_editor.text_delete_button.${i + 1}`}
                                    onClick={() => removeText(t.id)}
                                    className="text-xs px-2 py-0.5 rounded-lg"
                                    style={{
                                      background: "rgba(194,24,91,0.15)",
                                      color: "#C2185B",
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── STICKERS ── */}
                    {activeTab === "stickers" && (
                      <div className="space-y-3">
                        <p
                          className="text-xs font-bold mb-1"
                          style={{ color: "#C2185B" }}
                        >
                          😍 Sticker Overlays
                        </p>

                        {/* Category tabs */}
                        <div
                          className="flex gap-2 overflow-x-auto pb-1"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {(
                            Object.keys(STICKER_CATEGORIES) as StickerCategory[]
                          ).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              data-ocid={`video_editor.sticker_${cat}_tab`}
                              onClick={() => setActiveStickersCategory(cat)}
                              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
                              style={{
                                background:
                                  activeStickersCategory === cat
                                    ? "#C2185B"
                                    : "rgba(194,24,91,0.08)",
                                color:
                                  activeStickersCategory === cat
                                    ? "white"
                                    : "#C2185B",
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Emoji grid */}
                        <div className="grid grid-cols-5 gap-2">
                          {STICKER_CATEGORIES[activeStickersCategory].map(
                            (emoji, i) => (
                              <motion.button
                                key={`${activeStickersCategory}-${emoji}`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                data-ocid={`video_editor.sticker.item.${i + 1}`}
                                onClick={() => {
                                  setOverlayStickers((prev) => [
                                    ...prev,
                                    {
                                      id: Date.now(),
                                      emoji,
                                      position: "center",
                                    },
                                  ]);
                                  toast.success(`${emoji} added!`);
                                }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                style={{ background: "rgba(194,24,91,0.06)" }}
                              >
                                {emoji}
                              </motion.button>
                            ),
                          )}
                        </div>

                        {/* Active stickers */}
                        {overlayStickers.length > 0 && (
                          <div>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: "#888" }}
                            >
                              Added Stickers ({overlayStickers.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {overlayStickers.map((s, i) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  data-ocid={`video_editor.sticker_delete_button.${i + 1}`}
                                  onClick={() => removeSticker(s.id)}
                                  className="text-2xl w-10 h-10 rounded-full flex items-center justify-center relative"
                                  style={{ background: "rgba(194,24,91,0.1)" }}
                                  title="Tap to remove"
                                >
                                  {s.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── PHOTOS ── */}
                    {activeTab === "photos" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Image
                            className="w-5 h-5"
                            style={{ color: "#C2185B" }}
                          />
                          <h3
                            className="font-bold"
                            style={{ color: "#C2185B" }}
                          >
                            Photo Overlays
                          </h3>
                        </div>

                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoImport}
                        />

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          data-ocid="video_editor.photo_upload_button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#FF69B4,#C2185B)",
                            color: "white",
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Import Photos
                        </motion.button>

                        {/* Opacity & position */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#888" }}
                            >
                              Photo Opacity
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: "#C2185B" }}
                            >
                              {photoOpacity}%
                            </span>
                          </div>
                          <Slider
                            data-ocid="video_editor.photo_opacity_input"
                            value={[photoOpacity]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={([v]) => setPhotoOpacity(v)}
                          />
                        </div>

                        <div>
                          <p
                            className="text-xs font-semibold mb-1.5"
                            style={{ color: "#888" }}
                          >
                            Position
                          </p>
                          <div className="grid grid-cols-3 gap-1.5 w-36">
                            {POSITION_GRID.map((pos) => (
                              <button
                                key={pos}
                                type="button"
                                data-ocid="video_editor.photo_position_button"
                                onClick={() => setPhotoPosition(pos)}
                                className="h-9 rounded-lg transition-all"
                                style={{
                                  background:
                                    photoPosition === pos
                                      ? "#C2185B"
                                      : "rgba(194,24,91,0.1)",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Photo thumbnails */}
                        {overlayPhotos.length > 0 ? (
                          <div>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: "#888" }}
                            >
                              Added Photos
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {overlayPhotos.map((p, i) => (
                                <div
                                  key={p.id}
                                  data-ocid={`video_editor.photo.item.${i + 1}`}
                                  className="relative"
                                >
                                  <img
                                    src={p.src}
                                    alt={`overlay ${i + 1}`}
                                    className="w-16 h-16 object-cover rounded-xl"
                                    style={{ opacity: p.opacity / 100 }}
                                  />
                                  <button
                                    type="button"
                                    data-ocid={`video_editor.photo_delete_button.${i + 1}`}
                                    onClick={() => removePhoto(p.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                                    style={{ background: "#C2185B" }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div
                            data-ocid="video_editor.photos.empty_state"
                            className="rounded-xl p-6 text-center"
                            style={{ background: "rgba(194,24,91,0.04)" }}
                          >
                            <span className="text-3xl">🖼️</span>
                            <p
                              className="text-xs mt-2"
                              style={{ color: "#aaa" }}
                            >
                              No photos added yet
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── SPEED ── */}
                    {activeTab === "speed" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap
                            className="w-5 h-5"
                            style={{ color: "#C2185B" }}
                          />
                          <h3
                            className="font-bold"
                            style={{ color: "#C2185B" }}
                          >
                            Playback Speed
                          </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {SPEED_OPTIONS.map((s) => (
                            <motion.button
                              key={s.value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              data-ocid={`video_editor.speed_${s.label.replace(".", "").replace("×", "x")}_button`}
                              onClick={() => setPlaybackSpeed(s.value)}
                              className="py-3 rounded-xl text-sm font-bold transition-all"
                              style={{
                                background:
                                  playbackSpeed === s.value
                                    ? "linear-gradient(135deg,#FF69B4,#C2185B)"
                                    : "rgba(194,24,91,0.08)",
                                color:
                                  playbackSpeed === s.value
                                    ? "white"
                                    : "#C2185B",
                                boxShadow:
                                  playbackSpeed === s.value
                                    ? "0 4px 12px rgba(194,24,91,0.3)"
                                    : "none",
                              }}
                            >
                              {s.label}
                            </motion.button>
                          ))}
                        </div>
                        <div
                          className="rounded-xl p-4 text-center"
                          style={{
                            background:
                              "linear-gradient(135deg,rgba(123,47,190,0.08),rgba(194,24,91,0.08))",
                          }}
                        >
                          <p
                            className="text-2xl font-black"
                            style={{ color: "#C2185B" }}
                          >
                            {playbackSpeed}×
                          </p>
                          <p className="text-xs" style={{ color: "#888" }}>
                            Current Speed
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Save button (sticky bottom) ── */}
      {videoSrc && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-safe"
          style={{
            background: "rgba(255,240,245,0.97)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,105,180,0.2)",
            boxShadow: "0 -4px 20px rgba(255,105,180,0.15)",
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
            paddingTop: "12px",
          }}
        >
          <div className="max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              data-ocid="video_editor.save_button"
              onClick={handleSaveVideo}
              className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white"
              style={{
                background: "linear-gradient(135deg,#7B2FBE 0%,#C2185B 100%)",
                boxShadow: "0 4px 20px rgba(123,47,190,0.4)",
              }}
            >
              <Save className="w-5 h-5" />💾 Save Video
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── Footer branding ── */}
      <footer
        className="text-center py-4 pb-28 text-xs"
        style={{ color: "rgba(194,24,91,0.4)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "rgba(194,24,91,0.6)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
