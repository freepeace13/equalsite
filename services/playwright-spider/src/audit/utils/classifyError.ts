import type { CrawlErrorCode } from "@equalsite/types";

interface ClassifiedError {
    code: CrawlErrorCode;
    message: string;
}

const PATTERNS: Array<{ code: CrawlErrorCode; test: RegExp }> = [
    { code: 'dns_error', test: /ERR_NAME_NOT_RESOLVED|ENOTFOUND|ERR_ADDRESS_UNREACHABLE/i },
    { code: 'tls_error', test: /ERR_CERT_|ERR_SSL_|certificate/i },
    { code: 'connection_failed', test: /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED|ECONNREFUSED|ECONNRESET/i },
    { code: 'timeout', test: /timeout/i },
    { code: 'http_error', test: /status code \d{3}|HTTP\/?\s?\d{3}/i },
];

export function classifyError(error: unknown): ClassifiedError {
    const message = typeof error === 'string'
        ? error
        : error instanceof Error
            ? error.message
            : String(error);

    const match = PATTERNS.find(({ test }) => test.test(message));

    return {
        code: match?.code ?? 'internal_error',
        message,
    };
}
