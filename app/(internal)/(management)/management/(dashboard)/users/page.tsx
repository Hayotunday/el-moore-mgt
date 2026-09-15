"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { UserCog, Plus, UserX, Send, RotateCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import SearchFilterBar from "@/components/management/search-filter-bar";
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from "@/components/management/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { listUsers, assignUserRole, createUser, deactivateUser } from "@/lib/api/users";
import { sendInvite, listMyInvites, resendInvite, revokeInvite } from "@/lib/api/invites";
import type { Invite, ManagementUser } from "@/lib/api/types";
import { MANAGEMENT_ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { blurActiveElement, formatDate, getFullName } from "@/lib/utils";

const EMPTY_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  role: "SITE_COORDINATOR" as Role,
};
const EMPTY_INVITE_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  role: "SITE_COORDINATOR" as Role,
};

export default function UsersPage() {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE_FORM);
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
    try {
      setInvites(await listMyInvites());
    } catch {
      // MD/GM only — silently skip for other roles
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q && !getFullName(u).toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await assignUserRole(userId, role);
      toast.success("Role updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role.");
    }
  };

  const handleDeactivate = async (user: ManagementUser) => {
    const ok = await confirm({
      title: `Deactivate ${getFullName(user)}?`,
      description: "They won't be able to log in until reactivated.",
      confirmLabel: "Deactivate User",
      destructive: true,
    });
    if (!ok) return;
    setDeactivatingId(user.id);
    try {
      await deactivateUser(user.id);
      toast.success("User deactivated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not deactivate user.");
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("First name, last name, email and a starting password are required.");
      return;
    }
    setSaving(true);
    try {
      await createUser({
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success("User created.");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email) {
      toast.error("First name, last name, and email are required.");
      return;
    }
    setSendingInvite(true);
    try {
      await sendInvite(inviteForm);
      toast.success("Invite sent.");
      setInviteDialogOpen(false);
      setInviteForm(EMPTY_INVITE_FORM);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invite.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    setInviteBusyId(invite.id);
    try {
      await resendInvite(invite.id);
      toast.success("Invite resent.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend invite.");
    } finally {
      setInviteBusyId(null);
    }
  };

  const handleRevokeInvite = async (invite: Invite) => {
    const ok = await confirm({
      title: `Revoke the invite to ${invite.email}?`,
      description: "The invite link will stop working immediately.",
      confirmLabel: "Revoke Invite",
      destructive: true,
    });
    if (!ok) return;
    setInviteBusyId(invite.id);
    try {
      await revokeInvite(invite.id);
      toast.success("Invite revoked.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke invite.");
    } finally {
      setInviteBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users & Roles"
        subtitle="Everyone with access to the management side of El-Moore, and what they can see."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                blurActiveElement();
                setInviteDialogOpen(true);
              }}
            >
              <Send className="h-4 w-4" /> Send Invite
            </Button>
            <Button
              onClick={() => {
                blurActiveElement();
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={users.length} icon={<UserCog className="h-6 w-6" />} />
        <StatCard
          label="Leadership"
          value={users.filter((u) => u.role === "MD" || u.role === "GM").length}
          variant="gold"
          icon={<UserCog className="h-6 w-6" />}
        />
        <StatCard label="Roles In Use" value={MANAGEMENT_ROLES.length} icon={<UserCog className="h-6 w-6" />} />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
        filters={[
          {
            key: "role",
            label: "Role",
            value: roleFilter,
            onChange: setRoleFilter,
            options: MANAGEMENT_ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r })),
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Name</DataTableHeadCell>
          <DataTableHeadCell>Email</DataTableHeadCell>
          <DataTableHeadCell>Role</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="right">Joined</DataTableHeadCell>
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={6} />}
          {filtered.map((u, idx) => (
            <DataTableRow key={u.id} index={idx}>
              <DataTableCell className="font-medium">{getFullName(u)}</DataTableCell>
              <DataTableCell>{u.email}</DataTableCell>
              <DataTableCell>
                <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as Role)}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGEMENT_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={u.isActive === false ? "INACTIVE" : "ACTIVE"} />
              </DataTableCell>
              <DataTableCell align="right">{u.createdAt ? formatDate(u.createdAt) : "—"}</DataTableCell>
              <DataTableCell align="right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={deactivatingId === u.id || u.isActive === false}
                  onClick={() => handleDeactivate(u)}
                >
                  <UserX className="h-4 w-4" /> Deactivate
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      {invites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pending Invites</h2>
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Name</DataTableHeadCell>
              <DataTableHeadCell>Email</DataTableHeadCell>
              <DataTableHeadCell>Role</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
              <DataTableHeadCell align="right">Expires</DataTableHeadCell>
              <DataTableHeadCell align="right">Actions</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {invites.map((invite, idx) => (
                <DataTableRow key={invite.id} index={idx}>
                  <DataTableCell className="font-medium">{getFullName(invite)}</DataTableCell>
                  <DataTableCell>{invite.email}</DataTableCell>
                  <DataTableCell>{ROLE_LABELS[invite.role]}</DataTableCell>
                  <DataTableCell align="center">
                    <StatusBadge status={invite.status ?? "PENDING"} />
                  </DataTableCell>
                  <DataTableCell align="right">
                    {invite.expiresAt ? formatDate(invite.expiresAt) : "—"}
                  </DataTableCell>
                  <DataTableCell align="right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={inviteBusyId === invite.id}
                        onClick={() => handleResendInvite(invite)}
                        title="Resend invite"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={inviteBusyId === invite.id}
                        onClick={() => handleRevokeInvite(invite)}
                        title="Revoke invite"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </div>
      )}

      <Drawer open={dialogOpen} onOpenChange={setDialogOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add User</DrawerTitle>
            <DrawerDescription>Create an internal account with an immediate password.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Middle Name (optional)</Label>
              <Input
                value={form.middleName}
                onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Starting Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGEMENT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Send Invite</DrawerTitle>
            <DrawerDescription>
              Sends an email invite the person uses to set their own password — no starting
              password needed. MD can invite any role; GM can invite any role below MD.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Middle Name (optional)</Label>
              <Input
                value={inviteForm.middleName}
                onChange={(e) => setInviteForm((f) => ({ ...f, middleName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v as Role }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGEMENT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={sendingInvite}>
              {sendingInvite ? "Sending…" : "Send Invite"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
