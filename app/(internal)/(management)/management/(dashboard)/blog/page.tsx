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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  listPosts,
  createPost,
  updatePost,
  setPostPublished,
  deletePost,
} from "@/lib/api/blog";
import type { BlogPost } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

const EMPTY_FORM = { title: "", excerpt: "", content: "", category: "", published: false };

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setPosts(await listPosts());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [posts, search]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.excerpt || !form.content || !user) {
      toast.error("Title, excerpt and content are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updatePost(editingId, {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
        });
        await setPostPublished(editingId, form.published);
        toast.success("Post updated.");
      } else {
        await createPost({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category || "General",
          authorId: user.id,
          authorName: user.name,
          published: form.published,
        });
        toast.success("Post created.");
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
    try {
      await setPostPublished(post.id, !post.published);
      toast.success(post.published ? "Post unpublished." : "Post published.");
      await load();
    } catch {
      toast.error("Could not update post.");
    }
  };

  const handleDelete = async (post: BlogPost) => {
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
        <StatCard label="Total Posts" value={posts.length} icon={<BookOpen className="h-6 w-6" />} />
        <StatCard label="Published" value={publishedCount} variant="gold" icon={<BookOpen className="h-6 w-6" />} />
        <StatCard label="Drafts" value={posts.length - publishedCount} icon={<BookOpen className="h-6 w-6" />} />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or category…"
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Title</DataTableHeadCell>
          <DataTableHeadCell>Author</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="right">Published</DataTableHeadCell>
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={5} />}
          {filtered.map((post, idx) => (
            <DataTableRow key={post.id} index={idx}>
              <DataTableCell>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">{post.category}</p>
              </DataTableCell>
              <DataTableCell>{post.authorName}</DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={post.published ? "PUBLISHED" : "DRAFT"} />
              </DataTableCell>
              <DataTableCell align="right">
                {post.publishedAt ? formatDate(post.publishedAt) : "—"}
              </DataTableCell>
              <DataTableCell align="right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleTogglePublish(post)}>
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(post)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Market Insights"
              />
            </div>
            <div className="grid gap-2">
              <Label>Excerpt</Label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Content</Label>
              <Textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-sm bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Publish immediately</p>
                <p className="text-xs text-muted-foreground">
                  Publishing shows this on the public blog right away.
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
