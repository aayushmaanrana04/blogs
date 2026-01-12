<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        repo: string;
    }

    let { repo }: Props = $props();

    let containerRef: HTMLDivElement;
    let loaded = $state(false);

    function getTheme(): string {
        return document.documentElement.classList.contains("dark")
            ? "github-dark"
            : "github-light";
    }

    function loadUtterances() {
        if (!containerRef) return;

        // Clear existing content
        containerRef.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://utteranc.es/client.js";
        script.setAttribute("repo", repo);
        script.setAttribute("issue-term", "pathname");
        script.setAttribute("theme", getTheme());
        script.setAttribute("crossorigin", "anonymous");
        script.async = true;

        containerRef.appendChild(script);
        loaded = true;
    }

    onMount(() => {
        // Lazy load: only load utterances when section comes into view
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !loaded) {
                        loadUtterances();
                    }
                });
            },
            { rootMargin: "200px" } // Start loading 200px before it's visible
        );

        intersectionObserver.observe(containerRef);

        // Watch for theme changes via MutationObserver
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class" &&
                    loaded
                ) {
                    // Theme changed, reload utterances with new theme
                    loadUtterances();
                }
            });
        });

        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            intersectionObserver.disconnect();
            themeObserver.disconnect();
        };
    });
</script>

<footer class="comments-section">
    <div class="comments-header">
        <h2>Comments</h2>
        <p>Please leave a comment, would love to hear from you :)</p>
    </div>
    <div class="utterances-container" bind:this={containerRef}>
        {#if !loaded}
            <div class="skeleton-loader">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                    <div class="skeleton-header">
                        <div class="skeleton-line short"></div>
                    </div>
                    <div class="skeleton-body">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line medium"></div>
                    </div>
                    <div class="skeleton-actions">
                        <div class="skeleton-button"></div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</footer>

<style>
    .comments-section {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
    }

    .comments-header {
        margin-bottom: 1.5rem;
    }

    .comments-header h2 {
        font-family: var(--font-sans);
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--color-text);
    }

    .comments-header p {
        font-family: var(--font-serif);
        font-size: 0.875rem;
        color: var(--color-muted);
        margin: 0;
    }

    .utterances-container {
        min-height: 200px;
    }

    /* Skeleton loader styles */
    .skeleton-loader {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
    }

    .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-border);
        flex-shrink: 0;
        animation: pulse 1.5s ease-in-out infinite;
    }

    .skeleton-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton-header {
        display: flex;
        gap: 0.5rem;
    }

    .skeleton-body {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .skeleton-line {
        height: 12px;
        background: var(--color-border);
        border-radius: 4px;
        animation: pulse 1.5s ease-in-out infinite;
    }

    .skeleton-line.short {
        width: 30%;
    }

    .skeleton-line.medium {
        width: 60%;
    }

    .skeleton-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }

    .skeleton-button {
        width: 80px;
        height: 32px;
        background: var(--color-border);
        border-radius: 6px;
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    /* Ensure utterances iframe takes full width */
    .utterances-container :global(.utterances) {
        max-width: 100%;
    }

    .utterances-container :global(.utterances-frame) {
        width: 100%;
    }

    @media (min-width: 640px) {
        .comments-section {
            margin-top: 4rem;
            padding-top: 2.5rem;
        }

        .comments-header h2 {
            font-size: 1.5rem;
        }

        .comments-header p {
            font-size: 1rem;
        }
    }
</style>
