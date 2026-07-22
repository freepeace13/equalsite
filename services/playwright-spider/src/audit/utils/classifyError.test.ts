import { describe, expect, it } from "vitest";
import { classifyError } from "./classifyError";

describe("classifyError", () => {
    it("classifies DNS resolution failures", () => {
        const result = classifyError(new Error("net::ERR_NAME_NOT_RESOLVED at https://nope.example"));
        expect(result.code).toBe("dns_error");
        expect(result.message).toBe("net::ERR_NAME_NOT_RESOLVED at https://nope.example");
    });

    it("classifies TLS/certificate failures", () => {
        const result = classifyError(new Error("net::ERR_CERT_DATE_INVALID"));
        expect(result.code).toBe("tls_error");
    });

    it("classifies connection failures", () => {
        const result = classifyError(new Error("net::ERR_CONNECTION_REFUSED"));
        expect(result.code).toBe("connection_failed");
    });

    it("classifies navigation timeouts", () => {
        const result = classifyError(new Error("Navigation timeout of 45000 ms exceeded"));
        expect(result.code).toBe("timeout");
    });

    it("classifies HTTP status errors", () => {
        const result = classifyError(new Error("Request failed with status code 404"));
        expect(result.code).toBe("http_error");
    });

    it("falls back to internal_error for anything unrecognized", () => {
        const result = classifyError(new Error("ENOENT: no such file or directory, open 'x.json'"));
        expect(result.code).toBe("internal_error");
    });

    it("accepts a plain string error", () => {
        const result = classifyError("net::ERR_NAME_NOT_RESOLVED");
        expect(result.code).toBe("dns_error");
        expect(result.message).toBe("net::ERR_NAME_NOT_RESOLVED");
    });
});
