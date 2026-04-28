import assert from "node:assert/strict";
import test, {afterEach} from "node:test";
import {createAPIInterface} from "../dist/index.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
});

test("applies per-request headers and overrides instance headers", async () => {
    let capturedOptions;
    globalThis.fetch = async (_url, options) => {
        capturedOptions = options;
        return new Response(JSON.stringify({ok: true}), {
            status: 200,
            headers: {"Content-Type": "application/json"},
        });
    };

    const api = createAPIInterface({
        apiBaseURL: "https://example.com",
        authorizationHeader: "Bearer token",
        headers: {
            "X-Instance": "instance",
            "X-Shared": "instance-value",
        },
    });

    await api.apiGet("/items", undefined, {
        "X-Request": "request",
        "X-Shared": "request-value",
    });

    const headers = new Headers(capturedOptions.headers);
    assert.equal(headers.get("Authorization"), "Bearer token");
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(headers.get("X-Instance"), "instance");
    assert.equal(headers.get("X-Request"), "request");
    assert.equal(headers.get("X-Shared"), "request-value");
});

test("keeps existing behavior when request headers are omitted", async () => {
    let capturedOptions;
    globalThis.fetch = async (_url, options) => {
        capturedOptions = options;
        return new Response(JSON.stringify({saved: true}), {
            status: 200,
            headers: {"Content-Type": "application/json"},
        });
    };

    const api = createAPIInterface({
        apiBaseURL: "https://example.com",
        headers: {"X-Instance": "instance"},
    });

    await api.apiPost("/items", {name: "abc"});

    const headers = new Headers(capturedOptions.headers);
    assert.equal(headers.get("X-Instance"), "instance");
    assert.equal(headers.get("Content-Type"), "application/json");
});