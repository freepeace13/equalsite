// src/config/index.ts
import path from "path";
var secretKey = String(process.env.CRAWLER_SECRET);
var redis = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
};
var bullmq = {
  queue: "crawl-queue",
  concurrency: 2
};
var storagePath = path.join(process.cwd(), "storage");
var crawler = {
  maxRequestsPerCrawl: Number(process.env.CRAWLER_PAGE_LIMIT || 50),
  artifactDirectory: path.join(storagePath, "artifacts"),
  archiveDirectory: path.join(storagePath, "archives")
};

// src/app/services/redis.ts
import Redis from "ioredis";
var streamClient = new Redis(redis);
var cacheClient = new Redis({
  ...redis,
  retryStrategy: (times) => Math.min(times * 50, 2e3)
});
var bullClient = new Redis({
  ...redis,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

// src/audit/value/status.ts
var Status = class _Status {
  value;
  constructor(value) {
    this.value = value;
  }
  static make(value) {
    return new _Status(value);
  }
  static waiting() {
    return new _Status("waiting");
  }
  static active() {
    return new _Status("active");
  }
  static failed() {
    return new _Status("failed");
  }
  static completed() {
    return new _Status("completed");
  }
  static cancelled() {
    return new _Status("cancelled");
  }
  is(value) {
    return value === this.value;
  }
  isAny(values) {
    return values.indexOf(this.value) !== -1;
  }
};
var status_default = Status;

// src/audit/entities/audit.ts
var AuditEntity = class _AuditEntity {
  id;
  urls;
  status;
  error;
  options;
  createdAt;
  constructor(attributes) {
    this.id = attributes.id;
    this.urls = attributes.urls;
    this.status = attributes.status;
    this.createdAt = attributes.createdAt;
    this.options = attributes.options;
  }
  toString() {
    return JSON.stringify({
      id: this.id,
      urls: this.urls,
      status: this.status,
      createdAt: this.createdAt,
      options: this.options
    });
  }
  static make(attributes) {
    return new _AuditEntity(attributes);
  }
  static fromString(value) {
    const parsed = JSON.parse(value);
    const statusValue = typeof parsed.status === "string" ? parsed.status : parsed.status instanceof status_default ? parsed.status.value : parsed.status.value;
    return new _AuditEntity({
      ...parsed,
      status: status_default.make(statusValue)
    });
  }
  markAsCancelled() {
    const cancelled = status_default.cancelled();
    if (!this.status.is("active")) {
      throw new Error(`Status change from '${this.status.value}' to '${cancelled.value}' is not allowed.`);
    }
    this.status = cancelled;
    return this;
  }
  markAsCompleted() {
    const completed = status_default.completed();
    if (!this.status.is("active")) {
      throw new Error(`Status change from '${this.status.value}' to '${completed.value}' is not allowed.`);
    }
    this.status = completed;
    return this;
  }
  markAsFailed(reason) {
    const failed = status_default.failed();
    if (!this.status.is("active")) {
      throw new Error(`Status change from '${this.status.value}' to '${failed.value}' is not allowed.`);
    }
    this.status = failed;
    this.error = reason;
    return this;
  }
  markAsActive() {
    const active = status_default.active();
    if (!this.status.is("waiting")) {
      throw new Error(`Status change from '${this.status.value}' to '${active.value}' is not allowed.`);
    }
    this.status = active;
    return this;
  }
};
var audit_default = AuditEntity;

// src/app/adapters/redisAuditRepository.ts
import { randomUUID } from "crypto";

// src/app/support/redisCrudStore.ts
var RedisCrudStore = class {
  client;
  prefix;
  entityClass;
  constructor(redisClient, entityPrefix, entityClass) {
    this.client = redisClient;
    this.prefix = entityPrefix;
    this.entityClass = entityClass;
  }
  buildKey(id) {
    return `${this.prefix}:${id}`;
  }
  async save(entity) {
    const key = this.buildKey(entity.id);
    await this.client.set(key, entity.toString());
  }
  async findOne(id) {
    const key = this.buildKey(id);
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }
    try {
      return this.entityClass.fromString(data);
    } catch (error) {
      console.error(`[RedisCrudStore] Failed to parse entity for key "${key}":`, error);
      return null;
    }
  }
  async update(id, updates) {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }
    const updatedEntity = { ...existing, ...updates, id: existing.id };
    await this.save(updatedEntity);
    return updatedEntity;
  }
  async delete(id) {
    const key = this.buildKey(id);
    const result = await this.client.del(key);
    return result === 1;
  }
  async findAll() {
    const matchPattern = `${this.prefix}:*`;
    const allKeys = [];
    const stream = this.client.scanStream({
      match: matchPattern,
      count: 250
    });
    for await (const resultKeys of stream) {
      allKeys.push(...resultKeys);
    }
    if (allKeys.length === 0) {
      return [];
    }
    const stringifiedValues = await this.client.mget(allKeys);
    const results = [];
    for (const rawValue of stringifiedValues) {
      if (rawValue) {
        try {
          results.push(this.entityClass.fromString(rawValue));
        } catch {
          continue;
        }
      }
    }
    return results;
  }
  async findFiltered(predicate) {
    const allRecords = await this.findAll();
    return allRecords.filter(predicate);
  }
};

