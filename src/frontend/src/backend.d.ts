import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BackendFriendRequest {
    id: string;
    status: string;
    fromAvatar: string;
    toId: string;
    timestamp: bigint;
    fromName: string;
    fromId: string;
}
export interface BackendComment {
    id: string;
    content: string;
    authorAvatar: string;
    authorId: string;
    authorName: string;
    timestamp: bigint;
}
export interface StudentProfile {
    bio: string;
    name: string;
    role: string;
    division: string;
    email: string;
    yearOfDegree: string;
    avatarUrl: string;
    rollNumber: string;
    mobile: string;
    department: string;
    course: string;
    principalId: string;
}
export interface BackendActivity {
    id: string;
    organizer: string;
    date: string;
    name: string;
    time: string;
    description: string;
    timestamp: bigint;
    category: string;
    registrations: bigint;
    location: string;
}
export interface BackendPost {
    id: string;
    content: string;
    authorAvatar: string;
    authorId: string;
    authorDivision: string;
    authorName: string;
    authorRole: string;
    likes: Array<string>;
    imageUrl: string;
    timestamp: bigint;
    comments: Array<BackendComment>;
    videoUrl: string;
    authorCourse: string;
}
export interface BackendPollOption {
    id: string;
    votes: bigint;
    text: string;
}
export interface BackendPoll {
    id: string;
    active: boolean;
    question: string;
    authorId: string;
    authorName: string;
    deadline: string;
    timestamp: bigint;
    options: Array<BackendPollOption>;
}
export interface BackendNotice {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorRole: string;
    timestamp: bigint;
    priority: string;
    department: string;
}
export interface BackendChatMessage {
    id: string;
    content: string;
    receiverId: string;
    timestamp: bigint;
    senderId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: string, comment: BackendComment): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivity(activity: BackendActivity): Promise<void>;
    createNotice(notice: BackendNotice): Promise<void>;
    createPoll(poll: BackendPoll): Promise<void>;
    createPost(post: BackendPost): Promise<void>;
    deleteMyAccount(): Promise<void>;
    deletePost(postId: string): Promise<void>;
    deleteProfile(principalId: string): Promise<void>;
    getAllActivities(): Promise<Array<BackendActivity>>;
    getAllNotices(): Promise<Array<BackendNotice>>;
    getAllPolls(): Promise<Array<BackendPoll>>;
    getAllPosts(): Promise<Array<BackendPost>>;
    getAllProfiles(): Promise<Array<StudentProfile>>;
    getAllProfilesPublic(): Promise<Array<StudentProfile>>;
    getCallerUserProfile(): Promise<StudentProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatMessagesWith(partnerId: string): Promise<Array<BackendChatMessage>>;
    getFriendRequests(): Promise<Array<BackendFriendRequest>>;
    getMyPollVote(pollId: string): Promise<string | null>;
    getMyProfile(): Promise<StudentProfile | null>;
    getUserProfile(user: Principal): Promise<StudentProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<void>;
    registerOrUpdateUser(profile: StudentProfile): Promise<void>;
    respondToFriendRequest(requestId: string, accept: boolean): Promise<void>;
    saveCallerUserProfile(profile: StudentProfile): Promise<void>;
    sendChatMessage(msg: BackendChatMessage): Promise<void>;
    sendFriendRequest(req: BackendFriendRequest): Promise<void>;
    setUserRole(target: Principal, role: UserRole): Promise<void>;
    votePoll(pollId: string, optionId: string): Promise<void>;
}
