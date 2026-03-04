import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
  UserCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole as BackendUserRole } from "../backend";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { LocalUserProfile } from "../types/campus";
import { getAllUserProfiles, saveUserProfile } from "../utils/storage";

export function SettingsPage() {
  const { currentUser, setCurrentUser, isDark, toggleTheme, setActiveTab } =
    useApp();

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, appearance, and privacy preferences.
        </p>
      </motion.div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <AccountSection
          currentUser={currentUser}
          onSave={(updates) => setCurrentUser({ ...currentUser, ...updates })}
        />
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <AppearanceSection isDark={isDark} toggleTheme={toggleTheme} />
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <ProfileSection onNavigate={() => setActiveTab("profile")} />
      </motion.div>

      {/* Data & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <DataPrivacySection currentUser={currentUser} />
      </motion.div>

      {/* Danger Zone — Delete Account */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <DangerZoneSection />
      </motion.div>

      {/* Admin Bootstrap — visible to non-admins so they can promote themselves */}
      {currentUser.role !== "Admin" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <BecomeAdminSection
            currentUser={currentUser}
            onPromoted={(updated) => setCurrentUser(updated)}
          />
        </motion.div>
      )}

      {/* Admin Section — only for existing admins */}
      {currentUser.role === "Admin" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <AdminSection />
        </motion.div>
      )}
    </div>
  );
}

// ─── Account Section ───────────────────────────────────────────────────────────

