import { listPosts, getPost, type Post } from "./db";
import { marked } from "marked";

const TTL = 60 * 60 * 24 * 7; // 7-day safety-net TTL; invalidation on write keeps things fresh

function listKey(type: "blog" | "projects"): string {
  return `list:${type}`;
}

function postKey(slug: string): string {
  return `post:${slug}`;
}

export async function getCachedPostsList(
  kv: KVNamespace,
  db: D1Database,
  type: "blog" | "projects"
): Promise<Post[]> {
  const cached = await kv.get<Post[]>(listKey(type), "json");
  if (cached) return cached;

  const posts = await listPosts(db, type, true);
  await kv.put(listKey(type), JSON.stringify(posts), { expirationTtl: TTL });
  return posts;
}

export interface CachedPost {
  post: Post;
  html: string;
}

export async function getCachedPost(
  kv: KVNamespace,
  db: D1Database,
  slug: string
): Promise<CachedPost | null> {
  const cached = await kv.get<CachedPost>(postKey(slug), "json");
  if (cached) return cached;

  const post = await getPost(db, slug);
  if (!post) return null;

  const html = await marked(post.body);
  const entry: CachedPost = { post, html };
  await kv.put(postKey(slug), JSON.stringify(entry), { expirationTtl: TTL });
  return entry;
}

/** Call after any create / update / delete to keep KV in sync with D1. */
export async function invalidatePost(
  kv: KVNamespace,
  slug: string
): Promise<void> {
  await Promise.all([
    kv.delete(postKey(slug)),
    kv.delete(listKey("blog")),
    kv.delete(listKey("projects")),
  ]);
}
