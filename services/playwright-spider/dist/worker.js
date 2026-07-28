import {
  auditRepository,
  bullClient,
  bullmq,
  captureWorkerFailure,
  classifyError,
  crawler,
  crawlerMap,
  crawlerQueue,
  createArtifactService,
  createAuditService,
  createQueuePositionService,
  initSentry,
  onUncaughtException,
  onUnhandledRejection,
  progressEvent,
  publishEvent
} from "./chunk-6K4R3JGH.js";

// src/worker.ts
import { Worker } from "bullmq";

// src/audit/actions/crawlerFactory.ts
import path2 from "path";
import { Configuration, PlaywrightCrawler } from "crawlee";

// src/audit/events/pageFailedEvent.ts
import { EventEnum } from "@equalsite/types";
var pageFailedEvent = (payload) => ({
  type: EventEnum.PageFailed,
  payload
});

// src/audit/actions/handleAuditPageRequest.ts
import { Request } from "crawlee";

// src/audit/events/pageStartedEvent.ts
import { EventEnum as EventEnum2 } from "@equalsite/types";
var pageStartedEvent = (payload) => ({
  type: EventEnum2.PageStarted,
  payload
});

// src/audit/events/pageCompletedEvent.ts
import { EventEnum as EventEnum3 } from "@equalsite/types";
var pageCompletedEvent = (payload) => ({
  type: EventEnum3.PageCompleted,
  payload
});

// src/audit/actions/processAxeResult.ts
var createProcessAxeResultAction = (pushData, eventPublisher) => ({
  run: async ({
    auditId,
    pageUrl,
    axeResults,
    screenshotPaths
  }) => {
    const violations = axeResults.violations;
    await pushData({
      auditId,
      pageUrl,
      violations: violations.map((violation) => ({
        ...violation,
        screenshotPath: screenshotPaths?.[violation.id]
      }))
      // passes: axeResults.passes // @todo customizable by request
    });
    const severityBreakdown = violations.reduce(
      (prev, curr) => {
        if (curr.impact) {
          prev[curr.impact] = prev[curr.impact] + 1;
        }
        return prev;
      },
      {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      }
    );
    await eventPublisher(pageCompletedEvent({
      auditId,
      pageUrl,
      severityBreakdown,
      violationsCount: violations.length
      // passesCount: passes.length, // @todo customizable by request
    }));
  }
});

// src/audit/actions/captureViolationScreenshots.ts
import fs from "fs";
import path from "path";
var HIGHLIGHT_CLASS = "__equalsite_violation_highlight__";
var sanitizeRuleId = (ruleId) => ruleId.replace(/[^a-zA-Z0-9-_]/g, "-");
var resolveSelectors = (violation) => violation.nodes.map((node) => node.target[0]).filter((target) => typeof target === "string");
var highlightSelectors = async (page, selectors) => {
  await page.evaluate(
    ({ selectors: selectors2, className }) => {
      for (const selector of selectors2) {
        let element = null;
        try {
          element = document.querySelector(selector);
        } catch {
          continue;
        }
        if (!element) {
          continue;
        }
        const rect = element.getBoundingClientRect();
        const box = document.createElement("div");
        box.className = className;
        box.style.position = "absolute";
        box.style.left = `${rect.left + window.scrollX}px`;
        box.style.top = `${rect.top + window.scrollY}px`;
        box.style.width = `${rect.width}px`;
        box.style.height = `${rect.height}px`;
        box.style.border = "3px solid #ff3b30";
        box.style.boxSizing = "border-box";
        box.style.pointerEvents = "none";
        box.style.zIndex = "2147483647";
        document.body.appendChild(box);
      }
    },
    { selectors, className: HIGHLIGHT_CLASS }
  );
};
var clearHighlights = async (page) => {
  await page.evaluate((className) => {
    document.querySelectorAll(`.${className}`).forEach((element) => element.remove());
  }, HIGHLIGHT_CLASS);
};
var captureViolationScreenshots = async ({
  page,
  violations,
  screenshotsDir,
  pageIndex
}) => {
  const paths = {};
  for (const violation of violations) {
    const selectors = resolveSelectors(violation);
    if (selectors.length === 0) {
      continue;
    }
    try {
      await highlightSelectors(page, selectors);
      const fileName = `${pageIndex}__${sanitizeRuleId(violation.id)}.png`;
      const relativePath = path.join("screenshots", fileName);
      fs.mkdirSync(screenshotsDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotsDir, fileName), fullPage: true });
      paths[violation.id] = relativePath;
    } catch (error) {
      console.error(`Failed to capture screenshot for rule "${violation.id}":`, error);
    } finally {
      await clearHighlights(page);
    }
  }
  return paths;
};

