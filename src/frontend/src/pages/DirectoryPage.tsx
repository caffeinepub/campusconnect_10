import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Check,
  GraduationCap,
  Hash,
  Loader2,
  MessageCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { LocalUserProfile, Post, UserRole } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";
import { getAllUserProfiles } from "../utils/storage";

export function DirectoryPage() {
  const {
    currentUser,
    setActiveTab,
    setActiveChatUser,
    posts,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendshipStatus,
    friendRequests,
  } = useApp();
  const { actor, isFetching: actorFetching } = useActor();
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [viewingProfile, setViewingProfile] = useState<LocalUserProfile | null>(
    null,
  );
  const [backendProfiles, setBackendProfiles] = useState<LocalUserProfile[]>(
    [],
  );
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Load profiles from backend on mount
  useEffect(() => {
    if (!actor || actorFetching) return;

    async function loadProfiles() {
      setLoadingProfiles(true);
      try {
        const results = await actor!.getAllProfilesPublic();
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
      } catch {
        // Fall back to localStorage
        setBackendProfiles(getAllUserProfiles());
      } finally {
        setLoadingProfiles(false);
      }
    }

    loadProfiles();
  }, [actor, actorFetching]);

  const allProfiles = useMemo(() => {
    const source =
      backendProfiles.length > 0 ? backendProfiles : getAllUserProfiles();
    // Filter out current user
    return source.filter((p) => p.principalId !== currentUser?.principalId);
  }, [backendProfiles, currentUser]);

  // Derive unique filters
  const courses = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProfiles) if (p.course) set.add(p.course);
    return Array.from(set).sort();
  }, [allProfiles]);

  const divisions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProfiles) if (p.division) set.add(p.division);
    return Array.from(set).sort();
  }, [allProfiles]);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProfiles) if (p.yearOfDegree) set.add(p.yearOfDegree);
    return Array.from(set).sort();
  }, [allProfiles]);

  const filtered = useMemo(() => {
    let result = allProfiles;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.rollNumber.toLowerCase().includes(q) ||
          p.course.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q),
      );
    }
    if (courseFilter !== "all")
      result = result.filter((p) => p.course === courseFilter);
    if (divisionFilter !== "all")
      result = result.filter((p) => p.division === divisionFilter);
    if (yearFilter !== "all")
      result = result.filter((p) => p.yearOfDegree === yearFilter);
    return result;
  }, [allProfiles, query, courseFilter, divisionFilter, yearFilter]);

  function clearFilters() {
    setQuery("");
    setCourseFilter("all");
    setDivisionFilter("all");
    setYearFilter("all");
  }

  const hasFilters =
    query ||
    courseFilter !== "all" ||
    divisionFilter !== "all" ||
    yearFilter !== "all";

  if (loadingProfiles && actorFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Student Directory
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {allProfiles.length} students & faculty registered
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll number, course..."
            className="pl-9 rounded-xl bg-background border-border"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="rounded-xl h-8 text-xs w-auto min-w-[120px] bg-background border-border">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="rounded-xl h-8 text-xs w-auto min-w-[110px] bg-background border-border">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d} value={d}>
                  Division {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="rounded-xl h-8 text-xs w-auto min-w-[110px] bg-background border-border">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-8 px-2 rounded-lg border border-border bg-background"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((profile, index) => (
            <motion.div
              key={profile.principalId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <ProfileCard
                profile={profile}
                onView={() => setViewingProfile(profile)}
                onMessage={() => {
                  setActiveChatUser(profile.principalId);
                  setActiveTab("chat");
                }}
                friendshipStatus={getFriendshipStatus(profile.principalId)}
                onAddFriend={() => sendFriendRequest(profile)}
                onAcceptFriend={() => {
                  const req = friendRequests.find(
                    (r) =>
                      r.fromId === profile.principalId &&
                      r.toId === currentUser?.principalId &&
                      r.status === "pending",
                  );
                  if (req) acceptFriendRequest(req.id);
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No students found</p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-primary text-sm mt-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Profile viewer dialog */}
      <Dialog
        open={!!viewingProfile}
        onOpenChange={(v) => !v && setViewingProfile(null)}
      >
        <DialogContent className="max-w-lg rounded-2xl bg-card p-0 overflow-hidden">
          {viewingProfile && (
            <ProfileViewer
              profile={viewingProfile}
              posts={posts.filter(
                (p) => p.authorId === viewingProfile.principalId,
              )}
              friendshipStatus={getFriendshipStatus(viewingProfile.principalId)}
              onAddFriend={() => {
                sendFriendRequest(viewingProfile);
              }}
              onAcceptFriend={() => {
                const req = friendRequests.find(
                  (r) =>
                    r.fromId === viewingProfile.principalId &&
                    r.toId === currentUser?.principalId &&
                    r.status === "pending",
                );
                if (req) acceptFriendRequest(req.id);
              }}
              onMessage={() => {
                setActiveChatUser(viewingProfile.principalId);
                setActiveTab("chat");
                setViewingProfile(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type FriendshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends";

function FriendActionButton({
  status,
  onAddFriend,
  onAcceptFriend,
  onMessage,
  size = "sm",
}: {
  status: FriendshipStatus;
  onAddFriend: () => void;
  onAcceptFriend: () => void;
  onMessage: () => void;
  size?: "sm" | "default";
}) {
  if (status === "friends") {
    return (
      <Button
        size={size}
        variant="outline"
        onClick={onMessage}
        className="h-7 px-3 rounded-lg gap-1 text-xs border-border"
      >
        <MessageCircle className="w-3 h-3" />
        Message
      </Button>
    );
  }
  if (status === "pending_sent") {
    return (
      <Button
        size={size}
        variant="outline"
        disabled
        className="h-7 px-3 rounded-lg gap-1 text-xs border-border opacity-60 cursor-not-allowed"
      >
        <Check className="w-3 h-3" />
        Request Sent
      </Button>
    );
  }
  if (status === "pending_received") {
    return (
      <Button
        size={size}
        onClick={onAcceptFriend}
        className="h-7 px-3 rounded-lg gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Check className="w-3 h-3" />
        Accept
      </Button>
    );
  }
  // none
  return (
    <Button
      size={size}
      onClick={onAddFriend}
      className="h-7 px-3 rounded-lg gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <UserPlus className="w-3 h-3" />
      Add Friend
    </Button>
  );
}

function ProfileCard({
  profile,
  onView,
  onMessage,
  friendshipStatus,
  onAddFriend,
  onAcceptFriend,
}: {
  profile: LocalUserProfile;
  onView: () => void;
  onMessage: () => void;
  friendshipStatus: FriendshipStatus;
  onAddFriend: () => void;
  onAcceptFriend: () => void;
}) {
  return (
    <Card className="border-border bg-card shadow-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <button type="button" onClick={onView} className="w-full text-left">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-card-foreground truncate group-hover:text-primary transition-colors">
                {profile.name}
              </p>
              <RoleBadge role={profile.role} className="mt-0.5 text-[10px]" />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {profile.course && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span className="truncate">{profile.course}</span>
              </div>
            )}
            {profile.yearOfDegree && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="w-3 h-3 shrink-0" />
                <span>
                  {profile.yearOfDegree}
                  {profile.division ? ` · Division ${profile.division}` : ""}
                </span>
              </div>
            )}
            {profile.rollNumber && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="w-3 h-3 shrink-0" />
                <span>{profile.rollNumber}</span>
              </div>
            )}
          </div>
        </button>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onView}
            className="text-xs text-primary hover:underline font-medium"
          >
            View Profile
          </button>
          <FriendActionButton
            status={friendshipStatus}
            onAddFriend={onAddFriend}
            onAcceptFriend={onAcceptFriend}
            onMessage={onMessage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileViewer({
  profile,
  posts,
  friendshipStatus,
  onAddFriend,
  onAcceptFriend,
  onMessage,
}: {
  profile: LocalUserProfile;
  posts: Post[];
  friendshipStatus: FriendshipStatus;
  onAddFriend: () => void;
  onAcceptFriend: () => void;
  onMessage: () => void;
}) {
  return (
    <div className="overflow-y-auto max-h-[80vh]">
      {/* Cover */}
      <div className="h-24 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="ring-4 ring-card rounded-full">
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="xl"
            />
          </div>
          <FriendActionButton
            status={friendshipStatus}
            onAddFriend={onAddFriend}
            onAcceptFriend={onAcceptFriend}
            onMessage={onMessage}
            size="default"
          />
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-xl font-bold text-card-foreground">
              {profile.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={profile.role} />
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {profile.course && (
              <Badge
                className="text-xs bg-primary/15 text-primary border-primary/20"
                variant="outline"
              >
                {profile.course}
              </Badge>
            )}
            {profile.yearOfDegree && (
              <Badge
                className="text-xs bg-secondary text-secondary-foreground"
                variant="secondary"
              >
                {profile.yearOfDegree}
              </Badge>
            )}
            {profile.division && (
              <Badge
                className="text-xs bg-secondary text-secondary-foreground"
                variant="secondary"
              >
                Division {profile.division}
              </Badge>
            )}
            {profile.rollNumber && (
              <Badge
                className="text-xs bg-secondary text-secondary-foreground"
                variant="secondary"
              >
                #{profile.rollNumber}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-2 border-t border-border">
            <div>
              <p className="font-display font-bold text-base text-card-foreground">
                {posts.length}
              </p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-display font-bold text-base text-card-foreground">
                {posts.reduce((acc, p) => acc + p.likes.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
          </div>
        </div>

        {/* Recent posts */}
        {posts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm text-card-foreground">
              Recent Posts
            </h4>
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-muted/50 rounded-xl p-3">
                <p className="text-sm text-card-foreground leading-relaxed line-clamp-2">
                  {post.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(post.timestamp)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
