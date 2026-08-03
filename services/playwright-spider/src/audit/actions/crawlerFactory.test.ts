import { describe, expect, it, vi } from "vitest";

const playwrightCrawlerMock = vi.fn();

vi.mock("crawlee", () => ({
    Configuration: vi.fn().mockImplementation(function (this: unknown, opts: unknown) {
        return opts;
    }),
    PlaywrightCrawler: playwrightCrawlerMock,
}));

const { default: createPlaywrightCrawler } = await import("./crawlerFactory");

describe("createPlaywrightCrawler", () => {
    it("disables Crawlee's built-in robots.txt handling", () => {
        // robots.txt fetches go through got-scraping, not Playwright, and some WAFs block/challenge
        // that fingerprint while allowing the real page load - see crawlerFactory.ts for the full
        // rationale. We're not a search-engine crawler, so robots.txt compliance isn't required.
        createPlaywrightCrawler({
            auditId: "audit-1",
            eventPublisher: vi.fn(),
            artifactDirectory: "/tmp/equalsite-robots-test",
            options: {
                maxPages: 10,
                enqueueLinks: false,
                enqueueStrategy: "same-domain",
            },
        });

        const [crawlerOptions] = playwrightCrawlerMock.mock.calls[0]!;
        expect(crawlerOptions.respectRobotsTxtFile).toBe(false);
    });
});
