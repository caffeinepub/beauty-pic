import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CreditCard,
  Download,
  Film,
  Home,
  ImageIcon,
  Images,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/home" as const },
  { icon: Camera, label: "Camera", path: "/camera" as const },
  { icon: Film, label: "Video", path: "/video-editor" as const },
  { icon: CreditCard, label: "Passport", path: "/passport-editor" as const },
  { icon: Images, label: "Gallery", path: "/gallery" as const },
];

const mainCards = [
  {
    icon: Camera,
    label: "Camera",
    description: "Take beautiful photos",
    path: "/camera" as const,
    gradient: "linear-gradient(135deg,#FF69B4,#C2185B)",
    ocid: "home.camera_button",
    emoji: "📷",
  },
  {
    icon: ImageIcon,
    label: "Photo Editor",
    description: "Edit & enhance photos",
    path: "/editor" as const,
    gradient: "linear-gradient(135deg,#FF69B4,#FF1493)",
    ocid: "home.editor_button",
    emoji: "🖼️",
  },
  {
    icon: Film,
    label: "Video Editor",
    description: "Edit videos & add music",
    path: "/video-editor" as const,
    gradient: "linear-gradient(135deg,#7B2FBE,#C2185B)",
    ocid: "home.videoeditor_button",
    emoji: "🎬",
  },
  {
    icon: CreditCard,
    label: "Passport Editor",
    description: "ID & passport photo maker",
    path: "/passport-editor" as const,
    gradient: "linear-gradient(135deg,#1565C0,#7B1FA2)",
    ocid: "home.passport_button",
    emoji: "🪪",
  },
  {
    icon: Sparkles,
    label: "AI Beauty",
    description: "Smart skin & face tools",
    path: "/editor" as const,
    gradient: "linear-gradient(135deg,#9B59B6,#FF69B4)",
    ocid: "home.aibeauty_button",
    emoji: "✨",
  },
  {
    icon: Images,
    label: "Gallery",
    description: "View your saved photos",
    path: "/gallery" as const,
    gradient: "linear-gradient(135deg,#4FC3F7,#0288D1)",
    ocid: "home.gallery_button",
    emoji: "🖼",
  },
  {
    icon: Download,
    label: "Install App",
    description: "Add to home screen",
    path: "/install" as const,
    gradient: "linear-gradient(135deg,#C2185B,#880E4F)",
    ocid: "home.install_button",
    emoji: "📲",
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFF0F5 0%,#FFE4EE 100%)" }}
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 backdrop-blur-md border-b px-4 py-3"
        style={{
          background: "rgba(255,240,245,0.92)",
          borderColor: "rgba(255,105,180,0.2)",
          boxShadow: "0 2px 16px rgba(255,105,180,0.1)",
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <img
            src="/assets/generated/beauty-pic-logo-transparent.dim_256x256.png"
            alt="Beauty Pic"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#C2185B" }}>
              Beauty Pic
            </h1>
            <p className="text-xs" style={{ color: "rgba(194,24,91,0.7)" }}>
              Premium AI Photo & Video Editor
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                repeatDelay: 2,
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#FF69B4" }} />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 py-5 pb-24">
        <div className="max-w-md mx-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl p-6 mb-6 text-white overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg,#FF69B4 0%,#C2185B 60%,#880E4F 100%)",
              boxShadow: "0 8px 32px rgba(255,105,180,0.35)",
              minHeight: "140px",
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle,white 0%,transparent 70%)",
                transform: "translate(30%,-30%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle,white 0%,transparent 70%)",
                transform: "translate(-30%,30%)",
              }}
            />
            {/* Sparkle animation */}
            <motion.div
              className="absolute top-4 right-10 text-white/60 pointer-events-none"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute top-10 right-20 text-white/40 pointer-events-none"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.7, 1, 0.7] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3.2,
                delay: 0.8,
              }}
            >
              ✨
            </motion.div>

            <h2 className="text-2xl font-bold mb-1 relative z-10">
              Hello, Beautiful! ✨
            </h2>
            <p className="text-pink-100 text-sm relative z-10">
              Your premium AI photo &amp; video editor ✨
            </p>
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                ✦ AI Beauty
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                🎬 Video
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                🪪 Passport
              </span>
            </div>
          </motion.div>

          {/* Card Grid */}
          <div className="grid grid-cols-2 gap-4">
            {mainCards.map((card, i) => (
              <motion.button
                key={card.ocid}
                type="button"
                data-ocid={card.ocid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate({ to: card.path })}
                className="group flex flex-col items-center justify-center gap-3 rounded-3xl p-5 bg-white text-left"
                style={{
                  boxShadow: "0 4px 20px rgba(255,105,180,0.12)",
                  border: "1px solid rgba(255,105,180,0.08)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-pink"
                  style={{ background: card.gradient }}
                >
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: "#C2185B" }}>
                    {card.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
                    {card.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* ── Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 px-2 py-2"
        style={{
          background: "rgba(255,240,245,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,105,180,0.2)",
          boxShadow: "0 -4px 20px rgba(255,105,180,0.1)",
        }}
      >
        <div className="max-w-md mx-auto flex justify-around">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                data-ocid={`nav.${item.label.toLowerCase()}_link`}
                onClick={() => navigate({ to: item.path })}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200"
                style={{
                  background: active ? "rgba(255,105,180,0.12)" : "transparent",
                }}
              >
                <item.icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? "#C2185B" : "#aaa" }}
                />
                <span
                  className="text-xs font-medium transition-colors"
                  style={{ color: active ? "#C2185B" : "#aaa" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
