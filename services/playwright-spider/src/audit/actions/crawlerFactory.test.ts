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
    it("enables Crawlee's built-in robots.txt handling", () => {
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
        expect(crawlerOptions.respectRobotsTxtFile).toBe(true);
    });
});
