import type { APIRoute } from "astro";
import { listPosts, createPost } from "../../../lib/db";

export const GET: APIRoute = async ({ locals, url }) => {
  const db = locals.runtime.env.DB;
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
  const db = locals.runtime.env.DB;

  try {
    const body = await request.json() as Record<string, unknown>;
    const post = await createPost(db, {
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
    return Response.json(post, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create post";
    return Response.json({ error: msg }, { status: 400 });
  }
};
