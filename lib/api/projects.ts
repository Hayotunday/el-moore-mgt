import { apiFetch, uploadToPresignedUrl, toPublicR2Url, R2_PUBLIC_BASE_URL } from "./client";
import type {
  Project,
  ProjectBudgetSummary,
  ProjectDetail,
  ProjectIssue,
  ProjectPhoto,
  ProjectStatus,
  ProjectUpdate,
  WorkItem,
  WorkItemStatus,
} from "./types";

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

/** Includes work items, issues, updates, and photos in one call. */
export async function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/projects/${id}`);
}

/** MD, GM, or PROJECT_MANAGER. */
export async function createProject(input: {
  name: string;
  location: string;
  description?: string;
  status?: ProjectStatus;
  overallProgressPercent?: number;
  budgetAllocated?: string;
  startDate?: string;
  expectedCompletionDate?: string;
}): Promise<Project> {
  return apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(input) });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function updateProject(
  id: string,
  input: Partial<{
    name: string;
    location: string;
    description: string;
    status: ProjectStatus;
    overallProgressPercent: number;
    budgetAllocated: string;
    startDate: string;
    expectedCompletionDate: string;
  }>,
): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function deleteProject(id: string): Promise<void> {
  await apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}

export async function getProjectBudgetSummary(id: string): Promise<ProjectBudgetSummary> {
  return apiFetch<ProjectBudgetSummary>(`/projects/${id}/budget-summary`);
}

/* ---------- Work items ---------- */

export async function listWorkItems(projectId: string): Promise<WorkItem[]> {
  return apiFetch<WorkItem[]>(`/projects/${projectId}/work-items`);
}

/** MD, GM, or PROJECT_MANAGER. */
export async function createWorkItem(
  projectId: string,
  input: {
    name: string;
    progressPercent?: number;
    status?: WorkItemStatus;
    contractorId?: string;
    expectedCompletionDate?: string;
    latestUpdate?: string;
  },
): Promise<WorkItem> {
  return apiFetch<WorkItem>(`/projects/${projectId}/work-items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function updateWorkItem(
  projectId: string,
  itemId: string,
  input: Partial<{
    name: string;
    progressPercent: number;
    status: WorkItemStatus;
    contractorId: string;
    expectedCompletionDate: string;
    latestUpdate: string;
  }>,
): Promise<WorkItem> {
  return apiFetch<WorkItem>(`/projects/${projectId}/work-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** MD, GM, or PROJECT_MANAGER. Nulls out linked issues, updates, and photos. */
export async function deleteWorkItem(projectId: string, itemId: string): Promise<void> {
  await apiFetch<void>(`/projects/${projectId}/work-items/${itemId}`, { method: "DELETE" });
}

/* ---------- Issues ---------- */

export async function listIssues(projectId: string): Promise<ProjectIssue[]> {
  return apiFetch<ProjectIssue[]>(`/projects/${projectId}/issues`);
}

/** Any internal role can report an issue. */
export async function reportIssue(
  projectId: string,
  input: { description: string; workItemId?: string },
): Promise<ProjectIssue> {
  return apiFetch<ProjectIssue>(`/projects/${projectId}/issues`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function resolveIssue(projectId: string, issueId: string): Promise<ProjectIssue> {
  return apiFetch<ProjectIssue>(`/projects/${projectId}/issues/${issueId}/resolve`, {
    method: "PATCH",
  });
}

/* ---------- Updates ---------- */

export async function listProjectUpdates(projectId: string): Promise<ProjectUpdate[]> {
  return apiFetch<ProjectUpdate[]>(`/projects/${projectId}/updates`);
}

/** Any internal role. */
export async function postProjectUpdate(
  projectId: string,
  input: { note: string; workItemId?: string; visibleToCustomers?: boolean },
): Promise<ProjectUpdate> {
  return apiFetch<ProjectUpdate>(`/projects/${projectId}/updates`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function setUpdateVisibility(
  projectId: string,
  updateId: string,
  visibleToCustomers: boolean,
): Promise<ProjectUpdate> {
  return apiFetch<ProjectUpdate>(`/projects/${projectId}/updates/${updateId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ visibleToCustomers }),
  });
}

/* ---------- Photos ---------- */

export async function listProjectPhotos(projectId: string): Promise<ProjectPhoto[]> {
  return apiFetch<ProjectPhoto[]>(`/projects/${projectId}/photos`);
}

/** MD, GM, or PROJECT_MANAGER. Uploads a file to R2 via a presigned URL, then confirms it. */
export async function uploadProjectPhoto(
  projectId: string,
  file: File,
  visibleToCustomers = false,
): Promise<ProjectPhoto> {
  const { uploadUrl } = await apiFetch<{ uploadUrl: string }>(
    `/projects/${projectId}/photos/upload-url`,
    { method: "POST", body: JSON.stringify({ filename: file.name }) },
  );
  await uploadToPresignedUrl(uploadUrl, file);
  const photoUrl = toPublicR2Url(uploadUrl, R2_PUBLIC_BASE_URL);
  return apiFetch<ProjectPhoto>(`/projects/${projectId}/photos`, {
    method: "POST",
    body: JSON.stringify({ photoUrl, visibleToCustomers }),
  });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function setPhotoVisibility(
  projectId: string,
  photoId: string,
  visibleToCustomers: boolean,
): Promise<ProjectPhoto> {
  return apiFetch<ProjectPhoto>(`/projects/${projectId}/photos/${photoId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ visibleToCustomers }),
  });
}

/** MD, GM, or PROJECT_MANAGER. */
export async function deleteProjectPhoto(projectId: string, photoId: string): Promise<void> {
  await apiFetch<void>(`/projects/${projectId}/photos/${photoId}`, { method: "DELETE" });
}

/* ---------- Customer-facing portal ---------- */

/** Authenticated customer. Projects linked to properties they've purchased. */
export async function listMyProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/customer/projects");
}

/** Authenticated customer. Includes work items and only customer-visible updates/photos.
 *  Only accessible if the customer has a sale linked to a property in this project. */
export async function getMyProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/customer/projects/${id}`);
}
