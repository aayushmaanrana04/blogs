<script lang="ts">
    import "./layout.css";
    import { onMount } from "svelte";

    let { children } = $props();
    let isDark = $state(false);

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
        isDark = !isDark;
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }

    onMount(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            isDark = true;
            document.documentElement.classList.add("dark");
        }
    });
</script>

<svelte:head>
    <title>Fragments</title>
</svelte:head>

<div
    class="sm:h-[calc(100dvh-2.5rem)] h-[calc(100dvh-1rem)] flex flex-col bg-card-bg text-text sm:m-5 m-2 rounded-xl overflow-hidden"
>
    <header class="w-full px-6 border-b border-double flex-shrink-0">
        <div class="max-w-2xl mx-auto py-6 flex justify-between items-start">
            <div>
                <a href="/" class="block">
                    <h1
                        class="text-2xl font-bold tracking-tight m-0 font-sans"
                        style="letter-spacing: 0.02em;"
                    >
                        -fragment(s)
                    </h1>
                </a>
                <p
                    class="text-sm text-muted m-0 mt-1"
                    style="font-family: var(--font-serif); font-style: italic;"
                >
                    work in progress
                </p>
            </div>
            <div class="text-right flex items-center gap-8">
                <span class="text-xs font-sans text-muted tracking-wide"
                    >{formatCurrentDate()}</span
                >
                <button
                    class="theme-toggle"
                    onclick={toggleTheme}
                    aria-label={isDark
                        ? "Switch to light mode"
                        : "Switch to dark mode"}
                >
                    {#if isDark}
                        <!-- Sun icon for dark mode -->
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
                        <!-- Moon icon for light mode -->
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
        </div>
    </header>

    <main class="flex-1 w-full px-6 overflow-y-auto">
        <div class="max-w-2xl mx-auto py-8">
            {@render children()}
        </div>
    </main>
</div>
