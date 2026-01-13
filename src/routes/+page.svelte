<script lang="ts">
    import { page } from "$app/stores";

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

    const siteTitle = "Fragments";
    const siteDescription =
        "It gets easier. Every day it gets a little easier. But you gotta do it every day — that's the hard part.";
</script>

<svelte:head>
    <title>{siteTitle}</title>
    <meta name="description" content={siteDescription} />
    <link rel="canonical" href={$page.url.href} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={siteTitle} />
    <meta property="og:description" content={siteDescription} />
    <meta property="og:url" content={$page.url.href} />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:image" content={`${$page.url.origin}/bojack.webp`} />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={siteTitle} />
    <meta name="twitter:description" content={siteDescription} />
    <meta name="twitter:image" content={`${$page.url.origin}/bojack.webp`} />
</svelte:head>

<section>
    {#each data.blogs as blog}
        <article class="py-6 sm:py-8 border-b border-border">
            <a href="/{blog.slug}" class="block no-underline group">
                <div class="article-meta mb-2 sm:mb-3 flex-wrap">
                    <span class="category-tag">{blog.category}</span>
                    <span class="separator hidden sm:inline">·</span>
                    <span class="hidden sm:inline">{formatDate(blog.date)}</span
                    >
                    <span class="separator hidden sm:inline">·</span>
                    <span class="hidden sm:inline"
                        >{blog.readTime} MIN READ</span
                    >
                </div>

                <h2
                    class="text-xl sm:text-2xl md:text-3xl font-semibold m-0 mb-2 sm:mb-3 leading-tight"
                    style="font-family: var(--font-sans);"
                >
                    {blog.title}
                </h2>

                <p
                    class="m-0 text-text-secondary leading-relaxed text-sm sm:text-base line-clamp-3 sm:line-clamp-none"
                    style="font-family: var(--font-serif);"
                >
                    {blog.excerpt}
                </p>

                <div
                    class="mt-3 sm:mt-4 text-xs sm:text-sm text-muted font-sans flex flex-wrap items-center gap-2 sm:gap-0"
                >
                    <span class="border-l-2 border-muted pl-3"
                        >BY {blog.author.toUpperCase()}</span
                    >
                    <span class="sm:hidden text-muted"
                        >· {formatDate(blog.date)}</span
                    >
                </div>
            </a>
        </article>
    {/each}
</section>
