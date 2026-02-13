/**
 * Users Domain Types
 *
 * Central type definitions for the users domain.
 */

import type { Doc, Id } from "../../_generated/dataModel";

/** User combined with their profile data. */
export interface UserWithProfile {
  id: Id<"users">;
  email?: string;
  name?: string;
  image?: string;
  emailVerificationTime?: number;
  profile: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    phone?: string;
    address?: Doc<"userProfiles">["address"];
    preferences?: Doc<"userProfiles">["preferences"];
    defaultRole: string;
    isBanned: boolean;
    createdAt: number;
    updatedAt: number;
  } | null;
}

/** Seller profile enriched with user details. */
export interface SellerProfileResponse extends Doc<"sellers"> {
  user: {
    id: Id<"users">;
    name?: string;
    email?: string;
    image?: string;
  } | null;
}
