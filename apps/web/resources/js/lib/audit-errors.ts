import type { CrawlErrorCode } from '@equalsite/types';

const ERROR_CODE_MESSAGES: Record<CrawlErrorCode, string> = {
    dns_error:
        "We couldn't find that website. Double-check the domain and try again.",
    timeout: 'The page took too long to respond and the scan timed out.',
    connection_failed: "We couldn't connect to the server for this page.",
    tls_error: 'This page has an invalid or expired SSL certificate.',
    http_error: 'The server returned an error when we tried to load this page.',
    internal_error: 'Something went wrong while scanning this page.',
};

const GENERIC_FALLBACK = 'An unexpected error occurred.';

export function friendlyErrorMessage(code?: string | null): string {
    if (code && code in ERROR_CODE_MESSAGES) {
        return ERROR_CODE_MESSAGES[code as CrawlErrorCode];
    }

    return GENERIC_FALLBACK;
}
