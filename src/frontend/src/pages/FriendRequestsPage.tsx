import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, UserCheck, UserPlus, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useMemo } from "react";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { FriendRequest, LocalUserProfile } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";
import { getAllUserProfiles } from "../utils/storage";

export function FriendRequestsPage() {
  const {
    friendRequests,
    currentUser,
    acceptFriendRequest,
    declineFriendRequest,
    setActiveTab,
  } = useApp();

  // Build a lookup map of all profiles — must be called before any early return
  const profileMap = useMemo(() => {
    const profiles = getAllUserProfiles();
    const map = new Map<string, LocalUserProfile>();
    for (const p of profiles) map.set(p.principalId, p);
    return map;
  }, []);

  if (!currentUser) return null;

  const myId = currentUser.principalId;

  const incoming = friendRequests.filter(
    (r) => r.toId === myId && r.status === "pending",
  );

  const sent = friendRequests.filter(
    (r) => r.fromId === myId && r.status !== "declined",
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Friend Requests
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your connection requests
        </p>
      </div>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="rounded-xl bg-muted/60 p-1 w-full sm:w-auto">
          <TabsTrigger
            value="incoming"
            className="rounded-lg flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            Incoming
            {incoming.length > 0 && (
              <Badge className="ml-1 h-4 min-w-[16px] px-1 text-[10px] bg-red-500 text-white border-0 rounded-full">
                {incoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="rounded-lg flex items-center gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" />
            Sent
            {sent.filter((r) => r.status === "pending").length > 0 && (
              <Badge className="ml-1 h-4 min-w-[16px] px-1 text-[10px] bg-muted-foreground/60 text-white border-0 rounded-full">
                {sent.filter((r) => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="w-10 h-10 text-muted-foreground/40" />}
              title="No incoming requests"
              description="When someone sends you a friend request, it'll appear here."
              actionLabel="Find Friends in Directory"
              onAction={() => setActiveTab("directory")}
            />
          ) : (
            <AnimatePresence>
              {incoming.map((req, i) => (
                <IncomingRequestCard
                  key={req.id}
                  request={req}
                  index={i}
                  onAccept={() => acceptFriendRequest(req.id)}
                  onDecline={() => declineFriendRequest(req.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {sent.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-10 h-10 text-muted-foreground/40" />}
              title="No sent requests"
              description="Add friends from the Student Directory to connect with classmates."
              actionLabel="Go to Directory"
              onAction={() => setActiveTab("directory")}
            />
          ) : (
            <AnimatePresence>
              {sent.map((req, i) => (
                <SentRequestCard
                  key={req.id}
                  request={req}
                  index={i}
                  recipientProfile={profileMap.get(req.toId) ?? null}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IncomingRequestCard({
  request,
  index,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  index: number;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm"
    >
      <UserAvatar
        name={request.fromName}
        avatarUrl={request.fromAvatar}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-card-foreground">
          {request.fromName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTimeAgo(request.timestamp)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={onDecline}
          variant="outline"
          className="h-8 px-3 rounded-xl gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        >
          <X className="w-3 h-3" />
          Decline
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          className="h-8 px-3 rounded-xl gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Check className="w-3 h-3" />
          Accept
        </Button>
      </div>
    </motion.div>
  );
}

function SentRequestCard({
  request,
  index,
  recipientProfile,
}: {
  request: FriendRequest;
  index: number;
  recipientProfile: LocalUserProfile | null;
}) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    accepted: {
      label: "Friends",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    declined: {
      label: "Declined",
      className: "bg-red-100 text-red-600 border-red-200",
    },
  };

  const config = statusConfig[request.status];
  const displayName = recipientProfile?.name ?? request.toId;
  const displayAvatar = recipientProfile?.avatarUrl ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm"
    >
      {request.status === "accepted" ? (
        <div className="relative">
          <UserAvatar name={displayName} avatarUrl={displayAvatar} size="md" />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <UserCheck className="w-2.5 h-2.5 text-white" />
          </span>
        </div>
      ) : (
        <UserAvatar name={displayName} avatarUrl={displayAvatar} size="md" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-card-foreground">
          {displayName}
        </p>
        {recipientProfile?.course && (
          <p className="text-xs text-muted-foreground">
            {recipientProfile.course}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          Sent {formatTimeAgo(request.timestamp)}
        </p>
      </div>
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    </motion.div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="text-center py-14 flex flex-col items-center gap-3">
      {icon}
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="text-xs text-primary hover:underline font-medium mt-1"
      >
        {actionLabel}
      </button>
    </div>
  );
}
