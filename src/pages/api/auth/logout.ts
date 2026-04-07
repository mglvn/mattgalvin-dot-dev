import type { APIRoute } from "astro";
import { clearSessionCookie } from "../../../lib/auth";

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 303,
    headers: {
      "Set-Cookie": clearSessionCookie(!import.meta.env.DEV),
      Location: "/admin/login",
    },
  });
};
