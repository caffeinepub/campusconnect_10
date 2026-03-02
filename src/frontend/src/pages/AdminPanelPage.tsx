import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Crown,
  Download,
  GraduationCap,
  Loader2,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { LocalUserProfile, UserRole } from "../types/campus";
import { getAllUserProfiles, saveUserProfile } from "../utils/storage";

// ─── Role Badge ────────────────────────────────────────────────────────────────

function RolePill({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    Student:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    Faculty:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    Admin:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[role]}`}
    >
      {role}
    </Badge>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  count,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="rounded-2xl border-border shadow-card">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                {label}
              </p>
              <p className="text-3xl font-bold font-display text-foreground">
                {count}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── CSV Export Logic ──────────────────────────────────────────────────────────

function exportCSV(profiles: LocalUserProfile[]) {
  const header = [
    "Name",
    "Email",
    "Mobile",
    "Roll Number",
    "Course",
    "Year of Degree",
    "Division",
    "Department",
    "Role",
    "Principal ID",
  ];

  const escapeCsvCell = (cell: string) => {
    const s = String(cell ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = profiles.map((p) => [
    p.name ?? "",
    p.email ?? "",
    p.mobile ?? "",
    p.rollNumber ?? "",
    p.course ?? "",
    p.yearOfDegree ?? "",
    p.division ?? "",
    p.department ?? "",
    p.role ?? "",
    p.principalId ?? "",
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campusX-all-students-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function AdminPanelPage() {
  const { currentUser, setCurrentUser } = useApp();
  const { actor, isFetching: actorFetching } = useActor();
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [backendProfiles, setBackendProfiles] = useState<LocalUserProfile[]>(
    [],
  );
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Load all profiles from backend (admin only)
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTick triggers reload
  useEffect(() => {
    if (!actor || actorFetching) return;
    if (!currentUser || currentUser.role !== "Admin") return;

    async function loadProfiles() {
      setLoadingProfiles(true);
      try {
        const results = await actor!.getAllProfiles();
        const mapped: LocalUserProfile[] = results.map((p) => ({
          name: p.name,
          avatarUrl: p.avatarUrl || "",
          rollNumber: p.rollNumber || "",
          role: (p.role as UserRole) || "Student",
          department: p.department || "",
          year: p.yearOfDegree || "",
          bio: p.bio || "",
          principalId: p.principalId,
          course: p.course || "",
          yearOfDegree: p.yearOfDegree || "",
          division: p.division || "",
          email: p.email || "",
          mobile: p.mobile || "",
        }));
        setBackendProfiles(mapped);
        setAccessDenied(false);
      } catch {
        // getAllProfiles() throws if not admin on backend — fall back to localStorage
        setAccessDenied(false);
        setBackendProfiles(getAllUserProfiles());
      } finally {
        setLoadingProfiles(false);
      }
    }

    loadProfiles();
  }, [actor, actorFetching, refreshTick, currentUser]);

  // Use backend profiles if available, fall back to localStorage
  const allProfiles = useMemo(() => {
    if (backendProfiles.length > 0) return backendProfiles;
    return getAllUserProfiles();
  }, [backendProfiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProfiles;
    return allProfiles.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.rollNumber?.toLowerCase().includes(q) ||
        p.course?.toLowerCase().includes(q),
    );
  }, [allProfiles, search]);

  // Access guard — placed after all hooks
  if (!currentUser || currentUser.role !== "Admin" || accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          You must be an Admin to view this page. Please contact your
          administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  if (loadingProfiles && actorFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const students = allProfiles.filter((p) => p.role === "Student");
  const faculty = allProfiles.filter((p) => p.role === "Faculty");
  const admins = allProfiles.filter((p) => p.role === "Admin");

  function handleExportCSV() {
    setExporting(true);
    try {
      exportCSV(allProfiles);
      toast.success(
        `Exported ${allProfiles.length} record${allProfiles.length !== 1 ? "s" : ""}`,
      );
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  function handleToggleRole(profile: LocalUserProfile) {
    if (!currentUser) return;
    const newRole: UserRole = profile.role === "Admin" ? "Student" : "Admin";
    const updated: LocalUserProfile = { ...profile, role: newRole };
    saveUserProfile(updated);

    // Update backendProfiles state in-place so the table re-renders immediately
    setBackendProfiles((prev) =>
      prev.map((p) => (p.principalId === profile.principalId ? updated : p)),
    );

    // If toggling current user's own role, update context too
    if (profile.principalId === currentUser.principalId) {
      setCurrentUser(updated);
    }

    // Force allProfiles to re-read from backend too
    setRefreshTick((t) => t + 1);

    toast.success(
      `${profile.name} is now ${newRole === "Admin" ? "an Admin" : "a Student"}`,
    );
  }

  function truncatePrincipal(id: string) {
    if (!id) return "—";
    return `${id.slice(0, 8)}…${id.slice(-6)}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all registered students and faculty.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={exporting}
          size="sm"
          className="rounded-xl gap-2 shrink-0"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export CSV
            </>
          )}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Students"
          count={students.length}
          icon={GraduationCap}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          delay={0.05}
        />
        <StatCard
          label="Total Faculty"
          count={faculty.length}
          icon={Users}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          delay={0.1}
        />
        <StatCard
          label="Total Admins"
          count={admins.length}
          icon={Crown}
          color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
          delay={0.15}
        />
      </div>

      {/* Search + Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <Card className="rounded-2xl border-border shadow-card">
          <CardHeader className="pb-3 space-y-3">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Registered Users
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {filtered.length} of {allProfiles.length}
              </span>
            </CardTitle>
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, roll no, or course…"
                className="pl-9 rounded-xl"
                autoComplete="off"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {allProfiles.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground text-sm">
                  No students registered yet
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Share the app link for students to sign up. Their profiles
                  will appear here once they complete registration.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : (
              /* Scrollable Table */
              <div className="overflow-x-auto rounded-b-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-border">
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap pl-5">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Mobile
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Roll No.
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Course
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Year
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Div
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Role
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Principal ID
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap pr-5">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((profile, idx) => (
                      <motion.tr
                        key={profile.principalId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                        className="border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium text-sm text-foreground pl-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary uppercase">
                              {profile.name?.charAt(0) ?? "?"}
                            </div>
                            <span className="max-w-[120px] truncate">
                              {profile.name || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap max-w-[160px]">
                          <span className="truncate block max-w-[150px]">
                            {profile.email || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {profile.mobile || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {profile.rollNumber || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap max-w-[140px]">
                          <span className="truncate block max-w-[130px]">
                            {profile.course || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {profile.yearOfDegree || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {profile.division || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <RolePill role={profile.role} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {truncatePrincipal(profile.principalId)}
                        </TableCell>
                        <TableCell className="pr-5 whitespace-nowrap">
                          {/* Don't show role toggle for own account */}
                          {profile.principalId !== currentUser.principalId &&
                          profile.role !== "Faculty" ? (
                            <Button
                              size="sm"
                              variant={
                                profile.role === "Admin"
                                  ? "destructive"
                                  : "outline"
                              }
                              onClick={() => handleToggleRole(profile)}
                              className="rounded-lg text-xs h-7 px-2.5"
                            >
                              {profile.role === "Admin"
                                ? "Revoke Admin"
                                : "Make Admin"}
                            </Button>
                          ) : profile.principalId ===
                            currentUser.principalId ? (
                            <span className="text-xs text-muted-foreground italic">
                              (You)
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
