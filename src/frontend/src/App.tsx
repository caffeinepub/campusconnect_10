import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AppProvider, useApp } from "./context/AppContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { AuthPage } from "./pages/AuthPage";
import { BarcodeScannerPage } from "./pages/BarcodeScannerPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { FeedPage } from "./pages/FeedPage";
import { FriendRequestsPage } from "./pages/FriendRequestsPage";
import { LostFoundPage } from "./pages/LostFoundPage";
import { NoticesPage } from "./pages/NoticesPage";
import { PollsPage } from "./pages/PollsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { LocalUserProfile } from "./types/campus";
import { getUserProfile, saveUserProfile } from "./utils/storage";

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
        // Always try backend first — it's the shared source of truth
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

        // Fall back to localStorage if backend call returned nothing
        const localProfile = getUserProfile(principalId);
        if (localProfile) {
          setCurrentUser(localProfile);
        }
        // If neither has a profile, currentUser stays null → ProfileSetupPage is shown
      } catch {
        // Backend call failed — fall back to localStorage
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
      <ProfileSetupPage
        onComplete={(profile) => {
          setCurrentUser(profile);
        }}
      />
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

      {/* Main content area — offset for desktop sidebar */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">
          <PageContent activeTab={activeTab} />
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
