import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/home" });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #FFF5F8 0%, #FFC0CB 50%, #FF69B4 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            style={{
              background:
                "radial-gradient(circle, #FF69B4 0%, transparent 70%)",
            }}
          />
          <img
            src="/assets/generated/beauty-pic-logo-transparent.dim_256x256.png"
            alt="Beauty Pic Logo"
            className="relative w-36 h-36 object-contain drop-shadow-2xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{
              color: "#fff",
              textShadow: "0 2px 12px rgba(194,24,91,0.3)",
            }}
          >
            Beauty Pic
          </h1>
          <p
            className="mt-2 text-lg"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Camera &amp; Photo Editor
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
