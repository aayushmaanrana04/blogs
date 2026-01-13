<script lang="ts">
    import { marked } from "marked";
    import { page } from "$app/stores";
    import Comments from "$lib/components/Comments.svelte";

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

    function formatISODate(dateStr: string): string {
        return new Date(dateStr).toISOString();
    }

    function renderMarkdown(content: string): string {
        const renderer = new marked.Renderer();

        renderer.link = function ({ href, title, tokens }) {
            const text = this.parser.parseInline(tokens);
            const titleAttr = title ? ` title="${title}"` : "";

            // External links (start with http:// or https://)
            if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
                return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
            }
            return `<a href="${href}"${titleAttr}>${text}</a>`;
        };

        marked.setOptions({
            gfm: true,
            breaks: true,
        });

        return marked.parse(content, { renderer }) as string;
    }

    const siteTitle = "Fragments";
    let pageTitle = $derived(`${data.blog.title} | ${siteTitle}`);
    let canonicalUrl = $derived($page.url.href);
    let siteOrigin = $derived($page.url.origin);

    // JSON-LD structured data for the article
    let jsonLd = $derived({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.blog.title,
        "description": data.blog.excerpt,
        "author": {
            "@type": "Person",
            "name": data.blog.author
        },
        "datePublished": formatISODate(data.blog.date),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": siteTitle,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteOrigin}/logo.png`
            }
        },
        "image": `${siteOrigin}/bojack.png`,
        "articleSection": data.blog.category,
        "wordCount": data.blog.content.split(/\s+/).length,
        "timeRequired": `PT${data.blog.readTime}M`
    });

    // BreadcrumbList schema
    let breadcrumbSchema = $derived({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteOrigin
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": data.blog.category,
                "item": `${siteOrigin}/?category=${encodeURIComponent(data.blog.category)}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": data.blog.title,
                "item": canonicalUrl
            }
        ]
    });
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={data.blog.excerpt} />
    <meta name="keywords" content={`${data.blog.category}, blog, ${siteTitle}`} />
    <meta name="author" content={data.blog.author} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content={data.blog.title} />
    <meta property="og:description" content={data.blog.excerpt} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content={`${siteOrigin}/bojack.png`} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="article:published_time" content={formatISODate(data.blog.date)} />
    <meta property="article:author" content={data.blog.author} />
    <meta property="article:section" content={data.blog.category} />
    <meta property="article:tag" content={data.blog.category} />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={data.blog.title} />
    <meta name="twitter:description" content={data.blog.excerpt} />
    <meta name="twitter:image" content={`${siteOrigin}/bojack.png`} />
    <meta name="twitter:label1" content="Written by" />
    <meta name="twitter:data1" content={data.blog.author} />
    <meta name="twitter:label2" content="Reading time" />
    <meta name="twitter:data2" content={`${data.blog.readTime} min read`} />

    <!-- JSON-LD Structured Data -->
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
    {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<article>
    <nav class="mb-6 sm:mb-8">
        <a
            href="/"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-sans text-text hover:text-muted transition-colors"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4"
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

    <header class="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
        <div class="article-meta mb-3 sm:mb-4 flex-wrap">
            <span class="category-tag">{data.blog.category}</span>
            <span class="separator hidden sm:inline">·</span>
            <span class="hidden sm:inline">{formatDate(data.blog.date)}</span>
            <span class="separator hidden sm:inline">·</span>
            <span class="hidden sm:inline">{data.blog.readTime} MIN READ</span>
        </div>

        <h1
            class="text-2xl sm:text-3xl md:text-4xl font-semibold m-0 mb-3 sm:mb-4 leading-tight"
            style="font-family: var(--font-sans);"
        >
            {data.blog.title}
        </h1>

        <div
            class="text-xs sm:text-sm text-muted font-sans flex flex-wrap items-center gap-2 sm:gap-0"
        >
            <span class="border-l-2 border-muted pl-3"
                >BY {data.blog.author.toUpperCase()}</span
            >
            <span class="sm:hidden text-muted"
                >· {formatDate(data.blog.date)} · {data.blog.readTime} MIN READ</span
            >
        </div>
    </header>

    <div class="markdown-content">
        {@html renderMarkdown(data.blog.content)}
    </div>

    <Comments repo={data.commentsRepo} />
</article>

<style>
    /* Mobile-first responsive markdown styles */
    .markdown-content :global(h1) {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-family: var(--font-sans);
    }

    .markdown-content :global(h2) {
        font-size: 1.375rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-sans);
    }

    .markdown-content :global(h3) {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        font-family: var(--font-sans);
    }

    .markdown-content :global(h4) {
        font-size: 1.125rem;
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.375rem;
        font-family: var(--font-sans);
    }

    .markdown-content :global(p) {
        margin: 0.875rem 0;
        line-height: 1.75;
        font-family: var(--font-serif);
        font-size: 1rem;
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
        margin: 1rem 0;
    }

    .markdown-content :global(ul),
    .markdown-content :global(ol) {
        margin: 0.875rem 0;
        padding-left: 1.25rem;
        font-family: var(--font-serif);
        font-size: 1rem;
    }

    .markdown-content :global(li) {
        margin: 0.375rem 0;
        line-height: 1.75;
    }

    .markdown-content :global(code) {
        background-color: var(--color-border);
        padding: 0.125rem 0.375rem;
        border-radius: 3px;
        font-size: 0.8rem;
        font-family: var(--font-sans);
        word-break: break-word;
    }

    .markdown-content :global(pre) {
        background-color: var(--color-border);
        padding: 0.75rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1rem 0;
        -webkit-overflow-scrolling: touch;
    }

    .markdown-content :global(pre code) {
        background: none;
        padding: 0;
        font-size: 0.75rem;
        line-height: 1.5;
        word-break: normal;
    }

    .markdown-content :global(blockquote) {
        border-left: 3px solid var(--color-muted);
        padding-left: 0.75rem;
        margin: 1rem 0;
        color: var(--color-muted);
        font-style: italic;
    }

    .markdown-content :global(hr) {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 1.5rem 0;
    }

    /* Table responsive wrapper - allow horizontal scroll */
    .markdown-content :global(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        font-size: 0.8rem;
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .markdown-content :global(th),
    .markdown-content :global(td) {
        border: 1px solid var(--color-border);
        padding: 0.375rem 0.5rem;
        text-align: left;
        white-space: nowrap;
    }

    .markdown-content :global(th) {
        background-color: var(--color-border);
        font-weight: 600;
    }

    .markdown-content :global(details) {
        margin: 0.875rem 0;
        padding: 0.375rem 0;
    }

    .markdown-content :global(summary) {
        cursor: pointer;
        font-weight: 500;
        margin-bottom: 0.375rem;
    }

    .markdown-content :global(sup) {
        font-size: 0.7rem;
    }

    /* GitHub-style alerts */
    .markdown-content :global([class*="markdown-alert"]) {
        padding: 0.75rem;
        margin: 0.875rem 0;
        border-radius: 6px;
        border-left: 4px solid var(--color-muted);
        background-color: var(--color-border);
    }

    /* Tablet and up - enhanced typography */
    @media (min-width: 640px) {
        .markdown-content :global(h1) {
            font-size: 2rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .markdown-content :global(h2) {
            font-size: 1.75rem;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
        }

        .markdown-content :global(h3) {
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .markdown-content :global(h4) {
            font-size: 1.25rem;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .markdown-content :global(p) {
            margin: 1rem 0;
            line-height: 1.8;
            font-size: 1.125rem;
        }

        .markdown-content :global(img) {
            margin: 1.5rem 0;
        }

        .markdown-content :global(ul),
        .markdown-content :global(ol) {
            margin: 1rem 0;
            padding-left: 1.5rem;
            font-size: 1.125rem;
        }

        .markdown-content :global(li) {
            margin: 0.5rem 0;
            line-height: 1.8;
        }

        .markdown-content :global(code) {
            padding: 0.15rem 0.4rem;
            font-size: 0.875rem;
        }

        .markdown-content :global(pre) {
            padding: 1rem;
            margin: 1.5rem 0;
        }

        .markdown-content :global(pre code) {
            font-size: 0.85rem;
        }

        .markdown-content :global(blockquote) {
            padding-left: 1rem;
            margin: 1.5rem 0;
        }

        .markdown-content :global(hr) {
            margin: 2rem 0;
        }

        .markdown-content :global(table) {
            margin: 1.5rem 0;
            font-size: 0.9rem;
        }

        .markdown-content :global(th),
        .markdown-content :global(td) {
            padding: 0.5rem 0.75rem;
            white-space: normal;
        }

        .markdown-content :global(details) {
            margin: 1rem 0;
            padding: 0.5rem 0;
        }

        .markdown-content :global(summary) {
            margin-bottom: 0.5rem;
        }

        .markdown-content :global(sup) {
            font-size: 0.75rem;
        }

        .markdown-content :global([class*="markdown-alert"]) {
            padding: 1rem;
            margin: 1rem 0;
        }
    }
</style>
