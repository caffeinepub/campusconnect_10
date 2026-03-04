import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type {
  Activity,
  ChatMessage,
  FriendRequest,
  LocalUserProfile,
  LostFoundItem,
  Notice,
  Poll,
  Post,
} from "../types/campus";
import { generateId } from "../utils/helpers";
import {
  getActivities,
  getChatMessages,
  getLostFoundData,
  getNotices,
  getPollVote,
  getPollsData,
  getPosts,
  getTheme,
  getUserProfile,
  saveActivities,
  saveChatMessages,
  saveFriendRequests,
  saveLostFoundData,
  saveNotices,
  savePollVote,
  savePollsData,
  savePosts,
  saveTheme,
  saveUserProfile,
} from "../utils/storage";

interface AppContextValue {
  currentUser: LocalUserProfile | null;
  setCurrentUser: (profile: LocalUserProfile) => void;
  posts: Post[];
  addPost: (
    post: Omit<Post, "id" | "timestamp" | "likes" | "comments">,
  ) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (
    postId: string,
    comment: Omit<import("../types/campus").Comment, "id" | "timestamp">,
  ) => void;
  notices: Notice[];
  addNotice: (notice: Omit<Notice, "id" | "timestamp">) => void;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id">) => void;
  getChatHistory: (contactId: string) => ChatMessage[];
  sendMessage: (contactId: string, content: string, myId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeChatUser: string | null;
  setActiveChatUser: (id: string | null) => void;
  // Polls
  polls: Poll[];
  addPoll: (poll: Omit<Poll, "id" | "timestamp">) => void;
  votePoll: (pollId: string, optionId: string, principalId: string) => void;
  hasVotedPoll: (pollId: string, principalId: string) => string | null;
  backendVotes: Record<string, string>;
  // Lost & Found
  lostFoundItems: LostFoundItem[];
  addLostFoundItem: (
    item: Omit<LostFoundItem, "id" | "timestamp" | "resolved">,
  ) => void;
  resolveLostFoundItem: (itemId: string) => void;
  // Dark mode
  isDark: boolean;
  toggleTheme: () => void;
  // View profile
  viewingProfileId: string | null;
  setViewingProfileId: (id: string | null) => void;
  // Friend Requests
  friendRequests: FriendRequest[];
  friends: LocalUserProfile[];
  pendingIncomingRequests: FriendRequest[];
  sendFriendRequest: (toProfile: LocalUserProfile) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  getFriendshipStatus: (
    targetId: string,
  ) => "none" | "pending_sent" | "pending_received" | "friends";
  // Actor — exposed so ChatPage can call backend directly
  actor: backendInterface | null;
  // Account deletion
  deleteMyAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({
  children,
  principalId,
}: { children: React.ReactNode; principalId: string }) {
  const { actor, isFetching: actorFetching } = useActor();

  const [currentUser, setCurrentUserState] = useState<LocalUserProfile | null>(
    () => getUserProfile(principalId),
  );
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [notices, setNotices] = useState<Notice[]>(() => getNotices());
  const [activities, setActivities] = useState<Activity[]>(() =>
    getActivities(),
  );
  const [polls, setPolls] = useState<Poll[]>(() => getPollsData());
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(() =>
    getLostFoundData(),
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  // Friend requests — sourced from backend; fall back to empty until actor ready
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  // All public profiles fetched from backend (for building friends list)
  const [allProfiles, setAllProfiles] = useState<LocalUserProfile[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const theme = getTheme();
    return theme === "dark";
  });
  // Backend votes map: { [pollId]: optionId }
  const [backendVotes, setBackendVotes] = useState<Record<string, string>>({});

  const friendsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const contentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Apply dark mode on mount and changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Sync posts/notices/etc. to local storage as backup
  useEffect(() => {
    savePosts(posts);
  }, [posts]);
  useEffect(() => {
    saveNotices(notices);
  }, [notices]);
  useEffect(() => {
    saveActivities(activities);
  }, [activities]);
  useEffect(() => {
    savePollsData(polls);
  }, [polls]);
  useEffect(() => {
    saveLostFoundData(lostFoundItems);
  }, [lostFoundItems]);
  // Keep local storage copy in sync for backward-compat (optional)
  useEffect(() => {
    saveFriendRequests(friendRequests);
  }, [friendRequests]);

  /** Load friend requests + public profiles from backend */
  const refreshFriendsFromBackend = useCallback(async () => {
    if (!actor) return;
    try {
      const [backendReqs, backendProfiles] = await Promise.all([
        actor.getFriendRequests(),
        actor.getAllProfilesPublic(),
      ]);

      const localReqs: FriendRequest[] = backendReqs.map((r) => ({
        id: r.id,
        fromId: r.fromId,
        fromName: r.fromName,
        fromAvatar: r.fromAvatar,
        toId: r.toId,
        status: r.status as FriendRequest["status"],
        timestamp: Number(r.timestamp),
      }));
      setFriendRequests(localReqs);

      const localProfiles: LocalUserProfile[] = backendProfiles.map((p) => ({
        name: p.name,
        avatarUrl: p.avatarUrl || "",
        rollNumber: p.rollNumber || "",
        role: (p.role as LocalUserProfile["role"]) || "Student",
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
      setAllProfiles(localProfiles);
    } catch {
      // silently ignore polling errors
    }
  }, [actor]);

  /** Load notices, activities, polls from backend */
  const refreshContentFromBackend = useCallback(async () => {
    if (!actor) return;
    try {
      const [backendNotices, backendActivities, backendPolls] =
        await Promise.all([
          actor.getAllNotices(),
          actor.getAllActivities(),
          actor.getAllPolls(),
        ]);

      // Map notices
      const localNotices: Notice[] = backendNotices.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        authorName: n.authorName,
        authorRole: (n.authorRole as Notice["authorRole"]) || "Admin",
        timestamp: Number(n.timestamp),
        priority: (n.priority as Notice["priority"]) || "General",
        department: n.department || undefined,
      }));
      setNotices(localNotices);

      // Map activities
      const localActivities: Activity[] = backendActivities.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        date: a.date,
        time: a.time,
        organizer: a.organizer,
        category: (a.category as Activity["category"]) || "Academic",
        location: a.location,
        registrations: Number(a.registrations),
      }));
      setActivities(localActivities);

      // Map polls
      const localPolls: Poll[] = backendPolls.map((p) => ({
        id: p.id,
        question: p.question,
        options: p.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: Number(opt.votes),
        })),
        authorId: p.authorId,
        authorName: p.authorName,
        timestamp: Number(p.timestamp),
        deadline: p.deadline,
        active: p.active,
      }));
      setPolls(localPolls);
    } catch {
      // silently ignore polling errors
    }
  }, [actor]);

  /** Load backend votes for all polls for the current user */
  const refreshPollVotes = useCallback(
    async (pollList: Poll[]) => {
      if (!actor || pollList.length === 0) return;
      try {
        const voteResults = await Promise.all(
          pollList.map((p) =>
            actor
              .getMyPollVote(p.id)
              .then((v) => ({ pollId: p.id, vote: v }))
              .catch(() => ({ pollId: p.id, vote: null })),
          ),
        );
        const votesMap: Record<string, string> = {};
        for (const { pollId, vote } of voteResults) {
          if (vote) votesMap[pollId] = vote;
        }
        setBackendVotes(votesMap);
      } catch {
        // silently ignore
      }
    },
    [actor],
  );

  // Initial load + polling every 15s for friends
  useEffect(() => {
    if (!actor || actorFetching) return;
    refreshFriendsFromBackend();
    friendsIntervalRef.current = setInterval(refreshFriendsFromBackend, 15000);
    return () => {
      if (friendsIntervalRef.current) clearInterval(friendsIntervalRef.current);
    };
  }, [actor, actorFetching, refreshFriendsFromBackend]);

  // Initial load + polling every 30s for content (notices, activities, polls)
  useEffect(() => {
    if (!actor || actorFetching) return;
    refreshContentFromBackend();
    contentIntervalRef.current = setInterval(refreshContentFromBackend, 30000);
    return () => {
      if (contentIntervalRef.current) clearInterval(contentIntervalRef.current);
    };
  }, [actor, actorFetching, refreshContentFromBackend]);

  // After polls load from backend, refresh votes
  useEffect(() => {
    if (polls.length > 0 && actor && !actorFetching) {
      refreshPollVotes(polls);
    }
  }, [polls, actor, actorFetching, refreshPollVotes]);

  const setCurrentUser = useCallback((profile: LocalUserProfile) => {
    setCurrentUserState(profile);
    saveUserProfile(profile);
  }, []);

  const addPost = useCallback(
    (postData: Omit<Post, "id" | "timestamp" | "likes" | "comments">) => {
      const newPost: Post = {
        ...postData,
        id: generateId(),
        timestamp: Date.now(),
        likes: [],
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
    },
    [],
  );

  const toggleLike = useCallback((postId: string, userId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = p.likes.includes(userId);
        return {
          ...p,
          likes: hasLiked
            ? p.likes.filter((id) => id !== userId)
            : [...p.likes, userId],
        };
      }),
    );
  }, []);

  const addComment = useCallback(
    (
      postId: string,
      commentData: Omit<import("../types/campus").Comment, "id" | "timestamp">,
    ) => {
      const newComment = {
        ...commentData,
        id: generateId(),
        timestamp: Date.now(),
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
        ),
      );
    },
    [],
  );

  const addNotice = useCallback(
    async (noticeData: Omit<Notice, "id" | "timestamp">) => {
      if (!actor) {
        // Fallback: local only
        const newNotice: Notice = {
          ...noticeData,
          id: generateId(),
          timestamp: Date.now(),
        };
        setNotices((prev) => [newNotice, ...prev]);
        return;
      }
      const id = generateId();
      const timestamp = BigInt(Date.now());
      try {
        await actor.createNotice({
          id,
          title: noticeData.title,
          content: noticeData.content,
          authorName: noticeData.authorName,
          authorRole: noticeData.authorRole,
          timestamp,
          priority: noticeData.priority,
          department: noticeData.department || "",
        });
        await refreshContentFromBackend();
      } catch {
        // Fallback to local state on error
        const newNotice: Notice = {
          ...noticeData,
          id,
          timestamp: Number(timestamp),
        };
        setNotices((prev) => [newNotice, ...prev]);
      }
    },
    [actor, refreshContentFromBackend],
  );

  const addActivity = useCallback(
    async (activityData: Omit<Activity, "id">) => {
      if (!actor) {
        const newActivity: Activity = {
          ...activityData,
          id: generateId(),
        };
        setActivities((prev) => [newActivity, ...prev]);
        return;
      }
      const id = generateId();
      const timestamp = BigInt(Date.now());
      try {
        await actor.createActivity({
          id,
          name: activityData.name,
          description: activityData.description,
          date: activityData.date,
          time: activityData.time,
          organizer: activityData.organizer,
          category: activityData.category,
          location: activityData.location,
          registrations: BigInt(activityData.registrations),
          timestamp,
        });
        await refreshContentFromBackend();
      } catch {
        // Fallback to local state on error
        const newActivity: Activity = {
          ...activityData,
          id,
        };
        setActivities((prev) => [newActivity, ...prev]);
      }
    },
    [actor, refreshContentFromBackend],
  );

  const getChatHistory = useCallback(
    (contactId: string): ChatMessage[] => {
      return getChatMessages(contactId).map((m) => ({
        ...m,
        senderId: m.senderId === "me" ? principalId : m.senderId,
      }));
    },
    [principalId],
  );

  const sendMessage = useCallback(
    (contactId: string, content: string, myId: string) => {
      const existing = getChatMessages(contactId);
      const newMsg: ChatMessage = {
        id: generateId(),
        senderId: myId,
        receiverId: contactId,
        content,
        timestamp: Date.now(),
      };
      const updated = [
        ...existing.map((m) => ({
          ...m,
          senderId: m.senderId === principalId ? "me" : m.senderId,
        })),
        { ...newMsg, senderId: "me" },
      ];
      saveChatMessages(contactId, updated);
    },
    [principalId],
  );

  // Polls
  const addPoll = useCallback(
    async (pollData: Omit<Poll, "id" | "timestamp">) => {
      if (!actor) {
        const newPoll: Poll = {
          ...pollData,
          id: generateId(),
          timestamp: Date.now(),
        };
        setPolls((prev) => [newPoll, ...prev]);
        return;
      }
      const id = generateId();
      const timestamp = BigInt(Date.now());
      try {
        await actor.createPoll({
          id,
          question: pollData.question,
          options: pollData.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            votes: BigInt(opt.votes),
          })),
          authorId: pollData.authorId,
          authorName: pollData.authorName,
          deadline: pollData.deadline,
          active: pollData.active,
          timestamp,
        });
        await refreshContentFromBackend();
      } catch {
        // Fallback to local state on error
        const newPoll: Poll = {
          ...pollData,
          id,
          timestamp: Number(timestamp),
        };
        setPolls((prev) => [newPoll, ...prev]);
      }
    },
    [actor, refreshContentFromBackend],
  );

  const votePoll = useCallback(
    async (pollId: string, optionId: string, userPrincipalId: string) => {
      // Optimistic local update
      savePollVote(pollId, userPrincipalId, optionId);
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p;
          return {
            ...p,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
            ),
          };
        }),
      );
      setBackendVotes((prev) => ({ ...prev, [pollId]: optionId }));

      if (actor) {
        try {
          await actor.votePoll(pollId, optionId);
          // Refresh polls from backend to get accurate counts
          await refreshContentFromBackend();
        } catch {
          // silently ignore — optimistic update stays
        }
      }
    },
    [actor, refreshContentFromBackend],
  );

  const hasVotedPoll = useCallback(
    (pollId: string, userPrincipalId: string) => {
      // Check backend votes first, fall back to localStorage
      if (backendVotes[pollId]) return backendVotes[pollId];
      return getPollVote(pollId, userPrincipalId);
    },
    [backendVotes],
  );

  // Lost & Found
  const addLostFoundItem = useCallback(
    (itemData: Omit<LostFoundItem, "id" | "timestamp" | "resolved">) => {
      const newItem: LostFoundItem = {
        ...itemData,
        id: generateId(),
        timestamp: Date.now(),
        resolved: false,
      };
      setLostFoundItems((prev) => [newItem, ...prev]);
    },
    [],
  );

  const resolveLostFoundItem = useCallback((itemId: string) => {
    setLostFoundItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, resolved: true } : item,
      ),
    );
  }, []);

  // Friend request actions — call backend actor
  const sendFriendRequest = useCallback(
    (toProfile: LocalUserProfile) => {
      if (!currentUser || !actor) return;
      const myId = currentUser.principalId;
      // Prevent duplicate
      const exists = friendRequests.some(
        (r) =>
          ((r.fromId === myId && r.toId === toProfile.principalId) ||
            (r.fromId === toProfile.principalId && r.toId === myId)) &&
          r.status === "pending",
      );
      if (exists) return;
      const newReq = {
        id: generateId(),
        fromId: myId,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatarUrl,
        toId: toProfile.principalId,
        status: "pending",
        timestamp: BigInt(Date.now()),
      };
      actor
        .sendFriendRequest(newReq)
        .then(() => {
          refreshFriendsFromBackend();
        })
        .catch(() => {
          // ignore errors silently
        });
    },
    [currentUser, actor, friendRequests, refreshFriendsFromBackend],
  );

  const acceptFriendRequest = useCallback(
    (requestId: string) => {
      if (!actor) return;
      actor
        .respondToFriendRequest(requestId, true)
        .then(() => {
          refreshFriendsFromBackend();
        })
        .catch(() => {
          // ignore errors silently
        });
    },
    [actor, refreshFriendsFromBackend],
  );

  const declineFriendRequest = useCallback(
    (requestId: string) => {
      if (!actor) return;
      actor
        .respondToFriendRequest(requestId, false)
        .then(() => {
          refreshFriendsFromBackend();
        })
        .catch(() => {
          // ignore errors silently
        });
    },
    [actor, refreshFriendsFromBackend],
  );

  const getFriendshipStatus = useCallback(
    (
      targetId: string,
    ): "none" | "pending_sent" | "pending_received" | "friends" => {
      if (!currentUser) return "none";
      const myId = currentUser.principalId;
      const relevant = friendRequests.find(
        (r) =>
          (r.fromId === myId && r.toId === targetId) ||
          (r.fromId === targetId && r.toId === myId),
      );
      if (!relevant) return "none";
      if (relevant.status === "accepted") return "friends";
      if (relevant.status === "declined") return "none";
      if (relevant.fromId === myId) return "pending_sent";
      return "pending_received";
    },
    [currentUser, friendRequests],
  );

  // Delete my account
  const deleteMyAccount = useCallback(async () => {
    if (!actor) throw new Error("Not connected");
    await actor.deleteMyAccount();
  }, [actor]);

  // Derived: accepted friend profiles — built from backend public profiles
  const friends = useMemo(() => {
    if (!currentUser) return [];
    const myId = currentUser.principalId;
    const acceptedIds = friendRequests
      .filter(
        (r) =>
          r.status === "accepted" && (r.fromId === myId || r.toId === myId),
      )
      .map((r) => (r.fromId === myId ? r.toId : r.fromId));

    return allProfiles.filter((p) => acceptedIds.includes(p.principalId));
  }, [currentUser, friendRequests, allProfiles]);

  // Derived: pending incoming requests
  const pendingIncomingRequests = useMemo(() => {
    if (!currentUser) return [];
    return friendRequests.filter(
      (r) => r.toId === currentUser.principalId && r.status === "pending",
    );
  }, [currentUser, friendRequests]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      saveTheme(next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        posts,
        addPost,
        toggleLike,
        addComment,
        notices,
        addNotice,
        activities,
        addActivity,
        getChatHistory,
        sendMessage,
        activeTab,
        setActiveTab,
        activeChatUser,
        setActiveChatUser,
        polls,
        addPoll,
        votePoll,
        hasVotedPoll,
        backendVotes,
        lostFoundItems,
        addLostFoundItem,
        resolveLostFoundItem,
        isDark,
        toggleTheme,
        viewingProfileId,
        setViewingProfileId,
        friendRequests,
        friends,
        pendingIncomingRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        getFriendshipStatus,
        actor,
        deleteMyAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
