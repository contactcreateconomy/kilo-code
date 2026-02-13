/**
 * Users Domain Service
 *
 * Pure business-logic functions for the users domain.
 * No DB access — all data is received as parameters.
 */

import type { Doc } from "../../_generated/dataModel";

/**
 * Build a patch object for user profile updates.
 * Filters undefined values so only provided fields are patched.
 */
export function buildProfilePatch(args: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  address?: Doc<"userProfiles">["address"];
  preferences?: Doc<"userProfiles">["preferences"];
}): Partial<Doc<"userProfiles">> {
  const patch: Record<string, unknown> = {};

  if (args.displayName !== undefined) { patch["displayName"] = args.displayName; }
  if (args.bio !== undefined) { patch["bio"] = args.bio; }
  if (args.avatarUrl !== undefined) { patch["avatarUrl"] = args.avatarUrl; }
  if (args.phone !== undefined) { patch["phone"] = args.phone; }
  if (args.address !== undefined) { patch["address"] = args.address; }
  if (args.preferences !== undefined) { patch["preferences"] = args.preferences; }

  return patch as Partial<Doc<"userProfiles">>;
}

/**
 * Build a patch object for seller profile updates.
 * Filters undefined values so only provided fields are patched.
 */
export function buildSellerProfilePatch(args: {
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  description?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  youtubeUrl?: string;
  accentColor?: string;
  businessAddress?: Doc<"sellers">["businessAddress"];
}): Partial<Doc<"sellers">> {
  const patch: Record<string, unknown> = {};

  if (args.businessName !== undefined) { patch["businessName"] = args.businessName; }
  if (args.businessEmail !== undefined) { patch["businessEmail"] = args.businessEmail; }
  if (args.businessPhone !== undefined) { patch["businessPhone"] = args.businessPhone; }
  if (args.description !== undefined) { patch["description"] = args.description; }
  if (args.websiteUrl !== undefined) { patch["websiteUrl"] = args.websiteUrl; }
  if (args.twitterHandle !== undefined) { patch["twitterHandle"] = args.twitterHandle; }
  if (args.youtubeUrl !== undefined) { patch["youtubeUrl"] = args.youtubeUrl; }
  if (args.accentColor !== undefined) { patch["accentColor"] = args.accentColor; }
  if (args.businessAddress !== undefined) { patch["businessAddress"] = args.businessAddress; }

  return patch as Partial<Doc<"sellers">>;
}
