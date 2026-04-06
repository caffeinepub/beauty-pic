import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  loadGallery,
  saveToGallery as savePhotoToGallery,
} from "@/utils/gallery";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  Crown,
  Download,
  Images,
  Italic,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab =
  | "beauty"
  | "filters"
  | "adjust"
  | "text"
  | "stickers"
  | "frames";
type StickerCategory = "love" | "nature" | "stars" | "beauty" | "fun" | "food";

interface FilterValues {
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: number;
  sepia: number;
  saturate: number;
}

interface BeautyValues {
  smooth: number;
  whitening: number;
  glow: number;
  eyeEnhance: number;
  blemishFix: number;
}

interface TextOverlay {
  id: number;
  type: "text" | "sticker";
  value: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

interface TextDraft {
  value: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100,
  contrast: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
};

const DEFAULT_BEAUTY: BeautyValues = {
  smooth: 0,
  whitening: 0,
  glow: 0,
  eyeEnhance: 0,
  blemishFix: 0,
};

const DEFAULT_TEXT_DRAFT: TextDraft = {
  value: "",
  fontFamily: "Figtree",
  fontSize: 24,
  color: "#FF69B4",
  bold: false,
  italic: false,
};

const FONT_FAMILIES = [
  { label: "Figtree", value: "Figtree" },
  { label: "Playfair", value: "PlayfairDisplay" },
  { label: "Parisienne", value: "Parisienne" },
  { label: "DM Sans", value: "DMSans" },
  { label: "Mono", value: "JetBrainsMono" },
];

const TEXT_COLORS = [
  "#FF69B4",
  "#FF0000",
  "#FFFFFF",
  "#000000",
  "#FFD700",
  "#9B59B6",
  "#2ECC71",
  "#3498DB",
  "#FF6B35",
  "#FF1493",
];

const FILTER_PRESETS = [
  { name: "Normal", filter: "", colors: ["#f8f8f8", "#e8e8e8"] },
  {
    name: "Glamour",
    filter: "brightness(1.1) contrast(1.05) saturate(1.3)",
    colors: ["#FFB6C1", "#FF69B4"],
  },
  {
    name: "Rose Gold",
    filter: "sepia(0.3) saturate(1.4) brightness(1.1) hue-rotate(-15deg)",
    colors: ["#B76E79", "#FFB6C1"],
  },
  {
    name: "Cinematic",
    filter: "contrast(1.2) brightness(0.9) saturate(0.8)",
    colors: ["#1a1a2e", "#16213e"],
  },
  {
    name: "Vintage",
    filter: "sepia(0.5) contrast(1.1) brightness(0.95)",
    colors: ["#8B4513", "#DEB887"],
  },
  {
    name: "Vivid",
    filter: "saturate(1.8) contrast(1.1)",
    colors: ["#FF4500", "#FFD700"],
  },
  {
    name: "Cool",
    filter: "hue-rotate(15deg) saturate(0.9) brightness(1.05)",
    colors: ["#4FC3F7", "#0288D1"],
  },
  {
    name: "Warm",
    filter: "sepia(0.2) saturate(1.3) brightness(1.05)",
    colors: ["#FF8C00", "#FFD700"],
  },
  {
    name: "Noir",
    filter: "grayscale(1) contrast(1.2)",
    colors: ["#333", "#888"],
  },
  {
    name: "Sunset",
    filter: "sepia(0.4) saturate(1.5) hue-rotate(-20deg) brightness(1.1)",
    colors: ["#FF6B35", "#FF1493"],
  },
  {
    name: "Dreamy",
    filter: "brightness(1.15) contrast(0.9) saturate(1.2) blur(0.3px)",
    colors: ["#E1BEE7", "#CE93D8"],
  },
];

const FRAMES = [
  { name: "None", style: {} },
  {
    name: "Pink Love",
    style: {
      border: "4px solid #FF69B4",
      borderRadius: "16px",
      boxShadow: "0 0 20px rgba(255,105,180,0.6)",
    },
  },
  {
    name: "Gold Glam",
    style: {
      border: "4px solid #FFD700",
      borderRadius: "8px",
      boxShadow: "0 0 20px rgba(255,215,0,0.5)",
    },
  },
  {
    name: "White Classic",
    style: {
      border: "8px solid white",
      borderRadius: "4px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },
  },
  {
    name: "Purple Dream",
    style: {
      border: "4px solid #9B59B6",
      borderRadius: "24px",
      boxShadow: "0 0 25px rgba(155,89,182,0.6)",
    },
  },
  {
    name: "Rose Glow",
    style: {
      border: "6px solid #C2185B",
      borderRadius: "50% 20% 50% 20%",
      boxShadow: "0 0 30px rgba(194,24,91,0.4)",
    },
  },
  {
    name: "Rainbow",
    style: {
      border: "4px solid transparent",
      borderRadius: "16px",
      background:
        "linear-gradient(white,white) padding-box, linear-gradient(45deg,#FF6B35,#FFD700,#2ECC71,#3498DB,#9B59B6) border-box",
    },
  },
  {
    name: "Vintage Brown",
    style: { border: "8px solid #8B4513", borderRadius: "2px" },
  },
  {
    name: "Neon Pink",
    style: {
      border: "3px solid #FF1493",
      boxShadow: "0 0 15px #FF1493,inset 0 0 15px rgba(255,20,147,0.1)",
      borderRadius: "8px",
    },
  },
  {
    name: "Dark Elite",
    style: {
      border: "6px solid #1a1a1a",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    },
  },
  {
    name: "Silver Shine",
    style: {
      border: "4px solid #C0C0C0",
      borderRadius: "8px",
      boxShadow: "0 0 20px rgba(192,192,192,0.4)",
    },
  },
  {
    name: "Teal Glow",
    style: {
      border: "4px solid #1ABC9C",
      borderRadius: "16px",
      boxShadow: "0 0 20px rgba(26,188,156,0.5)",
    },
  },
];

const STICKER_DATA: Record<StickerCategory, string[]> = {
  love: [
    "❤️",
    "💕",
    "💖",
    "💗",
    "💘",
    "💝",
    "💞",
    "💓",
    "💟",
    "💌",
    "😍",
    "🥰",
    "😘",
    "💋",
    "👄",
    "💑",
    "👫",
    "💏",
    "🫶",
    "💍",
  ],
  nature: [
    "🌸",
    "🌺",
    "🌻",
    "🌹",
    "🌷",
    "🍀",
    "🌿",
    "🍃",
    "🌱",
    "🌲",
    "🌳",
    "🌴",
    "🦋",
    "🌈",
    "⭐",
    "🌟",
    "💫",
    "✨",
    "🌙",
    "☀️",
  ],
  stars: [
    "⭐",
    "🌟",
    "💫",
    "✨",
    "🌠",
    "🎇",
    "🎆",
    "⚡",
    "🔮",
    "🪄",
    "👑",
    "💎",
    "🏆",
    "🥇",
    "🎖️",
    "🌙",
    "☀️",
    "🌤️",
    "⛅",
    "🌊",
  ],
  beauty: [
    "💄",
    "💅",
    "👗",
    "👠",
    "👒",
    "🪞",
    "💍",
    "👛",
    "💎",
    "🧴",
    "🌸",
    "🌺",
    "💋",
    "💆",
    "🧖",
    "💇",
    "🧘",
    "🛁",
    "🕯️",
    "🪷",
  ],
  fun: [
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎀",
    "🎭",
    "🎪",
    "🎠",
    "🎡",
    "🎢",
    "🎯",
    "🎮",
    "🕹️",
    "🎲",
    "🃏",
    "🎸",
    "🎶",
    "🎵",
    "🎤",
    "🎬",
  ],
  food: [
    "🍓",
    "🍒",
    "🍑",
    "🍊",
    "🍋",
    "🍉",
    "🍇",
    "🫐",
    "🍌",
    "🍍",
    "🥭",
    "🍎",
    "🍐",
    "🍏",
    "🫒",
    "🥑",
    "🌽",
    "🥕",
    "🌶️",
    "🫙",
  ],
};

const STICKER_CATEGORIES: {
  key: StickerCategory;
  label: string;
  emoji: string;
}[] = [
  { key: "love", label: "Love", emoji: "💕" },
  { key: "nature", label: "Nature", emoji: "🌿" },
  { key: "stars", label: "Stars", emoji: "⭐" },
  { key: "beauty", label: "Beauty", emoji: "💄" },
  { key: "fun", label: "Fun", emoji: "🎉" },
  { key: "food", label: "Food", emoji: "🍓" },
];

const TAB_ITEMS: { key: ActiveTab; label: string; emoji: string }[] = [
  { key: "beauty", label: "Beauty", emoji: "🌸" },
  { key: "filters", label: "Filters", emoji: "🎨" },
  { key: "adjust", label: "Adjust", emoji: "⚙️" },
  { key: "text", label: "Text", emoji: "✍️" },
  { key: "stickers", label: "Stickers", emoji: "😍" },
  { key: "frames", label: "Frames", emoji: "🖼️" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAdjustFilter(f: FilterValues): string {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia / 100}) saturate(${f.saturate}%)`;
}

function buildBeautyFilter(b: BeautyValues): string {
  const parts: string[] = [];
  const totalBrightness = 1 + b.whitening * 0.003 + b.glow * 0.004;
  const totalContrast = 1 - b.glow * 0.002 - b.eyeEnhance * -0.01;
  const totalSaturate = 1 - b.whitening * 0.003;
  const totalBlur = b.smooth * 0.03 + b.blemishFix * 0.03;
  if (totalBrightness !== 1)
    parts.push(`brightness(${totalBrightness.toFixed(3)})`);
  if (totalContrast !== 1) parts.push(`contrast(${totalContrast.toFixed(3)})`);
  if (totalSaturate !== 1) parts.push(`saturate(${totalSaturate.toFixed(3)})`);
  if (totalBlur > 0) parts.push(`blur(${totalBlur.toFixed(2)}px)`);
  return parts.join(" ");
}

function buildCombinedFilter(
  f: FilterValues,
  b: BeautyValues,
  presetFilter: string,
): string {
  const parts = [buildAdjustFilter(f), buildBeautyFilter(b), presetFilter]
    .filter(Boolean)
    .join(" ");
  return parts || "none";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditorPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [beautyFilters, setBeautyFilters] =
    useState<BeautyValues>(DEFAULT_BEAUTY);
  const [activePreset, setActivePreset] = useState<string>("Normal");
  const [presetCssFilter, setPresetCssFilter] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("beauty");
  const [selectedFrame, setSelectedFrame] = useState<number>(0);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [nextId, setNextId] = useState(0);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [textDraft, setTextDraft] = useState<TextDraft>(DEFAULT_TEXT_DRAFT);
  const [activeStickerCat, setActiveStickerCat] =
    useState<StickerCategory>("love");

  // ── File upload ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFilters(DEFAULT_FILTERS);
    setBeautyFilters(DEFAULT_BEAUTY);
    setOverlays([]);
    setSelectedFrame(0);
    setActivePreset("Normal");
    setPresetCssFilter("");
  };

  const handleLoadFromGallery = () => {
    const gallery = loadGallery();
    if (gallery.length === 0) {
      toast.error("Gallery is empty. Capture a photo first!");
      return;
    }
    setImageUrl(gallery[0].dataUrl);
    setFilters(DEFAULT_FILTERS);
    setBeautyFilters(DEFAULT_BEAUTY);
    setOverlays([]);
    setSelectedFrame(0);
    setActivePreset("Normal");
    setPresetCssFilter("");
    toast.success("Latest photo loaded from gallery!");
  };

  // ── Overlay dragging ──
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null || !imageAreaRef.current) return;
    const rect = imageAreaRef.current.getBoundingClientRect();
    const x = Math.max(
      5,
      Math.min(95, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      5,
      Math.min(95, ((e.clientY - rect.top) / rect.height) * 100),
    );
    setOverlays((prev) =>
      prev.map((o) => (o.id === draggingId ? { ...o, x, y } : o)),
    );
  };

  const handlePointerUp = () => setDraggingId(null);

  // ── Text overlay ──
  const handleAddText = () => {
    if (!textDraft.value.trim()) return;
    const id = nextId;
    setNextId((n) => n + 1);
    setOverlays((prev) => [
      ...prev,
      {
        id,
        type: "text",
        value: textDraft.value.trim(),
        x: 50,
        y: 50,
        fontFamily: textDraft.fontFamily,
        fontSize: textDraft.fontSize,
        color: textDraft.color,
        bold: textDraft.bold,
        italic: textDraft.italic,
      },
    ]);
    setTextDraft((d) => ({ ...d, value: "" }));
  };

  // ── Sticker overlay ──
  const handleAddSticker = (emoji: string) => {
    const id = nextId;
    setNextId((n) => n + 1);
    setOverlays((prev) => [
      ...prev,
      {
        id,
        type: "sticker",
        value: emoji,
        x: Math.random() * 60 + 20,
        y: Math.random() * 60 + 20,
        fontFamily: "serif",
        fontSize: 36,
        color: "",
        bold: false,
        italic: false,
      },
    ]);
  };

  // ── HD Save ──
  const handleHDSave = useCallback(() => {
    if (!imageUrl) return;
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const combinedFilter = buildCombinedFilter(
      filters,
      beautyFilters,
      presetCssFilter,
    );
    ctx.filter = combinedFilter === "none" ? "" : combinedFilter;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    for (const o of overlays) {
      const x = (o.x / 100) * canvas.width;
      const y = (o.y / 100) * canvas.height;
      if (o.type === "text") {
        const weight = o.bold ? "bold " : "";
        const style = o.italic ? "italic " : "";
        const size = Math.round((o.fontSize / 430) * canvas.width);
        ctx.font = `${style}${weight}${size}px ${o.fontFamily}, sans-serif`;
        ctx.fillStyle = o.color || "#FF69B4";
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 2;
        ctx.strokeText(o.value, x, y);
        ctx.fillText(o.value, x, y);
      } else {
        const size = Math.round(canvas.width * 0.08);
        ctx.font = `${size}px serif`;
        ctx.fillText(o.value, x, y);
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
    savePhotoToGallery(dataUrl);

    // Also trigger browser download
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `beauty-pic-hd-${Date.now()}.jpg`;
    a.click();

    toast.success("HD photo saved! 💖");
  }, [imageUrl, filters, beautyFilters, presetCssFilter, overlays]);

  // ── Cleanup blob URL ──
  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const combinedFilterStr = buildCombinedFilter(
    filters,
    beautyFilters,
    presetCssFilter,
  );
  const frameStyle = FRAMES[selectedFrame]?.style ?? {};

  // ─── Tab content renderer ─────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      // ── Beauty Tab ──
      case "beauty": {
        const beautySliders: {
          key: keyof BeautyValues;
          label: string;
          desc: string;
        }[] = [
          { key: "smooth", label: "Skin Smooth", desc: "Soften skin texture" },
          {
            key: "whitening",
            label: "Skin Whitening",
            desc: "Brighten skin tone",
          },
          { key: "glow", label: "Face Glow", desc: "Add radiant glow" },
          {
            key: "eyeEnhance",
            label: "Eye Enhance",
            desc: "Define eye contrast",
          },
          {
            key: "blemishFix",
            label: "Blemish Fix",
            desc: "Smooth imperfections",
          },
        ];
        return (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <h3 className="font-bold text-base" style={{ color: "#C2185B" }}>
                AI Beauty
              </h3>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "linear-gradient(90deg,#FF69B4,#C2185B)",
                  color: "white",
                }}
              >
                PREMIUM
              </span>
            </div>
            {beautySliders.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#C2185B" }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: "linear-gradient(90deg,#FF69B4,#9B59B6)",
                        color: "white",
                        fontSize: "9px",
                      }}
                    >
                      AI
                    </span>
                  </div>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: "#FF69B4" }}
                  >
                    {beautyFilters[s.key]}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[beautyFilters[s.key]]}
                  onValueChange={([v]) =>
                    setBeautyFilters((prev) => ({ ...prev, [s.key]: v }))
                  }
                  className="beauty-slider"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBeautyFilters(DEFAULT_BEAUTY)}
              className="text-xs mt-2 px-3 py-1 rounded-full border transition-colors"
              style={{ borderColor: "#FF69B4", color: "#C2185B" }}
            >
              Reset Beauty
            </button>
          </div>
        );
      }

      // ── Filters Tab ──
      case "filters": {
        return (
          <div className="p-4">
            <h3 className="font-bold text-sm mb-3" style={{ color: "#C2185B" }}>
              🎨 Filter Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setActivePreset(preset.name);
                    setPresetCssFilter(preset.filter);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                  style={{
                    border:
                      activePreset === preset.name
                        ? "2px solid #FF69B4"
                        : "2px solid transparent",
                    background:
                      activePreset === preset.name
                        ? "rgba(255,105,180,0.08)"
                        : "rgba(255,255,255,0.6)",
                    boxShadow:
                      activePreset === preset.name
                        ? "0 0 0 2px rgba(255,105,180,0.3)"
                        : "none",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                    }}
                  />
                  <span
                    className="text-xs font-medium text-center leading-tight"
                    style={{ color: "#444" }}
                  >
                    {preset.name}
                  </span>
                  {activePreset === preset.name && (
                    <span className="text-xs" style={{ color: "#FF69B4" }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      }

      // ── Adjust Tab ──
      case "adjust": {
        const adjustSliders: {
          key: keyof FilterValues;
          label: string;
          min: number;
          max: number;
          unit: string;
        }[] = [
          {
            key: "brightness",
            label: "☀️ Brightness",
            min: 0,
            max: 200,
            unit: "%",
          },
          { key: "contrast", label: "◑ Contrast", min: 0, max: 200, unit: "%" },
          {
            key: "saturate",
            label: "🎨 Saturation",
            min: 0,
            max: 300,
            unit: "%",
          },
          { key: "blur", label: "💫 Blur", min: 0, max: 10, unit: "px" },
          { key: "sepia", label: "🕰️ Vintage", min: 0, max: 100, unit: "%" },
        ];
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-sm mb-3" style={{ color: "#C2185B" }}>
              ⚙️ Manual Adjust
            </h3>
            {adjustSliders.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium shrink-0 w-24"
                  style={{ color: "#555" }}
                >
                  {s.label}
                </span>
                <Slider
                  min={s.min}
                  max={s.max}
                  step={1}
                  value={[filters[s.key]]}
                  onValueChange={([v]) =>
                    setFilters((prev) => ({ ...prev, [s.key]: v }))
                  }
                  className="flex-1"
                />
                <span
                  className="text-xs font-mono w-12 text-right shrink-0"
                  style={{ color: "#FF69B4" }}
                >
                  {filters[s.key]}
                  {s.unit}
                </span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs mt-2 px-3 py-1 rounded-full border transition-colors"
              style={{ borderColor: "#FF69B4", color: "#C2185B" }}
            >
              Reset Adjustments
            </button>
          </div>
        );
      }

      // ── Text Tab ──
      case "text": {
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-sm mb-1" style={{ color: "#C2185B" }}>
              ✍️ Add Text
            </h3>
            <Input
              data-ocid="editor.text_input"
              value={textDraft.value}
              onChange={(e) =>
                setTextDraft((d) => ({ ...d, value: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              placeholder="Type your text here..."
              className="rounded-xl"
              style={{ borderColor: "#FF69B4", fontSize: "16px" }}
            />

            {/* Font Family */}
            <div>
              <p
                className="text-xs font-semibold mb-1.5"
                style={{ color: "#888" }}
              >
                Font
              </p>
              <div className="flex gap-2 flex-wrap">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      setTextDraft((d) => ({ ...d, fontFamily: f.value }))
                    }
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      fontFamily: f.value,
                      background:
                        textDraft.fontFamily === f.value
                          ? "linear-gradient(90deg,#FF69B4,#C2185B)"
                          : "rgba(255,105,180,0.1)",
                      color:
                        textDraft.fontFamily === f.value ? "white" : "#C2185B",
                      border:
                        textDraft.fontFamily === f.value
                          ? "none"
                          : "1px solid rgba(255,105,180,0.3)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold w-16 shrink-0"
                style={{ color: "#888" }}
              >
                Size
              </span>
              <Slider
                min={12}
                max={72}
                step={1}
                value={[textDraft.fontSize]}
                onValueChange={([v]) =>
                  setTextDraft((d) => ({ ...d, fontSize: v }))
                }
                className="flex-1"
              />
              <span
                className="text-xs font-mono w-8 text-right"
                style={{ color: "#FF69B4" }}
              >
                {textDraft.fontSize}
              </span>
            </div>

            {/* Color swatches */}
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
                    onClick={() => setTextDraft((d) => ({ ...d, color: c }))}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      border:
                        textDraft.color === c
                          ? "3px solid #FF69B4"
                          : "2px solid rgba(0,0,0,0.15)",
                      outline:
                        textDraft.color === c ? "2px solid white" : "none",
                      outlineOffset: "1px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bold / Italic */}
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="editor.bold_toggle"
                onClick={() => setTextDraft((d) => ({ ...d, bold: !d.bold }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: textDraft.bold
                    ? "linear-gradient(90deg,#FF69B4,#C2185B)"
                    : "rgba(255,105,180,0.1)",
                  color: textDraft.bold ? "white" : "#C2185B",
                  border: textDraft.bold
                    ? "none"
                    : "1px solid rgba(255,105,180,0.3)",
                }}
              >
                <Bold className="w-4 h-4" /> Bold
              </button>
              <button
                type="button"
                data-ocid="editor.italic_toggle"
                onClick={() =>
                  setTextDraft((d) => ({ ...d, italic: !d.italic }))
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: textDraft.italic
                    ? "linear-gradient(90deg,#FF69B4,#C2185B)"
                    : "rgba(255,105,180,0.1)",
                  color: textDraft.italic ? "white" : "#C2185B",
                  border: textDraft.italic
                    ? "none"
                    : "1px solid rgba(255,105,180,0.3)",
                }}
              >
                <Italic className="w-4 h-4" /> Italic
              </button>
            </div>

            {/* Preview */}
            {textDraft.value && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,105,180,0.08)" }}
              >
                <span
                  style={{
                    fontFamily: textDraft.fontFamily,
                    fontSize: `${Math.min(textDraft.fontSize, 32)}px`,
                    color: textDraft.color,
                    fontWeight: textDraft.bold ? 700 : 400,
                    fontStyle: textDraft.italic ? "italic" : "normal",
                  }}
                >
                  {textDraft.value}
                </span>
              </div>
            )}

            <Button
              data-ocid="editor.add_text_button"
              onClick={handleAddText}
              disabled={!textDraft.value.trim()}
              className="w-full rounded-xl font-semibold"
              style={{
                background: "linear-gradient(90deg,#FF69B4,#C2185B)",
                color: "white",
                border: "none",
              }}
            >
              ✍️ Add Text to Photo
            </Button>
            <p className="text-xs text-center" style={{ color: "#aaa" }}>
              Drag text on the photo to reposition
            </p>
          </div>
        );
      }

      // ── Stickers Tab ──
      case "stickers": {
        return (
          <div className="p-4">
            <h3 className="font-bold text-sm mb-3" style={{ color: "#C2185B" }}>
              😍 Sticker Gallery
            </h3>
            {/* Category tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {STICKER_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  data-ocid={`stickers.${cat.key}.tab`}
                  onClick={() => setActiveStickerCat(cat.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all"
                  style={{
                    background:
                      activeStickerCat === cat.key
                        ? "linear-gradient(90deg,#FF69B4,#C2185B)"
                        : "rgba(255,105,180,0.1)",
                    color: activeStickerCat === cat.key ? "white" : "#C2185B",
                    border:
                      activeStickerCat === cat.key
                        ? "none"
                        : "1px solid rgba(255,105,180,0.3)",
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            {/* Emoji grid */}
            <div className="grid grid-cols-5 gap-2">
              {STICKER_DATA[activeStickerCat].map((emoji, i) => (
                <button
                  key={`${activeStickerCat}-${emoji}`}
                  type="button"
                  data-ocid={`stickers.item.${i + 1}`}
                  onClick={() => handleAddSticker(emoji)}
                  className="w-full aspect-square flex items-center justify-center text-2xl rounded-2xl transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "rgba(255,105,180,0.08)",
                    fontSize: "1.5rem",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      }

      // ── Frames Tab ──
      case "frames": {
        return (
          <div className="p-4">
            <h3 className="font-bold text-sm mb-3" style={{ color: "#C2185B" }}>
              🖼️ Photo Frames
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {FRAMES.map((frame, i) => (
                <button
                  key={frame.name}
                  type="button"
                  data-ocid={`frames.item.${i + 1}`}
                  onClick={() => setSelectedFrame(i)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all"
                  style={{
                    background:
                      selectedFrame === i
                        ? "rgba(255,105,180,0.12)"
                        : "transparent",
                    border:
                      selectedFrame === i
                        ? "2px solid #FF69B4"
                        : "2px solid transparent",
                    boxShadow:
                      selectedFrame === i
                        ? "0 0 0 2px rgba(255,105,180,0.2)"
                        : "none",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg,#f8f8f8,#e8e8e8)"
                          : "linear-gradient(135deg,#FFB6C1,#FF69B4)",
                      ...frame.style,
                    }}
                  />
                  <span
                    className="text-xs text-center leading-tight"
                    style={{ color: "#555", fontSize: "9px" }}
                  >
                    {frame.name}
                  </span>
                  {selectedFrame === i && (
                    <span style={{ color: "#FF69B4", fontSize: "10px" }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg,#FFF0F5 0%,#FFE4EE 100%)" }}
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 backdrop-blur-md border-b px-3 py-2.5"
        style={{
          background: "rgba(255,240,245,0.92)",
          borderColor: "rgba(255,105,180,0.2)",
          boxShadow: "0 2px 16px rgba(255,105,180,0.12)",
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            type="button"
            data-ocid="editor.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-full transition"
            style={{ color: "#C2185B", background: "rgba(255,105,180,0.1)" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-lg">✨</span>
            <h1 className="text-base font-bold" style={{ color: "#C2185B" }}>
              Beauty Editor
            </h1>
            <Crown className="w-4 h-4" style={{ color: "#FFD700" }} />
          </div>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <>
                <button
                  type="button"
                  data-ocid="editor.reupload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full transition"
                  style={{
                    color: "#C2185B",
                    background: "rgba(255,105,180,0.1)",
                  }}
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-ocid="editor.save_button"
                  onClick={handleHDSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(90deg,#FF69B4,#C2185B)",
                    boxShadow: "0 2px 12px rgba(255,105,180,0.5)",
                  }}
                >
                  <Download className="w-4 h-4" /> HD Save
                </button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col pb-32">
        <div className="max-w-md mx-auto w-full flex flex-col flex-1">
          {!imageUrl ? (
            // ── Upload area ──
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <div
                className="w-full rounded-3xl border-2 border-dashed p-12 text-center"
                data-ocid="editor.dropzone"
                style={{
                  borderColor: "rgba(255,105,180,0.4)",
                  background: "rgba(255,105,180,0.04)",
                }}
              >
                <div className="flex flex-col items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(255,105,180,0.15),rgba(194,24,91,0.1))",
                    }}
                  >
                    📸
                  </div>
                  <div>
                    <p
                      className="font-bold text-lg"
                      style={{ color: "#C2185B" }}
                    >
                      Upload a Photo
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#aaa" }}>
                      Start editing your beauty shot
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      data-ocid="editor.upload_button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl font-semibold"
                      style={{
                        background: "linear-gradient(90deg,#FF69B4,#C2185B)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" /> From Device
                    </Button>
                    <Button
                      data-ocid="editor.gallery_button"
                      variant="outline"
                      onClick={handleLoadFromGallery}
                      className="rounded-xl font-semibold"
                      style={{
                        borderColor: "rgba(255,105,180,0.5)",
                        color: "#C2185B",
                      }}
                    >
                      <Images className="w-4 h-4 mr-2" /> Gallery
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Image preview ── */}
              <div
                ref={imageAreaRef}
                className="relative mx-3 mt-3 overflow-hidden select-none"
                style={{
                  height: "50vw",
                  maxHeight: "260px",
                  minHeight: "180px",
                  background: "#111",
                  borderRadius: "20px",
                  cursor: draggingId !== null ? "grabbing" : "default",
                  ...frameStyle,
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Editing"
                  crossOrigin="anonymous"
                  draggable={false}
                  className="w-full h-full object-contain"
                  style={{ filter: combinedFilterStr }}
                />

                {/* Overlays */}
                {overlays.map((o) => (
                  <div
                    key={o.id}
                    data-ocid={`editor.overlay.${o.id}`}
                    style={{
                      position: "absolute",
                      left: `${o.x}%`,
                      top: `${o.y}%`,
                      transform: "translate(-50%, -50%)",
                      cursor: "grab",
                      userSelect: "none",
                      touchAction: "none",
                      fontFamily: o.type === "text" ? o.fontFamily : "serif",
                      fontSize: o.type === "text" ? `${o.fontSize}px` : "2rem",
                      color: o.type === "text" ? o.color : "inherit",
                      fontWeight: o.bold ? 700 : 400,
                      fontStyle: o.italic ? "italic" : "normal",
                      textShadow:
                        o.type === "text"
                          ? "0 1px 4px rgba(0,0,0,0.5)"
                          : "none",
                      lineHeight: 1,
                      zIndex: 10,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, o.id)}
                    onDoubleClick={() =>
                      setOverlays((prev) => prev.filter((x) => x.id !== o.id))
                    }
                    title="Drag to move · Double-tap to remove"
                  >
                    {o.value}
                  </div>
                ))}
              </div>

              {/* Tab panel */}
              <div
                className="mx-3 mt-3 rounded-3xl overflow-hidden"
                style={{
                  background: "white",
                  boxShadow: "0 4px 24px rgba(255,105,180,0.12)",
                  minHeight: "200px",
                  maxHeight: "calc(100vh - 380px)",
                  overflowY: "auto",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Bottom Tab Bar (only when image loaded) ── */}
      {imageUrl && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20"
          style={{
            background: "rgba(255,240,245,0.97)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,105,180,0.2)",
            boxShadow: "0 -4px 20px rgba(255,105,180,0.15)",
          }}
        >
          <div className="max-w-md mx-auto flex justify-around px-1 py-2">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                data-ocid={`editor.tab.${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all min-w-0"
                style={{
                  background:
                    activeTab === tab.key
                      ? "rgba(255,105,180,0.15)"
                      : "transparent",
                  flex: "1 1 0",
                }}
              >
                <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>
                  {tab.emoji}
                </span>
                <span
                  className="text-xs font-semibold transition-colors"
                  style={{
                    color: activeTab === tab.key ? "#C2185B" : "#aaa",
                    fontSize: "9px",
                  }}
                >
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="w-1 h-1 rounded-full"
                    style={{ background: "#FF69B4" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
