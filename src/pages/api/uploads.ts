import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, request }) => {
  const bucket = locals.runtime.env.ASSETS as R2Bucket;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const url = `/media/${key}`;

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
