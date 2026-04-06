# Beauty Pic

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Splash screen with animated logo (2 second display before home)
- Home screen with Camera, Photo Editor, Gallery, and Video Editor buttons
- Camera page: access device camera via browser APIs, apply beauty filters (smooth, brightness, whitening) using Canvas, capture photos, record video
- Photo Editor page: load photos from gallery or camera, apply filters (brightness, blur, contrast, grayscale), crop, add text overlays, save
- Gallery page: display saved photos/videos in a grid layout
- Video recorder page: record video via browser MediaRecorder API, basic trim option
- APK installer info section: a dedicated page explaining how to install the web app as a PWA on Android (Add to Home Screen), with a downloadable guide and manifest/service worker setup for PWA installability
- PWA manifest and service worker so the app can be installed on Android as a home screen app (closest to APK experience on web)
- Beauty theme: pink (#FF69B4, #FFC0CB), white, soft gradients, modern Material-inspired UI
- Smooth page transitions and animations
- App icon and logo (generated image)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Generate app logo/icon image
2. Set up PWA manifest and service worker for Android installability
3. Backend: store saved photos (blob references) per session using blob-storage component
4. Frontend: Splash screen -> Home -> Camera / Photo Editor / Gallery / Video / Install Guide pages
5. Camera page using getUserMedia + Canvas filters
6. Photo editor using Canvas API with filter controls
7. Gallery grid pulling saved images
8. Install Guide page with step-by-step Android PWA install instructions
9. Pink/white beauty theme throughout
