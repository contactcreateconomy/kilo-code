"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@createconomy/ui";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const platformSettings = useQuery(api.functions.admin.getPlatformSettings, {});
  const updateSettings = useMutation(api.functions.admin.updatePlatformSettings);

  const [platformName, setPlatformName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [primaryColor, setPrimaryColor] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Populate form from loaded settings
  useEffect(() => {
    if (platformSettings) {
      setPlatformName(platformSettings.platformName ?? "");
      setCurrency(platformSettings.currency ?? "USD");
      setPrimaryColor(platformSettings.primaryColor ?? "");
      setTimezone(platformSettings.timezone ?? "");
    }
  }, [platformSettings]);

  if (platformSettings === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateSettings({
        platformName,
        currency,
        primaryColor: primaryColor || undefined,
        timezone: timezone || undefined,
      });
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Configure general platform settings and preferences
        </p>
      </div>

      {saveMessage && (
        <div
          className={`rounded-lg p-3 text-sm ${
            saveMessage.includes("success")
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Platform Information */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Platform Information</h2>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="platform-name" className="mb-1">
                Platform Name
              </Label>
              <Input
                id="platform-name"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1">Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    platformSettings?.isActive !== false
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {platformSettings?.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Settings */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Marketplace Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="primary-color" className="mb-1">
                Brand Color
              </Label>
              <Input
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#007bff"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="timezone" className="mb-1">
              Default Timezone
            </Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
            />
          </div>
        </div>
      </div>

      {/* Platform Stats (read-only) */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Platform Info</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {platformSettings && "slug" in platformSettings && (
            <div>
              <span className="text-muted-foreground">Slug: </span>
              <span className="font-medium">{platformSettings.slug}</span>
            </div>
          )}
          {platformSettings && "domain" in platformSettings && platformSettings.domain && (
            <div>
              <span className="text-muted-foreground">Domain: </span>
              <span className="font-medium">{platformSettings.domain}</span>
            </div>
          )}
          {platformSettings && "createdAt" in platformSettings && platformSettings.createdAt && (
            <div>
              <span className="text-muted-foreground">Created: </span>
              <span className="font-medium">
                {new Date(platformSettings.createdAt as number).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
