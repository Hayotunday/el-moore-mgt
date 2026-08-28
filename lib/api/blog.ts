import { apiFetch, uploadToPresignedUrl } from "./client";
import type { BlogPost } from "./types";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Public — published posts only. */
export async function listPublishedPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>("/blog/posts");
}

/** Public — a single published post by slug or id. */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/posts/${slug}`);
}

/** OFFICE_ADMIN only — every post, including drafts. */
export async function listAllPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>("/blog/posts/admin");
}

/** OFFICE_ADMIN only. */
export async function createPost(input: {
  title: string;
  slug?: string;
  content: string;
}): Promise<BlogPost> {
  const slug = input.slug || slugify(input.title);
  return apiFetch<BlogPost>("/blog/posts", {
    method: "POST",
    body: JSON.stringify({ title: input.title, slug, content: input.content }),
  });
}

/** OFFICE_ADMIN only. */
export async function updatePost(
  id: string,
  input: Partial<Pick<BlogPost, "title" | "content">> & { slug?: string },
): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/posts/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

/** OFFICE_ADMIN only. */
export async function setPostPublished(id: string, published: boolean): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/posts/${id}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
}

/** OFFICE_ADMIN only. */
export async function deletePost(id: string): Promise<void> {
  await apiFetch<void>(`/blog/posts/${id}`, { method: "DELETE" });
}

/** OFFICE_ADMIN only. Uploads a file to R2 via a presigned URL, then confirms it. */
export async function uploadPostCoverImage(id: string, file: File): Promise<string> {
  const { uploadUrl } = await apiFetch<{ uploadUrl: string }>(`/blog/posts/${id}/cover-image`, {
    method: "PATCH",
    body: JSON.stringify({ filename: file.name }),
  });
  await uploadToPresignedUrl(uploadUrl, file);
  const coverImageUrl = uploadUrl.split("?")[0];
  await apiFetch<void>(`/blog/posts/${id}/cover-image/confirm`, {
    method: "POST",
    body: JSON.stringify({ coverImageUrl }),
  });
  return coverImageUrl;
}
