"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Camera, KeyRound, Loader2, Save } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import StatusBadge from "@/components/management/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { updateUser, uploadUserAvatar, removeUserAvatar } from "@/lib/api/users";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate, getFullName, getInitials } from "@/lib/utils";

export default function AccountPage() {
  const { user, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [middleName, setMiddleName] = useState(user?.middleName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  if (!user) return null;

  const initials = getInitials(user);

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !email) {
      toast.error("First name, last name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      await updateUser(user.id, { firstName, middleName: middleName || undefined, lastName, email });
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await updateUser(user.id, { password: newPassword });
      toast.success("Password changed.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await uploadUserAvatar(user.id, file);
      await refreshProfile();
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      await removeUserAvatar(user.id);
      await refreshProfile();
      toast.success("Avatar removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove avatar.");
    } finally {
      setRemovingAvatar(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="My Account" subtitle="Your personal profile and login details." />

      {/* Identity */}
      <div className="rounded-lg border border-border p-6 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="relative shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={getFullName(user)}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-secondary-foreground text-xl font-bold">
              {initials}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-ambient hover:bg-primary/90 transition-colors">
            {uploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingAvatar}
              onChange={(e) => {
                handleAvatarChange(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{getFullName(user)}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              {ROLE_LABELS[user.role]}
            </span>
            <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Member since {formatDate(user.createdAt)}
          </p>
        </div>
        {user.avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            disabled={removingAvatar}
            onClick={handleRemoveAvatar}
            className="shrink-0"
          >
            {removingAvatar ? "Removing…" : "Remove Photo"}
          </Button>
        )}
      </div>

      {/* Profile details */}
      <div className="rounded-lg border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Middle Name (optional)</Label>
            <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            <Save className="h-4 w-4" /> {savingProfile ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-lg border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Change Password
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="grid gap-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword} disabled={savingPassword}>
            <KeyRound className="h-4 w-4" /> {savingPassword ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
