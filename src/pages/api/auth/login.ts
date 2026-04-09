export const prerender = false;
import type { APIRoute } from "astro";
import { createSessionCookie } from "../../../lib/auth";

export const POST: APIRoute = async ({ locals, request }) => {
  const env = locals.runtime.env;
  const formData = await request.formData();
  const password = formData.get("password") as string;

  if (!password || !env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/admin/login?error=1" },
    });
  }

  const cookie = await createSessionCookie(env.SESSION_SECRET, !import.meta.env.DEV);
  return new Response(null, {
    status: 303,
    headers: {
      "Set-Cookie": cookie,
      Location: "/admin",
    },
  });
};
