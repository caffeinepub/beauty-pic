import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, Download, Printer, Upload, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab =
  | "dress"
  | "background"
  | "crop"
  | "size"
  | "frame"
  | "multibg"
  | "enhance";

type DressType =
  | "none"
  | "court"
  | "official"
  | "suit"
  | "shirt"
  | "traditional";

type FrameCount = 1 | 2 | 4 | 6 | 8 | 12;

interface CropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface EnhanceValues {
  brightness: number;
  contrast: number;
  sharpen: boolean;
  faceSmooth: number;
}

interface SizeOption {
  id: string;
  flag: string;
  country: string;
  dimensions: string;
  ratio: number;
}

interface CropPreset {
  id: string;
  name: string;
  ratio: number;
  info: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DRESS_OPTIONS: { id: DressType; label: string; emoji: string }[] = [
  { id: "none", label: "None", emoji: "✕" },
  { id: "court", label: "Court", emoji: "⚖️" },
  { id: "official", label: "Official", emoji: "👔" },
  { id: "suit", label: "Suit", emoji: "🤵" },
  { id: "shirt", label: "Shirt", emoji: "👕" },
  { id: "traditional", label: "Traditional", emoji: "🥻" },
];

const BG_COLORS = [
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "offblue", label: "Official Blue", color: "#4169E1" },
  { id: "lightblue", label: "Light Blue", color: "#ADD8E6" },
  { id: "skyblue", label: "Sky Blue", color: "#87CEEB" },
  { id: "lightgrey", label: "Light Grey", color: "#D3D3D3" },
  { id: "red", label: "Red", color: "#FF4444" },
  { id: "green", label: "Green", color: "#28A745" },
  { id: "yellow", label: "Yellow", color: "#FFD700" },
  { id: "cream", label: "Cream", color: "#FFF8DC" },
  { id: "navy", label: "Navy", color: "#001F5B" },
];

const CROP_PRESETS: CropPreset[] = [
  { id: "india", name: "India Passport", ratio: 35 / 45, info: "35×45mm" },
  { id: "usa", name: "USA Passport", ratio: 1, info: "2×2 inch" },
  { id: "uk", name: "UK Passport", ratio: 35 / 45, info: "35×45mm" },
  { id: "eu", name: "EU/Schengen", ratio: 35 / 45, info: "35×45mm" },
  { id: "4x4", name: "4×4 cm", ratio: 1, info: "Square ID" },
  { id: "3x4", name: "3.5×4.5 cm", ratio: 7 / 9, info: "Standard" },
  { id: "custom", name: "Custom", ratio: 0, info: "Free crop" },
];

