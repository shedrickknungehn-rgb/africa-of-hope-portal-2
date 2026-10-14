import { supabase } from "@/integrations/supabase/client";

/**
 * Shared blog contract — see /code/.plans/public-site-blog-backend-contract.md.
 * `src/lib/blog.ts` (portal admin CRUD) imports the exact same `BlogPost` /
 * `BlogStatus` shape and row mapper from this file so both streams agree.
 */
export type BlogStatus = "draft" | "scheduled" | "published" | "archived";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  category: string;
  tags: string[];
  authorId: string | null;
  authorName: string;
  status: BlogStatus;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type Row = Record<string, unknown>;

const txt = (v: unknown, fallback = ""): string => (v === null || v === undefined ? fallback : String(v));
const orNull = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));
const bool = (v: unknown, fallback = false): boolean => (typeof v === "boolean" ? v : fallback);
const isBlogStatus = (v: unknown): v is BlogStatus =>
  v === "draft" || v === "scheduled" || v === "published" || v === "archived";

/** Maps a `blog_posts` row (any caller — public or admin) onto the shared `BlogPost` shape. */
export function mapBlogPostRow(r: Row): BlogPost {
  return {
    id: txt(r.id),
    slug: txt(r.slug),
    title: txt(r.title),
    excerpt: txt(r.excerpt),
    body: txt(r.body),
    coverImageUrl: orNull(r.cover_image_url),
    coverImagePath: orNull(r.cover_image_path),
    category: txt(r.category, "News"),
    tags: Array.isArray(r.tags) ? r.tags.map((t) => String(t)) : [],
    authorId: orNull(r.author_id),
    authorName: txt(r.author_name),
    status: isBlogStatus(r.status) ? r.status : "draft",
    featured: bool(r.featured, false),
    publishedAt: orNull(r.published_at),
    createdAt: txt(r.created_at),
    updatedAt: txt(r.updated_at),
  };
}

/**
 * True when the error is "the blog_posts table doesn't exist yet" (migration
 * not applied in this environment) rather than a real failure — public blog
 * views should degrade to an empty state instead of crashing.
 */
function isMissingTable(message: string | undefined | null): boolean {
  const m = message || "";
  return /relation .*blog_posts.* does not exist|schema cache/i.test(m);
}

export interface ListPublishedPostsOptions {
  limit?: number;
  category?: string;
}

/** Public, published-only reads. RLS already restricts visibility; we also order by published_at desc. */
export async function listPublishedPosts(options: ListPublishedPostsOptions = {}): Promise<BlogPost[]> {
  const { limit, category } = options;
  try {
    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (category && category !== "All") query = query.eq("category", category);
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      if (isMissingTable(error.message)) return [];
      throw new Error(error.message);
    }
    return (data ?? []).map(mapBlogPostRow);
  } catch {
    // Network/table-not-ready errors should never break the public site.
    return [];
  }
}

/** Public, published-only single-post read by slug. Returns null if missing or not visible. */
export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      if (isMissingTable(error.message)) return null;
      throw new Error(error.message);
    }
    return data ? mapBlogPostRow(data) : null;
  } catch {
    return null;
  }
}

/** Rough reading-time estimate (minutes) for a post body, at ~200 words/min. */
export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