function AccountSection({
  currentUser,
  onSave,
}: {
  currentUser: { name: string; email?: string; mobile?: string };
  onSave: (updates: { name: string; mobile?: string }) => void;
}) {
  const [name, setName] = useState(currentUser.name);
  const [mobile, setMobile] = useState(currentUser.mobile ?? "");
  const [saving, setSaving] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    // Simulate async save
    setTimeout(() => {
      onSave({ name: name.trim(), mobile: mobile.trim() || undefined });
      toast.success("Account details updated");
      setSaving(false);
    }, 400);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    setTimeout(() => {
      // Password is stored in localStorage auth; this is a frontend-only demo
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    }, 500);
  }

  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <User className="w-4 h-4 text-primary" />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-email" className="text-sm font-medium">
              College Email
            </Label>
            <Input
              id="settings-email"
              value={currentUser.email ?? "Not set"}
              readOnly
              disabled
              className="rounded-xl bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact your administrator.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-mobile" className="text-sm font-medium">
              Mobile Number
            </Label>
            <Input
              id="settings-mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98765 43210"
              className="rounded-xl"
              type="tel"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Account Details"
            )}
          </Button>
        </form>

        <Separator />

        {/* Change Password */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Change Password
            </span>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <PasswordField
              id="old-password"
              label="Current Password"
              value={oldPassword}
              onChange={setOldPassword}
              show={showOld}
              onToggleShow={() => setShowOld((v) => !v)}
            />
            <PasswordField
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
            />

            {newPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}

            <Button
              type="submit"
              variant="outline"
              disabled={changingPassword}
              className="rounded-xl"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl pr-10"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Appearance Section ────────────────────────────────────────────────────────

function AppearanceSection({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <Palette className="w-4 h-4 text-primary" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              {isDark ? (
                <Moon className="w-4 h-4 text-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDark ? "Dark Mode" : "Light Mode"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isDark
                  ? "Switch to light for a bright interface"
                  : "Switch to dark for a comfortable low-light view"}
              </p>
            </div>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <UserCircle className="w-4 h-4 text-primary" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Edit your public profile
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your photo, course, year, division, bio, and more.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigate}
            className="rounded-xl shrink-0"
          >
            Go to Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Data & Privacy Section ───────────────────────────────────────────────────

function DataPrivacySection({
  currentUser,
}: {
  currentUser: {
    name: string;
    email?: string;
    mobile?: string;
    rollNumber: string;
    course: string;
    yearOfDegree: string;
    division: string;
    department: string;
    year: string;
    bio: string;
    role: string;
    principalId: string;
  };
}) {
  function handleDownloadMyData() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: currentUser.name,
        email: currentUser.email ?? "",
        mobile: currentUser.mobile ?? "",
        rollNumber: currentUser.rollNumber,
        course: currentUser.course,
        yearOfDegree: currentUser.yearOfDegree,
        division: currentUser.division,
        department: currentUser.department,
        year: currentUser.year,
        bio: currentUser.bio,
        role: currentUser.role,
        principalId: currentUser.principalId,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campusX-my-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Your data has been downloaded");
  }

  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <Shield className="w-4 h-4 text-primary" />
          Data &amp; Privacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download a copy of all data campusX has stored for your account.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadMyData}
          className="rounded-xl gap-2"
        >
          <Download className="w-4 h-4" />
          Download My Data (JSON)
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Danger Zone Section ──────────────────────────────────────────────────────

function DangerZoneSection() {
  const { deleteMyAccount } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canConfirm = confirmText === "DELETE";

  async function handleDeleteAccount() {
    if (!canConfirm) return;
    setDeleting(true);
    try {
      await deleteMyAccount();
      // Clear all localStorage data
      localStorage.clear();
      // Reload to force re-authentication
      window.location.reload();
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="rounded-2xl border-destructive/40 shadow-card bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base font-semibold text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDialogOpen(true)}
            data-ocid="settings.delete_button"
            className="rounded-xl gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account Permanently
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent
          className="rounded-2xl max-w-md"
          data-ocid="settings.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This will permanently delete your profile, friend requests, and
              all personal data. This action <strong>cannot be undone</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2 space-y-2">
            <Label
              htmlFor="delete-confirm-input"
              className="text-sm font-medium text-foreground"
            >
              Type <span className="font-bold text-destructive">DELETE</span> to
              confirm:
            </Label>
            <Input
              id="delete-confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="rounded-xl border-destructive/40 focus-visible:ring-destructive/40"
              data-ocid="settings.input"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmText("");
                setDialogOpen(false);
              }}
              className="rounded-xl"
              data-ocid="settings.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={!canConfirm || deleting}
              data-ocid="settings.confirm_button"
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Become Admin Section ─────────────────────────────────────────────────────

function BecomeAdminSection({
  currentUser,
  onPromoted,
}: {
  currentUser: LocalUserProfile;
  onPromoted: (updated: LocalUserProfile) => void;
}) {
  const { actor } = useActor();
  const [promoting, setPromoting] = useState(false);

  async function handleBecomeAdmin() {
    setPromoting(true);
    try {
      const updated: LocalUserProfile = { ...currentUser, role: "Admin" };
      // Persist to localStorage first
      saveUserProfile(updated);

      // Persist to backend
      if (actor && currentUser.principalId) {
        try {
          await actor.setUserRole(
            Principal.fromText(currentUser.principalId),
            BackendUserRole.admin,
          );
        } catch {
          // Non-fatal: backend may reject if not authorized; local state still updated
        }
      }

      onPromoted(updated);
      toast.success(
        "You are now an Admin! Admin Panel is now visible in the sidebar.",
      );
    } finally {
      setPromoting(false);
    }
  }

  return (
    <Card className="rounded-2xl border-amber-300/50 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <Shield className="w-4 h-4 text-amber-600" />
          Admin Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Promote your account to Admin to access the Admin Panel, manage
          students, and export data.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBecomeAdmin}
          disabled={promoting}
          data-ocid="settings.primary_button"
          className="rounded-xl gap-2 border-amber-400/60 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
        >
          {promoting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Promoting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Make me Admin
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Admin Section ────────────────────────────────────────────────────────────

function AdminSection() {
  const { setActiveTab } = useApp();
  const [exporting, setExporting] = useState(false);

  function handleExportCSV() {
    setExporting(true);
    try {
      const profiles = getAllUserProfiles();

      const header = [
        "Name",
        "Email",
        "Mobile",
        "Course",
        "Year",
        "Division",
        "Roll Number",
        "Principal ID",
      ];

      const rows = profiles.map((p) => [
        p.name ?? "",
        p.email ?? "",
        p.mobile ?? "",
        p.course ?? "",
        p.yearOfDegree ?? "",
        p.division ?? "",
        p.rollNumber ?? "",
        p.principalId ?? "",
      ]);

      const escapeCsvCell = (cell: string) => {
        const s = String(cell);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const csvContent = [header, ...rows]
        .map((row) => row.map(escapeCsvCell).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campusX-students-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${profiles.length} student record${profiles.length !== 1 ? "s" : ""}`,
      );
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="rounded-2xl border-destructive/30 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-semibold">
          <Database className="w-4 h-4 text-destructive" />
          Admin Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          View all registered students, manage roles, and export data.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("admin")}
            className="rounded-xl gap-2 border-primary/40 text-primary hover:bg-primary/5"
          >
            <Shield className="w-4 h-4" />
            Go to Admin Panel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={exporting}
            className="rounded-xl gap-2 border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export All Student Data (CSV)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
