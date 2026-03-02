import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  Hash,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import { formatDate, formatTimeAgo } from "../utils/helpers";
import { getAllUserProfiles } from "../utils/storage";

export function DashboardPage() {
  const {
    currentUser,
    posts,
    notices,
    activities,
    polls,
    lostFoundItems,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const allProfiles = useMemo(() => getAllUserProfiles(), []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.principalId !== currentUser?.principalId &&
        (p.name.toLowerCase().includes(q) ||
          p.rollNumber.toLowerCase().includes(q) ||
          p.course.toLowerCase().includes(q)),
    );
  }, [searchQuery, allProfiles, currentUser]);

  const upcomingActivities = useMemo(() => {
    const now = new Date();
    return activities
      .filter((a) => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);
  }, [activities]);

  const activePolls = polls.filter((p) => p.active);
  const recentPosts = posts.slice(0, 3);
  const recentNotices = notices.slice(0, 2);
  const openLostFound = lostFoundItems.filter((i) => !i.resolved).length;

  if (!currentUser) return null;

  const stats = [
    {
      label: "Posts",
      value: posts.length,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      tab: "feed",
    },
    {
      label: "Notices",
      value: notices.length,
      icon: Bell,
      color: "text-campus-amber",
      bg: "bg-campus-amber/10",
      tab: "notices",
    },
    {
      label: "Active Polls",
      value: activePolls.length,
      icon: BarChart2,
      color: "text-campus-green",
      bg: "bg-campus-green/10",
      tab: "polls",
    },
    {
      label: "Events",
      value: upcomingActivities.length,
      icon: Calendar,
      color: "text-campus-red",
      bg: "bg-campus-red/10",
      tab: "activities",
    },
  ];

  const quickLinks = [
    { label: "Feed", icon: TrendingUp, tab: "feed", desc: "Latest posts" },
    { label: "Notices", icon: Bell, tab: "notices", desc: "Announcements" },
    { label: "Events", icon: Calendar, tab: "activities", desc: "Upcoming" },
    { label: "Polls", icon: BarChart2, tab: "polls", desc: "Vote now" },
    {
      label: "Lost & Found",
      icon: MapPin,
      tab: "lostandfound",
      desc: `${openLostFound} open`,
    },
    {
      label: "Directory",
      icon: Users,
      tab: "directory",
      desc: "Find students",
    },
    { label: "Chat", icon: MessageCircle, tab: "chat", desc: "Messages" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground rounded-2xl overflow-hidden shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="ring-2 ring-white/30 rounded-full">
                  <UserAvatar
                    name={currentUser.name}
                    avatarUrl={currentUser.avatarUrl}
                    size="lg"
                  />
                </div>
                <div>
                  <p className="text-xs opacity-80 mb-0.5">Welcome back,</p>
                  <h2 className="font-display text-xl font-bold leading-tight">
                    {currentUser.name.split(" ")[0]}! 👋
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <RoleBadge
                      role={currentUser.role}
                      className="!bg-white/20 !text-white !border-white/30"
                    />
                    {currentUser.course && (
                      <span className="text-xs opacity-80">
                        {currentUser.course}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <LayoutDashboard className="w-10 h-10 opacity-20 hidden sm:block" />
            </div>

            {/* Profile badges */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
              {currentUser.yearOfDegree && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/20 text-white">
                  <GraduationCap className="w-3 h-3" />
                  {currentUser.yearOfDegree}
                </span>
              )}
              {currentUser.division && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/20 text-white">
                  <BookOpen className="w-3 h-3" />
                  Division {currentUser.division}
                </span>
              )}
              {currentUser.rollNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/20 text-white">
                  <Hash className="w-3 h-3" />
                  {currentUser.rollNumber}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, roll number, or course..."
            className="pl-9 rounded-xl bg-card border-border shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchResults.length > 0 && searchQuery && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {searchResults.slice(0, 6).map((profile) => (
              <button
                key={profile.principalId}
                type="button"
                onClick={() => {
                  setActiveTab("directory");
                  setSearchQuery("");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
              >
                <UserAvatar
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.course}
                    {profile.rollNumber ? ` · #${profile.rollNumber}` : ""}
                  </p>
                </div>
                <RoleBadge
                  role={profile.role}
                  className="text-[10px] shrink-0"
                />
              </button>
            ))}
            {searchResults.length > 6 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("directory");
                  setSearchQuery("");
                }}
                className="w-full text-center py-2.5 text-xs text-primary hover:bg-muted/50 border-t border-border font-medium"
              >
                View all {searchResults.length} results →
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => setActiveTab(stat.tab)}
            className="group"
          >
            <Card className="border-border bg-card shadow-card rounded-xl hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                >
                  <stat.icon
                    className={`w-4.5 h-4.5 ${stat.color}`}
                    size={18}
                  />
                </div>
                <p className={`font-display font-bold text-2xl ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="font-display font-bold text-sm text-foreground mb-3">
          Quick Access
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.tab}
              type="button"
              onClick={() => setActiveTab(link.tab)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <link.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight text-center">
                {link.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {link.desc}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Two column: Recent posts + notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent posts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="border-border bg-card shadow-card rounded-2xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Recent Posts
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setActiveTab("feed")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No posts yet
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-2.5">
                    <UserAvatar
                      name={post.authorName}
                      avatarUrl={post.authorAvatar}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-card-foreground">
                        {post.authorName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {post.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {formatTimeAgo(post.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent notices */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-border bg-card shadow-card rounded-2xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-campus-amber" />
                  Notices
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setActiveTab("notices")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {recentNotices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notices
                </p>
              ) : (
                recentNotices.map((notice) => (
                  <div key={notice.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Badge
                        className={`text-[10px] shrink-0 mt-0.5 ${
                          notice.priority === "Important"
                            ? "bg-destructive/15 text-destructive border-destructive/20"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                        variant="outline"
                      >
                        {notice.priority}
                      </Badge>
                      <p className="text-xs font-semibold text-card-foreground line-clamp-1">
                        {notice.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {formatTimeAgo(notice.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming activities */}
      {upcomingActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Card className="border-border bg-card shadow-card rounded-2xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-campus-red" />
                  Upcoming Events
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-campus-red/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-campus-red leading-none">
                      {new Date(activity.date)
                        .toLocaleString("en-US", { month: "short" })
                        .toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-campus-red leading-none">
                      {new Date(activity.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.location} · {activity.time}
                    </p>
                  </div>
                  <Badge
                    className="text-[10px] bg-secondary text-secondary-foreground shrink-0"
                    variant="secondary"
                  >
                    {activity.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
