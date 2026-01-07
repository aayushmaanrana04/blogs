<script lang="ts">
    import { marked } from "marked";

    let { data } = $props();

    function formatDate(dateStr: string): string {
        return new Date(dateStr)
            .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            })
            .toUpperCase();
    }

    function renderMarkdown(content: string): string {
        marked.setOptions({
            gfm: true,
            breaks: true,
        });
        return marked.parse(content) as string;
    }
</script>

<svelte:head>
    <title>{data.blog.title} - The Chronicle</title>
</svelte:head>

<article>
    <nav class="mb-8">
        <a
            href="/"
            class="inline-flex items-center gap-2 text-sm font-sans text-text hover:text-muted transition-colors"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
            </svg>
            BACK TO ARTICLES
        </a>
    </nav>

    <header class="mb-8 pb-8 border-b border-border">
        <div class="article-meta mb-4">
            <span class="category-tag">{data.blog.category}</span>
            <span class="separator">·</span>
            <span>{formatDate(data.blog.date)}</span>
            <span class="separator">·</span>
            <span>{data.blog.readTime} MIN READ</span>
        </div>

        <h1
            class="text-3xl font-semibold m-0 mb-4 leading-tight"
            style="font-family: var(--font-serif);"
        >
            {data.blog.title}
        </h1>

        <div class="text-sm text-muted font-sans flex items-center">
            <span class="border-l-2 border-muted pl-3"
                >BY {data.blog.author.toUpperCase()}</span
            >
        </div>
    </header>

    <div class="markdown-content">
        {@html renderMarkdown(data.blog.content)}
    </div>
</article>

<style>
    .markdown-content :global(h1) {
        font-size: 1.75rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-family: var(--font-serif);
    }

    .markdown-content :global(h2) {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        font-family: var(--font-serif);
    }

    .markdown-content :global(h3) {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-serif);
    }

    .markdown-content :global(h4) {
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-serif);
    }

    .markdown-content :global(p) {
        margin: 1rem 0;
        line-height: 1.7;
        font-family: var(--font-serif);
    }

    .markdown-content :global(a) {
        color: var(--color-text);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .markdown-content :global(a:hover) {
        opacity: 0.7;
    }

    .markdown-content :global(img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 1.5rem 0;
    }

    .markdown-content :global(ul),
    .markdown-content :global(ol) {
        margin: 1rem 0;
        padding-left: 1.5rem;
        font-family: var(--font-serif);
    }

    .markdown-content :global(li) {
        margin: 0.5rem 0;
        line-height: 1.6;
    }

    .markdown-content :global(code) {
        background-color: var(--color-border);
        padding: 0.15rem 0.4rem;
        border-radius: 3px;
        font-size: 0.875rem;
        font-family: var(--font-sans);
    }

    .markdown-content :global(pre) {
        background-color: var(--color-border);
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1.5rem 0;
    }

    .markdown-content :global(pre code) {
        background: none;
        padding: 0;
        font-size: 0.85rem;
        line-height: 1.5;
    }

    .markdown-content :global(blockquote) {
        border-left: 3px solid var(--color-muted);
        padding-left: 1rem;
        margin: 1.5rem 0;
        color: var(--color-muted);
        font-style: italic;
    }

    .markdown-content :global(hr) {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 2rem 0;
    }

    .markdown-content :global(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        font-size: 0.9rem;
    }

    .markdown-content :global(th),
    .markdown-content :global(td) {
        border: 1px solid var(--color-border);
        padding: 0.5rem 0.75rem;
        text-align: left;
    }

    .markdown-content :global(th) {
        background-color: var(--color-border);
        font-weight: 600;
    }

    .markdown-content :global(details) {
        margin: 1rem 0;
        padding: 0.5rem 0;
    }

    .markdown-content :global(summary) {
        cursor: pointer;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    .markdown-content :global(sup) {
        font-size: 0.75rem;
    }

    /* GitHub-style alerts */
    .markdown-content :global([class*="markdown-alert"]) {
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 6px;
        border-left: 4px solid var(--color-muted);
        background-color: var(--color-border);
    }
</style>
