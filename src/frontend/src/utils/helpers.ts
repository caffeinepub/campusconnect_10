import type { UserRole } from "../types/campus";

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const ROLE_COLORS: Record<UserRole, string> = {
  Student: "bg-blue-100 text-blue-700 border border-blue-200",
  Faculty: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Admin: "bg-red-100 text-red-700 border border-red-200",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Sports: "bg-orange-100 text-orange-700",
  Cultural: "bg-pink-100 text-pink-700",
  Academic: "bg-blue-100 text-blue-700",
  Club: "bg-purple-100 text-purple-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Important: "bg-red-100 text-red-700 border border-red-200",
  General: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const AVATAR_COLORS = [
  "#4f46e5",
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#db2777",
  "#d97706",
  "#dc2626",
  "#2563eb",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
