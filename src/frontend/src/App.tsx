import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import CameraPage from "./pages/CameraPage";
import EditorPage from "./pages/EditorPage";
import GalleryPage from "./pages/GalleryPage";
import HomeScreen from "./pages/HomeScreen";
import InstallPage from "./pages/InstallPage";
import PassportEditorPage from "./pages/PassportEditorPage";
import SplashScreen from "./pages/SplashScreen";
import VideoEditorPage from "./pages/VideoEditorPage";

function RootLayout() {
  useEffect(() => {
    document.title = "Beauty Pic";
  }, []);
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SplashScreen,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: HomeScreen,
});

const cameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/camera",
  component: CameraPage,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: EditorPage,
});

const videoEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video-editor",
  component: VideoEditorPage,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryPage,
});

const installRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/install",
  component: InstallPage,
});

const passportEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passport-editor",
  component: PassportEditorPage,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  homeRoute,
  cameraRoute,
  editorRoute,
  videoEditorRoute,
  galleryRoute,
  installRoute,
  passportEditorRoute,
]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <SplashScreen />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
