"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";

interface WebhookEndpointData {
  _id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  failureCount: number;
  lastDeliveredAt?: number;
  createdAt: number;
}

export default function WebhooksPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const endpointsResult = useQuery(api.functions.webhookEndpoints.getWebhookEndpoints, {});
  const availableEventsResult = useQuery(api.functions.webhookEndpoints.getAvailableEvents, {});
  const createEndpoint = useMutation(api.functions.webhookEndpoints.createWebhookEndpoint);
  const deleteEndpoint = useMutation(api.functions.webhookEndpoints.deleteWebhookEndpoint);
  const regenerateSecret = useMutation(api.functions.webhookEndpoints.regenerateWebhookSecret);

  const endpoints = (endpointsResult?.items ?? []) as WebhookEndpointData[];
  const availableEvents = (availableEventsResult ?? []) as Array<{ value: string; label: string }>;

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }

  function toggleSecretVisibility(endpointId: string) {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(endpointId)) {
        next.delete(endpointId);
      } else {
        next.add(endpointId);
      }
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim() || selectedEvents.length === 0) return;

    setIsSubmitting(true);
    try {
      await createEndpoint({
        url: newUrl.trim(),
        events: selectedEvents,
      });
      setNewUrl("");
      setSelectedEvents([]);
      setShowCreateForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create webhook");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(endpointId: string) {
    if (!confirm("Are you sure you want to delete this webhook endpoint?")) return;
    try {
      await deleteEndpoint({ endpointId: endpointId as Id<"webhookEndpoints"> });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  async function handleRegenerateSecret(endpointId: string) {
    if (!confirm("Regenerating the secret will invalidate the old one. Continue?")) return;
    try {
      await regenerateSecret({ endpointId: endpointId as Id<"webhookEndpoints"> });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to regenerate secret");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-[var(--muted-foreground)]">
            Configure outbound webhooks to receive real-time notifications about events
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          {showCreateForm ? "Cancel" : "+ Add Endpoint"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="seller-card space-y-4">
          <h2 className="text-lg font-semibold">New Webhook Endpoint</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Endpoint URL (HTTPS required)</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Events to subscribe to</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <label
                  key={event.value}
                  className="flex items-center gap-2 p-2 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newUrl.trim() || selectedEvents.length === 0}
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Endpoint"}
          </button>
        </form>
      )}

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.length === 0 ? (
          <div className="seller-card text-center py-12">
            <p className="text-[var(--muted-foreground)]">
              No webhook endpoints configured. Add one to start receiving event notifications.
            </p>
          </div>
        ) : (
          endpoints.map((endpoint) => (
            <div key={endpoint._id} className="seller-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{endpoint.url}</code>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        endpoint.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {endpoint.isActive ? "Active" : "Disabled"}
                    </span>
                    {endpoint.failureCount > 0 && (
                      <span className="text-xs text-orange-600">
                        {endpoint.failureCount} failures
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {endpoint.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 text-xs bg-[var(--muted)] rounded-full"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(endpoint._id)}
                  className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Secret */}
              <div className="flex items-center gap-2 p-2 bg-[var(--muted)] rounded-lg">
                <span className="text-xs text-[var(--muted-foreground)]">Secret:</span>
                <code className="text-xs font-mono flex-1">
                  {revealedSecrets.has(endpoint._id)
                    ? endpoint.secret
                    : "•".repeat(20)}
                </code>
                <button
                  onClick={() => toggleSecretVisibility(endpoint._id)}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  {revealedSecrets.has(endpoint._id) ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleRegenerateSecret(endpoint._id)}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                >
                  Regenerate
                </button>
              </div>

              {endpoint.lastDeliveredAt && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Last delivered: {new Date(endpoint.lastDeliveredAt).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
