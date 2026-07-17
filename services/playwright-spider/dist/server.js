import {
  auditRepository,
  bullClient,
  bullmq,
  crawler,
  crawlerMap,
  createArtifactService,
  createAuditService,
  deleteDirectoryIfExists,
  publishEvent,
  secretKey
} from "./chunk-WWYPIUJH.js";

// src/app.ts
import express from "express";

// src/routes/index.ts
import { Router } from "express";

// src/app/middleware/validationMiddleware.ts
import { validationResult } from "express-validator";
function validationMiddleware(validations) {
  return async (request, response, next) => {
    await Promise.all(validations.map((validation) => validation.run(request)));
    const result = validationResult(request).formatWith((error) => ({
      field: error.type === "field" ? error.path : error.type,
      message: normalizeMessage(error.msg)
    }));
    if (result.isEmpty()) {
      return next();
    }
    return response.status(400).json({
      error: "Invalid request body",
      message: "The request failed validation.",
      errors: result.array({ onlyFirstError: true })
    });
  };
}
function normalizeMessage(message) {
  const text = typeof message === "string" && message.trim().length > 0 ? message.trim() : "Invalid value";
  return text.endsWith(".") ? text : `${text}.`;
}

// src/app/validators/auditValidators.ts
import { body, param } from "express-validator";
var createAuditValidationRules = [
  body("urls").isArray({ min: 1 }).withMessage("urls is required and must be a non-empty array of strings"),
  body("urls.*").isString().withMessage("each url must be a string").bail().isURL().withMessage("each url must be a valid URL"),
  body("options").isObject().withMessage("options is required and must be an object"),
  body("options.maxPages").isInt({ min: 1 }).withMessage("options.maxPages is required and must be a positive integer"),
  body("options.enqueueLinks").isBoolean().withMessage("options.enqueueLinks is required and must be a boolean"),
  body("options.enqueueStrategy").isString().withMessage("options.enqueueStrategy is required and must be a string").bail().notEmpty().withMessage("options.enqueueStrategy must not be empty"),
  body("options.maxDepth").optional({ nullable: true }).isInt({ min: 0 }).withMessage("options.maxDepth must be a non-negative integer or null"),
  body("options.includeGlobs").optional().isArray().withMessage("options.includeGlobs must be an array of strings"),
  body("options.includeGlobs.*").optional().isString().withMessage("each options.includeGlobs entry must be a string"),
  body("options.excludeGlobs").optional().isArray().withMessage("options.excludeGlobs must be an array of strings"),
  body("options.excludeGlobs.*").optional().isString().withMessage("each options.excludeGlobs entry must be a string")
];
var cancelAuditValidationRules = [
  param("auditId").isString().trim().notEmpty().withMessage("auditId is required")
];

// src/app/services/queue.ts
import { Queue } from "bullmq";
var crawlerQueue = new Queue(
  bullmq.queue,
  {
    connection: bullClient,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 1e3,
      attempts: 1,
      backoff: {
        type: "exponential",
        delay: 5e3
      }
    }
  }
);

// src/audit/actions/createAudit.ts
var createAuditAction = (auditRepository2) => ({
  run: async ({
    urls,
    options
  }) => {
    const audit = await auditRepository2.create({
      urls,
      options
    });
    return audit.id;
  }
});

// src/app/controllers/createAuditController.ts
var createAuditAction2 = createAuditAction(auditRepository);
var CreateAuditController = async (request, response) => {
  const urls = request.body.urls;
  const options = request.body.options;
  const auditId = await createAuditAction2.run({
    urls,
    options
  });
  await crawlerQueue.add("audit", { auditId }, { jobId: auditId });
  return response.status(202).json({
    id: auditId,
    options
  });
};

// src/audit/actions/cancelAudit.ts
var createCancelAuditAction = (auditRepository2, eventPublisher, artifactDirectory2) => {
  const auditService = createAuditService(auditRepository2, eventPublisher);
  return {
    run: async (auditId) => {
      const audit = await auditRepository2.findOrFail(auditId);
      if (!audit.status.is("active")) {
        return;
      }
      await auditRepository2.save(audit.markAsCancelled());
      try {
        const crawler2 = crawlerMap.get(audit.id);
        if (crawler2) {
          await auditService.cancelAudit(audit, crawler2);
          await crawler2.teardown();
        }
        await deleteDirectoryIfExists(artifactDirectory2);
      } catch (err) {
        console.error(err);
      } finally {
        await auditRepository2.delete(audit.id);
        crawlerMap.delete(audit.id);
      }
    }
  };
};

// src/app/controllers/cancelAuditController.ts
var cancelAuditAction = createCancelAuditAction(
  auditRepository,
  publishEvent,
  crawler.artifactDirectory
);
var CancelAuditController = async (request, response) => {
  const auditId = request.params.auditId;
  await cancelAuditAction.run(auditId);
  const job = await crawlerQueue.getJob(auditId);
  const state = await job?.getState();
  if (state === "waiting" || state === "delayed") {
    await job?.remove();
  }
  return response.json({
    auditId
  });
};

// src/app/controllers/downloadArtifactsController.ts
var { artifactDirectory, archiveDirectory } = crawler;
var artifactService = createArtifactService(artifactDirectory, archiveDirectory);
var DownloadArtifactsController = async (request, response) => {
  const { auditId } = request.params;
  const zippedFile = await artifactService.zippedFile(auditId);
  return response.download(zippedFile, (err) => {
    if (err) {
      console.error("Error during file transfer:", err);
      if (!response.headersSent) {
        return response.status(500).send("Could not download file.");
      }
    } else {
      console.log("Download complete. Proceeding to delete file...");
      void artifactService.cleanup(auditId);
    }
  });
};

// src/routes/index.ts
var router = Router();
router.post(
  "/audit",
  validationMiddleware(createAuditValidationRules),
  CreateAuditController
);
router.delete(
  "/audit/:auditId",
  validationMiddleware(cancelAuditValidationRules),
  CancelAuditController
);
router.get("/download/:auditId", DownloadArtifactsController);
router.get("/ping", (req, res) => {
  res.json({ ok: true });
});
var routes_default = router;

// src/app/middleware/authenticateInternalRequest.ts
function authenticateInternalRequest() {
  return (request, response, next) => {
    const authToken = request.headers.authorization;
    if (!authToken?.startsWith("Bearer ")) {
      return response.status(401).json({
        error: "Unauthorized"
      });
    }
    const token = authToken.replace("Bearer ", "");
    if (token !== secretKey) {
      return response.status(403).json({
        error: "Forbidden"
      });
    }
    next();
  };
}

// src/app.ts
var app = express();
app.use(express.json());
app.use(authenticateInternalRequest());
app.use("/api/v1", routes_default);
var app_default = app;

// src/server.ts
var HOST = "0.0.0.0";
var PORT = Number(process.env.CRAWLER_PORT) || 3e3;
app_default.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
