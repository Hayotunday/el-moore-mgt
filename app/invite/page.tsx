import { redirect } from "next/navigation";

/**
 * The invite claim page now lives at /management/invite. This stub stays in place
 * only so an invite email link the backend already generated as /invite?token=...
 * keeps working — it forwards the full query string and can be deleted once no
 * outstanding invite email points here.
 */
export default async function LegacyInviteRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) query.set(key, value[0]);
  }
  const qs = query.toString();
  redirect(`/management/invite${qs ? `?${qs}` : ""}`);
}
