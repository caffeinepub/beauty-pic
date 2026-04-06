# Beauty Pic - Passport Size Photo Editor

## Current State
App has: SplashScreen, HomeScreen, CameraPage, EditorPage (6 tabs: Beauty/Filters/Adjust/Text/Stickers/Frames), GalleryPage, VideoEditorPage, InstallPage.

No passport/ID photo editor exists.

## Requested Changes (Diff)

### Add
- New `/passport-editor` route and `PassportEditorPage.tsx`
- Features:
  1. **Dress overlay** — Court dress, official shirt, suit, tie options (emoji/CSS overlays on neck/shoulder area)
  2. **Background removal/change** — Solid color backgrounds: White, Blue (official), Light Blue, Red, Grey, Green, Yellow, custom color picker
  3. **Crop tool** — Crop to exact passport sizes: 35x45mm (India/UK), 2x2 inch (USA), 51x51mm, 4x4 cm, custom ratio
  4. **Size Choice** — Output size selector for standard passport formats worldwide
  5. **Multi Edit** — Edit multiple photos at once (up to 6 photos), apply same settings to all
  6. **Multi Frame** — Print-ready layouts: 1, 2, 4, 6, 8 passport photos on one sheet (A4/Letter)
  7. **Multi Background** — Try different backgrounds on all photos at once
- Card on HomeScreen

### Modify
- `App.tsx` — Add `/passport-editor` route
- `HomeScreen.tsx` — Add Passport Editor card

### Remove
- Nothing

## Implementation Plan
1. Create `PassportEditorPage.tsx`:
   - Photo import (single or multiple)
   - 7-tab panel: Dress | Background | Crop | Size | Multi Edit | Multi Frame | Enhance
   - Dress tab: overlay collar/jacket shapes as SVG/CSS on photo using absolutely positioned divs
   - Background tab: color swatches + custom color picker, applied via canvas compositing or CSS background behind transparent photo
   - Crop tab: aspect ratio presets + visual crop preview
   - Size tab: standard passport size selector
   - Multi Edit tab: import up to 6 photos, apply same filters/background to all
   - Multi Frame tab: generate printable sheet layout with N copies per page
   - Canvas-based export for final save
2. Update routing and HomeScreen
