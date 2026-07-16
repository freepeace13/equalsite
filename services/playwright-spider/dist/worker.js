import {
  auditRepository,
  bullClient,
  bullmq,
  crawler,
  crawlerMap,
  createAuditService,
  deleteDirectoryIfExists,
  deleteFileIfExists,
  progressEvent,
  publishEvent,
  secretKey,
  zipDirectory
} from "./chunk-TEUD2NZP.js";

// src/worker.ts
import { Worker } from "bullmq";

// src/audit/actions/crawlerFactory.ts
import path from "path";
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
    axeResults
  }) => {
    const violations = axeResults.violations;
    await pushData({
      auditId,
      pageUrl,
      violations
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
var createAuditPageRequestHandler = (auditId, eventPublisher, options) => async ({
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
  await processAxeResultAction.run({
    pageUrl: request.url,
    auditId,
    axeResults
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

// src/audit/actions/crawlerFactory.ts
function createPlaywrightCrawler({
  auditId,
  eventPublisher,
  artifactDirectory,
  options
}) {
  const storageDir = path.join(artifactDirectory, String(auditId));
  const config = new Configuration({
    purgeOnStart: false,
    storageClientOptions: {
      localDataDirectory: storageDir
    }
  });
  return new PlaywrightCrawler(
    {
      requestHandler: createAuditPageRequestHandler(auditId, eventPublisher, options),
      failedRequestHandler: async ({ request }, error) => {
        await eventPublisher(pageFailedEvent({
          auditId,
          pageUrl: request.url,
          attemptsCount: request.retryCount,
          errorMessage: error.message
        }));
      },
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

// src/audit/actions/releaseArtifacts.ts
import fs from "fs";
import path2 from "path";
var createReleaseArtifactsAction = (auditRepository2, artifactDirectory, archiveDirectory, secretKey2) => {
  return {
    run: async (auditId) => {
      const audit = await auditRepository2.findOrFail(auditId);
      const zipPath = await extractAndCompressArtifacts(audit, artifactDirectory, archiveDirectory);
      try {
        await sendHttpRequest(audit, zipPath, secretKey2);
        console.log(`Audit ${auditId} artifacts sent!`);
      } catch (err) {
        console.error("Audit artifacts could'nt release: ", err);
      }
      return zipPath;
    }
  };
};
async function sendHttpRequest(audit, zipPath, secretKey2) {
  const form = new FormData();
  form.append("auditId", audit.id);
  form.append("artifact", new Blob([fs.readFileSync(zipPath)]), `${audit.id}.zip`);
  const response = await fetch(audit.urlCallback, {
    method: "POST",
    headers: { "Authorization": `Bearer ${secretKey2}` },
    body: form
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
async function extractAndCompressArtifacts(audit, artifactDirectory, archiveDirectory) {
  const sourceDir = path2.join(artifactDirectory, audit.id);
  const zipPath = path2.join(archiveDirectory, `${audit.id}.zip`);
  console.log(`Extracting artifacts (${sourceDir}) to (${zipPath})`);
  const result = await zipDirectory(sourceDir, zipPath);
  await deleteDirectoryIfExists(sourceDir);
  return result.path;
}

// src/audit/actions/performCleanUp.ts
var createPerformCleanUpAction = (auditRepository2) => ({
  run: async (audit, zipPath) => {
    try {
      await crawlerMap.get(audit.id)?.teardown();
      crawlerMap.delete(audit.id);
      await auditRepository2.delete(audit.id);
      deleteFileIfExists(zipPath);
      console.log("Cleanup successfully!");
    } catch (err) {
      console.log("Clean up failed: ", err);
    }
  }
});

// src/audit/actions/runAudit.ts
var createRunAuditAction = (auditRepository2, eventPublisher, config) => {
  const {
    artifactDirectory,
    archiveDirectory,
    secretKey: secretKey2
  } = config;
  const auditService = createAuditService(auditRepository2, eventPublisher);
  const performCleanUpAction = createPerformCleanUpAction(auditRepository2);
  const releaseArtifactsAction = createReleaseArtifactsAction(auditRepository2, artifactDirectory, archiveDirectory, secretKey2);
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
        await auditService.completeAudit(audit, crawler2);
      } catch (err) {
        console.error(err);
        await auditService.failAudit(audit, err);
        throw err;
      } finally {
        const zipPath = await releaseArtifactsAction.run(audit.id);
        await performCleanUpAction.run(audit, zipPath);
      }
    }
  };
};

// src/worker.ts
var crawlerWorker = new Worker(
  bullmq.queue,
  async ({ data }) => {
    await createRunAuditAction(
      auditRepository,
      publishEvent,
      {
        artifactDirectory: crawler.artifactDirectory,
        archiveDirectory: crawler.archiveDirectory,
        secretKey
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
});
crawlerWorker.on("error", (error) => {
  console.error("Crawler worker error", error);
});
crawlerWorker.on("ready", () => {
  console.log("Crawler worker ready");
});
