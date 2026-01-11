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
