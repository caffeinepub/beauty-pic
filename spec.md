# Beauty Pic - Premium Editor Upgrade

## Current State
- EditorPage has basic filter sliders (brightness, contrast, blur, grayscale, sepia, saturate)
- Text overlay with single fixed pink color and font
- 8 basic emoji stickers
- No frames, no font change, no text position dragging, no category-wise editing
- HomeScreen has 4 basic cards, no AI Beauty or premium branding

## Requested Changes (Diff)

### Add
- **Category-wise editing tabs** in EditorPage: Beauty, Filters, Adjust, Text, Stickers, Frames
- **AI Beauty skin tools**: Skin Smooth, Whitening, Blemish Remove, Face Glow, Eye Enhance, Lip Color — each with intensity slider
- **Premium Photo Filters** (category): Glamour, Rose Gold, Cinematic, Vintage, Vivid, Cool, Warm, Noir, Sunset, Dreamy
- **Frame selector** panel with 10+ decorative frame options (colors/patterns rendered via CSS/canvas overlay)
- **Text tool upgrades**: font family picker (5+ fonts from available fonts), font size slider, color picker (10 preset colors), text position dragging on image, bold/italic toggles
- **Emoji category picker**: Nature, Love, Stars, Beauty, Food, Travel — scrollable grid of 30+ emojis per category
- **HD Export button** that exports at full native resolution with quality=1.0
- **Premium badge / crown icon** on editor header to denote premium quality
- AI Beauty section card on HomeScreen

### Modify
- EditorPage UI: full tab-based layout with category icons at bottom, premium gradient header
- Sticker panel: expanded to category tabs with many more emojis
- HomeScreen: add AI Beauty card and update welcome message

### Remove
- Old flat filter slider section replaced by tabbed Adjust section
- Old single-row sticker row replaced by category sticker panel

## Implementation Plan
1. Rebuild EditorPage with tabbed bottom navigation (6 tabs: Beauty, Filters, Adjust, Text, Stickers, Frames)
2. Beauty tab: AI skin sliders (Smooth, Whitening, Glow, Eye, Blemish) with CSS filter approximations
3. Filters tab: visual filter cards with thumbnail previews showing named preset filters
4. Adjust tab: existing sliders (brightness, contrast, saturation, blur, etc.)
5. Text tab: input + font picker + size + color picker + bold/italic + draggable overlay on image
6. Stickers tab: category tabs (Love, Nature, Stars, Beauty, Travel, Food) with emoji grids
7. Frames tab: frame options rendered as CSS border/overlay on image preview
8. HD Save button with full resolution export
9. HomeScreen: add AI Beauty card
