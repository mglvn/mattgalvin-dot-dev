export interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  description: string;
  tags: string; // JSON array string e.g. '["Go","Postgres"]'
  type: "blog" | "projects";
  status: "active" | "wip" | "archived";
  published: number; // 0 | 1
  date: string;
  created_at: string;
}

export function parseTags(tags: string): string[] {
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export async function listPosts(
  db: D1Database,
  type?: string,
  publishedOnly = true
): Promise<Post[]> {
  let query = "SELECT * FROM posts WHERE 1=1";
  const bindings: unknown[] = [];

  if (type) {
    query += " AND type = ?";
    bindings.push(type);
  }
  if (publishedOnly) {
    query += " AND published = 1";
  }
  query += " ORDER BY date DESC";

  const stmt = db.prepare(query);
  const result = await stmt.bind(...bindings).all<Post>();
  return result.results;
}

export async function getPost(
  db: D1Database,
  slug: string
): Promise<Post | null> {
  return db
    .prepare("SELECT * FROM posts WHERE slug = ?")
    .bind(slug)
    .first<Post>();
}

export async function createPost(
  db: D1Database,
  data: Omit<Post, "id" | "created_at">
): Promise<Post> {
  const result = await db
    .prepare(
      `INSERT INTO posts (title, slug, body, description, tags, type, status, published, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(
      data.title,
      data.slug,
      data.body,
      data.description,
      data.tags,
      data.type,
      data.status,
      data.published,
      data.date
    )
    .first<Post>();
  if (!result) throw new Error("Failed to create post");
  return result;
}

export async function updatePost(
  db: D1Database,
  slug: string,
  data: Partial<Omit<Post, "id" | "created_at" | "slug">>
): Promise<Post> {
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(", ");
  const values = Object.values(data);
  const result = await db
    .prepare(`UPDATE posts SET ${fields} WHERE slug = ? RETURNING *`)
    .bind(...values, slug)
    .first<Post>();
  if (!result) throw new Error("Post not found");
  return result;
}

export async function deletePost(
  db: D1Database,
  slug: string
): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM posts WHERE slug = ?")
    .bind(slug)
    .run();
  return result.success;
}
