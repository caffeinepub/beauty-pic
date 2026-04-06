import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MonitorSmartphone,
  Smartphone,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const steps = [
  {
    icon: "🌐",
    title: "Open in Chrome",
    description:
      "Open this website in Google Chrome browser on your Android phone.",
  },
  {
    icon: "⋮",
    title: "Tap the Menu",
    description: "Tap the 3-dot menu (⋮) in the top-right corner of Chrome.",
  },
  {
    icon: "📲",
    title: "Add to Home screen",
    description: 'Tap "Add to Home screen" or "Install app" from the menu.',
  },
  {
    icon: "✅",
    title: "Confirm Install",
    description: 'Tap "Add" or "Install" on the dialog that appears.',
  },
  {
    icon: "🎉",
    title: "Done!",
    description: "Beauty Pic icon will appear on your Android home screen!",
  },
];

export default function InstallPage() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("Beauty Pic installed! 🎉");
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3"
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            type="button"
            data-ocid="install.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-full hover:bg-pink-50 transition text-pink-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-pink-600 flex-1">
            Install App
          </h1>
          <Smartphone className="w-5 h-5 text-pink-400" />
        </div>
      </motion.header>

      <main className="flex-1 px-4 py-6 pb-12">
        <div className="max-w-md mx-auto space-y-5">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FF69B4 0%, #C2185B 100%)",
              boxShadow: "0 8px 32px rgba(255,105,180,0.3)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-36 h-36 opacity-20 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, white 0%, transparent 70%)",
                transform: "translate(20%, -20%)",
              }}
            />
            <MonitorSmartphone className="w-10 h-10 mb-3 opacity-90" />
            <h2 className="text-xl font-bold mb-2">Install Beauty Pic</h2>
            <p className="text-pink-100 text-sm">
              Add Beauty Pic to your Android home screen for a native app-like
              experience.
            </p>

            {installPrompt && !installed && (
              <Button
                data-ocid="install.install_now_button"
                onClick={handleInstall}
                className="mt-4 bg-white text-pink-600 hover:bg-pink-50 font-semibold rounded-xl shadow"
              >
                <Download className="w-4 h-4 mr-2" /> Install Now
              </Button>
            )}
            {installed && (
              <div className="mt-4 flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-5 h-5" /> Installed successfully!
              </div>
            )}
          </motion.div>

          {/* PWA Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-4 bg-pink-50 border border-pink-100"
          >
            <p className="text-sm text-pink-700 font-medium">
              💡 Beauty Pic is a PWA (Progressive Web App) — it works just like
              a real app on your Android phone, including offline support!
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">
              How to Install on Android
            </h3>
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                data-ocid={`install.step.${i + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-start gap-4 bg-white rounded-2xl p-4"
                style={{ boxShadow: "0 2px 12px rgba(255,105,180,0.1)" }}
              >
                <div className="w-11 h-11 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl shrink-0">
                  {step.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    <span className="text-pink-500 mr-1.5">Step {i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t border-pink-100">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-600 transition"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
