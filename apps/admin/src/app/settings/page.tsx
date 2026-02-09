"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@createconomy/ui";

export default function SettingsPage() {
  const [sellerRegistration, setSellerRegistration] = useState(true);
  const [reviewModeration, setReviewModeration] = useState(true);
  const [forumEnabled, setForumEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Configure general platform settings and preferences
        </p>
      </div>

      {/* Platform Information */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Platform Information</h2>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="platform-name" className="mb-1">
                Platform Name
              </Label>
              <Input id="platform-name" defaultValue="Createconomy" />
            </div>
            <div>
              <Label htmlFor="support-email" className="mb-1">
                Support Email
              </Label>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@createconomy.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="platform-description" className="mb-1">
              Platform Description
            </Label>
            <Textarea
              id="platform-description"
              rows={3}
              defaultValue="A marketplace for digital creators to sell their products and connect with customers."
            />
          </div>
        </div>
      </div>

      {/* Marketplace Settings */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Marketplace Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="commission-rate" className="mb-1">
                Default Commission Rate (%)
              </Label>
              <Input
                id="commission-rate"
                type="number"
                defaultValue="15"
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label htmlFor="min-payout" className="mb-1">
                Minimum Payout Amount ($)
              </Label>
              <Input
                id="min-payout"
                type="number"
                defaultValue="50"
                min={0}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1">Default Currency</Label>
              <Select defaultValue="USD">
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
              <Label className="mb-1">Payout Schedule</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Feature Toggles</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Seller Registration</p>
              <p className="text-sm text-muted-foreground">
                Allow new sellers to register on the platform
              </p>
            </div>
            <Switch
              checked={sellerRegistration}
              onCheckedChange={setSellerRegistration}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Review Moderation</p>
              <p className="text-sm text-muted-foreground">
                Require approval for new product reviews
              </p>
            </div>
            <Switch
              checked={reviewModeration}
              onCheckedChange={setReviewModeration}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Forum</p>
              <p className="text-sm text-muted-foreground">
                Enable community forum features
              </p>
            </div>
            <Switch
              checked={forumEnabled}
              onCheckedChange={setForumEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Put the platform in maintenance mode
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="meta-title" className="mb-1">
              Default Meta Title
            </Label>
            <Input
              id="meta-title"
              defaultValue="Createconomy - Digital Marketplace for Creators"
            />
          </div>
          <div>
            <Label htmlFor="meta-description" className="mb-1">
              Default Meta Description
            </Label>
            <Textarea
              id="meta-description"
              rows={2}
              defaultValue="Discover and purchase high-quality digital products from talented creators. Templates, graphics, code, and more."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
