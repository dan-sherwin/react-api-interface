<h1 align="center">@dsherwin/react-api-interface 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.10.6-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> A tiny, typed API interface for React apps and plain TS/JS, with consistent errors, timeouts, and hooks or singleton usage.

## Table of Contents
- Install
- Description
- Quick Start
- Usage
  - Global singleton helpers
  - React hook factory
- API Reference
  - Configuration
  - Requests
  - Error handling
  - Processors (request/response)
  - Logging
- Examples
- Author

## Install

```sh
npm install @dsherwin/react-api-interface
```

## Description
This library simplifies calling REST APIs with ergonomic methods (GET/POST/PUT/PATCH/DELETE). Success responses always return parsed JSON. All failures throw a typed APIError with normalized errorData — no more "unknown" error shapes.

- Built-in base URL management, headers, and Authorization.
- Optional request timeout and abort handling.
- Optional debug logging of requests/responses.
- Extensible request/response processors.
- Form-data POST helper.

## Quick Start

```tsx
import {
  useAPIInterface,
  setAPIBaseURL,
  setAuthorizationHeader,
  apiGet
} from "@dsherwin/react-api-interface";
import { useEffect } from "react";

const App = () => {
  // Use shared singleton helpers in global app setup
  useEffect(() => {
    setAPIBaseURL("http://localhost:3500");
    setAuthorizationHeader("Bearer " + token);
  }, []);

  const handleClick = async () => {
    try {
      const data = await apiGet("/mystuff");
      console.log("DATA", data);
    } catch (e) {
      console.log("ERROR", e);
    }
  };

  return <button onClick={handleClick}>Click me!</button>;
};
```

## Usage
### 1) Global singleton helpers
For simple apps, configure once and call from anywhere:

```ts
import {
  setAPIBaseURL,
  setAuthorizationHeader,
  setAPITimeout,
  enableAPILog,
  apiGet, apiPost, apiPut, apiPatch, apiDelete, apiPostForm
} from "@dsherwin/react-api-interface";

setAPIBaseURL("https://api.example.com");
setAuthorizationHeader("Bearer <token>");
setAPITimeout(8000); // 8s
enableAPILog(true);

const data = await apiGet("/users", { role: "admin" });
```

### 2) React hook factory (isolated instances)
If you need different configs per component or scope, create an instance:

```ts
import { useAPIInterface } from "@dsherwin/react-api-interface";

const { apiGet, setAPITimeout } = useAPIInterface(
  "https://api.example.com",
  "Bearer <token>",
  true,   // enable logging
  5000    // timeout (ms)
);

setAPITimeout(10000); // override later if needed
```

## API Reference
### Configuration (singleton helpers)
- setAPIBaseURL(url: string): void
- setAuthorizationHeader(authStr: string | null | undefined): void
- enableAPILog(log: boolean): void
- setAPITimeout(ms: number): void
- setHeader(key: string, value: string): void
- rmHeader(key: string): void
- clearHeaders(): void
- setRequestPreProcessor((req) => req): void
- setResponsePostProcessor((res) => res): void
- setErrorResponsePostProcessor((err: APIError) => APIError): void

### Requests
- apiGet(path: string, queryParams?): Promise<any>
- apiDelete(path: string, queryParams?): Promise<any>
- apiPost(path: string, data?: any, queryParams?): Promise<any>
- apiPut(path: string, data?: any, queryParams?): Promise<any>
- apiPatch(path: string, data?: any, queryParams?): Promise<any>
- apiPostForm(path: string, data?: Array<Record<string, string | Blob>>, queryParams?): Promise<any>

Notes:
- path can be absolute or relative to the configured base URL.
- For JSON requests, Content-Type is set automatically.
- apiPostForm sends FormData and will not set JSON Content-Type.

### Error handling
All failures throw APIError. Access normalized error data via error.errorData:

```ts
import { APIError } from "@dsherwin/react-api-interface";

try {
  await apiGet("/restricted");
} catch (e) {
  if (e instanceof APIError) {
    const { code, status, message, description, details, requestPath } = e.errorData;
    // Handle
  }
}
```

### Processors
- setRequestPreProcessor((req) => req): mutate/inspect a request before sending.
- setResponsePostProcessor((res) => res): transform successful JSON responses.
- setErrorResponsePostProcessor((err: APIError) => APIError): map/augment errors before they bubble up.

### Logging
- enableAPILog(true) to log requests and responses to console for debugging.

## Examples
- Add a global header
```ts
setHeader("X-Trace-Id", crypto.randomUUID());
```

- Retry wrapper (simple)
```ts
async function apiGetWithRetry(path: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try { return await apiGet(path); } catch (e) { if (i === retries) throw e; }
  }
}
```

- Form upload
```ts
await apiPostForm("/upload", [{ file: myBlob, name: "avatar.png" }]);
```

## Author
👤 **dsherwin**


