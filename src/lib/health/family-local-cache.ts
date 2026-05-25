import type { FamilyMember } from "@/types/health";

const FAMILY_CACHE_PREFIX = "lifemed-family-v1";

function cacheKey(userId: string | null) {
  return userId ? `${FAMILY_CACHE_PREFIX}:${userId}` : `${FAMILY_CACHE_PREFIX}:demo`;
}

export function loadCachedFamilyMembers(userId: string | null): FamilyMember[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as FamilyMember[];
  } catch {
    return [];
  }
}

export function saveCachedFamilyMembers(userId: string | null, members: FamilyMember[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(members));
  } catch {
    // Ignore quota errors for large embedded photos.
  }
}

export function mergeFamilyMembersWithCache(
  members: FamilyMember[],
  userId: string | null
): FamilyMember[] {
  const cached = loadCachedFamilyMembers(userId);
  if (!cached.length) return members;

  const cacheById = new Map(cached.map((member) => [member.id, member]));

  return members.map((member) => {
    const cachedMember = cacheById.get(member.id);
    if (!cachedMember) return member;

    return {
      ...member,
      avatarUrl: member.avatarUrl ?? cachedMember.avatarUrl,
    };
  });
}
