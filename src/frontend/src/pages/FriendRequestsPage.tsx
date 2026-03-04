import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Clock,
  Loader2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BackendFriendRequest } from "../backend.d";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import { useActor } from "../hooks/useActor";
import type { FriendRequest } from "../types/campus";
import { formatTimeAgo } from "../utils/helpers";

/** Convert backend friend request to local type */
function backendReqToLocal(r: BackendFriendRequest): FriendRequest {
  return {
    id: r.id,
    fromId: r.fromId,
    fromName: r.fromName,
    fromAvatar: r.fromAvatar,
    toId: r.toId,
    status: r.status as FriendRequest["status"],
    timestamp: Number(r.timestamp),
  };
}

export function FriendRequestsPage() {
  const { currentUser, setActiveTab } = useApp();
  const { actor, isFetching: actorFetching } = useActor();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRequests = useCallback(async () => {
    if (!actor) return;
    try {
      const backendReqs = await actor.getFriendRequests();
      const local = backendReqs.map(backendReqToLocal);
      setRequests(local);
    } catch {
      // silently ignore polling errors
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // Load on mount
  useEffect(() => {
    if (!actor || actorFetching) return;
    loadRequests();
  }, [actor, actorFetching, loadRequests]);

  // Poll every 15s for new incoming requests
  useEffect(() => {
    if (!actor || actorFetching) return;
    intervalRef.current = setInterval(loadRequests, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [actor, actorFetching, loadRequests]);

  // All hooks must run before early returns
  if (!currentUser) return null;

  const myId = currentUser.principalId;

  const incoming = requests.filter(
    (r) => r.toId === myId && r.status === "pending",
  );

  const sent = requests.filter(
    (r) => r.fromId === myId && r.status !== "declined",
  );

  async function handleAccept(requestId: string) {
    if (!actor) return;
    setProcessingId(requestId);
    try {
      await actor.respondToFriendRequest(requestId, true);
      await loadRequests();
      toast.success("Friend request accepted!");
    } catch {
      toast.error("Failed to accept request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDecline(requestId: string) {
    if (!actor) return;
    setProcessingId(requestId);
    try {
      await actor.respondToFriendRequest(requestId, false);
      await loadRequests();
      toast.success("Friend request declined.");
    } catch {
      toast.error("Failed to decline request. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading && actorFetching) {
    return (
      <div
        data-ocid="friends.loading_state"
        className="flex flex-col items-center justify-center min-h-[40vh] gap-3"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

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
            data-ocid="friends.incoming.tab"
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
            data-ocid="friends.sent.tab"
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
          {loading && !actorFetching && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          {!loading && incoming.length === 0 ? (
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
                  processing={processingId === req.id}
                  onAccept={() => handleAccept(req.id)}
                  onDecline={() => handleDecline(req.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-4 space-y-3">
          {loading && !actorFetching && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          {!loading && sent.length === 0 ? (
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
                <SentRequestCard key={req.id} request={req} index={i} />
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
  processing,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  index: number;
  processing: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      data-ocid={`friends.incoming.item.${index + 1}`}
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
          disabled={processing}
          variant="outline"
          data-ocid={`friends.incoming.delete_button.${index + 1}`}
          className="h-8 px-3 rounded-xl gap-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        >
          {processing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <X className="w-3 h-3" />
          )}
          Decline
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabled={processing}
          data-ocid={`friends.incoming.confirm_button.${index + 1}`}
          className="h-8 px-3 rounded-xl gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {processing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Accept
        </Button>
      </div>
    </motion.div>
  );
}

function SentRequestCard({
  request,
  index,
}: {
  request: FriendRequest;
  index: number;
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

  const config = statusConfig[request.status] ?? statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      data-ocid={`friends.sent.item.${index + 1}`}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm"
    >
      {request.status === "accepted" ? (
        <div className="relative">
          <UserAvatar name={request.toId} avatarUrl="" size="md" />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <UserCheck className="w-2.5 h-2.5 text-white" />
          </span>
        </div>
      ) : (
        <UserAvatar name={request.toId} avatarUrl="" size="md" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-card-foreground">
          {request.toId}
        </p>
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