const SIZE_OPTIONS: SizeOption[] = [
  {
    id: "in",
    flag: "🇮🇳",
    country: "India",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  { id: "us", flag: "🇺🇸", country: "USA", dimensions: "51×51mm", ratio: 1 },
  {
    id: "gb",
    flag: "🇬🇧",
    country: "UK",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "eu",
    flag: "🇪🇺",
    country: "Europe",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "ae",
    flag: "🇦🇪",
    country: "UAE",
    dimensions: "40×60mm",
    ratio: 40 / 60,
  },
  {
    id: "sa",
    flag: "🇸🇦",
    country: "Saudi Arabia",
    dimensions: "40×60mm",
    ratio: 40 / 60,
  },
  {
    id: "ca",
    flag: "🇨🇦",
    country: "Canada",
    dimensions: "50×70mm",
    ratio: 50 / 70,
  },
  {
    id: "au",
    flag: "🇦🇺",
    country: "Australia",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "jp",
    flag: "🇯🇵",
    country: "Japan",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "bd",
    flag: "🇧🇩",
    country: "Bangladesh",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "pk",
    flag: "🇵🇰",
    country: "Pakistan",
    dimensions: "35×45mm",
    ratio: 35 / 45,
  },
  {
    id: "id",
    flag: "💳",
    country: "ID Card",
    dimensions: "54×86mm",
    ratio: 54 / 86,
  },
];

const FRAME_OPTIONS: {
  count: FrameCount;
  label: string;
  grid: [number, number];
}[] = [
  { count: 1, label: "1 Photo", grid: [1, 1] },
  { count: 2, label: "2 Photos", grid: [1, 2] },
  { count: 4, label: "4 Photos", grid: [2, 2] },
  { count: 6, label: "6 Photos", grid: [2, 3] },
  { count: 8, label: "8 Photos", grid: [2, 4] },
  { count: 12, label: "12 Photos", grid: [3, 4] },
];

const MULTI_BG_COLORS = [
  { id: "white", color: "#FFFFFF", label: "White" },
  { id: "blue", color: "#4169E1", label: "Blue" },
  { id: "lightblue", color: "#ADD8E6", label: "Lt. Blue" },
  { id: "red", color: "#FF4444", label: "Red" },
  { id: "grey", color: "#D3D3D3", label: "Grey" },
  { id: "green", color: "#28A745", label: "Green" },
];

const DEFAULT_ENHANCE: EnhanceValues = {
  brightness: 100,
  contrast: 100,
  sharpen: false,
  faceSmooth: 0,
};

// ─── Dress Overlay Component ─────────────────────────────────────────────────

function DressOverlay({ type }: { type: DressType }) {
  if (type === "none") return null;

  const styles: Record<Exclude<DressType, "none">, React.CSSProperties> = {
    court: {
      background: "linear-gradient(180deg, #1a1a1a 0%, #000 60%)",
      borderTop: "8px solid #fff",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      zIndex: 5,
      borderRadius: "0 0 8px 8px",
    },
    official: {
      background: "linear-gradient(180deg, #f5f0e8 0%, #e8e0d0 100%)",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      zIndex: 5,
      borderRadius: "0 0 8px 8px",
    },
    suit: {
      background: "linear-gradient(180deg, #2c2c3e 0%, #1a1a2e 100%)",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      zIndex: 5,
      borderRadius: "0 0 8px 8px",
    },
    shirt: {
      background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
      border: "2px solid #e0e0e0",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      zIndex: 5,
      borderRadius: "0 0 8px 8px",
    },
    traditional: {
      background:
        "linear-gradient(135deg, #FF6B35 0%, #C2185B 50%, #28A745 100%)",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      zIndex: 5,
      borderRadius: "0 0 8px 8px",
      opacity: 0.92,
    },
  };

  return (
    <div style={styles[type as Exclude<DressType, "none">]}>
      {type === "court" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "12px",
            background: "#fff",
            borderRadius: "0 0 4px 4px",
          }}
        />
      )}
      {type === "official" && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "4px",
            height: "70%",
            background: "#333",
            borderRadius: "2px",
          }}
        />
      )}
      {type === "suit" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "25%",
            width: "50%",
            height: "20%",
            background: "linear-gradient(180deg, #fff 0%, #e0e0e0 100%)",
            clipPath: "polygon(20% 0%, 80% 0%, 60% 100%, 40% 100%)",
          }}
        />
      )}
      {type === "shirt" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "35%",
            width: "30%",
            height: "14px",
            background: "#e0e0e0",
            clipPath: "polygon(0% 0%, 100% 0%, 65% 100%, 35% 100%)",
          }}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PassportEditorPage() {
  const navigate = useNavigate();

  // Core state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dress");

  // Dress
  const [selectedDress, setSelectedDress] = useState<DressType>("none");

  // Background
  const [bgColor, setBgColor] = useState("#87CEEB");
  const [customBgColor, setCustomBgColor] = useState("#87CEEB");

  // Crop
  const [selectedCropPreset, setSelectedCropPreset] = useState<string>("india");
  const [cropRatio, setCropRatio] = useState(35 / 45);
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    zoom: 100,
    offsetX: 50,
    offsetY: 20,
  });

  // Size
  const [selectedSize, setSelectedSize] = useState<string>("in");

  // Frame
  const [frameCount, setFrameCount] = useState<FrameCount>(4);

  // Multi-bg
  const [activeBg, setActiveBg] = useState<string>("lightblue");

  // Enhance
  const [enhance, setEnhance] = useState<EnhanceValues>(DEFAULT_ENHANCE);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Derived CSS filter string ─────────────────────────────────────────────
  const filterStyle = [
    `brightness(${enhance.brightness}%)`,
    `contrast(${enhance.contrast + (enhance.sharpen ? 15 : 0)}%)`,
    enhance.faceSmooth > 0 ? `blur(${enhance.faceSmooth * 0.02}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // ── Photo Import ──────────────────────────────────────────────────────────
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  }, []);

  // ── Save / Export ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!photoUrl) {
      toast.error("Please import a photo first");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = SIZE_OPTIONS.find((s) => s.id === selectedSize);
    const aspectRatio = size ? size.ratio : 35 / 45;
    const W = 350;
    const H = Math.round(W / aspectRatio);
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Draw photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = photoUrl;
    });

    const scale = cropSettings.zoom / 100;
    const iW = W * scale;
    const iH = H * scale;
    const dx = ((W - iW) * cropSettings.offsetX) / 100;
    const dy = ((H - iH) * cropSettings.offsetY) / 100;
    ctx.drawImage(img, dx, dy, iW, iH);

    // Draw dress overlay
    if (selectedDress !== "none") {
      const dressH = H * 0.38;
      const dressY = H - dressH;
      const dressColors: Record<Exclude<DressType, "none">, string> = {
        court: "#111",
        official: "#f5f0e8",
        suit: "#2c2c3e",
        shirt: "#ffffff",
        traditional: "#FF6B35",
      };
      ctx.fillStyle = dressColors[selectedDress as Exclude<DressType, "none">];
      ctx.fillRect(0, dressY, W, dressH);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `passport-photo-${Date.now()}.jpg`;
    link.click();
    toast.success("Passport photo saved! 📸");
  }, [photoUrl, bgColor, selectedDress, selectedSize, cropSettings]);

  // ── Print Sheet ───────────────────────────────────────────────────────────
  const handlePrintSheet = useCallback(() => {
    if (!photoUrl) {
      toast.error("Please import a photo first");
      return;
    }
    toast.success(`Preparing ${frameCount} photo print sheet...`);
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const frame = FRAME_OPTIONS.find((f) => f.count === frameCount);
    const [cols, rows] = frame ? frame.grid : [2, 2];
    const cells = Array.from({ length: cols * rows })
      .map(
        () =>
          `<div style="width:90px;height:115px;overflow:hidden;border:1px solid #ccc;display:inline-block;margin:3px;"><img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;"/></div>`,
      )
      .join("");
    printWin.document.write(
      `<html><body style="background:#fff;padding:16px;text-align:center;"><div style="display:grid;grid-template-columns:repeat(${cols},96px);gap:6px;justify-content:center;">${cells}</div><script>window.onload=()=>window.print();<\/script></body></html>`,
    );
    printWin.document.close();
  }, [photoUrl, frameCount]);

  // ── Download All (Multi BG) ───────────────────────────────────────────────
  const handleDownloadAll = useCallback(async () => {
    if (!photoUrl) {
      toast.error("Please import a photo first");
      return;
    }
    toast.success("Downloading 6 background variants...");
    for (const bg of MULTI_BG_COLORS) {
      const canvas = document.createElement("canvas");
      canvas.width = 350;
      canvas.height = 450;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, 350, 450);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = photoUrl;
      });
      ctx.drawImage(img, 0, 0, 350, 450);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.download = `passport-${bg.id}-${Date.now()}.jpg`;
      link.click();
      await new Promise((r) => setTimeout(r, 200));
    }
  }, [photoUrl]);

  // ── Crop preset select ────────────────────────────────────────────────────
  const handleCropPresetSelect = (preset: CropPreset) => {
    setSelectedCropPreset(preset.id);
    if (preset.id !== "custom") setCropRatio(preset.ratio);
  };

  // ── Size select ───────────────────────────────────────────────────────────
  const handleSizeSelect = (size: SizeOption) => {
    setSelectedSize(size.id);
    setCropRatio(size.ratio);
  };

  // ── Preview aspect ratio ──────────────────────────────────────────────────
  const previewWidth = 160;
  const previewHeight =
    cropRatio > 0 ? Math.round(previewWidth / cropRatio) : 200;

  // ── Tabs config ──────────────────────────────────────────────────────────
  const TABS: { id: ActiveTab; label: string; emoji: string }[] = [
    { id: "dress", label: "Dress", emoji: "👗" },
    { id: "background", label: "Background", emoji: "🎨" },
    { id: "crop", label: "Crop", emoji: "✂️" },
    { id: "size", label: "Size", emoji: "📐" },
    { id: "frame", label: "Multi Frame", emoji: "🖼️" },
    { id: "multibg", label: "Multi BG", emoji: "🌈" },
    { id: "enhance", label: "Enhance", emoji: "✨" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFF0F5 0%,#FFE4EE 100%)" }}
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-30 px-4 py-3 border-b"
        style={{
          background: "rgba(255,240,245,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,105,180,0.2)",
          boxShadow: "0 2px 16px rgba(255,105,180,0.1)",
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            type="button"
            data-ocid="passport.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "rgba(194,24,91,0.08)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#C2185B" }} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">🪪</span>
            <h1 className="text-lg font-bold" style={{ color: "#C2185B" }}>
              Passport Editor
            </h1>
            <div
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-xs font-bold"
              style={{ background: "linear-gradient(90deg,#FFD700,#FFA500)" }}
            >
              <Crown className="w-3 h-3" />
              <span>PRO</span>
            </div>
          </div>
          <button
            type="button"
            data-ocid="passport.save_button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-sm font-bold shadow-lg transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg,#C2185B,#FF69B4)" }}
          >
            <Download className="w-4 h-4" />
            Save
          </button>
        </div>
      </motion.header>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-6">
        <div className="max-w-md mx-auto px-4">
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* ── Photo Import or Preview ── */}
          <AnimatePresence mode="wait">
            {!photoUrl ? (
              <motion.div
                key="import"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 mb-4"
              >
                <div
                  className="rounded-3xl p-8 flex flex-col items-center gap-4 border-2 border-dashed"
                  style={{
                    borderColor: "rgba(255,105,180,0.4)",
                    background: "rgba(255,240,245,0.7)",
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#FF69B4,#C2185B)",
                    }}
                  >
                    <span className="text-4xl">🪪</span>
                  </div>
                  <div className="text-center">
                    <p
                      className="font-bold text-base"
                      style={{ color: "#C2185B" }}
                    >
                      Import Your Photo
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#aaa" }}>
                      Import your photo to create passport size prints
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImport}
                    data-ocid="passport.upload_button"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    data-ocid="passport.import_button"
                    className="px-8 py-3 rounded-2xl text-white font-bold"
                    style={{
                      background: "linear-gradient(135deg,#C2185B,#FF69B4)",
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Photo
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-4 mb-4 flex flex-col items-center"
              >
                {/* Preview frame */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative overflow-hidden rounded-2xl shadow-xl"
                    style={{
                      width: previewWidth,
                      height: previewHeight,
                      background: bgColor,
                      border: "3px solid rgba(194,24,91,0.3)",
                      maxHeight: 240,
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt="Passport preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: `${cropSettings.offsetX}% ${cropSettings.offsetY}%`,
                        transform: `scale(${cropSettings.zoom / 100})`,
                        transformOrigin: "center",
                        filter: filterStyle,
                        display: "block",
                      }}
                    />
                    <DressOverlay type={selectedDress} />
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(194,24,91,0.7)" }}
                  >
                    {SIZE_OPTIONS.find((s) => s.id === selectedSize)
                      ?.dimensions ?? "35×45mm"}{" "}
                    •{" "}
                    {SIZE_OPTIONS.find((s) => s.id === selectedSize)?.country ??
                      "Standard"}
                  </p>
                  {/* Re-import button */}
                  <button
                    type="button"
                    data-ocid="passport.reimport_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      background: "rgba(194,24,91,0.1)",
                      color: "#C2185B",
                    }}
                  >
                    Change Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImport}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tab Bar ── */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            data-ocid="passport.tab"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`passport.${tab.id}_tab`}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg,#C2185B,#FF69B4)"
                      : "rgba(255,255,255,0.8)",
                  color: activeTab === tab.id ? "#fff" : "#C2185B",
                  border:
                    activeTab === tab.id
                      ? "none"
                      : "1px solid rgba(194,24,91,0.2)",
                  boxShadow:
                    activeTab === tab.id
                      ? "0 4px 12px rgba(255,105,180,0.35)"
                      : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* ── Dress Tab ── */}
              {activeTab === "dress" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    👗 Dress / Collar Overlay
                  </h2>
                  <div
                    className="flex gap-2 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {DRESS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        data-ocid={`passport.dress_${opt.id}_button`}
                        onClick={() => setSelectedDress(opt.id)}
                        className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all"
                        style={{
                          background:
                            selectedDress === opt.id
                              ? "linear-gradient(135deg,#C2185B,#FF69B4)"
                              : "rgba(255,255,255,0.9)",
                          color: selectedDress === opt.id ? "#fff" : "#C2185B",
                          border:
                            selectedDress === opt.id
                              ? "none"
                              : "1px solid rgba(194,24,91,0.2)",
                          boxShadow:
                            selectedDress === opt.id
                              ? "0 4px 12px rgba(255,105,180,0.4)"
                              : "none",
                        }}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dress Preview Panel */}
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.8)" }}
                  >
                    <p
                      className="text-sm font-semibold mb-2"
                      style={{ color: "#C2185B" }}
                    >
                      Dress Preview
                    </p>
                    {selectedDress === "none" ? (
                      <p className="text-sm" style={{ color: "#aaa" }}>
                        No dress overlay applied. Select a style above.
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div
                          className="relative rounded-xl overflow-hidden"
                          style={{ width: 60, height: 77, background: bgColor }}
                        >
                          {photoUrl && (
                            <img
                              src={photoUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <DressOverlay type={selectedDress} />
                        </div>
                        <div>
                          <p
                            className="font-bold text-sm"
                            style={{ color: "#C2185B" }}
                          >
                            {
                              DRESS_OPTIONS.find((d) => d.id === selectedDress)
                                ?.label
                            }
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#aaa" }}
                          >
                            Collar overlay applied to photo
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Background Tab ── */}
              {activeTab === "background" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    🎨 Background Color
                  </h2>
                  <div className="grid grid-cols-5 gap-3">
                    {BG_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        data-ocid={`passport.bg_${c.id}_button`}
                        onClick={() => setBgColor(c.color)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-12 h-12 rounded-2xl border-2 relative flex items-center justify-center transition-transform active:scale-95"
                          style={{
                            background: c.color,
                            borderColor:
                              bgColor === c.color
                                ? "#C2185B"
                                : "rgba(0,0,0,0.1)",
                            transform:
                              bgColor === c.color ? "scale(1.1)" : "scale(1)",
                            boxShadow:
                              bgColor === c.color
                                ? "0 0 0 3px rgba(194,24,91,0.3)"
                                : "none",
                          }}
                        >
                          {bgColor === c.color && (
                            <span className="text-base">
                              {c.color === "#FFFFFF" ||
                              c.color === "#FFF8DC" ||
                              c.color === "#D3D3D3" ||
                              c.color === "#ADD8E6" ||
                              c.color === "#87CEEB"
                                ? "✓"
                                : "✓"}
                            </span>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: "#888" }}>
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom color */}
                  <div
                    className="rounded-2xl p-4 flex items-center gap-4"
                    style={{ background: "rgba(255,255,255,0.8)" }}
                  >
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "#C2185B" }}
                      htmlFor="custom-bg-color"
                    >
                      Custom Color:
                    </label>
                    <input
                      id="custom-bg-color"
                      type="color"
                      value={customBgColor}
                      data-ocid="passport.bg_custom_input"
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        setBgColor(e.target.value);
                      }}
                      className="w-12 h-10 rounded-xl cursor-pointer border-0 p-0"
                      style={{ borderRadius: "12px" }}
                    />
                    <div
                      className="w-8 h-8 rounded-xl border"
                      style={{
                        background: bgColor,
                        borderColor: "rgba(0,0,0,0.1)",
                      }}
                    />
                    <span
                      className="text-sm font-mono"
                      style={{ color: "#888" }}
                    >
                      {bgColor}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Crop Tab ── */}
              {activeTab === "crop" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    ✂️ Crop & Aspect Ratio
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {CROP_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        data-ocid={`passport.crop_${preset.id}_button`}
                        onClick={() => handleCropPresetSelect(preset)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                        style={{
                          background:
                            selectedCropPreset === preset.id
                              ? "linear-gradient(135deg,#C2185B,#FF69B4)"
                              : "rgba(255,255,255,0.9)",
                          color:
                            selectedCropPreset === preset.id
                              ? "#fff"
                              : "#C2185B",
                          border:
                            selectedCropPreset === preset.id
                              ? "none"
                              : "1px solid rgba(194,24,91,0.15)",
                        }}
                      >
                        <div>
                          <p className="text-sm font-bold">{preset.name}</p>
                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color:
                                selectedCropPreset === preset.id
                                  ? "rgba(255,255,255,0.8)"
                                  : "#aaa",
                            }}
                          >
                            {preset.info}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Crop controls */}
                  <div
                    className="rounded-2xl p-4 space-y-4"
                    style={{ background: "rgba(255,255,255,0.8)" }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#C2185B" }}
                    >
                      Photo Position
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs w-20"
                          style={{ color: "#888" }}
                        >
                          🔍 Zoom
                        </span>
                        <Slider
                          data-ocid="passport.crop_zoom_input"
                          min={80}
                          max={200}
                          step={1}
                          value={[cropSettings.zoom]}
                          onValueChange={([v]) =>
                            setCropSettings((p) => ({ ...p, zoom: v }))
                          }
                          className="flex-1"
                        />
                        <span
                          className="text-xs w-12 text-right"
                          style={{ color: "#C2185B" }}
                        >
                          {cropSettings.zoom}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs w-20"
                          style={{ color: "#888" }}
                        >
                          ↔ X Offset
                        </span>
                        <Slider
                          data-ocid="passport.crop_x_input"
                          min={0}
                          max={100}
                          step={1}
                          value={[cropSettings.offsetX]}
                          onValueChange={([v]) =>
                            setCropSettings((p) => ({ ...p, offsetX: v }))
                          }
                          className="flex-1"
                        />
                        <span
                          className="text-xs w-12 text-right"
                          style={{ color: "#C2185B" }}
                        >
                          {cropSettings.offsetX}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs w-20"
                          style={{ color: "#888" }}
                        >
                          ↕ Y Offset
                        </span>
                        <Slider
                          data-ocid="passport.crop_y_input"
                          min={0}
                          max={100}
                          step={1}
                          value={[cropSettings.offsetY]}
                          onValueChange={([v]) =>
                            setCropSettings((p) => ({ ...p, offsetY: v }))
                          }
                          className="flex-1"
                        />
                        <span
                          className="text-xs w-12 text-right"
                          style={{ color: "#C2185B" }}
                        >
                          {cropSettings.offsetY}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Size Tab ── */}
              {activeTab === "size" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    📐 Country Size Standard
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        data-ocid={`passport.size_${size.id}_button`}
                        onClick={() => handleSizeSelect(size)}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all"
                        style={{
                          background:
                            selectedSize === size.id
                              ? "linear-gradient(135deg,#1565C0,#0D47A1)"
                              : "rgba(255,255,255,0.9)",
                          color: selectedSize === size.id ? "#fff" : "#333",
                          border:
                            selectedSize === size.id
                              ? "none"
                              : "1px solid rgba(0,0,0,0.08)",
                          boxShadow:
                            selectedSize === size.id
                              ? "0 4px 12px rgba(21,101,192,0.3)"
                              : "none",
                        }}
                      >
                        <span className="text-2xl">{size.flag}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {size.country}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color:
                                selectedSize === size.id
                                  ? "rgba(255,255,255,0.75)"
                                  : "#888",
                            }}
                          >
                            {size.dimensions}
                          </p>
                        </div>
                        {selectedSize === size.id && (
                          <span className="ml-auto text-green-300 font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Multi Frame Tab ── */}
              {activeTab === "frame" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    🖼️ Multi Frame Print Layout
                  </h2>

                  {/* Frame count selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {FRAME_OPTIONS.map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        data-ocid={`passport.frame_${opt.count}_button`}
                        onClick={() => setFrameCount(opt.count)}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl font-semibold text-sm transition-all"
                        style={{
                          background:
                            frameCount === opt.count
                              ? "linear-gradient(135deg,#C2185B,#FF69B4)"
                              : "rgba(255,255,255,0.9)",
                          color: frameCount === opt.count ? "#fff" : "#C2185B",
                          border:
                            frameCount === opt.count
                              ? "none"
                              : "1px solid rgba(194,24,91,0.2)",
                        }}
                      >
                        {/* Mini grid visual */}
                        <div
                          className="grid gap-0.5"
                          style={{
                            gridTemplateColumns: `repeat(${opt.grid[0]}, 1fr)`,
                          }}
                        >
                          {Array.from(
                            { length: opt.count },
                            (_, i) => `cell-${opt.count}-${i}`,
                          ).map((cellKey) => (
                            <div
                              key={cellKey}
                              className="rounded-sm"
                              style={{
                                width: Math.max(8, 24 / opt.grid[0]),
                                height: Math.max(10, 30 / opt.grid[1]),
                                background:
                                  frameCount === opt.count
                                    ? "rgba(255,255,255,0.5)"
                                    : "rgba(194,24,91,0.25)",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Print preview */}
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.8)" }}
                  >
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: "#C2185B" }}
                    >
                      Print Sheet Preview
                    </p>
                    <div
                      className="bg-white rounded-xl p-3 border grid gap-1.5 mx-auto"
                      style={{
                        borderColor: "rgba(0,0,0,0.1)",
                        gridTemplateColumns: `repeat(${FRAME_OPTIONS.find((f) => f.count === frameCount)?.grid[0] ?? 2}, 1fr)`,
                        maxWidth: 260,
                      }}
                    >
                      {Array.from(
                        { length: frameCount },
                        (_, i) => `preview-${frameCount}-${i}`,
                      ).map((previewKey) => (
                        <div
                          key={previewKey}
                          className="rounded overflow-hidden border relative"
                          style={{
                            aspectRatio: `${cropRatio}`,
                            borderColor: "rgba(0,0,0,0.1)",
                            background: bgColor,
                          }}
                        >
                          {photoUrl && (
                            <img
                              src={photoUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          )}
                          {!photoUrl && (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ color: "rgba(0,0,0,0.2)" }}
                            >
                              🪪
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    data-ocid="passport.print_button"
                    onClick={handlePrintSheet}
                    className="w-full py-3 rounded-2xl text-white font-bold"
                    style={{
                      background: "linear-gradient(135deg,#1565C0,#0D47A1)",
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Sheet ({frameCount} photos)
                  </Button>
                </div>
              )}

              {/* ── Multi Background Tab ── */}
              {activeTab === "multibg" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    🌈 Multi Background Variants
                  </h2>
                  <p className="text-sm" style={{ color: "#aaa" }}>
                    Preview & download your photo with 6 different backgrounds
                  </p>

                  {/* 6 variants grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {MULTI_BG_COLORS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        data-ocid={`passport.multibg_${bg.id}_button`}
                        onClick={() => {
                          setActiveBg(bg.id);
                          setBgColor(bg.color);
                        }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className="relative rounded-2xl overflow-hidden border-2 transition-all"
                          style={{
                            width: "100%",
                            aspectRatio: `${cropRatio > 0 ? cropRatio : 35 / 45}`,
                            background: bg.color,
                            borderColor:
                              activeBg === bg.id
                                ? "#C2185B"
                                : "rgba(0,0,0,0.1)",
                            boxShadow:
                              activeBg === bg.id
                                ? "0 0 0 2px rgba(194,24,91,0.3)"
                                : "none",
                          }}
                        >
                          {photoUrl && (
                            <img
                              src={photoUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          )}
                          {activeBg === bg.id && (
                            <div
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                              style={{ background: "#C2185B" }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#666" }}
                        >
                          {bg.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  <Button
                    data-ocid="passport.download_all_button"
                    onClick={handleDownloadAll}
                    className="w-full py-3 rounded-2xl text-white font-bold"
                    style={{
                      background: "linear-gradient(135deg,#28A745,#20c997)",
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All 6 Variants
                  </Button>
                </div>
              )}

              {/* ── Enhance Tab ── */}
              {activeTab === "enhance" && (
                <div className="space-y-4">
                  <h2
                    className="font-bold text-base"
                    style={{ color: "#C2185B" }}
                  >
                    ✨ Photo Enhancement
                  </h2>

                  <div
                    className="rounded-2xl p-4 space-y-4"
                    style={{ background: "rgba(255,255,255,0.8)" }}
                  >
                    {/* Brightness */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#C2185B" }}
                        >
                          ☀️ Brightness
                        </span>
                        <span className="text-sm" style={{ color: "#888" }}>
                          {enhance.brightness}%
                        </span>
                      </div>
                      <Slider
                        data-ocid="passport.brightness_input"
                        min={50}
                        max={150}
                        step={1}
                        value={[enhance.brightness]}
                        onValueChange={([v]) =>
                          setEnhance((p) => ({ ...p, brightness: v }))
                        }
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#C2185B" }}
                        >
                          🌓 Contrast
                        </span>
                        <span className="text-sm" style={{ color: "#888" }}>
                          {enhance.contrast}%
                        </span>
                      </div>
                      <Slider
                        data-ocid="passport.contrast_input"
                        min={50}
                        max={150}
                        step={1}
                        value={[enhance.contrast]}
                        onValueChange={([v]) =>
                          setEnhance((p) => ({ ...p, contrast: v }))
                        }
                      />
                    </div>

                    {/* Face Smooth */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#C2185B" }}
                        >
                          🧖 Face Smooth
                        </span>
                        <span className="text-sm" style={{ color: "#888" }}>
                          {enhance.faceSmooth}
                        </span>
                      </div>
                      <Slider
                        data-ocid="passport.smooth_input"
                        min={0}
                        max={50}
                        step={1}
                        value={[enhance.faceSmooth]}
                        onValueChange={([v]) =>
                          setEnhance((p) => ({ ...p, faceSmooth: v }))
                        }
                      />
                    </div>

                    {/* Sharpen Toggle */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#C2185B" }}
                      >
                        🔪 Sharpen
                      </span>
                      <button
                        type="button"
                        data-ocid="passport.sharpen_toggle"
                        onClick={() =>
                          setEnhance((p) => ({ ...p, sharpen: !p.sharpen }))
                        }
                        className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors"
                        style={{
                          background: enhance.sharpen
                            ? "#C2185B"
                            : "rgba(0,0,0,0.12)",
                        }}
                      >
                        <span
                          className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                          style={{
                            transform: enhance.sharpen
                              ? "translateX(26px)"
                              : "translateX(2px)",
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Auto Enhance */}
                  <Button
                    data-ocid="passport.auto_enhance_button"
                    onClick={() =>
                      setEnhance({
                        brightness: 105,
                        contrast: 108,
                        sharpen: true,
                        faceSmooth: 0,
                      })
                    }
                    className="w-full py-3 rounded-2xl text-white font-bold"
                    style={{
                      background: "linear-gradient(135deg,#9B59B6,#FF69B4)",
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto Enhance
                  </Button>

                  <Button
                    data-ocid="passport.reset_enhance_button"
                    variant="outline"
                    onClick={() => setEnhance(DEFAULT_ENHANCE)}
                    className="w-full py-2 rounded-2xl"
                    style={{
                      borderColor: "rgba(194,24,91,0.3)",
                      color: "#C2185B",
                    }}
                  >
                    Reset Enhancements
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-4 text-center">
        <p className="text-xs" style={{ color: "rgba(194,24,91,0.4)" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#C2185B" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
