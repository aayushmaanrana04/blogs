<script lang="ts">
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
</script>

<svelte:head>
    <title>The Chronicle</title>
</svelte:head>

<section>
    {#each data.blogs as blog}
        <article class="py-8 border-b border-border">
            <a href="/{blog.slug}" class="block no-underline group">
                <div class="article-meta mb-3">
                    <span class="category-tag">{blog.category}</span>
                    <span class="separator">·</span>
                    <span>{formatDate(blog.date)}</span>
                    <span class="separator">·</span>
                    <span>{blog.readTime} MIN READ</span>
                </div>

                <h2
                    class="text-3xl font-semibold m-0 mb-3 leading-tight"
                    style="font-family: var(--font-sans);"
                >
                    {blog.title}
                </h2>

                <p
                    class="m-0 text-text-secondary leading-relaxed"
                    style="font-family: var(--font-serif);"
                >
                    {blog.excerpt}
                </p>

                <div
                    class="mt-4 text-sm text-muted font-sans flex items-center"
                >
                    <span class="border-l-2 border-muted pl-3"
                        >BY {blog.author.toUpperCase()}</span
                    >
                </div>
            </a>
        </article>
    {/each}
</section>
