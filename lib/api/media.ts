import { apiFetch, uploadToPresignedUrl } from "./client";

/**
 * OFFICE_ADMIN only. Requests a presigned URL for an image to embed inline in blog or
 * newsletter rich text (no DB row created — the URL is inserted directly into the editor).
 */
export async function uploadContentImage(
  context: "blog" | "newsletter",
  contextId: string,
  file: File,
): Promise<string> {
  const { uploadUrl } = await apiFetch<{ uploadUrl: string }>("/media/content-image", {
    method: "POST",
    body: JSON.stringify({ context, contextId, filename: file.name }),
  });
  await uploadToPresignedUrl(uploadUrl, file);
  return uploadUrl.split("?")[0];
}
