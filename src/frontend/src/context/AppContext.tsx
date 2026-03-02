import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  ensureSeeded,
  getActivities,
  getAllUserProfiles,
  getChatMessages,
  getFriendRequests,
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
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({
  children,
  principalId,
}: { children: React.ReactNode; principalId: string }) {
  const [currentUser, setCurrentUserState] = useState<LocalUserProfile | null>(
    () => {
      ensureSeeded();
      return getUserProfile(principalId);
    },
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
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() =>
    getFriendRequests(),
  );
  const [isDark, setIsDark] = useState<boolean>(() => {
    const theme = getTheme();
    return theme === "dark";
  });

  // Apply dark mode on mount and changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Sync posts to storage
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
  useEffect(() => {
    saveFriendRequests(friendRequests);
  }, [friendRequests]);

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
    (noticeData: Omit<Notice, "id" | "timestamp">) => {
      const newNotice: Notice = {
        ...noticeData,
        id: generateId(),
        timestamp: Date.now(),
      };
      setNotices((prev) => [newNotice, ...prev]);
    },
    [],
  );

  const addActivity = useCallback((activityData: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activityData,
      id: generateId(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  }, []);

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
  const addPoll = useCallback((pollData: Omit<Poll, "id" | "timestamp">) => {
    const newPoll: Poll = {
      ...pollData,
      id: generateId(),
      timestamp: Date.now(),
    };
    setPolls((prev) => [newPoll, ...prev]);
  }, []);

  const votePoll = useCallback(
    (pollId: string, optionId: string, principalId: string) => {
      savePollVote(pollId, principalId, optionId);
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
    },
    [],
  );

  const hasVotedPoll = useCallback((pollId: string, principalId: string) => {
    return getPollVote(pollId, principalId);
  }, []);

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

  // Friend request actions
  const sendFriendRequest = useCallback(
    (toProfile: LocalUserProfile) => {
      if (!currentUser) return;
      const myId = currentUser.principalId;
      // Prevent duplicate
      const exists = getFriendRequests().some(
        (r) =>
          ((r.fromId === myId && r.toId === toProfile.principalId) ||
            (r.fromId === toProfile.principalId && r.toId === myId)) &&
          r.status === "pending",
      );
      if (exists) return;
      const newReq: FriendRequest = {
        id: generateId(),
        fromId: myId,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatarUrl,
        toId: toProfile.principalId,
        status: "pending",
        timestamp: Date.now(),
      };
      setFriendRequests((prev) => [...prev, newReq]);
    },
    [currentUser],
  );

  const acceptFriendRequest = useCallback((requestId: string) => {
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r)),
    );
  }, []);

  const declineFriendRequest = useCallback((requestId: string) => {
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r)),
    );
  }, []);

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

  // Derived: accepted friend profiles
  const friends = useMemo(() => {
    if (!currentUser) return [];
    const myId = currentUser.principalId;
    const acceptedIds = friendRequests
      .filter(
        (r) =>
          r.status === "accepted" && (r.fromId === myId || r.toId === myId),
      )
      .map((r) => (r.fromId === myId ? r.toId : r.fromId));

    const allProfiles = getAllUserProfiles();
    return allProfiles.filter((p) => acceptedIds.includes(p.principalId));
  }, [currentUser, friendRequests]);

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
