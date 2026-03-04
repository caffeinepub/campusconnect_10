import { useQuery } from "@tanstack/react-query";
import type { LocalUserProfile, UserRole } from "../types/campus";
import { getAllUserProfiles } from "../utils/storage";
import { useActor } from "./useActor";

/**
 * Fetches all public profiles from the shared backend canister.
 * Falls back to localStorage if the backend call fails.
 * Used in Directory, Dashboard, TopBar — anywhere we need cross-browser profiles.
 */
export function useBackendProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<LocalUserProfile[]>({
    queryKey: ["backendProfiles"],
    queryFn: async () => {
      if (!actor) return getAllUserProfiles();
      try {
        const results = await actor.getAllProfilesPublic();
        return results.map(
          (p): LocalUserProfile => ({
            name: p.name,
            avatarUrl: p.avatarUrl || "",
            rollNumber: p.rollNumber || "",
            role: (p.role as UserRole) || "Student",
            department: p.department || "",
            year: p.yearOfDegree || "",
            bio: p.bio || "",
            principalId: p.principalId,
            course: p.course || "",
            yearOfDegree: p.yearOfDegree || "",
            division: p.division || "",
            email: p.email || "",
            mobile: p.mobile || "",
          }),
        );
      } catch {
        return getAllUserProfiles();
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000, // cache for 30s
  });

  return {
    profiles: query.data ?? getAllUserProfiles(),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
