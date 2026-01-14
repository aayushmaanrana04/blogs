<script lang="ts">
    import "./layout.css";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    let { children, data } = $props();
    let isDark = $state(false);
    let isAnimating = $state(false);

    function formatCurrentDate(): string {
        const now = new Date();
        const days = [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
        ];
        const months = [
            "JANUARY",
            "FEBRUARY",
            "MARCH",
            "APRIL",
            "MAY",
            "JUNE",
            "JULY",
            "AUGUST",
            "SEPTEMBER",
            "OCTOBER",
            "NOVEMBER",
            "DECEMBER",
        ];

        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();

        return `${dayName}, ${monthName} ${day}, ${year}`;
    }

    function toggleTheme() {
        if (isAnimating) return;
        isAnimating = true;

        const newIsDark = !isDark;
        const mainContainer = document.querySelector('.main-container') as HTMLElement;

        // Get scroll position of main content before cloning
        const mainContent = mainContainer.querySelector('main') as HTMLElement;
        const scrollTop = mainContent?.scrollTop || 0;

        // Clone the current content with current theme
        const clone = mainContainer.cloneNode(true) as HTMLElement;
        clone.classList.add('theme-wipe-clone');
        if (isDark) {
            clone.classList.add('dark-themed');
        } else {
            clone.classList.add('light-themed');
        }

        // Create line inside clone so it respects rounded borders
        const line = document.createElement('div');
        line.className = 'theme-wipe-line';
        if (newIsDark) {
            line.classList.add('to-dark');
        }

        // Add sparse dither layer
        const sparseDither = document.createElement('div');
        sparseDither.className = 'theme-wipe-sparse';
        line.appendChild(sparseDither);

        clone.appendChild(line);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'theme-wipe-overlay';
        overlay.appendChild(clone);
        document.body.appendChild(overlay);

        // Sync scroll position after clone is in DOM
        requestAnimationFrame(() => {
            const clonedMain = clone.querySelector('main') as HTMLElement;
            if (clonedMain) {
                clonedMain.scrollTop = scrollTop;
            }
        });

        // Apply new theme immediately (will show through as clone shrinks)
        isDark = newIsDark;
        if (newIsDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

        // Clean up after animation
        setTimeout(() => {
            overlay.remove();
            isAnimating = false;
        }, 800);
    }

    onMount(() => {
        // Sync with the class that was set by the inline script in app.html
        isDark = document.documentElement.classList.contains("dark");
    });
</script>


<div
    class="main-container h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2.5rem)] flex flex-col bg-card-bg text-text m-2 sm:m-5 rounded-xl overflow-hidden"
>
    <header
        class="w-full px-4 sm:px-6 border-b border-bg border-double flex-shrink-0"
    >
        <div
            class="max-w-2xl mx-auto py-4 sm:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 relative"
        >
            <!-- Logo - hidden on mobile, shown on larger screens -->
            <div
                class="hidden lg:flex absolute -left-22 justify-center items-center"
            >
                <img src="/logo.png" alt="Logo" class="w-18" />
            </div>

            <!-- Title and tagline section -->
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <a href="/">
                        <h1
                            class="text-xl sm:text-2xl font-bold tracking-tight m-0 font-sans"
                            style="letter-spacing: 0.02em;"
                        >
                            -fragment(s)
                        </h1>
                    </a>
                    <!-- Visitor stats & theme toggle - mobile only -->
                    <div class="flex sm:hidden items-center gap-2 text-xs text-muted">
                        <span class="flex items-center gap-1" title="Online now">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            {data.current}
                        </span>
                        <span class="flex items-center gap-1" title="Total visitors">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            {data.total.toLocaleString()}
                        </span>
                        <button
                            class="theme-toggle"
                            onclick={toggleTheme}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {#if isDark}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                </svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>
                <p
                    class="text-xs sm:text-sm text-muted m-0 mt-1 max-w-xs"
                    style="font-family: var(--font-serif); font-style: italic;"
                >
                    can we talk about the political and economic state of the
                    world right now
                </p>
                <!-- Badges row -->
                <div class="flex flex-wrap gap-2 mt-4 sm:mt-6">
                    {#if !$page.url.pathname.startsWith('/what-percent')}
                        <a
                            href="/what-percent"
                            class="nav-badge"
                        >
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            what %?
                        </a>
                    {/if}
                </div>
            </div>

            <!-- Right section - desktop only -->
            <div
                class="hidden sm:flex text-right flex-col items-end justify-center gap-2"
            >
                <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1 text-xs text-muted" title="Online now">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        {data.current}
                    </span>
                    <span class="flex items-center gap-1 text-xs text-muted" title="Total visitors">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        {data.total.toLocaleString()}
                    </span>
                    <button
                        class="theme-toggle"
                        onclick={toggleTheme}
                        aria-label={isDark
                            ? "Switch to light mode"
                            : "Switch to dark mode"}
                    >
                        {#if isDark}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                                />
                            </svg>
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                                />
                            </svg>
                        {/if}
                    </button>
                </div>
                <span class="text-xs font-sans text-muted tracking-wide"
                    >{formatCurrentDate()}</span
                >
            </div>
        </div>
    </header>

    <main class="flex-1 w-full px-4 sm:px-6 overflow-y-auto">
        <div class="max-w-2xl mx-auto py-6 sm:py-8">
            {@render children()}
        </div>
    </main>
</div>

