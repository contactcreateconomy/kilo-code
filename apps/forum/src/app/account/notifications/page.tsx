"use client";

import { useState } from "react";
import { Button, Label } from "@createconomy/ui";

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
};

const defaultSettings: NotificationSetting[] = [
  {
    id: "replies",
    label: "Replies to your threads",
    description: "Get notified when someone replies to your threads",
    email: true,
    push: true,
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "Get notified when someone mentions you",
    email: true,
    push: true,
  },
  {
    id: "follows",
    label: "New followers",
    description: "Get notified when someone follows you",
    email: false,
    push: true,
  },
  {
    id: "likes",
    label: "Likes on your posts",
    description: "Get notified when someone likes your posts",
    email: false,
    push: false,
  },
  {
    id: "announcements",
    label: "Forum announcements",
    description: "Important updates and announcements from the forum",
    email: true,
    push: true,
  },
  {
    id: "digest",
    label: "Weekly digest",
    description: "A weekly summary of activity in your followed categories",
    email: true,
    push: false,
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (
    id: string,
    type: "email" | "push",
    value: boolean
  ) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [type]: value } : setting
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In production, this would call a Convex mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
          {settings.map((setting) => (
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
                  checked={setting.email}
                  onChange={(e) =>
                    toggleSetting(setting.id, "email", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={setting.push}
                  onChange={(e) =>
                    toggleSetting(setting.id, "push", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() =>
              setSettings((prev) =>
                prev.map((s) => ({ ...s, email: true, push: true }))
              )
            }
            className="text-primary hover:underline"
          >
            Enable all
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() =>
              setSettings((prev) =>
                prev.map((s) => ({ ...s, email: false, push: false }))
              )
            }
            className="text-primary hover:underline"
          >
            Disable all
          </button>
        </div>

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
            • <strong>Push notifications</strong> appear in your browser when
            enabled
          </li>
          <li>
            • You can unsubscribe from emails using the link in any notification
          </li>
        </ul>
      </div>
    </div>
  );
}
