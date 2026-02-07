"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Campaign } from "@/types/forum";

/**
 * useActiveCampaign — Fetches the currently active campaign from Convex.
 *
 * Returns null when no campaign is active.
 */
export function useActiveCampaign() {
  const data = useQuery(api.functions.forum.getActiveCampaign, {});

  const campaign: Campaign | null = data
    ? {
        id: data.id,
        title: data.title,
        description: data.description,
        prize: data.prize,
        endDate: new Date(data.endDate),
        progress: data.progress,
        targetPoints: data.targetPoints,
        participantCount: data.participantCount,
      }
    : null;

  return {
    campaign,
    isLoading: data === undefined,
  };
}
