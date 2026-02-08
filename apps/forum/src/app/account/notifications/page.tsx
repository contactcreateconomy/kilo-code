"use client";

import { useState, useEffect } from "react";
import { Button, Label } from "@createconomy/ui";
import {
  useNotificationPreferences,
  type NotificationPreferences,
} from "@/hooks/use-notifications";

type NotificationSetting = {
  id: keyof Pick<
    NotificationPreferences,
    | "replyEmail"
    | "upvoteEmail"
    | "mentionEmail"
    | "followEmail"
    | "campaignEmail"
  >;
  emailKey: keyof NotificationPreferences;
  pushKey: keyof NotificationPreferences;
  label: string;
  description: string;
};

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "replyEmail",
    emailKey: "replyEmail",
    pushKey: "replyPush",
    label: "Replies to your threads",
    description: "Get notified when someone replies to your threads",
  },
  {
    id: "mentionEmail",
    emailKey: "mentionEmail",
    pushKey: "mentionPush",
    label: "Mentions",
    description: "Get notified when someone mentions you with @username",
  },
  {
    id: "followEmail",
    emailKey: "followEmail",
    pushKey: "followPush",
    label: "New followers",
    description: "Get notified when someone follows you",
  },
  {
    id: "upvoteEmail",
    emailKey: "upvoteEmail",
    pushKey: "upvotePush",
    label: "Upvote milestones",
    description:
      "Get notified when your posts reach upvote milestones (5, 10, 25, etc.)",
  },
  {
    id: "campaignEmail",
    emailKey: "campaignEmail",
    pushKey: "campaignPush",
    label: "Campaigns & announcements",
    description: "Important updates and campaign announcements from the forum",
  },
];

export default function NotificationsPage() {
  const {
    preferences,
    isLoading: isLoadingPrefs,
    updatePreferences,
  } = useNotificationPreferences();

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sync remote preferences to local state
  useEffect(() => {
    if (preferences && !localPrefs) {
      setLocalPrefs(preferences);
    }
  }, [preferences, localPrefs]);

  const toggleSetting = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setLocalPrefs((prev) => (prev ? { ...prev, [key]: value } : null));
    setSaveMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPrefs) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updatePreferences(localPrefs);
      setSaveMessage("Preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const enableAll = () => {
    if (!localPrefs) return;
    const updated: NotificationPreferences = { ...localPrefs };
    for (const key of Object.keys(updated) as (keyof NotificationPreferences)[]) {
      (updated as Record<string, boolean>)[key] = true;
    }
    setLocalPrefs(updated);
    setSaveMessage(null);
  };

  const disableAll = () => {
    if (!localPrefs) return;
    const updated: NotificationPreferences = { ...localPrefs };
    for (const key of Object.keys(updated) as (keyof NotificationPreferences)[]) {
      (updated as Record<string, boolean>)[key] = false;
    }
    setLocalPrefs(updated);
    setSaveMessage(null);
  };

  if (isLoadingPrefs || !localPrefs) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Notification Settings
        </h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Notification Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card">
          {/* Header */}
          <div className="grid grid-cols-[1fr,80px,80px] gap-4 p-4 border-b bg-muted/50">
            <div className="font-medium">Notification Type</div>
            <div className="font-medium text-center">Email</div>
            <div className="font-medium text-center">Push</div>
          </div>

          {/* Settings */}
          {NOTIFICATION_SETTINGS.map((setting) => (
            <div
              key={setting.id}
              className="grid grid-cols-[1fr,80px,80px] gap-4 p-4 border-b last:border-b-0 items-center"
            >
              <div>
                <Label className="font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={localPrefs[setting.emailKey]}
                  onChange={(e) =>
                    toggleSetting(setting.emailKey, e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={localPrefs[setting.pushKey]}
                  onChange={(e) =>
                    toggleSetting(setting.pushKey, e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
          ))}

          {/* Weekly Digest */}
          <div className="grid grid-cols-[1fr,80px,80px] gap-4 p-4 border-t items-center">
            <div>
              <Label className="font-medium">Weekly digest</Label>
              <p className="text-sm text-muted-foreground">
                A weekly summary of activity in your followed categories
              </p>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={localPrefs.weeklyDigest}
                onChange={(e) =>
                  toggleSetting("weeklyDigest", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
            <div className="flex justify-center">
              {/* Weekly digest is email-only */}
              <span className="text-xs text-muted-foreground">—</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={enableAll}
            className="text-primary hover:underline"
          >
            Enable all
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={disableAll}
            className="text-primary hover:underline"
          >
            Disable all
          </button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <p
            className={`text-sm ${
              saveMessage.includes("success")
                ? "text-green-600"
                : "text-destructive"
            }`}
          >
            {saveMessage}
          </p>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-4">
        <h3 className="font-medium mb-2">About Notifications</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • <strong>Email notifications</strong> are sent to your registered
            email address
          </li>
          <li>
            • <strong>Push notifications</strong> appear in your notification
            bell in real-time
          </li>
          <li>
            • Upvote notifications are sent at milestones (5, 10, 25, 50, 100+)
            to avoid spam
          </li>
          <li>
            • You can unsubscribe from emails using the link in any notification
          </li>
        </ul>
      </div>
    </div>
  );
}
