import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Bell,
  Calendar,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  QrCode,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { RoleBadge } from "./RoleBadge";
import { UserAvatar } from "./UserAvatar";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "feed", label: "Feed", icon: Home },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "activities", label: "Activities", icon: Calendar },
  { id: "polls", label: "Polls", icon: BarChart2 },
  { id: "lostandfound", label: "Lost & Found", icon: MapPin },
  { id: "directory", label: "Directory", icon: Users },
  { id: "requests", label: "Requests", icon: UserPlus },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "scanner", label: "Scanner", icon: QrCode },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Profile", icon: User },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { activeTab, setActiveTab, currentUser, pendingIncomingRequests } =
    useApp();
  const { clear } = useInternetIdentity();

  function handleNav(tab: string) {
    setActiveTab(tab);
    onMobileClose();
  }

  function handleLogout() {
    clear();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[oklch(var(--sidebar))] text-sidebar-foreground">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-base font-bold text-sidebar-foreground">
            campusX
          </span>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-4 h-4 text-sidebar-foreground opacity-70" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNav(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="flex-shrink-0" size={17} />
              {item.label}
              {item.id === "requests" && pendingIncomingRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0 leading-5 min-w-[18px] text-center">
                  {pendingIncomingRequests.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Panel — only visible to admins */}
        {currentUser?.role === "Admin" && (
          <button
            type="button"
            onClick={() => handleNav("admin")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
              activeTab === "admin"
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <Shield className="flex-shrink-0" size={17} />
            Admin Panel
          </button>
        )}
      </nav>

      {/* User card at bottom */}
      {currentUser && (
        <div className="p-2.5 border-t border-sidebar-border">
          <button
            type="button"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors w-full text-left"
            onClick={() => handleNav("profile")}
            onKeyUp={(e) => e.key === "Enter" && handleNav("profile")}
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatarUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <RoleBadge
                role={currentUser.role}
                className="mt-0.5 text-[10px]"
              />
            </div>
          </button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full mt-1 justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-9 px-3 rounded-xl text-sm"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
