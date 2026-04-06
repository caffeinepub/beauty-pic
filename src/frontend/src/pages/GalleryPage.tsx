import { Button } from "@/components/ui/button";
import { type GalleryPhoto, loadGallery, saveGallery } from "@/utils/gallery";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Images, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function GalleryPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    setPhotos(loadGallery());
  }, []);

  const deletePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveGallery(updated);
      toast.success("Photo deleted");
      return updated;
    });
    if (selected?.id === id) setSelected(null);
  };

  const downloadPhoto = (dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `beauty-pic-${Date.now()}.jpg`;
    a.click();
    toast.success("Photo downloaded! 📥");
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
            data-ocid="gallery.back_button"
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-full hover:bg-pink-50 transition text-pink-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-pink-600 flex-1">Gallery</h1>
          <span className="text-sm text-muted-foreground">
            {photos.length} photos
          </span>
        </div>
      </motion.header>

      <main className="flex-1 px-4 py-4 pb-8">
        <div className="max-w-md mx-auto">
          {photos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
              data-ocid="gallery.empty_state"
            >
              <div className="w-20 h-20 rounded-3xl bg-pink-50 flex items-center justify-center">
                <Images className="w-10 h-10 text-pink-300" />
              </div>
              <p className="text-muted-foreground text-center">
                No photos yet.
                <br />
                Capture your first beauty shot!
              </p>
              <Button
                data-ocid="gallery.go_camera_button"
                onClick={() => navigate({ to: "/camera" })}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
              >
                Open Camera
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  data-ocid={`gallery.item.${i + 1}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group rounded-2xl overflow-hidden bg-pink-50 aspect-square cursor-pointer"
                  style={{ boxShadow: "0 4px 16px rgba(255,105,180,0.15)" }}
                  onClick={() => setSelected(photo)}
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Gallery item ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    data-ocid={`gallery.delete_button.${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Full Screen Viewer */}
      <AnimatePresence>
        {selected && (
          <motion.dialog
            open
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 w-full h-full max-w-none max-h-none m-0 p-6 border-none"
            data-ocid="gallery.modal"
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={selected.dataUrl}
              alt="Full screen view"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain"
            />
            <div className="flex gap-4 mt-6">
              <Button
                data-ocid="gallery.download_button"
                onClick={() => downloadPhoto(selected.dataUrl)}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button
                data-ocid="gallery.close_button"
                variant="outline"
                onClick={() => setSelected(null)}
                className="border-white/20 text-white bg-white/10 hover:bg-white/20 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" /> Close
              </Button>
            </div>
          </motion.dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
