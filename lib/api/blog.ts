import { apiFetch, IS_MOCK } from "./client";
import { delay, blogPosts, uid } from "./mock-store";
import type { BlogPost } from "./types";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function listPosts(opts: { publishedOnly?: boolean } = {}): Promise<BlogPost[]> {
  if (IS_MOCK) {
    await delay();
    return blogPosts
      .filter((p) => !opts.publishedOnly || p.published)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return apiFetch<BlogPost[]>(`/blog${opts.publishedOnly ? "?published=true" : ""}`);
}

export async function createPost(input: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  authorId: string;
  authorName: string;
  published: boolean;
}): Promise<BlogPost> {
  if (IS_MOCK) {
    await delay(400);
    const newPost: BlogPost = {
      id: uid("post"),
      slug: slugify(input.title),
      publishedAt: input.published ? new Date().toISOString().slice(0, 10) : null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    blogPosts.unshift(newPost);
    return { ...newPost };
  }
  return apiFetch<BlogPost>("/blog", { method: "POST", body: JSON.stringify(input) });
}

export async function updatePost(
  id: string,
  input: Partial<Pick<BlogPost, "title" | "excerpt" | "content" | "category" | "image">>,
): Promise<BlogPost> {
  if (IS_MOCK) {
    await delay(300);
    const post = blogPosts.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    Object.assign(post, input);
    if (input.title) post.slug = slugify(input.title);
    return { ...post };
  }
  return apiFetch<BlogPost>(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function setPostPublished(id: string, published: boolean): Promise<BlogPost> {
  if (IS_MOCK) {
    await delay(300);
    const post = blogPosts.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    post.published = published;
    post.publishedAt = published ? new Date().toISOString().slice(0, 10) : null;
    return { ...post };
  }
  return apiFetch<BlogPost>(`/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ published }),
  });
}

export async function deletePost(id: string): Promise<void> {
  if (IS_MOCK) {
    await delay(300);
    const idx = blogPosts.findIndex((p) => p.id === id);
    if (idx !== -1) blogPosts.splice(idx, 1);
    return;
  }
  await apiFetch<void>(`/blog/${id}`, { method: "DELETE" });
}
