import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  loadGallery,
  saveToGallery as savePhotoToGallery,
} from "@/utils/gallery";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Images, Save, Type, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type FilterKey =
  | "brightness"
  | "contrast"
  | "blur"
  | "grayscale"
  | "sepia"
  | "saturate";

interface FilterValues {
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: number;
  sepia: number;
  saturate: number;
}

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100,
  contrast: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
};

const STICKERS = ["❤️", "⭐", "✨", "🌸", "💋", "👑", "💎", "🦋"];

function buildFilter(f: FilterValues): string {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) saturate(${f.saturate}%)`;
}

export default function EditorPage() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [textInput, setTextInput] = useState("");
  const [overlays, setOverlays] = useState<
    {
      type: "text" | "sticker";
      value: string;
      x: number;
      y: number;
      id: number;
    }[]
  >([]);
  const [nextId, setNextId] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFilters(DEFAULT_FILTERS);
    setOverlays([]);
  };

  const handleLoadFromGallery = () => {
    const gallery = loadGallery();
    if (gallery.length === 0) {
      toast.error("Gallery is empty. Capture a photo first!");
      return;
    }
    setImageUrl(gallery[0].dataUrl);
    setFilters(DEFAULT_FILTERS);
    setOverlays([]);
    toast.success("Latest photo loaded from gallery!");
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    const id = nextId;
    setNextId((n) => n + 1);
    setOverlays((prev) => [
      ...prev,
      { type: "text", value: textInput.trim(), x: 50, y: 50, id },
    ]);
    setTextInput("");
  };

  const handleAddSticker = (sticker: string) => {
    const id = nextId;
    setNextId((n) => n + 1);
    setOverlays((prev) => [
      ...prev,
      {
        type: "sticker",
        value: sticker,
        x: Math.random() * 60 + 20,
        y: Math.random() * 60 + 20,
        id,
      },
    ]);
  };

  const handleSaveToGallery = useCallback(() => {
    if (!imageUrl) return;
    const canvas = document.createElement("canvas");
    const img = imgRef.current;
    if (!img) return;
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = buildFilter(filters);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    for (const o of overlays) {
      const x = (o.x / 100) * canvas.width;
      const y = (o.y / 100) * canvas.height;
      if (o.type === "text") {
        ctx.font = `bold ${Math.round(canvas.width * 0.06)}px Figtree, sans-serif`;
        ctx.fillStyle = "#FF69B4";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.strokeText(o.value, x, y);
        ctx.fillText(o.value, x, y);
      } else {
        ctx.font = `${Math.round(canvas.width * 0.08)}px serif`;
        ctx.fillText(o.value, x, y);
      }
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    savePhotoToGallery(dataUrl);
    toast.success("Edited photo saved to gallery! 💖");
  }, [imageUrl, filters, overlays]);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const filterConfigs: {
    key: FilterKey;
    label: string;
    min: number;
    max: number;
    default: number;
  }[] = [
    { key: "brightness", label: "Brightness", min: 0, max: 200, default: 100 },
    { key: "contrast", label: "Contrast", min: 0, max: 200, default: 100 },
    { key: "blur", label: "Blur", min: 0, max: 10, default: 0 },
    { key: "grayscale", label: "Grayscale", min: 0, max: 100, default: 0 },
    { key: "sepia", label: "Vintage", min: 0, max: 100, default: 0 },
    { key: "saturate", label: "Vivid", min: 0, max: 300, default: 100 },
  ];

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
            data-ocid="editor.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-full hover:bg-pink-50 transition text-pink-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-pink-600 flex-1">
            Photo Editor
          </h1>
          {imageUrl && (
            <Button
              data-ocid="editor.save_button"
              size="sm"
              onClick={handleSaveToGallery}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
            >
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
          )}
        </div>
      </motion.header>

      <main className="flex-1 px-4 py-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {/* Upload Area */}
          {!imageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50 p-10 text-center"
              data-ocid="editor.dropzone"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-pink-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Upload a Photo
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose from device or gallery
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    data-ocid="editor.upload_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
                  >
                    <Upload className="w-4 h-4 mr-2" /> From Device
                  </Button>
                  <Button
                    data-ocid="editor.gallery_button"
                    variant="outline"
                    onClick={handleLoadFromGallery}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl"
                  >
                    <Images className="w-4 h-4 mr-2" /> Gallery
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </motion.div>
          ) : (
            <>
              {/* Image Preview with overlays */}
              <div
                className="relative rounded-3xl overflow-hidden bg-black"
                style={{ boxShadow: "0 8px 32px rgba(255,105,180,0.2)" }}
              >
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Editing"
                  className="w-full object-contain"
                  style={{ filter: buildFilter(filters), maxHeight: "360px" }}
                  crossOrigin="anonymous"
                />
                {overlays.map((o) => (
                  <button
                    type="button"
                    key={o.id}
                    className="absolute cursor-pointer select-none bg-transparent border-none p-0"
                    style={{
                      left: `${o.x}%`,
                      top: `${o.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: o.type === "sticker" ? "2rem" : "1.1rem",
                      color: o.type === "text" ? "#FF69B4" : "inherit",
                      fontWeight: "bold",
                      textShadow: o.type === "text" ? "0 0 4px white" : "none",
                      userSelect: "none",
                    }}
                    onClick={() =>
                      setOverlays((prev) =>
                        prev.filter((item) => item.id !== o.id),
                      )
                    }
                    title="Click to remove"
                  >
                    {o.value}
                  </button>
                ))}
                <button
                  type="button"
                  data-ocid="editor.reupload_button"
                  onClick={() => {
                    setImageUrl(null);
                    setOverlays([]);
                    setFilters(DEFAULT_FILTERS);
                  }}
                  className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Sliders */}
              <div
                className="bg-white rounded-3xl p-4 space-y-3"
                style={{ boxShadow: "0 4px 20px rgba(255,105,180,0.1)" }}
              >
                <p className="text-sm font-semibold text-foreground">
                  Adjustments
                </p>
                {filterConfigs.map((fc) => (
                  <div key={fc.key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {fc.label}
                    </span>
                    <Slider
                      min={fc.min}
                      max={fc.max}
                      step={1}
                      value={[filters[fc.key]]}
                      onValueChange={([v]) =>
                        setFilters((prev) => ({ ...prev, [fc.key]: v }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {filters[fc.key]}
                    </span>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-pink-400 hover:text-pink-600 hover:bg-pink-50 text-xs"
                >
                  Reset
                </Button>
              </div>

              {/* Text Overlay */}
              <div
                className="bg-white rounded-3xl p-4"
                style={{ boxShadow: "0 4px 20px rgba(255,105,180,0.1)" }}
              >
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-pink-400" /> Add Text
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="editor.text_input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type something..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                    className="rounded-xl border-pink-200 focus:ring-pink-400"
                  />
                  <Button
                    data-ocid="editor.add_text_button"
                    onClick={handleAddText}
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Stickers */}
              <div
                className="bg-white rounded-3xl p-4"
                style={{ boxShadow: "0 4px 20px rgba(255,105,180,0.1)" }}
              >
                <p className="text-sm font-semibold text-foreground mb-3">
                  Stickers
                </p>
                <div className="flex gap-3 flex-wrap">
                  {STICKERS.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      data-ocid={`editor.sticker.${i + 1}`}
                      onClick={() => handleAddSticker(s)}
                      className="w-12 h-12 rounded-2xl bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
