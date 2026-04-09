import { describe, it, expect, beforeEach } from "vitest";
import { getCachedPostsList, getCachedPost, invalidatePost } from "../posts-cache";
import type { Post } from "../db";

// --- minimal mocks ---

function makeKV(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: async (key: string, type?: string) => {
      const val = store.get(key) ?? null;
      if (val && type === "json") return JSON.parse(val);
      return val;
    },
    put: async (key: string, value: string) => { store.set(key, value); },
    delete: async (key: string) => { store.delete(key); },
    list: async () => ({ keys: [], list_complete: true, cursor: "" }),
    getWithMetadata: async () => ({ value: null, metadata: null }),
  } as unknown as KVNamespace;
}

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: "Test Post",
    slug: "test-post",
    body: "Hello **world**",
    description: "A test",
    tags: '["test"]',
    type: "blog",
    status: "active",
    published: 1,
    date: "2024-01-01",
    hero_image: "",
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeDB(posts: Post[] = []): D1Database {
  return {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: posts }),
        first: async () => posts[0] ?? null,
        run: async () => ({ success: true }),
      }),
    }),
  } as unknown as D1Database;
}

// --- tests ---

describe("getCachedPostsList", () => {
  let kv: KVNamespace;

  beforeEach(() => { kv = makeKV(); });

  it("fetches from D1 on cache miss and caches result", async () => {
    const post = makePost();
    const db = makeDB([post]);

    const result = await getCachedPostsList(kv, db, "blog");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("test-post");

    // second call should hit KV, not D1 (D1 now returns nothing)
    const emptyDb = makeDB([]);
    const cached = await getCachedPostsList(kv, emptyDb, "blog");
    expect(cached).toHaveLength(1);
  });

  it("returns cached list on cache hit", async () => {
    const post = makePost();
    const db = makeDB([post]);

    await getCachedPostsList(kv, db, "blog");
    const result = await getCachedPostsList(kv, makeDB([]), "blog");
    expect(result[0].title).toBe("Test Post");
  });

  it("keeps blog and projects lists separate", async () => {
    const blogPost = makePost({ slug: "blog-1", type: "blog" });
    const projectPost = makePost({ id: 2, slug: "proj-1", type: "projects" });

    await getCachedPostsList(kv, makeDB([blogPost]), "blog");
    await getCachedPostsList(kv, makeDB([projectPost]), "projects");

    const blogs = await getCachedPostsList(kv, makeDB([]), "blog");
    const projects = await getCachedPostsList(kv, makeDB([]), "projects");

    expect(blogs[0].slug).toBe("blog-1");
    expect(projects[0].slug).toBe("proj-1");
  });
});

describe("getCachedPost", () => {
  let kv: KVNamespace;

  beforeEach(() => { kv = makeKV(); });

  it("returns null for a missing post", async () => {
    const result = await getCachedPost(kv, makeDB([]), "no-such-post");
    expect(result).toBeNull();
  });

  it("fetches from D1 on miss and includes rendered html", async () => {
    const post = makePost();
    const result = await getCachedPost(kv, makeDB([post]), "test-post");
    expect(result).not.toBeNull();
    expect(result!.post.slug).toBe("test-post");
    expect(result!.html).toContain("<strong>world</strong>");
  });

  it("returns cached entry on second call", async () => {
    const post = makePost();
    await getCachedPost(kv, makeDB([post]), "test-post");

    // D1 now returns nothing — should still get cached result
    const cached = await getCachedPost(kv, makeDB([]), "test-post");
    expect(cached!.post.slug).toBe("test-post");
  });
});

describe("invalidatePost", () => {
  let kv: KVNamespace;

  beforeEach(() => { kv = makeKV(); });

  it("clears the post key and both list keys", async () => {
    const post = makePost();
    const db = makeDB([post]);

    // warm up all three keys
    await getCachedPostsList(kv, db, "blog");
    await getCachedPostsList(kv, db, "projects");
    await getCachedPost(kv, db, "test-post");

    await invalidatePost(kv, "test-post");

    // after invalidation, empty DB should yield misses
    const blogs = await getCachedPostsList(kv, makeDB([]), "blog");
    const projects = await getCachedPostsList(kv, makeDB([]), "projects");
    const postEntry = await getCachedPost(kv, makeDB([]), "test-post");

    expect(blogs).toHaveLength(0);
    expect(projects).toHaveLength(0);
    expect(postEntry).toBeNull();
  });
});
