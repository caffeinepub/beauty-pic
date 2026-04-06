import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Download,
  Home,
  ImageIcon,
  Images,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, label: "Home", path: "/home" as const },
  { icon: Camera, label: "Camera", path: "/camera" as const },
  { icon: Images, label: "Gallery", path: "/gallery" as const },
  { icon: Download, label: "Install", path: "/install" as const },
];

const mainCards = [
  {
    icon: Camera,
    label: "Camera",
    description: "Take beautiful photos",
    path: "/camera" as const,
    gradient: "from-pink-400 to-pink-500",
    ocid: "home.camera_button",
  },
  {
    icon: ImageIcon,
    label: "Photo Editor",
    description: "Edit & enhance photos",
    path: "/editor" as const,
    gradient: "from-pink-300 to-pink-400",
    ocid: "home.editor_button",
  },
  {
    icon: Images,
    label: "Gallery",
    description: "View your saved photos",
    path: "/gallery" as const,
    gradient: "from-pink-200 to-pink-300",
    ocid: "home.gallery_button",
  },
  {
    icon: Download,
    label: "Install App",
    description: "Add to home screen",
    path: "/install" as const,
    gradient: "from-pink-400 to-pink-700",
    ocid: "home.install_button",
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #FFF5F8 0%, #FFC0CB22 100%)",
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3"
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <img
            src="/assets/generated/beauty-pic-logo-transparent.dim_256x256.png"
            alt="Beauty Pic"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-pink-600">Beauty Pic</h1>
            <p className="text-xs text-pink-400">Camera &amp; Photo Editor</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-md mx-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl p-6 mb-6 text-white overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, #FF69B4 0%, #C2185B 100%)",
              boxShadow: "0 8px 32px rgba(255, 105, 180, 0.3)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, white 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            <h2 className="text-2xl font-bold mb-1">Hello, Beautiful! ✨</h2>
            <p className="text-pink-100 text-sm">
              Ready to capture your best moments?
            </p>
          </motion.div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {mainCards.map((card, i) => (
              <motion.button
                key={card.path}
                type="button"
                data-ocid={card.ocid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate({ to: card.path })}
                className="group flex flex-col items-center justify-center gap-3 rounded-3xl p-6 bg-white text-left"
                style={{ boxShadow: "0 4px 20px rgba(255, 105, 180, 0.15)" }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-pink`}
                >
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">
                    {card.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 px-2 py-2 z-20"
        style={{ boxShadow: "0 -4px 20px rgba(255,105,180,0.1)" }}
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
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                  active ? "bg-pink-50" : "hover:bg-pink-50/50"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-pink-500" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? "text-pink-500" : "text-muted-foreground"
                  }`}
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
