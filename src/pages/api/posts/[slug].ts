import type { APIRoute } from "astro";
import { getPost, updatePost, deletePost } from "../../../lib/db";

export const GET: APIRoute = async ({ locals, params }) => {
  const db = locals.runtime.env.DB;
  const post = await getPost(db, params.slug!);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  const db = locals.runtime.env.DB;
  try {
    const body = await request.json() as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.title       !== undefined) data.title       = String(body.title);
    if (body.body        !== undefined) data.body        = String(body.body);
    if (body.description !== undefined) data.description = String(body.description);
    if (body.tags        !== undefined) data.tags        = typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags);
    if (body.type        !== undefined) data.type        = body.type;
    if (body.status      !== undefined) data.status      = body.status;
    if (body.published   !== undefined) data.published   = body.published ? 1 : 0;
    if (body.date        !== undefined) data.date        = String(body.date);

    const post = await updatePost(db, params.slug!, data as Parameters<typeof updatePost>[2]);
    return Response.json(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update post";
    return Response.json({ error: msg }, { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const db = locals.runtime.env.DB;
  const ok = await deletePost(db, params.slug!);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
};
