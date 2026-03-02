import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProfile(principalId: string): Promise<void>;
    getAllProfiles(): Promise<Array<StudentProfile>>;
    getAllProfilesPublic(): Promise<Array<StudentProfile>>;
    getCallerUserProfile(): Promise<StudentProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<StudentProfile | null>;
    getUserProfile(user: Principal): Promise<StudentProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(profile: StudentProfile): Promise<void>;
    saveCallerUserProfile(profile: StudentProfile): Promise<void>;
    updateProfile(profile: StudentProfile): Promise<void>;
}
