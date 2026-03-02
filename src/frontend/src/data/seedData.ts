import type {
  Activity,
  ChatUser,
  LostFoundItem,
  Notice,
  Poll,
  Post,
} from "../types/campus";

export const SEED_POSTS: Post[] = [];

export const SEED_NOTICES: Notice[] = [];

export const SEED_ACTIVITIES: Activity[] = [];

export const SEED_CHAT_USERS: ChatUser[] = [];

export const SEED_CHAT_MESSAGES: Record<
  string,
  { senderId: string; content: string; timestamp: number }[]
> = {};

export const SEED_POLLS: Poll[] = [];

export const SEED_LOST_FOUND: LostFoundItem[] = [];
