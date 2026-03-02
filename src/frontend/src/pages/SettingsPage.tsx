import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
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
  User,
  UserCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
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

      {/* Admin Section */}
      {currentUser.role === "Admin" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
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

// ─── Admin Section ────────────────────────────────────────────────────────────

function AdminSection() {
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
          Export all registered student data as a CSV spreadsheet.
        </p>
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
      </CardContent>
    </Card>
  );
}
