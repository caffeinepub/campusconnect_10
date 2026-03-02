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

const KEYS = {
  USER_PROFILE: "campusconnect_profile_",
  POSTS: "campusconnect_posts",
  NOTICES: "campusconnect_notices",
  ACTIVITIES: "campusconnect_activities",
  CHAT_MESSAGES: "campusconnect_chat_",
  SEEDED: "campusconnect_seeded",
  POLLS: "campusconnect_polls",
  POLL_VOTES: "campusconnect_poll_votes_",
  LOST_FOUND: "campusconnect_lost_found",
  THEME: "campusconnect_theme",
  FRIEND_REQUESTS: "campusconnect_friend_requests",
  DATA_VERSION: "campusx_data_version",
};

// Current data version — bump this to force a clean wipe of old demo data
const CURRENT_DATA_VERSION = "v9_clean";

/**
 * Wipe all campusconnect_* keys that contain demo/seed data from older builds.
 * Runs once per data version. Preserves real user profiles (those NOT matching
 * the known seed IDs) and the current theme preference.
 */
function wipeOldDemoData(): void {
  const stored = localStorage.getItem(KEYS.DATA_VERSION);
  if (stored === CURRENT_DATA_VERSION) return; // Already clean

  // Known demo seed profile IDs from all previous builds
  const seedIds = [
    "seed-priya",
    "seed-raj",
    "seed-anita",
    "seed-kumar",
    "seed-meera",
    "demo-1",
    "demo-2",
    "demo-3",
    "demo-4",
    "demo-5",
  ];

  // Clear all non-profile data (posts, notices, activities, polls, lost-found, chat, friend-requests)
  const bulkKeys = [
    KEYS.POSTS,
    KEYS.NOTICES,
    KEYS.ACTIVITIES,
    KEYS.POLLS,
    KEYS.LOST_FOUND,
    KEYS.FRIEND_REQUESTS,
    KEYS.SEEDED,
  ];
  for (const k of bulkKeys) {
    localStorage.removeItem(k);
  }

  // Remove all demo profile entries and any chat/poll-vote entries
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(KEYS.CHAT_MESSAGES)) {
      toRemove.push(key);
      continue;
    }
    if (key.startsWith(KEYS.POLL_VOTES)) {
      toRemove.push(key);
      continue;
    }
    // Remove demo profile entries by known seed IDs
    for (const id of seedIds) {
      if (key === KEYS.USER_PROFILE + id) {
        toRemove.push(key);
        break;
      }
    }
  }
  for (const k of toRemove) localStorage.removeItem(k);

  // Mark as clean
  localStorage.setItem(KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

export function ensureSeeded(): void {
  // Wipe any demo/seed data from older builds (runs once per data version)
  wipeOldDemoData();
}

// User Profile
export function getUserProfile(principalId: string): LocalUserProfile | null {
  return safeGet<LocalUserProfile | null>(
    KEYS.USER_PROFILE + principalId,
    null,
  );
}

export function saveUserProfile(profile: LocalUserProfile): void {
  safeSet(KEYS.USER_PROFILE + profile.principalId, profile);
}

export function getAllUserProfiles(): LocalUserProfile[] {
  const profiles: LocalUserProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(KEYS.USER_PROFILE)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const profile = JSON.parse(raw) as LocalUserProfile;
          profiles.push(profile);
        }
      } catch {
        // Skip invalid entries
      }
    }
  }
  return profiles;
}

// Posts
export function getPosts(): Post[] {
  return safeGet<Post[]>(KEYS.POSTS, []);
}

export function savePosts(posts: Post[]): void {
  safeSet(KEYS.POSTS, posts);
}

// Notices
export function getNotices(): Notice[] {
  return safeGet<Notice[]>(KEYS.NOTICES, []);
}

export function saveNotices(notices: Notice[]): void {
  safeSet(KEYS.NOTICES, notices);
}

// Activities
export function getActivities(): Activity[] {
  return safeGet<Activity[]>(KEYS.ACTIVITIES, []);
}

export function saveActivities(activities: Activity[]): void {
  safeSet(KEYS.ACTIVITIES, activities);
}

// Chat Messages - stored per conversation
export function getChatMessages(contactId: string): ChatMessage[] {
  const raw = safeGet<
    { senderId: string; content: string; timestamp: number }[]
  >(KEYS.CHAT_MESSAGES + contactId, []);
  return raw.map((m, i) => ({
    id: `msg-${contactId}-${i}`,
    senderId: m.senderId === "ME" ? "me" : m.senderId,
    receiverId: m.senderId === "ME" ? contactId : "me",
    content: m.content,
    timestamp: m.timestamp,
  }));
}

export function saveChatMessages(
  contactId: string,
  messages: ChatMessage[],
): void {
  const raw = messages.map((m) => ({
    senderId: m.senderId === "me" ? "ME" : m.senderId,
    content: m.content,
    timestamp: m.timestamp,
  }));
  safeSet(KEYS.CHAT_MESSAGES + contactId, raw);
}

// Polls
export function getPollsData(): Poll[] {
  return safeGet<Poll[]>(KEYS.POLLS, []);
}

export function savePollsData(polls: Poll[]): void {
  safeSet(KEYS.POLLS, polls);
}

export function getPollVote(
  pollId: string,
  principalId: string,
): string | null {
  return localStorage.getItem(`${KEYS.POLL_VOTES}${pollId}_${principalId}`);
}

export function savePollVote(
  pollId: string,
  principalId: string,
  optionId: string,
): void {
  localStorage.setItem(`${KEYS.POLL_VOTES}${pollId}_${principalId}`, optionId);
}

// Lost & Found
export function getLostFoundData(): LostFoundItem[] {
  return safeGet<LostFoundItem[]>(KEYS.LOST_FOUND, []);
}

export function saveLostFoundData(items: LostFoundItem[]): void {
  safeSet(KEYS.LOST_FOUND, items);
}

// Theme
export function getTheme(): "light" | "dark" {
  return (localStorage.getItem(KEYS.THEME) as "light" | "dark") || "light";
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(KEYS.THEME, theme);
}

// Friend Requests
export function getFriendRequests(): FriendRequest[] {
  return safeGet<FriendRequest[]>(KEYS.FRIEND_REQUESTS, []);
}

export function saveFriendRequests(requests: FriendRequest[]): void {
  safeSet(KEYS.FRIEND_REQUESTS, requests);
}
