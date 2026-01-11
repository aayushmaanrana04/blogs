import {
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME,
  GITHUB_BRANCH,
  GITHUB_CONTENT_PATH,
  GITHUB_TOKEN,
} from "$env/static/private";
import { getCached, setCache } from "./cache";

const CONTENT_PATH = GITHUB_CONTENT_PATH || "";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface BlogFrontmatter {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
  public: boolean;
}

export interface Blog extends BlogFrontmatter {
  slug: string;
  content: string;
}

export interface BlogSummary extends BlogFrontmatter {
  slug: string;
}

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

/**
 * Parse YAML frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): {
  frontmatter: BlogFrontmatter;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    throw new Error("Invalid frontmatter format");
  }

  const yamlContent = match[1];
  const content = match[2].trim();

  // Parse YAML manually (simple key: value pairs)
  const frontmatter: Record<string, unknown> = {};
  const lines = yamlContent.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: string | number | boolean = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Parse booleans
    if (value === "true") value = true;
    else if (value === "false") value = false;
    // Parse numbers
    else if (!isNaN(Number(value)) && value !== "") value = Number(value);

    frontmatter[key] = value;
  }

  return {
    frontmatter: frontmatter as unknown as BlogFrontmatter,
    content,
  };
}

/**
 * Get raw content URL for a file
 */
function getRawUrl(slug: string): string {
  const path = CONTENT_PATH ? `${CONTENT_PATH}/${slug}.md` : `${slug}.md`;
  return `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${path}`;
}

/**
 * Get GitHub API URL for listing contents
 */
function getApiUrl(): string {
  return `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${CONTENT_PATH}?ref=${GITHUB_BRANCH}`;
}

/**
 * Get raw URL for blog.json metadata file
 */
function getBlogJsonUrl(): string {
  return `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/blog.json`;
}

/**
 * Fetch list of all .md files from the repository root
 */
export async function fetchBlogList(
  fetch: typeof globalThis.fetch,
): Promise<GitHubFile[]> {
  const cacheKey = "blog-list";
  const cached = getCached<GitHubFile[]>(cacheKey);
  if (cached) return cached;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SvelteKit-Blog",
  };

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(getApiUrl(), { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const files: GitHubFile[] = await response.json();

  // Filter to only .md files
  const mdFiles = files.filter(
    (file) => file.type === "file" && file.name.endsWith(".md"),
  );

  setCache(cacheKey, mdFiles, CACHE_TTL);
  return mdFiles;
}

/**
 * Fetch raw markdown content for a specific blog post
 */
export async function fetchBlogContent(
  slug: string,
  fetch: typeof globalThis.fetch,
): Promise<string> {
  const cacheKey = `blog-content:${slug}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const url = getRawUrl(slug);
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Blog post not found");
    }
    throw new Error(`Failed to fetch blog content: ${response.status}`);
  }

  const content = await response.text();
  setCache(cacheKey, content, CACHE_TTL);
  return content;
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlog(
  slug: string,
  fetch: typeof globalThis.fetch,
): Promise<Blog> {
  const markdown = await fetchBlogContent(slug, fetch);
  const { frontmatter, content } = parseFrontmatter(markdown);

  return {
    slug,
    ...frontmatter,
    content,
  };
}

interface BlogJsonEntry {
  filename: string;
  path: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
  public: boolean;
}

/**
 * Fetch all blog summaries from blog.json (single request)
 */
export async function fetchAllBlogSummaries(
  fetch: typeof globalThis.fetch,
): Promise<BlogSummary[]> {
  const cacheKey = "blog-summaries";
  const cached = getCached<BlogSummary[]>(cacheKey);
  if (cached) return cached;

  const response = await fetch(getBlogJsonUrl());

  if (!response.ok) {
    throw new Error(`Failed to fetch blog.json: ${response.status}`);
  }

  const data: { blogs: BlogJsonEntry[] } = await response.json();

  const summaries: BlogSummary[] = data.blogs.map((entry) => ({
    slug: entry.filename,
    title: entry.title,
    excerpt: entry.excerpt,
    date: entry.date,
    category: entry.category,
    author: entry.author,
    readTime: entry.readTime,
    public: entry.public,
  }));

  // Sort by date descending
  const sorted = summaries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  setCache(cacheKey, sorted, CACHE_TTL);
  return sorted;
}

/**
 * Fetch all public blog summaries (for homepage display)
 */
export async function fetchPublicBlogSummaries(
  fetch: typeof globalThis.fetch,
): Promise<BlogSummary[]> {
  const summaries = await fetchAllBlogSummaries(fetch);
  return summaries.filter((blog) => blog.public === true);
}
