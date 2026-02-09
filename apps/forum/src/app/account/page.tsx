"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Input, Label, Spinner } from "@createconomy/ui";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";

/**
 * AccountPage — Profile settings page connected to Convex.
 *
 * Loads the current user's profile via getCurrentUser and saves
 * changes via updateUserProfile mutation.
 */
export default function AccountPage() {
  const currentUser = useQuery(api.functions.users.getCurrentUser);
  const updateProfile = useMutation(api.functions.users.updateUserProfile);
  const deleteAccount = useMutation(api.functions.users.deleteAccount);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize form when user data loads
  useEffect(() => {
    if (currentUser) {
      setDisplayName(
        currentUser.profile?.displayName ?? currentUser.name ?? ""
      );
      setBio(currentUser.profile?.bio ?? "");
      setEmail(currentUser.email ?? "");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // After deletion the auth state will change and redirect
    } catch (error) {
      console.error("Failed to delete account:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete account.",
      });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading state
  if (currentUser === undefined) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Profile Settings
        </h1>
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Not authenticated (shouldn't happen due to AuthGuard but just in case)
  if (!currentUser) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Please sign in to access your profile settings.
        </p>
      </div>
    );
  }

  const avatarUrl =
    currentUser.profile?.avatarUrl ??
    currentUser.image ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email ?? "default"}`;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Profile Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20">
              <Image
                src={avatarUrl}
                alt="Profile picture"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your profile picture is synced from your sign-in provider.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 resize-y"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/200 characters
              </p>
            </div>
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-4">Email Address</h2>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Your email is managed by your sign-in provider and cannot be
              changed here.
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 rounded-lg border border-destructive/50 bg-destructive/5 p-6">
        <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-destructive">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        )}
      </div>
    </div>
  );
}
