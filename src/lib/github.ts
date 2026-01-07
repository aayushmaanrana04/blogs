import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_BRANCH } from '$env/static/private';

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

interface GitHubFile {
	name: string;
	path: string;
	type: 'file' | 'dir';
	download_url: string | null;
}

/**
 * Parse YAML frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): { frontmatter: BlogFrontmatter; content: string } {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = markdown.match(frontmatterRegex);

	if (!match) {
		throw new Error('Invalid frontmatter format');
	}

	const yamlContent = match[1];
	const content = match[2].trim();

	// Parse YAML manually (simple key: value pairs)
	const frontmatter: Record<string, unknown> = {};
	const lines = yamlContent.split('\n');

	for (const line of lines) {
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) continue;

		const key = line.slice(0, colonIndex).trim();
		let value: string | number | boolean = line.slice(colonIndex + 1).trim();

		// Remove quotes if present
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}

		// Parse booleans
		if (value === 'true') value = true;
		else if (value === 'false') value = false;
		// Parse numbers
		else if (!isNaN(Number(value)) && value !== '') value = Number(value);

		frontmatter[key] = value;
	}

	return {
		frontmatter: frontmatter as unknown as BlogFrontmatter,
		content
	};
}

/**
 * Get raw content URL for a file
 */
function getRawUrl(path: string): string {
	return `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${path}`;
}

/**
 * Get GitHub API URL for listing contents
 */
function getApiUrl(path: string = ''): string {
	return `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}?ref=${GITHUB_BRANCH}`;
}

/**
 * Fetch list of all .md files from the repository root
 */
export async function fetchBlogList(fetch: typeof globalThis.fetch): Promise<GitHubFile[]> {
	const response = await fetch(getApiUrl(), {
		headers: {
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'SvelteKit-Blog'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}

	const files: GitHubFile[] = await response.json();

	// Filter to only .md files
	return files.filter(file => file.type === 'file' && file.name.endsWith('.md'));
}

/**
 * Fetch raw markdown content for a specific blog post
 */
export async function fetchBlogContent(slug: string, fetch: typeof globalThis.fetch): Promise<string> {
	const url = getRawUrl(`${slug}.md`);
	const response = await fetch(url);

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error('Blog post not found');
		}
		throw new Error(`Failed to fetch blog content: ${response.status}`);
	}

	return response.text();
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlog(slug: string, fetch: typeof globalThis.fetch): Promise<Blog> {
	const markdown = await fetchBlogContent(slug, fetch);
	const { frontmatter, content } = parseFrontmatter(markdown);

	return {
		slug,
		...frontmatter,
		content
	};
}

/**
 * Fetch all blogs with their frontmatter (for homepage)
 */
export async function fetchAllBlogs(fetch: typeof globalThis.fetch): Promise<Blog[]> {
	const files = await fetchBlogList(fetch);

	const blogs: Blog[] = [];

	for (const file of files) {
		try {
			const slug = file.name.replace('.md', '');
			const markdown = await fetchBlogContent(slug, fetch);
			const { frontmatter, content } = parseFrontmatter(markdown);

			blogs.push({
				slug,
				...frontmatter,
				content
			});
		} catch (error) {
			// Skip files with invalid frontmatter
			console.warn(`Skipping ${file.name}: ${error}`);
		}
	}

	// Sort by date descending
	return blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetch all public blogs (for homepage display)
 */
export async function fetchPublicBlogs(fetch: typeof globalThis.fetch): Promise<Blog[]> {
	const allBlogs = await fetchAllBlogs(fetch);
	return allBlogs.filter(blog => blog.public === true);
}
