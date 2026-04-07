import { defineMiddleware } from "astro:middleware";
import { verifySession, COOKIE_NAME } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) return next();
  if (pathname === "/admin/login") return next();

  const session = context.cookies.get(COOKIE_NAME)?.value;
  if (!session) return context.redirect("/admin/login");

  const secret = (context.locals as App.Locals).runtime.env.SESSION_SECRET;
  if (!secret || !(await verifySession(session, secret))) {
    return context.redirect("/admin/login");
  }

  return next();
});
