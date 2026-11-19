const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parts(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return { year, month, day };
}

/** "2026-11-01" -> "Nov 2026" */
export function formatMonth(date: string): string {
    const { year, month } = parts(date);
    return `${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

/** "2026-11-01" -> "1 November 2026" */
export function formatFullDate(date: string): string {
    const { year, month, day } = parts(date);
    return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** "2026-11-01" -> "Sun, 01 Nov 2026 12:00:00 GMT" (RFC 822, noon UTC) */
export function toRssDate(date: string): string {
    const { year, month, day } = parts(date);
    const utc = new Date(Date.UTC(year, month - 1, day, 12));
    const dd = String(day).padStart(2, "0");
    return `${DAYS[utc.getUTCDay()]}, ${dd} ${MONTHS[month - 1].slice(0, 3)} ${year} 12:00:00 GMT`;
}