// src/audit/actions/handleAuditPageRequest.ts
import AxeBuilder from "@axe-core/playwright";
var canonicalizeRequestUniqueKey = (request) => {
  const url = new URL(request.url);
  url.protocol = "https:";
  url.hostname = url.hostname.replace(/^www\./, "");
  return {
    ...request,
    uniqueKey: Request.computeUniqueKey({ url: url.href, method: "GET" })
  };
};
var createAuditPageRequestHandler = (auditId, eventPublisher, options, screenshotsDir) => {
  let pageIndex = 0;
  return async ({
    request,
    page,
    pushData,
    enqueueLinks,
    crawler: crawler2
  }) => {
    await eventPublisher(pageStartedEvent({
      auditId,
      pageUrl: request.url,
      attemptsCount: request.retryCount
    }));
    const processAxeResultAction = createProcessAxeResultAction(pushData, eventPublisher);
    const axeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).options({ resultTypes: ["violations"] }).analyze();
    const screenshotPaths = options.captureScreenshot ? await captureViolationScreenshots({
      page,
      violations: axeResults.violations,
      screenshotsDir,
      pageIndex: pageIndex++
    }) : void 0;
    await processAxeResultAction.run({
      pageUrl: request.url,
      auditId,
      axeResults,
      screenshotPaths
    });
    const queue = await crawler2.getRequestQueue();
    const info = await queue.getInfo();
    await eventPublisher(progressEvent({
      auditId,
      completedRequests: info?.handledRequestCount ?? 0,
      pendingRequests: info?.pendingRequestCount ?? 0,
      totalRequests: info?.totalRequestCount ?? 0
    }));
    const currentDepth = request.userData?.depth ?? 0;
    const withinMaxDepth = options.maxDepth === void 0 || options.maxDepth === null || currentDepth < options.maxDepth;
    if (options.enqueueLinks && withinMaxDepth) {
      await enqueueLinks({
        strategy: options.enqueueStrategy,
        selector: "a",
        globs: options.includeGlobs?.length ? options.includeGlobs : void 0,
        exclude: options.excludeGlobs?.length ? options.excludeGlobs : void 0,
        userData: { depth: currentDepth + 1 },
        transformRequestFunction: canonicalizeRequestUniqueKey
      });
    }
  };
};

// src/audit/actions/crawlerFactory.ts
function createPlaywrightCrawler({
  auditId,
  eventPublisher,
  artifactDirectory,
  options
}) {
  const storageDir = path2.join(artifactDirectory, String(auditId));
  const screenshotsDir = path2.join(storageDir, "screenshots");
  const config = new Configuration({
    purgeOnStart: false,
    storageClientOptions: {
      localDataDirectory: storageDir
    }
  });
  return new PlaywrightCrawler(
    {
      requestHandler: createAuditPageRequestHandler(auditId, eventPublisher, options, screenshotsDir),
      failedRequestHandler: async ({ request }, error) => {
        const classified = classifyError(error);
        await eventPublisher(pageFailedEvent({
          auditId,
          pageUrl: request.url,
          attemptsCount: request.retryCount,
          errorMessage: classified.message,
          errorCode: classified.code
        }));
      },
      // Disabled: robots.txt fetches go through got-scraping, not Playwright, and some
      // WAFs (e.g. Cloudflare on marketdragon.ph) block/challenge that fingerprint while
      // allowing the real page load. A failed fetch isn't cached, so every request pays
      // a ~60s retry-and-fail tax, which can blow the AutoscaledPool's taskTimeoutSecs and
      // fatally kill the whole crawl. We're not a search-engine crawler, so robots.txt
      // compliance isn't required here.
      respectRobotsTxtFile: false,
      // onSkippedRequest: async ({ url, reason }) => {
      //     await eventPublisher(pageSkippedEvent({
      //         auditId,
      //         reason,
      //         pageUrl: url,
      //     }));
      // },
      minConcurrency: 1,
      maxConcurrency: 2,
      maxRequestsPerCrawl: Math.min(options.maxPages, 200),
      // Safety max audit page limit
      maxRequestRetries: 2,
      requestHandlerTimeoutSecs: 120,
      navigationTimeoutSecs: 45,
      headless: true,
      useSessionPool: true,
      persistCookiesPerSession: false,
      autoscaledPoolOptions: {
        desiredConcurrency: 2,
        maxConcurrency: 2,
        autoscaleIntervalSecs: 10,
        maybeRunIntervalSecs: 1,
        loggingIntervalSecs: 30,
        taskTimeoutSecs: 180,
        snapshotterOptions: {
          maxUsedMemoryRatio: 0.75
        }
      },
      launchContext: {
        launchOptions: {
          args: [
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox"
          ]
        }
      },
      preNavigationHooks: [
        resourceBlockingHook
      ]
    },
    config
  );
}
var resourceBlockingHook = async ({ page }) => {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const resourceType = request.resourceType();
    if ([
      "media",
      "font",
      "websocket",
      "manifest",
      "stylesheet"
    ].includes(resourceType)) {
      return await route.abort();
    }
    const url = request.url();
    if (url.includes("google-analytics") || url.includes("doubleclick") || url.includes("hotjar")) {
      return await route.abort();
    }
    return await route.continue();
  });
};

