<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		getYearProgress,
		getMonthProgress,
		getWeekProgress,
		getDayProgress,
		getHourProgress,
		getDecadeProgress,
		getCenturyProgress,
		getMonthsInYear,
		getDaysInMonthArray,
		getDaysInWeek,
		getDayStatus,
		getZoomLevelLabel,
		getDecadeRange,
		getCenturyRange,
		getYearsInDecade,
		getDecadesInCentury,
		getYearProgressInDecade,
		getDecadeProgressInCentury,
		format,
		getYear,
		getMonth,
		getDate,
		getHours,
		getMinutes,
		getDay,
		startOfWeek,
		endOfWeek,
		isBefore,
		startOfYear
	} from '$lib/time-utils';

	// Zoom levels: 0=Hours, 1=Day, 2=Week, 3=Month, 4=Year, 5=Decade, 6=Century
	const MIN_ZOOM = 0;
	const MAX_ZOOM = 6;
	const DEFAULT_ZOOM = 4; // Year view

	const ZOOM_HASH_MAP: Record<number, string> = {
		0: 'hour',
		1: 'day',
		2: 'week',
		3: 'month',
		4: 'year',
		5: 'decade',
		6: 'century'
	};

	const HASH_ZOOM_MAP: Record<string, number> = {
		'hour': 0,
		'day': 1,
		'week': 2,
		'month': 3,
		'year': 4,
		'decade': 5,
		'century': 6
	};

	function getInitialZoom(): number {
		if (typeof window !== 'undefined') {
			const hash = window.location.hash.slice(1).toLowerCase();
			if (hash && HASH_ZOOM_MAP[hash] !== undefined) {
				return HASH_ZOOM_MAP[hash];
			}
		}
		return DEFAULT_ZOOM;
	}

	let now = $state(new Date());
	let zoomLevel = $state(getInitialZoom());
	let isTransitioning = $state(false);

	function updateHash(level: number) {
		if (typeof window !== 'undefined') {
			window.history.replaceState(null, '', `#${ZOOM_HASH_MAP[level]}`);
		}
	}

	// Derived values
	let yearProgress = $derived(getYearProgress(now));
	let monthProgress = $derived(getMonthProgress(now));
	let weekProgress = $derived(getWeekProgress(now));
	let dayProgress = $derived(getDayProgress(now));
	let hourProgress = $derived(getHourProgress(now));
	let decadeProgress = $derived(getDecadeProgress(now));
	let centuryProgress = $derived(getCenturyProgress(now));

	let currentYear = $derived(getYear(now));
	let currentMonth = $derived(getMonth(now));
	let currentDate = $derived(getDate(now));
	let currentHour = $derived(getHours(now));
	let currentMinute = $derived(getMinutes(now));

	// Calculate days elapsed in year
	let daysElapsed = $derived.by(() => {
		const yearStart = startOfYear(now);
		const diffTime = now.getTime() - yearStart.getTime();
		return Math.floor(diffTime / (1000 * 60 * 60 * 24));
	});

	// Get the main progress percentage based on zoom level
	let mainProgress = $derived.by(() => {
		switch (zoomLevel) {
			case 0:
				return hourProgress;
			case 1:
				return dayProgress;
			case 2:
				return weekProgress;
			case 3:
				return monthProgress;
			case 4:
				return yearProgress;
			case 5:
				return decadeProgress;
			case 6:
				return centuryProgress;
			default:
				return yearProgress;
		}
	});

	// Get the context label for the heading
	let contextLabel = $derived.by(() => {
		switch (zoomLevel) {
			case 0:
				return 'HOUR';
			case 1:
				return 'DAY';
			case 2:
				return 'WEEK';
			case 3:
				return 'MONTH';
			case 4:
				return 'YEAR';
			case 5:
				return 'DECADE';
			case 6:
				return 'CENTURY';
			default:
				return 'YEAR';
		}
	});

	// Get the time period display
	let periodDisplay = $derived.by(() => {
		switch (zoomLevel) {
			case 0:
				return format(now, 'h:00 a');
			case 1:
				return format(now, 'MMM d');
			case 2:
				return `Week ${Math.ceil((currentDate + getDay(startOfYear(now))) / 7)}`;
			case 3:
				return format(now, 'MMMM');
			case 4:
				return String(currentYear);
			case 5:
				return getDecadeRange(currentYear);
			case 6:
				return getCenturyRange(currentYear);
			default:
				return String(currentYear);
		}
	});

	// Get unit count for "X DAYS/HOURS/etc MARKED"
	let unitsMarked = $derived.by(() => {
		switch (zoomLevel) {
			case 0:
				return currentMinute;
			case 1:
				return currentHour;
			case 2:
				return getDay(now);
			case 3:
				return currentDate - 1;
			case 4:
				return daysElapsed;
			case 5:
				return currentYear - Math.floor(currentYear / 10) * 10;
			case 6:
				return Math.floor(currentYear / 10) - Math.floor(currentYear / 100) * 10;
			default:
				return daysElapsed;
		}
	});

	let unitLabel = $derived.by(() => {
		switch (zoomLevel) {
			case 0:
				return 'MINUTES';
			case 1:
				return 'HOURS';
			case 2:
				return 'DAYS';
			case 3:
				return 'DAYS';
			case 4:
				return 'DAYS';
			case 5:
				return 'YEARS';
			case 6:
				return 'DECADES';
			default:
				return 'DAYS';
		}
	});

	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		intervalId = setInterval(() => {
			now = new Date();
		}, 1000);
		// Set initial hash
		updateHash(zoomLevel);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function zoomIn() {
		if (zoomLevel > MIN_ZOOM && !isTransitioning) {
			isTransitioning = true;
			zoomLevel--;
			updateHash(zoomLevel);
			setTimeout(() => (isTransitioning = false), 300);
		}
	}

	function zoomOut() {
		if (zoomLevel < MAX_ZOOM && !isTransitioning) {
			isTransitioning = true;
			zoomLevel++;
			updateHash(zoomLevel);
			setTimeout(() => (isTransitioning = false), 300);
		}
	}

	// Generate data for views
	let months = $derived(getMonthsInYear(currentYear));
	let monthDays = $derived(getDaysInMonthArray(currentYear, currentMonth));
	let monthFirstDayOffset = $derived(getDay(monthDays[0]));
	let weekDays = $derived(getDaysInWeek(now));

	function getWeekdayName(dayIndex: number): string {
		const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		return names[dayIndex];
	}

	function getMonthName(month: number): string {
		const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		return names[month];
	}

	function getFullMonthName(month: number): string {
		const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		return names[month];
	}
