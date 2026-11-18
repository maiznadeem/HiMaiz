process.env.TZ = "America/Los_Angeles";

import { describe, expect, it } from "vitest";
import { formatFullDate, formatMonth, toRssDate } from "./dates";

describe("dates", () => {
    it("formats month", () => {
        expect(formatMonth("2026-11-01")).toBe("Nov 2026");
        expect(formatMonth("2026-01-31")).toBe("Jan 2026");
    });
    it("formats full date", () => {
        expect(formatFullDate("2026-11-01")).toBe("1 November 2026");
    });
    it("formats RSS date", () => {
        expect(toRssDate("2026-11-01")).toBe("Sun, 01 Nov 2026 12:00:00 GMT");
    });
});
