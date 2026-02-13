import type { Id } from "../_generated/dataModel";

export type UserRole = "customer" | "seller" | "moderator" | "admin";

export type PolicyContext = {
  userId: Id<"users">;
  role: string;
};

export type PolicyPredicate = (
  context: PolicyContext
) => boolean | Promise<boolean>;

export function hasAnyRole(allowedRoles: readonly string[]): PolicyPredicate {
  return (context) => allowedRoles.includes(context.role);
}

export function isOwner(
  getOwnerId: (context: PolicyContext) => string | Id<"users">
): PolicyPredicate {
  return (context) => context.userId === getOwnerId(context);
}

export function andPolicy(...policies: PolicyPredicate[]): PolicyPredicate {
  return async (context) => {
    for (const policy of policies) {
      if (!(await policy(context))) {
        return false;
      }
    }
    return true;
  };
}

export function orPolicy(...policies: PolicyPredicate[]): PolicyPredicate {
  return async (context) => {
    for (const policy of policies) {
      if (await policy(context)) {
        return true;
      }
    }
    return false;
  };
}

export function notPolicy(policy: PolicyPredicate): PolicyPredicate {
  return async (context) => !(await policy(context));
}

export function ownerOrRoles(
  getOwnerId: (context: PolicyContext) => string | Id<"users">,
  allowedRoles: readonly string[]
): PolicyPredicate {
  return orPolicy(isOwner(getOwnerId), hasAnyRole(allowedRoles));
}
