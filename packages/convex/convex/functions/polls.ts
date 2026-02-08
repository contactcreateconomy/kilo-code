import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Poll System — Phase 3
 *
 * Manages poll voting for poll-type threads. Poll options are stored
 * directly on the forumThreads table, votes in the pollVotes table.
 */

// ============================================================================
// Poll Queries
// ============================================================================

/**
 * Get poll results for a thread, including vote counts per option
 * and the current user's vote(s).
 */
export const getPollResults = query({
  args: {
    threadId: v.id("forumThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted || thread.postType !== "poll") {
      return null;
    }

    const options = thread.pollOptions ?? [];
    const endsAt = thread.pollEndsAt ?? null;
    const multiSelect = thread.pollMultiSelect ?? false;
    const hasEnded = endsAt !== null && Date.now() > endsAt;

    // Get all votes
    const allVotes = await ctx.db
      .query("pollVotes")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Count votes per option
    const voteCounts = new Array<number>(options.length).fill(0);
    for (const vote of allVotes) {
      if (vote.optionIndex >= 0 && vote.optionIndex < options.length) {
        voteCounts[vote.optionIndex]++;
      }
    }

    const totalVotes = allVotes.length;

    // Calculate percentages
    const percentages = voteCounts.map((count) =>
      totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
    );

    // Get current user's votes
    const userVotes: number[] = [];
    if (userId) {
      const userVoteRecords = await ctx.db
        .query("pollVotes")
        .withIndex("by_thread_user", (q) =>
          q.eq("threadId", args.threadId).eq("userId", userId)
        )
        .collect();
      for (const v of userVoteRecords) {
        userVotes.push(v.optionIndex);
      }
    }

    return {
      options,
      voteCounts,
      percentages,
      totalVotes,
      userVotes,
      endsAt,
      multiSelect,
      hasEnded,
    };
  },
});

// ============================================================================
// Poll Mutations
// ============================================================================

/**
 * Cast a vote on a poll.
 *
 * For single-select polls, replaces any existing vote.
 * For multi-select polls, adds a new vote (or removes if already voted).
 */
export const votePoll = mutation({
  args: {
    threadId: v.id("forumThreads"),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) throw new Error("Thread not found");
    if (thread.postType !== "poll") throw new Error("Thread is not a poll");

    const options = thread.pollOptions ?? [];
    if (args.optionIndex < 0 || args.optionIndex >= options.length) {
      throw new Error("Invalid option index");
    }

    // Check if poll has ended
    if (thread.pollEndsAt && Date.now() > thread.pollEndsAt) {
      throw new Error("This poll has ended");
    }

    const multiSelect = thread.pollMultiSelect ?? false;

    // Get user's existing votes
    const existingVotes = await ctx.db
      .query("pollVotes")
      .withIndex("by_thread_user", (q) =>
        q.eq("threadId", args.threadId).eq("userId", userId)
      )
      .collect();

    // Check if user already voted for this option
    const existingForOption = existingVotes.find(
      (v) => v.optionIndex === args.optionIndex
    );

    if (existingForOption) {
      // Toggle off — remove vote
      await ctx.db.delete(existingForOption._id);
      return { action: "removed" as const, optionIndex: args.optionIndex };
    }

    if (!multiSelect && existingVotes.length > 0) {
      // Single-select: remove previous vote before adding new one
      for (const vote of existingVotes) {
        await ctx.db.delete(vote._id);
      }
    }

    // Cast the vote
    await ctx.db.insert("pollVotes", {
      threadId: args.threadId,
      userId,
      optionIndex: args.optionIndex,
      createdAt: Date.now(),
    });

    return { action: "voted" as const, optionIndex: args.optionIndex };
  },
});

/**
 * Remove all of a user's votes from a poll.
 */
export const removePollVotes = mutation({
  args: {
    threadId: v.id("forumThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) throw new Error("Thread not found");

    if (thread.pollEndsAt && Date.now() > thread.pollEndsAt) {
      throw new Error("This poll has ended");
    }

    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_thread_user", (q) =>
        q.eq("threadId", args.threadId).eq("userId", userId)
      )
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    return { removed: votes.length };
  },
});
