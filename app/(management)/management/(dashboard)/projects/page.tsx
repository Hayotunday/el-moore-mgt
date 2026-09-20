"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Building,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Camera,
  Trash2,
  Upload,
  Pencil,
  DollarSign,
  TrendingUp,
  FolderKanban,
  Send,
  Loader2,
  Eye,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem,
  reportIssue,
  resolveIssue,
  postProjectUpdate,
  uploadProjectPhoto,
  deleteProjectPhoto,
} from "@/lib/api/projects";
import type {
  Project,
  ProjectDetail,
  ProjectStatus,
  WorkItem,
  WorkItemStatus,
  ProjectIssue,
  ProjectUpdate,
  ProjectPhoto,
} from "@/lib/api/types";
import { formatCurrency, formatDate, blurActiveElement } from "@/lib/utils";

const PROJECT_STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"];
const WORK_ITEM_STATUSES: WorkItemStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "DELAYED"];

const EMPTY_PROJECT_FORM = {
  name: "",
  location: "",
  description: "",
  status: "IN_PROGRESS" as ProjectStatus,
  overallProgressPercent: 0,
  budgetAllocated: "",
  startDate: "",
  expectedCompletionDate: "",
};

export default function ProjectsPage() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Project Drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);

  // Detail Drawer
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "work_items" | "issues" | "updates" | "photos">("overview");

  // Detail sub-actions
  const [newWorkItemName, setNewWorkItemName] = useState("");
  const [newWorkItemStatus, setNewWorkItemStatus] = useState<WorkItemStatus>("NOT_STARTED");
  const [addingWorkItem, setAddingWorkItem] = useState(false);

  const [issueDesc, setIssueDesc] = useState("");
  const [reportingIssue, setReportingIssue] = useState(false);

  const [updateNote, setUpdateNote] = useState("");
  const [visibleToCustomers, setVisibleToCustomers] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await listProjects());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await getProject(id);
      setProjectDetail(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load project details.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const openProjectDetail = (proj: Project) => {
    blurActiveElement();
    setSelectedProjectId(proj.id);
    setActiveDetailTab("overview");
    setDetailDrawerOpen(true);
    loadDetail(proj.id);
  };

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [projects, search, statusFilter]);

  const totalBudgetAllocated = useMemo(
    () => projects.reduce((sum, p) => sum + Number(p.budgetAllocated || 0), 0),
    [projects],
  );

  const activeProjectsCount = useMemo(
    () => projects.filter((p) => p.status === "IN_PROGRESS").length,
    [projects],
  );

  // Project Creation
  const handleOpenCreate = () => {
    blurActiveElement();
    setProjectForm(EMPTY_PROJECT_FORM);
    setCreateDrawerOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name || !projectForm.location) {
      toast.error("Project name and location are required.");
      return;
    }
    setCreating(true);
    try {
      await createProject({
        name: projectForm.name,
        location: projectForm.location,
        description: projectForm.description || undefined,
        status: projectForm.status,
        overallProgressPercent: Number(projectForm.overallProgressPercent) || 0,
        budgetAllocated: projectForm.budgetAllocated || undefined,
        startDate: projectForm.startDate || undefined,
        expectedCompletionDate: projectForm.expectedCompletionDate || undefined,
      });
      toast.success("Project created successfully.");
      setCreateDrawerOpen(false);
      setProjectForm(EMPTY_PROJECT_FORM);
      await loadProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create project.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (proj: Project) => {
    const ok = await confirm({
      title: `Delete Project ${proj.name}?`,
      description: "This removes the development project and all its work items permanently.",
      confirmLabel: "Delete Project",
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteProject(proj.id);
      toast.success("Project deleted.");
      setDetailDrawerOpen(false);
      await loadProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete project.");
    }
  };

  // Sub-Actions inside Project Detail
  const handleAddWorkItem = async () => {
    if (!selectedProjectId || !newWorkItemName) return;
    setAddingWorkItem(true);
    try {
      await createWorkItem(selectedProjectId, {
        name: newWorkItemName,
        status: newWorkItemStatus,
        progressPercent: 0,
      });
      toast.success("Work item added.");
      setNewWorkItemName("");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add work item.");
    } finally {
      setAddingWorkItem(false);
    }
  };

  const handleUpdateWorkItemStatus = async (item: WorkItem, newStatus: WorkItemStatus) => {
    if (!selectedProjectId) return;
    try {
      await updateWorkItem(selectedProjectId, item.id, {
        status: newStatus,
        progressPercent: newStatus === "COMPLETED" ? 100 : item.progressPercent,
      });
      toast.success("Work item updated.");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update work item.");
    }
  };

  const handleReportIssue = async () => {
    if (!selectedProjectId || !issueDesc) return;
    setReportingIssue(true);
    try {
      await reportIssue(selectedProjectId, { description: issueDesc });
      toast.success("Issue reported.");
      setIssueDesc("");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not report issue.");
    } finally {
      setReportingIssue(false);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    if (!selectedProjectId) return;
    try {
      await resolveIssue(selectedProjectId, issueId);
      toast.success("Issue marked as resolved.");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resolve issue.");
    }
  };

  const handlePostUpdate = async () => {
    if (!selectedProjectId || !updateNote) return;
    setPostingUpdate(true);
    try {
      await postProjectUpdate(selectedProjectId, {
        note: updateNote,
        visibleToCustomers,
      });
      toast.success("Update posted.");
      setUpdateNote("");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post update.");
    } finally {
      setPostingUpdate(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedProjectId || !photoFile) return;
    setUploadingPhoto(true);
    try {
      await uploadProjectPhoto(selectedProjectId, photoFile, {
        caption: photoCaption || undefined,
        visibleToCustomers: true,
      });
      toast.success("Project photo uploaded.");
      setPhotoFile(null);
      setPhotoCaption("");
      await loadDetail(selectedProjectId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Construction Projects"
        subtitle="Manage real estate site developments, work items, budget allocations, and site updates."
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Projects"
          value={loading ? "…" : projects.length}
          icon={<FolderKanban className="h-6 w-6" />}
        />
        <StatCard
          label="Active Developments"
          value={loading ? "…" : activeProjectsCount}
          sublabel="Currently in progress"
          icon={<Building className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Total Budget Allocated"
          value={loading ? "…" : formatCurrency(totalBudgetAllocated)}
          icon={<DollarSign className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Completed Projects"
          value={loading ? "…" : projects.filter((p) => p.status === "COMPLETED").length}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
      </div>

      {/* Search & Status Filter */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project name or location…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Planning", value: "PLANNING" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "On Hold", value: "ON_HOLD" },
              { label: "Completed", value: "COMPLETED" },
            ],
          },
        ]}
      />

      {/* Projects Table */}
      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Project Name</DataTableHeadCell>
          <DataTableHeadCell>Location</DataTableHeadCell>
          <DataTableHeadCell align="center">Progress</DataTableHeadCell>
          <DataTableHeadCell align="right">Budget</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {loading ? (
            <DataTableRow index={0}>
              <DataTableCell align="center" className="py-8 text-muted-foreground">
                Loading projects…
              </DataTableCell>
              <DataTableCell>{""}</DataTableCell>
              <DataTableCell>{""}</DataTableCell>
              <DataTableCell>{""}</DataTableCell>
              <DataTableCell>{""}</DataTableCell>
              <DataTableCell>{""}</DataTableCell>
            </DataTableRow>
          ) : filteredProjects.length === 0 ? (
            <DataTableEmpty colSpan={6} />
          ) : (
            filteredProjects.map((proj, idx) => (
              <DataTableRow key={proj.id} index={idx}>
                <DataTableCell className="font-semibold text-foreground">
                  {proj.name}
                </DataTableCell>
                <DataTableCell className="text-xs text-muted-foreground">
                  {proj.location}
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="w-28 mx-auto space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-foreground">
                      <span>{proj.overallProgressPercent || 0}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all duration-300"
                        style={{ width: `${Math.min(100, proj.overallProgressPercent || 0)}%` }}
                      />
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell align="right" className="font-medium text-foreground">
                  {proj.budgetAllocated ? formatCurrency(proj.budgetAllocated) : "—"}
                </DataTableCell>
                <DataTableCell align="center">
                  <StatusBadge status={proj.status || "PLANNING"} />
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      onClick={() => openProjectDetail(proj)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      {/* Create Project Drawer */}
      <Drawer open={createDrawerOpen} onOpenChange={setCreateDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New Construction Project</DrawerTitle>
            <DrawerDescription>Create a new site development project.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid gap-2">
              <Label>Project Name</Label>
              <Input
                placeholder="e.g. Palm Haven Estate Phase 1"
                value={projectForm.name}
                onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Location / Site Address</Label>
              <Input
                placeholder="e.g. Epe Express, Lagos"
                value={projectForm.location}
                onChange={(e) => setProjectForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={projectForm.status}
                onValueChange={(val) => setProjectForm((f) => ({ ...f, status: val as ProjectStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((stg) => (
                    <SelectItem key={stg} value={stg}>
                      {stg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Allocated Budget (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 50000000"
                value={projectForm.budgetAllocated}
                onChange={(e) => setProjectForm((f) => ({ ...f, budgetAllocated: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Completion Date</Label>
                <Input
                  type="date"
                  value={projectForm.expectedCompletionDate}
                  onChange={(e) => setProjectForm((f) => ({ ...f, expectedCompletionDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Project Description (Optional)</Label>
              <Textarea
                rows={3}
                placeholder="Key deliverables, infrastructure scope..."
                value={projectForm.description}
                onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setCreateDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={creating}>
              {creating ? "Creating…" : "Create Project"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Project Detail Slide-Over Drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} direction="right">
        <DrawerContent className="w-full sm:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>{projectDetail ? projectDetail.name : "Project Details"}</DrawerTitle>
            <DrawerDescription>
              {projectDetail ? projectDetail.location : "Development management"}
            </DrawerDescription>
          </DrawerHeader>

          {loadingDetail || !projectDetail ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DrawerBody className="space-y-6">
              {/* Profile Overview Card */}
              <div className="rounded-md border p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={projectDetail.status} />
                  <p className="text-xs font-bold text-foreground">
                    Progress: {projectDetail.overallProgressPercent || 0}%
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${Math.min(100, projectDetail.overallProgressPercent || 0)}%` }}
                  />
                </div>
              </div>

              {/* Sub-Tabs: Overview, Work Items, Issues, Updates, Photos */}
              <Tabs
                value={activeDetailTab}
                onValueChange={(v) => setActiveDetailTab(v as typeof activeDetailTab)}
                className="space-y-4"
              >
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="work_items">Work Items ({projectDetail.workItems?.length || 0})</TabsTrigger>
                  <TabsTrigger value="issues">Issues ({projectDetail.issues?.length || 0})</TabsTrigger>
                  <TabsTrigger value="updates">Updates ({projectDetail.updates?.length || 0})</TabsTrigger>
                  <TabsTrigger value="photos">Photos ({projectDetail.photos?.length || 0})</TabsTrigger>
                </TabsList>

                {/* Sub Tab: Overview */}
                <TabsContent value="overview" className="space-y-4 m-0">
                  <div className="space-y-2 text-sm text-foreground">
                    <p><span className="font-semibold">Allocated Budget:</span> {projectDetail.budgetAllocated ? formatCurrency(projectDetail.budgetAllocated) : "—"}</p>
                    <p><span className="font-semibold">Start Date:</span> {projectDetail.startDate ? formatDate(projectDetail.startDate) : "—"}</p>
                    <p><span className="font-semibold">Expected Completion:</span> {projectDetail.expectedCompletionDate ? formatDate(projectDetail.expectedCompletionDate) : "—"}</p>
                    <p className="pt-2 text-muted-foreground">{projectDetail.description || "No description provided."}</p>
                  </div>
                </TabsContent>

                {/* Sub Tab: Work Items */}
                <TabsContent value="work_items" className="space-y-4 m-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New work item (e.g. Drainage construction)..."
                      value={newWorkItemName}
                      onChange={(e) => setNewWorkItemName(e.target.value)}
                    />
                    <Button size="sm" onClick={handleAddWorkItem} disabled={addingWorkItem}>
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {projectDetail.workItems?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No work items logged yet.</p>
                    ) : (
                      projectDetail.workItems?.map((item) => (
                        <div key={item.id} className="rounded-md border p-3 flex items-center justify-between gap-3 bg-card">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Progress: {item.progressPercent}%</p>
                          </div>
                          <Select
                            value={item.status}
                            onValueChange={(val) => handleUpdateWorkItemStatus(item, val as WorkItemStatus)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WORK_ITEM_STATUSES.map((st) => (
                                <SelectItem key={st} value={st}>
                                  {st}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Sub Tab: Issues */}
                <TabsContent value="issues" className="space-y-4 m-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Report an issue or delay..."
                      value={issueDesc}
                      onChange={(e) => setIssueDesc(e.target.value)}
                    />
                    <Button size="sm" variant="outline" className="text-destructive" onClick={handleReportIssue} disabled={reportingIssue}>
                      Report Issue
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {projectDetail.issues?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No active issues reported.</p>
                    ) : (
                      projectDetail.issues?.map((issue) => (
                        <div key={issue.id} className="rounded-md border p-3 flex items-center justify-between gap-3 bg-card">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{issue.description}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {issue.createdAt ? formatDate(issue.createdAt) : "—"}
                            </p>
                          </div>
                          {issue.resolvedAt ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                              Resolved
                            </span>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleResolveIssue(issue.id)}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Sub Tab: Updates */}
                <TabsContent value="updates" className="space-y-4 m-0">
                  <div className="space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Post a progress update note..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleToCustomers}
                          onChange={(e) => setVisibleToCustomers(e.target.checked)}
                          className="rounded"
                        />
                        Visible to customer portal
                      </label>
                      <Button size="sm" onClick={handlePostUpdate} disabled={postingUpdate}>
                        Post Update
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {projectDetail.updates?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No updates posted yet.</p>
                    ) : (
                      projectDetail.updates?.map((upd) => (
                        <div key={upd.id} className="rounded-md border p-3 bg-card space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {upd.createdAt ? formatDate(upd.createdAt) : "—"}
                          </p>
                          <p className="text-sm text-foreground">{upd.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Sub Tab: Photos */}
                <TabsContent value="photos" className="space-y-4 m-0">
                  <div className="space-y-2 rounded-md border p-3 bg-muted/20">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    />
                    <Input
                      placeholder="Photo caption (e.g. Foundation laying)..."
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                    />
                    <Button size="sm" onClick={handleUploadPhoto} disabled={uploadingPhoto}>
                      <Upload className="h-3.5 w-3.5" /> Upload Photo
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {projectDetail.photos?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic col-span-2">No site photos uploaded yet.</p>
                    ) : (
                      projectDetail.photos?.map((photo) => (
                        <div key={photo.id} className="rounded-md border overflow-hidden bg-card shadow-sm space-y-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.photoUrl} alt="Site photo" className="h-28 w-full object-cover" />
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DrawerBody>
          )}

          <DrawerFooter className="flex flex-row justify-between">
            {projectDetail && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteProject(projectDetail)}
              >
                <Trash2 className="h-4 w-4" /> Delete Project
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setDetailDrawerOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
