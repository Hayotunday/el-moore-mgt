"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, BookOpen, Trash2, Pencil } from "lucide-react";
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
import TiptapEditor from "@/components/management/tiptap-editor";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  listAllPosts,
  createPost,
  updatePost,
  setPostPublished,
  deletePost,
  uploadPostCoverImage,
} from "@/lib/api/blog";
import type { BlogPost } from "@/lib/api/types";
import { blurActiveElement, formatDate } from "@/lib/utils";
import { useConfirm } from "@/contexts/confirm-dialog-context";

const EMPTY_FORM = { title: "", slug: "", content: "", published: false };

export default function BlogPage() {
  const confirm = useConfirm();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await listAllPosts());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [posts, search]);

  const openNew = () => {
    blurActiveElement();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    blurActiveElement();
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      published: post.published,
    });
    setCoverFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const text = form.content.replace(/<[^>]+>/g, "").trim();
    const hasImage = /<img\b[^>]*\bsrc\s*=/i.test(form.content);
    if (!form.title.trim() || (!text && !hasImage)) {
      toast.error("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      let postId = editingId;
      if (editingId) {
        await updatePost(editingId, {
          title: form.title,
          content: form.content,
        });
        await setPostPublished(editingId, form.published);
        toast.success("Post updated.");
      } else {
        const created = await createPost({
          title: form.title,
          slug: form.slug,
          content: form.content,
        });
        postId = created.id;
        if (form.published) await setPostPublished(created.id, true);
        toast.success("Post created.");
      }
      if (coverFile && postId) {
        await uploadPostCoverImage(postId, coverFile);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const action = post.published ? "unpublish" : "publish";
    const ok = await confirm({
      title: post.published ? "Unpublish Post?" : "Publish Post?",
      description: post.published
        ? `"${post.title}" will be hidden from the public blog immediately.`
        : `"${post.title}" will go live on the public blog immediately.`,
      confirmLabel: post.published ? "Unpublish" : "Publish",
    });
    if (!ok) return;
    try {
      await setPostPublished(post.id, !post.published);
      toast.success(post.published ? "Post unpublished." : "Post published.");
      await load();
    } catch {
      toast.error(`Could not ${action} post.`);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    const ok = await confirm({
      title: "Delete Post?",
      description: `"${post.title}" will be permanently deleted and removed from the blog.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePost(post.id);
      toast.success("Post deleted.");
      await load();
    } catch {
      toast.error("Could not delete post.");
    }
  };

  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Blog"
        subtitle="Manage the articles shown on the public El-Moore Academy blog."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Posts"
          value={posts.length}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          label="Published"
          value={publishedCount}
          variant="gold"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          label="Drafts"
          value={posts.length - publishedCount}
          icon={<BookOpen className="h-6 w-6" />}
        />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or slug…"
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Title</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="right">Published</DataTableHeadCell>
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={4} />}
          {filtered.map((post, idx) => (
            <DataTableRow key={post.id} index={idx}>
              <DataTableCell>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">/{post.slug}</p>
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={post.published ? "PUBLISHED" : "DRAFT"} />
              </DataTableCell>
              <DataTableCell align="right">
                {post.publishedAt ? formatDate(post.publishedAt) : "—"}
              </DataTableCell>
              <DataTableCell align="right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(post)}
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => openEdit(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDelete(post)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Drawer open={dialogOpen} onOpenChange={setDialogOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingId ? "Edit Post" : "New Post"}</DrawerTitle>
            <DrawerDescription>Write and publish an article to the public El-Moore blog.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>
                Slug (optional — auto-generated from title if left blank)
              </Label>
              <Input
                value={form.slug}
                disabled={editingId !== null}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="how-to-invest-in-property"
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <TiptapEditor
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                postId={editingId}
              />
            </div>
            <div className="grid gap-2">
              <Label>Cover image (optional)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              />
            </div>
            <div className="flex items-center justify-between rounded-sm bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Publish immediately
                </p>
                <p className="text-xs text-muted-foreground">
                  Publishing shows this on the public blog right away.
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, published: v }))
                }
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Post"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