</script>

<svelte:head>
	<title>What Percent | Time Visualization</title>
	<meta name="description" content="What percentage of time is over? A visual time lens." />
</svelte:head>

<div class="what-percent">
	<!-- Stats Header Card -->
	<div class="stats-card">
		<div class="stats-main">
			<div class="stats-row">
				<div class="stats-left">
					<div class="percent-display">{mainProgress.toFixed(1)}%</div>
					<div class="percent-label">of the {contextLabel.toLowerCase()} is over</div>
				</div>
				<div class="stats-divider"></div>
				<div class="stats-middle">
					<div class="units-count">{unitsMarked}</div>
					<div class="units-label">{unitLabel} COMPLETED</div>
				</div>
				<div class="stats-divider"></div>
				<div class="stats-right">
					<div class="units-count remaining">{(100 - mainProgress).toFixed(1)}%</div>
					<div class="units-label">REMAINING</div>
				</div>
			</div>
			<div class="stats-footer">
				<div class="progress-bar-full">
					<div class="progress-bar-fill" style="width: {mainProgress}%"></div>
				</div>
				<div class="stats-quote">
					<span class="quote-mark">"</span>
					Time and tide waits for none
					<span class="quote-mark">"</span>
					<span class="quote-author">— some old guy</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Zoom Controls -->
	<div class="zoom-controls">
		<button
			class="zoom-btn"
			onclick={zoomOut}
			disabled={zoomLevel >= MAX_ZOOM || isTransitioning}
			aria-label="Zoom out"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
			</svg>
		</button>
		<div class="zoom-pill">
			<span class="zoom-level-label">{contextLabel}</span>
			<span class="zoom-period">{periodDisplay}</span>
		</div>
		<button
			class="zoom-btn"
			onclick={zoomIn}
			disabled={zoomLevel <= MIN_ZOOM || isTransitioning}
			aria-label="Zoom in"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
		</button>
	</div>

	<!-- View Container -->
	<div class="view-container" class:transitioning={isTransitioning}>
		{#if zoomLevel === 6}
			<!-- Century View -->
			<div class="century-view">
				<div class="decades-grid">
					{#each getDecadesInCentury(currentYear) as decadeStart}
						{@const progress = getDecadeProgressInCentury(decadeStart, currentYear, now)}
						{@const isCurrent = Math.floor(currentYear / 10) * 10 === decadeStart}
						{@const isPast = decadeStart < Math.floor(currentYear / 10) * 10}
						<div class="time-block" class:current={isCurrent}>
							<div class="block-label">{decadeStart}s</div>
							<div class="block-progress">
								<div class="progress-fill" style="width: {progress}%"></div>
							</div>
							<div class="block-percent">{progress.toFixed(0)}%</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if zoomLevel === 5}
			<!-- Decade View -->
			<div class="decade-view">
				<div class="years-grid">
					{#each getYearsInDecade(currentYear) as year}
						{@const progress = getYearProgressInDecade(year, currentYear, now)}
						{@const isCurrent = year === currentYear}
						<div class="time-block" class:current={isCurrent}>
							<div class="block-label">{year}</div>
							<div class="block-progress">
								<div class="progress-fill" style="width: {progress}%"></div>
							</div>
							<div class="block-percent">{progress.toFixed(0)}%</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if zoomLevel === 4}
			<!-- Year View (Default) -->
			<div class="year-view">
				<div class="months-grid">
					{#each months as month, monthIndex}
						{@const days = getDaysInMonthArray(currentYear, monthIndex)}
						{@const isCurrentMonth = monthIndex === currentMonth}
						{@const firstDayOffset = getDay(days[0])}
						<div class="month-card">
							<div class="month-name">{getMonthName(monthIndex)}</div>
							<div class="weekday-row">
								{#each [0, 1, 2, 3, 4, 5, 6] as dayIdx}
									<span class="weekday">{getWeekdayName(dayIdx)}</span>
								{/each}
							</div>
							<div class="days-grid">
								{#each Array(firstDayOffset) as _}
									<div class="day-cell empty"></div>
								{/each}
								{#each days as day}
									{@const status = getDayStatus(day, now)}
									{@const dayNum = getDate(day)}
									<div class="day-cell {status}">
										{#if status === 'current'}
											<div class="day-progress" style="width: {dayProgress}%"></div>
										{/if}
										<span class="day-num">{dayNum}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if zoomLevel === 3}
			<!-- Month View -->
			<div class="month-view">
				<div class="month-card large">
					<div class="month-name">{getFullMonthName(currentMonth).toUpperCase()}</div>
					<div class="weekday-row">
						{#each ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as dayName}
							<span class="weekday">{dayName}</span>
						{/each}
					</div>
					<div class="days-grid large">
						{#each Array(monthFirstDayOffset) as _}
							<div class="day-cell large empty"></div>
						{/each}
						{#each monthDays as day}
							{@const status = getDayStatus(day, now)}
							{@const dayNum = getDate(day)}
							<div class="day-cell large {status}">
								{#if status === 'current'}
									<div class="day-progress" style="width: {dayProgress}%"></div>
								{/if}
								<span class="day-num">{dayNum}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if zoomLevel === 2}
			<!-- Week View -->
			<div class="week-view">
				<div class="week-grid">
					{#each weekDays as day, idx}
						{@const status = getDayStatus(day, now)}
						{@const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][idx]}
						<div class="week-day-card {status}">
							<div class="week-day-info">
								<span class="week-day-name">{dayName}</span>
								<span class="week-day-date">{format(day, 'MMM d')}</span>
							</div>
							{#if status === 'current'}
								<div class="week-day-progress">
									<div class="progress-bar">
										<div class="progress-fill" style="width: {dayProgress}%"></div>
									</div>
									<span class="progress-text">{dayProgress.toFixed(1)}%</span>
								</div>
							{:else if status === 'past'}
								<div class="week-day-complete">COMPLETE</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if zoomLevel === 1}
			<!-- Day View -->
			<div class="day-view">
				<div class="hours-grid">
					{#each Array(24) as _, hour}
						{@const isPast = hour < currentHour}
						{@const isCurrent = hour === currentHour}
						{@const progress = isCurrent ? hourProgress : isPast ? 100 : 0}
						<div class="hour-card" class:past={isPast} class:current={isCurrent}>
							<span class="hour-label">
								{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
							</span>
							{#if isCurrent}
								<div class="hour-progress">
									<div class="progress-fill" style="width: {progress}%"></div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Hours View (Minutes) -->
			<div class="hours-view">
				<div class="time-display">{format(now, 'h:mm:ss a')}</div>
				<div class="hour-bar">
					<div class="hour-bar-fill" style="width: {hourProgress}%"></div>
				</div>
				<div class="hour-bar-label">{hourProgress.toFixed(1)}% of this hour</div>
				<div class="minutes-grid">
					{#each Array(60) as _, minute}
						{@const isPast = minute < currentMinute}
						{@const isCurrent = minute === currentMinute}
						<div class="minute-cell" class:past={isPast} class:current={isCurrent}>
							{#if minute % 5 === 0}
								<span class="minute-num">{minute}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.what-percent {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0.5rem 0;
	}

	/* Stats Header Card */
	.stats-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
	}

	.stats-main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.stats-row {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.stats-left {
		flex-shrink: 0;
	}

	.percent-display {
		font-size: 2.5rem;
		font-weight: 700;
		font-family: var(--font-mono);
		color: var(--color-accent);
		line-height: 1;
	}

	.percent-label {
		font-size: 0.75rem;
		color: var(--color-muted);
		margin-top: 0.25rem;
		font-family: var(--font-sans);
		letter-spacing: 0.02em;
	}

	.stats-divider {
		width: 1px;
		height: 3rem;
		background: var(--color-border);
		flex-shrink: 0;
	}

	.stats-middle {
		flex-shrink: 0;
	}

	.units-count {
		font-size: 1.75rem;
		font-weight: 600;
		font-family: var(--font-sans);
		line-height: 1;
	}

	.units-label {
		font-size: 0.7rem;
		color: var(--color-muted);
		margin-top: 0.25rem;
		font-family: var(--font-sans);
		letter-spacing: 0.02em;
	}

	.stats-right {
		flex-shrink: 0;
	}

	.units-count.remaining {
		color: var(--color-muted);
	}

	.stats-footer {
		border-top: 1px solid var(--color-border);
		padding-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.progress-bar-full {
		height: 0.375rem;
		background: var(--color-border);
		border-radius: 1rem;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 1rem;
		transition: width 1s linear;
	}

	.stats-quote {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.quote-mark {
		color: var(--color-accent);
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1;
	}

	.quote-author {
		color: var(--color-muted);
		font-size: 0.75rem;
		margin-left: 0.5rem;
	}

	/* Zoom Controls */
	.zoom-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		max-width: 20rem;
		margin: 0 auto;
	}

	.zoom-btn {
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s ease;
		padding: 0;
	}

	.zoom-btn:hover:not(:disabled) {
		opacity: 0.7;
	}

	.zoom-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.zoom-btn .icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.zoom-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 2rem;
		font-family: var(--font-sans);
		width: 14rem;
	}

	.zoom-level-label {
		font-size: 0.75rem;
		color: var(--color-muted);
		letter-spacing: 0.05em;
	}

	.zoom-period {
		font-size: 1rem;
		font-weight: 600;
	}

	/* View Container */
	.view-container {
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.view-container.transitioning {
		opacity: 0.5;
		transform: scale(0.98);
	}

	/* Time Block (Century/Decade views) */
	.centuries-grid,
	.decades-grid,
	.years-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.time-block {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 1rem;
		transition: border-color 0.2s ease;
	}

	.time-block.current {
		border-color: var(--color-accent);
	}

	.block-label {
		font-size: 1rem;
		font-weight: 600;
		font-family: var(--font-sans);
		margin-bottom: 0.5rem;
	}

	.block-progress {
		height: 0.25rem;
		background: var(--color-border);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 0.375rem;
	}

	.block-progress .progress-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 1s linear;
	}

	.block-percent {
		font-size: 0.75rem;
		color: var(--color-muted);
		font-family: var(--font-mono);
	}

	/* Year View - Calendar */
	.year-view {
		padding: 0.5rem 0;
	}

	.months-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	@media (min-width: 500px) {
		.months-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 0.75rem;
		}
	}

	.month-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		padding: 0.5rem;
	}

	.month-card.large {
		padding: 1.25rem;
	}

	.month-name {
		font-size: 0.65rem;
		font-weight: 600;
		text-align: center;
		margin-bottom: 0.25rem;
		font-family: var(--font-sans);
		letter-spacing: 0.05em;
	}

	.weekday-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
		margin-bottom: 0.125rem;
	}

	.weekday {
		font-size: 0.4rem;
		text-align: center;
		color: var(--color-muted);
		font-family: var(--font-sans);
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
	}

	.days-grid.large {
		gap: 0.5rem;
	}

	.day-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.5rem;
		font-family: var(--font-sans);
		position: relative;
		border-radius: 1px;
	}

	/* Tablet/Desktop enhancements */
	@media (min-width: 500px) {
		.month-card {
			padding: 0.625rem;
			border-radius: 0.5rem;
		}

		.month-name {
			font-size: 0.75rem;
			margin-bottom: 0.375rem;
		}

		.weekday {
			font-size: 0.5rem;
		}

		.weekday-row {
			gap: 2px;
			margin-bottom: 0.25rem;
		}

		.days-grid {
			gap: 2px;
		}

		.day-cell {
			font-size: 0.625rem;
			border-radius: 2px;
		}
	}

	.day-progress {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: var(--color-accent);
		transition: width 1s linear;
		border-radius: 0;
	}

	.day-num {
		position: relative;
		z-index: 1;
	}

	.day-cell.current .day-num {
		color: var(--color-text);
		font-weight: 600;
	}

	.day-cell.large {
		min-height: 3rem;
		font-size: 1rem;
	}

	.day-cell.empty {
		background: transparent;
	}

	.day-cell.past {
		background: var(--color-accent);
		color: white;
	}

	.day-cell.future {
		background: var(--color-border);
		color: var(--color-muted);
	}

	.day-cell.current {
		background: var(--color-border);
		border: 1px solid var(--color-accent);
		font-weight: 600;
		overflow: hidden;
	}

	/* Month View */
	.month-view {
		padding: 0.5rem 0;
	}

	/* Week View */
	.week-view {
		padding: 0.5rem 0;
	}

	.week-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.week-day-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 1rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: border-color 0.2s ease;
	}

	.week-day-card.current {
		border-color: var(--color-accent);
	}

	.week-day-card.future {
		opacity: 0.5;
	}

	.week-day-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.week-day-name {
		font-size: 0.875rem;
		font-weight: 600;
		font-family: var(--font-sans);
		letter-spacing: 0.02em;
	}

	.week-day-date {
		font-size: 0.75rem;
		color: var(--color-muted);
		font-family: var(--font-sans);
	}

	.week-day-card.past .week-day-name {
		color: var(--color-accent);
	}

	.week-day-progress {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-bar {
		width: 6rem;
		height: 0.25rem;
		background: var(--color-border);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 1s linear;
	}

	.progress-text {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		color: var(--color-accent);
		min-width: 3rem;
	}

	.week-day-complete {
		font-size: 0.625rem;
		color: var(--color-accent);
		font-family: var(--font-sans);
		letter-spacing: 0.05em;
	}

	/* Day View */
	.day-view {
		padding: 0.5rem 0;
	}

	.hours-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.hours-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.hour-card {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		transition: border-color 0.2s ease;
	}

	.hour-card.current {
		border-color: var(--color-accent);
	}

	.hour-card.past .hour-label {
		color: var(--color-accent);
	}

	.hour-label {
		font-size: 0.7rem;
		font-family: var(--font-sans);
		text-align: center;
	}

	.hour-progress {
		width: 100%;
		height: 0.1875rem;
		background: var(--color-border);
		border-radius: 1px;
		overflow: hidden;
	}

	.hour-progress .progress-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 1s linear;
	}

	/* Hours (Minutes) View */
	.hours-view {
		padding: 0.5rem 0;
		text-align: center;
	}

	.time-display {
		font-size: 2.5rem;
		font-weight: 700;
		font-family: 'Doto', var(--font-mono);
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.minutes-grid {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0.25rem;
	}

	@media (min-width: 640px) {
		.minutes-grid {
			grid-template-columns: repeat(12, 1fr);
		}
	}

	.minute-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.5rem;
		color: var(--color-muted);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 2px;
		font-family: var(--font-sans);
	}

	.minute-cell.past {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.minute-cell.past .minute-num {
		color: white;
	}

	.minute-cell.current {
		border-color: var(--color-accent);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.hour-bar {
		height: 0.375rem;
		background: var(--color-border);
		border-radius: 0.25rem;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.hour-bar-fill {
		height: 100%;
		background: var(--color-accent);
		transition: width 1s linear;
	}

	.hour-bar-label {
		font-size: 0.875rem;
		color: var(--color-muted);
		font-family: var(--font-serif);
		font-style: italic;
		margin-bottom: 1.5rem;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* Responsive adjustments */
	@media (min-width: 640px) {
		.percent-display {
			font-size: 3rem;
		}

		.decades-grid,
		.years-grid {
			grid-template-columns: repeat(5, 1fr);
		}

		.time-display {
			font-size: 3rem;
		}
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.stats-card {
			padding: 1rem;
		}

		.stats-row {
			flex-wrap: wrap;
			gap: 1rem;
		}

		.stats-left {
			flex: 1;
			min-width: 45%;
		}

		.stats-middle,
		.stats-right {
			flex: 1;
			min-width: 40%;
		}

		.stats-divider {
			display: none;
		}

		.percent-display {
			font-size: 2rem;
		}

		.units-count {
			font-size: 1.25rem;
		}

		.stats-quote {
			font-size: 0.75rem;
		}

		.quote-mark {
			font-size: 1rem;
		}

		.quote-author {
			font-size: 0.65rem;
		}
	}
</style>
