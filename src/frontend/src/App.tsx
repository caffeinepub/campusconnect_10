import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { InstallBanner } from "./components/InstallBanner";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AppProvider, useApp } from "./context/AppContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AuthPage } from "./pages/AuthPage";
import type { LocalUserProfile } from "./types/campus";
import { getUserProfile, saveUserProfile } from "./utils/storage";

// Lazy-load all heavy pages so the initial bundle stays small
const ActivitiesPage = lazy(() =>
  import("./pages/ActivitiesPage").then((m) => ({ default: m.ActivitiesPage })),
);
const AdminPanelPage = lazy(() =>
  import("./pages/AdminPanelPage").then((m) => ({ default: m.AdminPanelPage })),
);
const BarcodeScannerPage = lazy(() =>
  import("./pages/BarcodeScannerPage").then((m) => ({
    default: m.BarcodeScannerPage,
  })),
);
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const DirectoryPage = lazy(() =>
  import("./pages/DirectoryPage").then((m) => ({ default: m.DirectoryPage })),
);
const FeedPage = lazy(() =>
  import("./pages/FeedPage").then((m) => ({ default: m.FeedPage })),
);
const FriendRequestsPage = lazy(() =>
  import("./pages/FriendRequestsPage").then((m) => ({
    default: m.FriendRequestsPage,
  })),
);
const LostFoundPage = lazy(() =>
  import("./pages/LostFoundPage").then((m) => ({ default: m.LostFoundPage })),
);
const NoticesPage = lazy(() =>
  import("./pages/NoticesPage").then((m) => ({ default: m.NoticesPage })),
);
const PollsPage = lazy(() =>
  import("./pages/PollsPage").then((m) => ({ default: m.PollsPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const ProfileSetupPage = lazy(() =>
  import("./pages/ProfileSetupPage").then((m) => ({
    default: m.ProfileSetupPage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Loading campusX...</span>
        </div>
        <Toaster richColors />
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <AuthPage />
        <Toaster richColors />
      </>
    );
  }

  const principalId = identity.getPrincipal().toString();

  return (
    <>
      <AppProvider principalId={principalId}>
        <AppContent principalId={principalId} />
      </AppProvider>
      <InstallBanner />
      <Toaster richColors />
    </>
  );
}

function AppContent({ principalId }: { principalId: string }) {
  const { currentUser, setCurrentUser } = useApp();
  const { actor, isFetching } = useActor();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check/load profile from backend first, then fall back to localStorage
  useEffect(() => {
    if (!actor || isFetching || hasChecked) return;

    async function checkProfile() {
      try {
        if (actor) {
          const backendProfile = await actor.getMyProfile();
          if (backendProfile) {
            const profile: LocalUserProfile = {
              name: backendProfile.name,
              avatarUrl: backendProfile.avatarUrl || "",
              rollNumber: backendProfile.rollNumber || "",
              role:
                (backendProfile.role as LocalUserProfile["role"]) || "Student",
              department: backendProfile.department || "",
              year: backendProfile.yearOfDegree || "",
              bio: backendProfile.bio || "",
              principalId: backendProfile.principalId || principalId,
              course: backendProfile.course || "",
              yearOfDegree: backendProfile.yearOfDegree || "",
              division: backendProfile.division || "",
              email: backendProfile.email || "",
              mobile: backendProfile.mobile || "",
            };
            saveUserProfile(profile);
            setCurrentUser(profile);
            return;
          }
        }

        const localProfile = getUserProfile(principalId);
        if (localProfile) {
          setCurrentUser(localProfile);
        }
      } catch {
        const localProfile = getUserProfile(principalId);
        if (localProfile) {
          setCurrentUser(localProfile);
        }
      } finally {
        setCheckingProfile(false);
        setHasChecked(true);
      }
    }

    checkProfile();
  }, [actor, isFetching, hasChecked, principalId, setCurrentUser]);

  if (checkingProfile || isFetching) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Suspense fallback={<PageSpinner />}>
        <ProfileSetupPage
          onComplete={(profile) => {
            setCurrentUser(profile);
          }}
        />
      </Suspense>
    );
  }

  return <MainLayout />;
}

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<PageSpinner />}>
            <PageContent activeTab={activeTab} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function PageContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <DashboardPage />;
    case "feed":
      return <FeedPage />;
    case "notices":
      return <NoticesPage />;
    case "activities":
      return <ActivitiesPage />;
    case "chat":
      return <ChatPage />;
    case "profile":
      return <ProfilePage />;
    case "scanner":
      return <BarcodeScannerPage />;
    case "polls":
      return <PollsPage />;
    case "lostandfound":
      return <LostFoundPage />;
    case "directory":
      return <DirectoryPage />;
    case "requests":
      return <FriendRequestsPage />;
    case "settings":
      return <SettingsPage />;
    case "admin":
      return <AdminPanelPage />;
    default:
      return <DashboardPage />;
  }
}
