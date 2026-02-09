import type { Metadata } from "next";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Separator,
} from "@createconomy/ui";
import { Switch } from "@createconomy/ui/components/switch";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
  // In production, fetch user data from Convex
  const user = {
    name: "John Doe",
    email: "john@example.com",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and public profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={user.name}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                placeholder="Your email"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your orders
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails" className="text-sm font-medium">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products and promotions
              </p>
            </div>
            <Switch id="marketing-emails" />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <Label htmlFor="review-reminders" className="text-sm font-medium">
                Review Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to review products you&apos;ve purchased
              </p>
            </div>
            <Switch id="review-reminders" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