// src/app/adapters/redisAuditRepository.ts
var store = new RedisCrudStore(cacheClient, "spider-cache:audits", audit_default);
var auditRepository = {
  find: async (id) => {
    return await store.findOne(id);
  },
  all: async () => {
    return await store.findAll();
  },
  save: async (audit) => {
    await store.save(audit);
  },
  delete: async (id) => {
    await store.delete(id);
  },
  exists: async (id) => {
    const record = await store.findOne(id);
    return record !== null;
  },
  findOrFail: async (id) => {
    const record = await store.findOne(id);
    if (!record) {
      throw new Error(`Audit record with ID [${id}] not found`);
    }
    return record;
  },
  create: async (attributes) => {
    const created = audit_default.make({
      ...attributes,
      id: randomUUID(),
      status: status_default.waiting(),
      createdAt: Date.now()
    });
    await store.save(created);
    return created;
  },
  getByStatus: async (status) => {
    return await store.findFiltered((records) => records.status.is(status.value));
  }
};

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

// src/app/adapters/redisStreamPublisher.ts
var VERSION = "1";
var STREAM_NAME = String(process.env.STREAM_NAME);
var publishEvent = async function(event) {
  await streamClient.xadd(
    STREAM_NAME,
    "MAXLEN",
    "~",
    "10000",
    "*",
    "data",
    JSON.stringify({
      version: VERSION,
      timestamp: Date.now(),
      ...event
    })
  );
  console.log("[Redis Stream] published event: ", JSON.stringify({
    version: VERSION,
    timestamp: Date.now(),
    ...event
  }));
};

// src/audit/events/queuedEvent.ts
import { EventEnum } from "@equalsite/types";
var queuedEvent = (payload) => ({
  type: EventEnum.Queued,
  payload
});

// src/audit/services/queuePositionService.ts
var createQueuePositionService = (queue, eventPublisher) => ({
  publishPositions: async () => {
    const [activeCount, waitingJobs] = await Promise.all([
      queue.getActiveCount(),
      queue.getJobs(["waiting"], 0, -1, true)
    ]);
    const jobsWithId = waitingJobs.filter(
      (job) => typeof job.id === "string"
    );
    await Promise.all(
      jobsWithId.map(
        (job, i) => eventPublisher(queuedEvent({
          auditId: job.id,
          ahead: activeCount + i,
          position: activeCount + i + 1,
          waiting: jobsWithId.length
        }))
      )
    );
  }
});

// src/audit/events/completedEvent.ts
import { EventEnum as EventEnum2 } from "@equalsite/types";
var completedEvent = (payload) => ({
  type: EventEnum2.Completed,
  payload: {
    auditId: payload.auditId,
    ...payload.statistics
  }
});

// src/audit/events/startedEvent.ts
import { EventEnum as EventEnum3 } from "@equalsite/types";
var startedEvent = (payload) => ({
  type: EventEnum3.Started,
  payload
});

// src/audit/events/failedEvent.ts
import { EventEnum as EventEnum4 } from "@equalsite/types";
var failedEvent = (payload) => ({
  type: EventEnum4.Failed,
  payload
});

// src/audit/events/cancelledEvent.ts
import { EventEnum as EventEnum5 } from "@equalsite/types";
var cancelledEvent = (payload) => ({
  type: EventEnum5.Cancelled,
  payload: {
    auditId: payload.auditId,
    ...payload.statistics
  }
});

// src/audit/events/progressEvent.ts
import { EventEnum as EventEnum6 } from "@equalsite/types";
var progressEvent = (payload) => ({
  type: EventEnum6.Progress,
  payload: {
    ...payload,
    progressPercentage: Math.floor(payload.completedRequests / payload.totalRequests * 100)
  }
});

