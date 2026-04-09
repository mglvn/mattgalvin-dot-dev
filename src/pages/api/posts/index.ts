export const prerender = false;
import type { APIRoute } from "astro";
import { listPosts, createPost } from "../../../lib/db";

function triggerDeploy(hookUrl: string | undefined): void {
  if (hookUrl) fetch(hookUrl, { method: "POST" }).catch(() => {});
}

export const GET: APIRoute = async ({ locals, url }) => {
  const { DB: db } = locals.runtime.env;
  const type = url.searchParams.get("type") ?? undefined;
  const all = url.searchParams.get("all") === "1";

  try {
    const posts = await listPosts(db, type, !all);
    return Response.json(posts);
  } catch (e) {
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  const { DB, DEPLOY_HOOK_URL } = locals.runtime.env;

  try {
    const body = await request.json() as Record<string, unknown>;
    const post = await createPost(DB, {
      title:       String(body.title ?? ""),
      slug:        String(body.slug ?? ""),
      body:        String(body.body ?? ""),
      description: String(body.description ?? ""),
      tags:        typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags ?? []),
      type:        (body.type as "blog" | "projects") ?? "blog",
      status:      (body.status as "active" | "wip" | "archived") ?? "active",
      published:   body.published ? 1 : 0,
      date:        String(body.date ?? new Date().toISOString().slice(0, 10)),
    });
    triggerDeploy(DEPLOY_HOOK_URL);
    return Response.json(post, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create post";
    return Response.json({ error: msg }, { status: 400 });
  }
};
