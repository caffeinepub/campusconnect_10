export type UserRole = "Student" | "Faculty" | "Admin";

export interface LocalUserProfile {
  name: string;
  avatarUrl: string;
  rollNumber: string;
  role: UserRole;
  department: string;
  year: string;
  bio: string;
  principalId: string;
  course: string;
  yearOfDegree: string;
  division: string;
  mobile?: string;
  email?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  authorCourse?: string;
  authorDivision?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: number;
  likes: string[]; // principalIds who liked
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  timestamp: number;
  priority: "Important" | "General";
  department?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  organizer: string;
  category: "Sports" | "Cultural" | "Academic" | "Club";
  location: string;
  registrations: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

export interface ChatUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
  avatarColor: string;
  status: "online" | "offline" | "away";
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  authorId: string;
  authorName: string;
  timestamp: number;
  deadline: string; // ISO date string
  active: boolean;
}

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  contactInfo: string;
  isLost: boolean; // true = lost, false = found
  authorId: string;
  authorName: string;
  imageUrl?: string;
  timestamp: number;
  resolved: boolean;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  status: "pending" | "accepted" | "declined";
  timestamp: number;
}