// src/audit/utils/classifyError.ts
var PATTERNS = [
  { code: "dns_error", test: /ERR_NAME_NOT_RESOLVED|ENOTFOUND|ERR_ADDRESS_UNREACHABLE/i },
  { code: "tls_error", test: /ERR_CERT_|ERR_SSL_|certificate/i },
  { code: "connection_failed", test: /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED|ECONNREFUSED|ECONNRESET/i },
  { code: "timeout", test: /timeout/i },
  { code: "http_error", test: /status code \d{3}|HTTP\/?\s?\d{3}/i }
];
function classifyError(error) {
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : String(error);
  const match = PATTERNS.find(({ test }) => test.test(message));
  return {
    code: match?.code ?? "internal_error",
    message
  };
}

// src/audit/services/auditService.ts
var createAuditService = (auditRepository2, eventPublisher) => ({
  startAudit: async (audit) => {
    await auditRepository2.save(audit.markAsActive());
    await eventPublisher(startedEvent({
      auditId: audit.id
    }));
  },
  cancelAudit: async (audit, crawler2) => {
    await auditRepository2.save(audit.markAsCancelled());
    await eventPublisher(cancelledEvent({
      auditId: audit.id,
      statistics: crawler2.stats.state
    }));
  },
  completeAudit: async (audit, crawler2) => {
    const queue = await crawler2.getRequestQueue();
    const info = await queue.getInfo();
    await eventPublisher(progressEvent({
      auditId: audit.id,
      completedRequests: info?.handledRequestCount ?? 0,
      pendingRequests: info?.pendingRequestCount ?? 0,
      totalRequests: info?.totalRequestCount ?? 0
    }));
    await auditRepository2.save(audit.markAsCompleted());
    await eventPublisher(completedEvent({
      auditId: audit.id,
      statistics: crawler2.stats.state
    }));
  },
  failAudit: async (audit, err) => {
    const classified = classifyError(err);
    await auditRepository2.save(audit.markAsFailed(classified.message));
    await eventPublisher(failedEvent({
      auditId: audit.id,
      error: classified.message,
      errorCode: classified.code
    }));
  }
});

// src/audit/services/artifactService.ts
import fs2 from "fs";
import path3 from "path";

// src/audit/utils/fsDirectory.ts
import fs from "fs";
import path2 from "path";
import { ZipArchive } from "archiver";
async function deleteDirectoryIfExists(dir) {
  if (fs.existsSync(dir)) {
    await fs.promises.rm(
      dir,
      {
        recursive: true,
        force: true
      }
    );
  }
}
function deleteFileIfExists(path4) {
  if (fs.existsSync(path4)) {
    try {
      fs.unlinkSync(path4);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
}
function ensureDirectoryExistence(targetPath) {
  const dirname = path2.dirname(targetPath);
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }
}
async function zipDirectory(sourceDir, outputZip) {
  return await new Promise((resolve, reject) => {
    if (fs.existsSync(outputZip)) {
      resolve({ path: outputZip });
    }
    if (!fs.existsSync(sourceDir)) {
      reject("Source directory not exists.");
    }
    ensureDirectoryExistence(outputZip);
    const output = fs.createWriteStream(outputZip);
    const archive = new ZipArchive({
      zlib: { level: 9 }
    });
    output.on("close", () => resolve({
      path: output.path
    }));
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    void archive.finalize();
  });
}

// src/audit/services/artifactService.ts
var createArtifactService = (artifactDirectory, archiveDirectory) => {
  const directoryPath = (auditId) => {
    return path3.join(artifactDirectory, auditId);
  };
  const zippedPath = (auditId) => {
    return path3.join(archiveDirectory, `${auditId}.zip`);
  };
  const compress = async (auditId) => {
    const source = directoryPath(auditId);
    const result = await zipDirectory(source, zippedPath(auditId));
    await deleteDirectoryIfExists(source);
    return result.path;
  };
  const cleanup = async (auditId) => {
    await deleteDirectoryIfExists(directoryPath(auditId));
    deleteFileIfExists(zippedPath(auditId));
  };
  const zippedFile = (auditId) => {
    const zipPath = zippedPath(auditId);
    if (fs2.existsSync(zipPath)) {
      return zipPath;
    }
    if (fs2.existsSync(directoryPath(auditId))) {
      return compress(auditId);
    }
    throw new Error("Missing artifacts download.");
  };
  return {
    zippedFile,
    cleanup,
    compress,
    zippedPath,
    directoryPath
  };
};

// src/audit/services/crawlerMap.ts
var crawlerMap = /* @__PURE__ */ new Map();

export {
  secretKey,
  bullmq,
  crawler,
  bullClient,
  auditRepository,
  crawlerQueue,
  publishEvent,
  createQueuePositionService,
  progressEvent,
  classifyError,
  createAuditService,
  createArtifactService,
  crawlerMap
};