// src/audit/actions/performCleanUp.ts
var createPerformCleanUpAction = (auditRepository2) => ({
  run: async (audit) => {
    try {
      await crawlerMap.get(audit.id)?.teardown();
      crawlerMap.delete(audit.id);
      await auditRepository2.delete(audit.id);
      console.log("Cleanup successfully!");
    } catch (err) {
      console.log("Clean up failed: ", err);
    }
  }
});

// src/audit/actions/cancellationGuard.ts
function wasCancelledExternally(freshAudit) {
  return freshAudit === null || freshAudit.status.is("cancelled");
}

// src/audit/actions/runAudit.ts
var createRunAuditAction = (auditRepository2, eventPublisher, config) => {
  const {
    artifactDirectory,
    archiveDirectory
  } = config;
  const auditService = createAuditService(auditRepository2, eventPublisher);
  const artifactService = createArtifactService(artifactDirectory, archiveDirectory);
  const performCleanUpAction = createPerformCleanUpAction(auditRepository2);
  return {
    run: async (auditId) => {
      const audit = await auditRepository2.findOrFail(auditId);
      if (!audit.status.is("waiting")) {
        return;
      }
      const crawler2 = createPlaywrightCrawler({
        auditId,
        eventPublisher,
        artifactDirectory,
        options: audit.options
      });
      crawlerMap.set(audit.id, crawler2);
      try {
        await auditService.startAudit(audit);
        await crawler2.run(audit.urls);
        if (wasCancelledExternally(await auditRepository2.find(auditId))) {
          return;
        }
        await artifactService.compress(audit.id);
        await auditService.completeAudit(audit, crawler2);
      } catch (err) {
        if (wasCancelledExternally(await auditRepository2.find(auditId))) {
          return;
        }
        console.error(err);
        await auditService.failAudit(audit, err);
        throw err;
      } finally {
        await performCleanUpAction.run(audit);
      }
    }
  };
};

// src/worker.ts
initSentry();
process.on("uncaughtException", onUncaughtException);
process.on("unhandledRejection", onUnhandledRejection);
var queuePositionService = createQueuePositionService(crawlerQueue, publishEvent);
var crawlerWorker = new Worker(
  bullmq.queue,
  async ({ data }) => {
    await createRunAuditAction(
      auditRepository,
      publishEvent,
      {
        artifactDirectory: crawler.artifactDirectory,
        archiveDirectory: crawler.archiveDirectory
      }
    ).run(data.auditId);
  },
  {
    connection: bullClient,
    concurrency: bullmq.concurrency
  }
);
crawlerWorker.on("active", (job) => {
  console.error("Crawler worker active", { jobId: job.id });
  queuePositionService.publishPositions().catch(console.error);
});
crawlerWorker.on("completed", () => {
  queuePositionService.publishPositions().catch(console.error);
});
crawlerWorker.on("failed", (_job, error) => {
  captureWorkerFailure(error);
  queuePositionService.publishPositions().catch(console.error);
});
crawlerWorker.on("error", (error) => {
  console.error("Crawler worker error", error);
});
crawlerWorker.on("ready", () => {
  console.log("Crawler worker ready");
});
