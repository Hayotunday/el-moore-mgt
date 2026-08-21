"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { UserCog, Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { listUsers, updateUserRole, inviteUser } from "@/lib/api/users";
import type { ManagementUser } from "@/lib/api/types";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "SITE_COORDINATOR" as Role });

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await listUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await updateUserRole(userId, role);
      toast.success("Role updated.");
      await load();
    } catch {
      toast.error("Could not update role.");
    }
  };

  const handleInvite = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      await inviteUser(form);
      toast.success("User invited.");
      setDialogOpen(false);
      setForm({ name: "", email: "", role: "SITE_COORDINATOR" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users & Roles"
        subtitle="Everyone with access to the management side of El-Moore, and what they can see."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={users.length} icon={<UserCog className="h-6 w-6" />} />
        <StatCard
          label="Leadership"
          value={users.filter((u) => u.role === "MD_GM" || u.role === "OFFICE_ADMIN").length}
          variant="gold"
          icon={<UserCog className="h-6 w-6" />}
        />
        <StatCard label="Roles In Use" value={ROLES.length} icon={<UserCog className="h-6 w-6" />} />
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
            options: ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r })),
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Name</DataTableHeadCell>
          <DataTableHeadCell>Email</DataTableHeadCell>
          <DataTableHeadCell>Role</DataTableHeadCell>
          <DataTableHeadCell align="right">Joined</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={4} />}
          {filtered.map((u, idx) => (
            <DataTableRow key={u.id} index={idx}>
              <DataTableCell className="font-medium">{u.name}</DataTableCell>
              <DataTableCell>{u.email}</DataTableCell>
              <DataTableCell>
                <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as Role)}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DataTableCell>
              <DataTableCell align="right">{formatDate(u.createdAt)}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
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
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={saving}>
              {saving ? "Inviting…" : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
