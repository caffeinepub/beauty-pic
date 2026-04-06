export interface GalleryPhoto {
  id: string;
  dataUrl: string;
}

const GALLERY_KEY = "beauty_pic_gallery";

function generateId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadGallery(): GalleryPhoto[] {
  const raw = localStorage.getItem(GALLERY_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as (string | GalleryPhoto)[];
  return parsed.map((item, i) => {
    if (typeof item === "string") {
      return { id: `legacy-${i}-${item.slice(-8)}`, dataUrl: item };
    }
    return item;
  });
}

export function saveToGallery(dataUrl: string): void {
  const existing = loadGallery();
  existing.unshift({ id: generateId(), dataUrl });
  localStorage.setItem(GALLERY_KEY, JSON.stringify(existing));
}

export function saveGallery(photos: GalleryPhoto[]): void {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(photos));
}
