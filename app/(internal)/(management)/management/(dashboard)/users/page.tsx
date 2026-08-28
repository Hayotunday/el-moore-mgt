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
  DialogDescription,
} from "@/components/ui/dialog";
import { listUsers, assignUserRole, createUser } from "@/lib/api/users";
import type { ManagementUser } from "@/lib/api/types";
import { MANAGEMENT_ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "SITE_COORDINATOR" as Role,
};

export default function UsersPage() {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await assignUserRole(userId, role);
      toast.success("Role updated.");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update role.",
      );
    }
  };

  const handleInvite = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and a starting password are required.");
      return;
    }
    setSaving(true);
    try {
      await createUser(form);
      toast.success("User created.");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create user.",
      );
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
            <Plus className="h-4 w-4" /> Add User
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={<UserCog className="h-6 w-6" />}
        />
        <StatCard
          label="Leadership"
          value={users.filter((u) => u.role === "MD" || u.role === "GM").length}
          variant="gold"
          icon={<UserCog className="h-6 w-6" />}
        />
        <StatCard
          label="Roles In Use"
          value={MANAGEMENT_ROLES.length}
          icon={<UserCog className="h-6 w-6" />}
        />
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
            options: MANAGEMENT_ROLES.map((r) => ({
              label: ROLE_LABELS[r],
              value: r,
            })),
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
                <Select
                  value={u.role}
                  onValueChange={(v) => handleRoleChange(u.id, v as Role)}
                >
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
              <DataTableCell align="right">
                {u.createdAt ? formatDate(u.createdAt) : "—"}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogDescription className="invisible">Users</DialogDescription>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Starting Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="At least 8 characters"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as Role }))
                }
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
