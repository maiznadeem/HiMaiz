// Argus demo data. Every name here is invented (storyboard/demo-data.md); nothing comes from the real
// project or its estate.

export const SOURCES = [
    { name: "Cloud A", time: "06:00:04" },
    { name: "Cloud B", time: "05:00:11", stale: true },
    { name: "DNS", time: "06:00:02" },
    { name: "Code host", time: "06:00:07" },
    { name: "Database host", time: "06:00:05" },
    { name: "VM", time: "06:00:03" },
    { name: "Outside probe", time: "06:00:09" },
    { name: "Billing", time: "06:00:06" },
] as const;

export type RuleResult = "pass" | "broken" | "excepted" | "unknown";

/** The 12 rules on screen, of 23. `final` is where each one ends up. */
export const RULES: { n: string; name: string; final: RuleResult; cloudB?: boolean }[] = [
    { n: "01", name: "Every address points somewhere known", final: "pass" },
    { n: "02", name: "Certificates renew 14+ days early", final: "pass" },
    { n: "04", name: "Every origin refuses direct calls", final: "broken" },
    { n: "06", name: "No public database ports", final: "excepted" },
    { n: "07", name: "Every service has a budget cap", final: "unknown" },
    { n: "09", name: "Deploys come from the main branch", final: "pass" },
    { n: "11", name: "Every container runs as non-root", final: "pass" },
    { n: "13", name: "Secrets are never in images", final: "pass" },
    { n: "15", name: "Logs leave no credentials", final: "pass" },
    { n: "17", name: "Every Cloud B service is behind sign-in", final: "unknown", cloudB: true },
    { n: "18", name: "Cloud B buckets are private", final: "unknown", cloudB: true },
    { n: "21", name: "Cloud B jobs have a timeout", final: "unknown", cloudB: true },
];

export const TOTAL_RULES = 23;

/**
 * The summary bar. demo-data.md says "Pass 18, Could not check 3", but its own rules give four grey
 * cards (07 plus the three Cloud B rules) and 6 shown passes plus 11 unshown, so the bar is corrected
 * to add up: 17 + 1 + 1 + 4 = 23.
 */
export const SUMMARY = { pass: 17, broken: 1, excepted: 1, unknown: 4 } as const;

/** Argus's own colours inside its screen. */
export const ARGUS = {
    panel: "#2b3037",
    panelLine: "#4a525c",
    onPanel: "#eeede6",
    onPanelSoft: "#a9adb2",
    blank: "#efeee8",
    pass: "#7fae6b",
    broken: "#ff4f1a",
    excepted: "#8fa6c4",
    unknown: "#b3b2ab",
    unknownLine: "#55544f",
} as const;
