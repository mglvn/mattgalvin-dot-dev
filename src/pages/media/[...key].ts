import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals, params }) => {
  const bucket = locals.runtime.env.ASSETS as R2Bucket;
  const key = params.key;

  if (!key) return new Response(null, { status: 404 });

  const object = await bucket.get(key);
  if (!object) return new Response(null, { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
