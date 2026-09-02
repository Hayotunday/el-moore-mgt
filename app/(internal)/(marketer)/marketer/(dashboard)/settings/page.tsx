"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Lock, Trash2 } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { updateUser, uploadUserAvatar, removeUserAvatar } from "@/lib/api/users";
import { ROLE_LABELS } from "@/lib/rbac";

export default function MarketerSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profileForm.name || !profileForm.email) {
      toast.error("Name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      await updateUser(user.id, { name: profileForm.name, email: profileForm.email });
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (password.length < 12) {
      toast.error("Password must be at least 12 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await updateUser(user.id, { password });
      setPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarBusy(true);
    try {
      await uploadUserAvatar(user.id, file);
      await refreshProfile();
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload avatar.");
    } finally {
      setAvatarBusy(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setAvatarBusy(true);
    try {
      await removeUserAvatar(user.id);
      await refreshProfile();
      toast.success("Avatar removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove avatar.");
    } finally {
      setAvatarBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="El-Moore Marketer"
        title="Account Settings"
        subtitle="Manage your profile and login details."
      />

      <div className="rounded-md bg-card p-6 shadow-ambient space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold text-secondary-foreground text-lg font-bold">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            )}
          </div>
          <div className="flex gap-2">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={avatarBusy}
              />
              <span className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors">
                {avatarBusy ? "Uploading…" : "Change Photo"}
              </span>
            </label>
            {user.avatarUrl && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} disabled={avatarBusy}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md bg-card p-6 shadow-ambient space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4" /> Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Full Name</Label>
            <Input
              value={profileForm.name}
              onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-2 sm:max-w-xs">
          <Label>Role</Label>
          <p className="text-sm text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-card p-6 shadow-ambient space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4" /> Password
        </h2>
        <div className="grid gap-2 sm:max-w-xs">
          <Label>New Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 12 characters"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword} disabled={savingPassword || !password}>
            {savingPassword ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
