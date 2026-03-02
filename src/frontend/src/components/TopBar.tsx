import { Input } from "@/components/ui/input";
import { GraduationCap, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useRef, useState } from "react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import { getAllUserProfiles } from "../utils/storage";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  feed: "Campus Feed",
  notices: "Notices & Announcements",
  activities: "Activities & Events",
  chat: "Messages",
  profile: "My Profile",
  scanner: "QR / Barcode Scanner",
  polls: "Campus Polls",
  lostandfound: "Lost & Found",
  directory: "Student Directory",
};

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const { currentUser, activeTab, isDark, toggleTheme, setActiveTab } =
    useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allProfiles = getAllUserProfiles();

  const searchResults =
    searchQuery.trim().length > 0
      ? allProfiles
          .filter(
            (p) =>
              p.principalId !== currentUser?.principalId &&
              (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.rollNumber
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                p.course.toLowerCase().includes(searchQuery.toLowerCase())),
          )
          .slice(0, 5)
      : [];

  function handleSearchBlur() {
    // Delay to allow click events on results
    setTimeout(() => setShowResults(false), 150);
  }

  return (
    <header className="sticky top-0 z-20 bg-card/90 dark:bg-card/95 backdrop-blur-md border-b border-border px-4 py-2.5 flex items-center gap-3">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-foreground text-sm">
          campusX
        </span>
      </div>

      {/* Page title (desktop) */}
      <h1 className="hidden lg:block font-display text-base font-bold text-foreground">
        {TAB_LABELS[activeTab] || "campusX"}
      </h1>

      {/* Search bar (desktop) */}
      <div
        ref={searchRef}
        className="hidden md:flex flex-1 max-w-xs relative ml-2"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={handleSearchBlur}
            placeholder="Search students..."
            className="pl-8 h-8 text-sm rounded-xl bg-muted border-transparent focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-30">
            {searchResults.map((profile) => (
              <button
                key={profile.principalId}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setActiveTab("directory");
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
              >
                <UserAvatar
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-card-foreground truncate">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {profile.course}
                  </p>
                </div>
                <RoleBadge
                  role={profile.role}
                  className="text-[9px] shrink-0"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Dark mode toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* User info */}
      {currentUser && (
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUser.department}
            </p>
          </div>
          <button type="button" onClick={() => setActiveTab("profile")}>
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
              size="sm"
            />
          </button>
        </div>
      )}
    </header>
  );
}
