/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  DEPLOY_HOOK_URL: string | undefined;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
