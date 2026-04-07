/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
