import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { saveToGallery } from "@/utils/gallery";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  FlipHorizontal,
  RefreshCw,
  Save,
  Square,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Filter = "normal" | "smooth" | "bright" | "whitening";

const FILTER_STYLES: Record<Filter, string> = {
  normal: "none",
  smooth: "blur(0.5px) brightness(1.1)",
  bright: "brightness(1.3)",
  whitening: "brightness(1.2) contrast(0.9) saturate(0.8)",
};

const FILTERS: { id: Filter; label: string; emoji: string }[] = [
  { id: "normal", label: "Normal", emoji: "✨" },
  { id: "smooth", label: "Smooth", emoji: "💆" },
  { id: "bright", label: "Bright", emoji: "☀️" },
  { id: "whitening", label: "Whitening", emoji: "🌸" },
];

export default function CameraPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("normal");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    isActive,
    isLoading,
    isSupported,
    error,
    switchCamera,
  } = useCamera({
    facingMode: "user",
    width: 1280,
    height: 720,
    quality: 0.92,
    format: "image/jpeg",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToGallery = () => {
    if (capturedPhoto) {
      saveToGallery(capturedPhoto);
      toast.success("Photo saved to gallery! 💖");
      setCapturedPhoto(null);
    }
  };

  const handleStartRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;
    const chunks: Blob[] = [];
    recordedChunksRef.current = chunks;
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beauty-pic-video-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Video saved! 🎥");
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  if (isSupported === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <p className="text-center text-muted-foreground">
          Camera is not supported in this browser.
        </p>
        <Button
          onClick={() => navigate({ to: "/home" })}
          className="mt-4"
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm z-10">
        <button
          type="button"
          data-ocid="camera.back_button"
          onClick={() => {
            stopCamera();
            navigate({ to: "/home" });
          }}
          className="text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold">Camera</h2>
        <button
          type="button"
          data-ocid="camera.switch_button"
          onClick={() => switchCamera()}
          disabled={isLoading || !isActive}
          className="text-white p-2 rounded-full hover:bg-white/10 transition disabled:opacity-40"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Preview */}
      <div className="relative flex-1 overflow-hidden">
        <div className="w-full aspect-[3/4] bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ filter: FILTER_STYLES[activeFilter] }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50"
              data-ocid="camera.loading_state"
            >
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {error && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6"
              data-ocid="camera.error_state"
            >
              <p className="text-white text-center mb-4">{error.message}</p>
              <Button
                onClick={() => startCamera()}
                variant="outline"
                className="bg-white/10 text-white border-white/30"
              >
                Retry
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500/90 text-white text-sm px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Recording...
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-sm overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              data-ocid={`camera.${f.id}_filter`}
              onClick={() => setActiveFilter(f.id)}
              className={`flex flex-col items-center gap-1 min-w-[60px] px-3 py-2 rounded-2xl transition-all ${
                activeFilter === f.id
                  ? "bg-pink-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="text-lg">{f.emoji}</span>
              <span className="text-xs font-medium">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-around px-8 py-5 bg-black">
          <button
            type="button"
            data-ocid="camera.record_toggle"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!isActive}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all disabled:opacity-40 ${
              isRecording
                ? "bg-red-500 border-red-400"
                : "bg-white/10 border-white/30 hover:bg-white/20"
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            type="button"
            data-ocid="camera.capture_button"
            onClick={handleCapture}
            disabled={!isActive || isLoading}
            className="w-20 h-20 rounded-full bg-white border-4 border-pink-400 flex items-center justify-center shadow-pink-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <Camera className="w-8 h-8 text-pink-500" />
          </button>

          <div className="w-12 h-12" />
        </div>
      </div>

      {/* Captured Photo Preview */}
      <AnimatePresence>
        {capturedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6"
            data-ocid="camera.preview_modal"
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={capturedPhoto}
              alt="Captured"
              className="max-w-full max-h-[60vh] rounded-3xl object-contain shadow-pink-lg"
            />
            <div className="flex gap-4 mt-6">
              <Button
                data-ocid="camera.discard_button"
                variant="outline"
                onClick={() => setCapturedPhoto(null)}
                className="border-white/30 text-white bg-white/10 hover:bg-white/20"
              >
                Retake
              </Button>
              <Button
                data-ocid="camera.save_button"
                onClick={handleSaveToGallery}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" /> Save to Gallery
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
