import {
	startOfYear,
	endOfYear,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	startOfDay,
	endOfDay,
	startOfHour,
	endOfHour,
	getDaysInYear,
	getDaysInMonth,
	getDay,
	getDate,
	getMonth,
	getYear,
	getHours,
	getMinutes,
	getSeconds,
	differenceInMilliseconds,
	eachDayOfInterval,
	eachMonthOfInterval,
	format,
	isLeapYear,
	isSameDay,
	isBefore,
	isAfter
} from 'date-fns';

/**
 * Calculate the percentage of the current year that has elapsed
 * Includes partial day progress for continuous updates
 */
export function getYearProgress(now: Date): number {
	const yearStart = startOfYear(now);
	const yearEnd = endOfYear(now);
	const totalMs = differenceInMilliseconds(yearEnd, yearStart);
	const elapsedMs = differenceInMilliseconds(now, yearStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current month that has elapsed
 */
export function getMonthProgress(now: Date): number {
	const monthStart = startOfMonth(now);
	const monthEnd = endOfMonth(now);
	const totalMs = differenceInMilliseconds(monthEnd, monthStart);
	const elapsedMs = differenceInMilliseconds(now, monthStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current week that has elapsed
 * Week starts on Sunday by default
 */
export function getWeekProgress(now: Date): number {
	const weekStart = startOfWeek(now);
	const weekEnd = endOfWeek(now);
	const totalMs = differenceInMilliseconds(weekEnd, weekStart);
	const elapsedMs = differenceInMilliseconds(now, weekStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current day that has elapsed
 */
export function getDayProgress(now: Date): number {
	const dayStart = startOfDay(now);
	const dayEnd = endOfDay(now);
	const totalMs = differenceInMilliseconds(dayEnd, dayStart);
	const elapsedMs = differenceInMilliseconds(now, dayStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current hour that has elapsed
 */
export function getHourProgress(now: Date): number {
	const hourStart = startOfHour(now);
	const hourEnd = endOfHour(now);
	const totalMs = differenceInMilliseconds(hourEnd, hourStart);
	const elapsedMs = differenceInMilliseconds(now, hourStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current decade that has elapsed
 * Decade: 2020-2029, 2030-2039, etc.
 */
export function getDecadeProgress(now: Date): number {
	const currentYear = getYear(now);
	const decadeStart = new Date(Math.floor(currentYear / 10) * 10, 0, 1);
	const decadeEnd = new Date(Math.floor(currentYear / 10) * 10 + 10, 0, 1);
	const totalMs = differenceInMilliseconds(decadeEnd, decadeStart);
	const elapsedMs = differenceInMilliseconds(now, decadeStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Calculate the percentage of the current century that has elapsed
 * Century: 2000-2099, 2100-2199, etc.
 */
export function getCenturyProgress(now: Date): number {
	const currentYear = getYear(now);
	const centuryStart = new Date(Math.floor(currentYear / 100) * 100, 0, 1);
	const centuryEnd = new Date(Math.floor(currentYear / 100) * 100 + 100, 0, 1);
	const totalMs = differenceInMilliseconds(centuryEnd, centuryStart);
	const elapsedMs = differenceInMilliseconds(now, centuryStart);
	return (elapsedMs / totalMs) * 100;
}

/**
 * Get all months in a year with their dates
 */
export function getMonthsInYear(year: number): Date[] {
	const yearStart = new Date(year, 0, 1);
	const yearEnd = new Date(year, 11, 31);
	return eachMonthOfInterval({ start: yearStart, end: yearEnd });
}

/**
 * Get all days in a month
 */
export function getDaysInMonthArray(year: number, month: number): Date[] {
	const monthStart = new Date(year, month, 1);
	const monthEnd = endOfMonth(monthStart);
	return eachDayOfInterval({ start: monthStart, end: monthEnd });
}

/**
 * Get the days of the week for a given date's week
 */
export function getDaysInWeek(date: Date): Date[] {
	const weekStart = startOfWeek(date);
	const weekEnd = endOfWeek(date);
	return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Determine the status of a day relative to now
 */
export function getDayStatus(day: Date, now: Date): 'past' | 'current' | 'future' {
	if (isSameDay(day, now)) return 'current';
	if (isBefore(day, now)) return 'past';
	return 'future';
}

/**
 * Get progress for the current unit based on zoom level
 */
export function getProgressForZoomLevel(now: Date, zoomLevel: number): number {
	switch (zoomLevel) {
		case 0: // Hours view
			return getHourProgress(now);
		case 1: // Day view
			return getDayProgress(now);
		case 2: // Week view
			return getWeekProgress(now);
		case 3: // Month view
			return getMonthProgress(now);
		case 4: // Year view (default)
			return getYearProgress(now);
		case 5: // Decade view
			return getDecadeProgress(now);
		case 6: // Century view
			return getCenturyProgress(now);
		default:
			return getYearProgress(now);
	}
}

/**
 * Get the label for the current zoom level
 */
export function getZoomLevelLabel(zoomLevel: number): string {
	switch (zoomLevel) {
		case 0:
			return 'Hour';
		case 1:
			return 'Day';
		case 2:
			return 'Week';
		case 3:
			return 'Month';
		case 4:
			return 'Year';
		case 5:
			return 'Decade';
		case 6:
			return 'Century';
		default:
			return 'Year';
	}
}

/**
 * Format a date for display
 */
export function formatDate(date: Date, formatStr: string): string {
	return format(date, formatStr);
}

/**
 * Get the current decade range (e.g., "2020-2029")
 */
export function getDecadeRange(year: number): string {
	const decadeStart = Math.floor(year / 10) * 10;
	return `${decadeStart}-${decadeStart + 9}`;
}

/**
 * Get the current century range (e.g., "2000-2099")
 */
export function getCenturyRange(year: number): string {
	const centuryStart = Math.floor(year / 100) * 100;
	return `${centuryStart}-${centuryStart + 99}`;
}

/**
 * Get years in the current decade
 */
export function getYearsInDecade(year: number): number[] {
	const decadeStart = Math.floor(year / 10) * 10;
	return Array.from({ length: 10 }, (_, i) => decadeStart + i);
}

/**
 * Get decades in the current century
 */
export function getDecadesInCentury(year: number): number[] {
	const centuryStart = Math.floor(year / 100) * 100;
	return Array.from({ length: 10 }, (_, i) => centuryStart + i * 10);
}

/**
 * Calculate what percentage of a specific year has elapsed (for decade view)
 */
export function getYearProgressInDecade(targetYear: number, currentYear: number, now: Date): number {
	if (targetYear < currentYear) return 100;
	if (targetYear > currentYear) return 0;
	return getYearProgress(now);
}

/**
 * Calculate what percentage of a specific decade has elapsed (for century view)
 */
export function getDecadeProgressInCentury(
	targetDecadeStart: number,
	currentYear: number,
	now: Date
): number {
	const currentDecadeStart = Math.floor(currentYear / 10) * 10;
	if (targetDecadeStart < currentDecadeStart) return 100;
	if (targetDecadeStart > currentDecadeStart) return 0;
	return getDecadeProgress(now);
}

// Re-export useful date-fns functions
export {
	getDay,
	getDate,
	getMonth,
	getYear,
	getHours,
	getMinutes,
	getSeconds,
	getDaysInYear,
	getDaysInMonth,
	isLeapYear,
	isSameDay,
	isBefore,
	isAfter,
	format,
	startOfYear,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth
};
