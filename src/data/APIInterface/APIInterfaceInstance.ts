import {APIError, parseError} from "./APIError";

export interface APIInstanceCreateOptions {
    apiBaseURL?: string;
    authorizationHeader?: string;
    enableAPILog?: boolean;
    apiTimeout?: number;
    includeCredentials?: boolean;
    headers?: { [key: string]: string };
    requestPreProcessor?: ((apiRequest: IAPIRequest) => IAPIRequest);
    responsePostProcessor?: ((response: any) => any);
    errorResponsePostProcessor?: ((response: APIError) => APIError);
}

export interface IAPIRequest {
    method: APIMETHOD,
    path: string,
    data?: any,
    queryParams?: { [key: string]: string; },
    apiBaseURL?: string,
    authorizationHeader?: string
    includeCredentials?: boolean;
}

/**
 * Factory for creating a new API interface instance.
 *
 * Use this when you want an isolated instance with its own base URL, headers,
 * logging, and timeout configuration. For a shared singleton, use the default
 * helpers exported from useAPIInterface.tsx.
 *
 * @param options Optional initial configuration for the instance.
 * @returns A typed API interface instance.
 */
export const createAPIInterface = (options?: APIInstanceCreateOptions): IAPIInterface => {
    const inst = Object.create(APIInterfaceInstance);
    if (options) {
        inst.setAPIBaseURL(options.apiBaseURL ?? "");
        inst.setAuthorizationHeader(options.authorizationHeader);
        inst.enableAPILog(options.enableAPILog ?? false);
        inst.setAPITimeout(options.apiTimeout ?? 0);
        inst.setIncludeCredentials(options.includeCredentials ?? false);
        inst.setRequestPreProcessor(options.requestPreProcessor);
        inst.setResponsePostProcessor(options.responsePostProcessor);
        inst.setErrorResponsePostProcessor(options.errorResponsePostProcessor);
        if (options.headers) {
            inst.clearHeaders();
            for (const k in options.headers) {
                inst.setHeader(k, options.headers[k]);
            }
        }
    }
    return inst as IAPIInterface;
}

interface IQueryParams {
    [key: string]: string;
}

enum APIMETHOD {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export type IAPIInterface = Omit<typeof APIInterfaceInstance, "includeCredentials" | "baseURL" | "authHeader" | "logEnabled" | "headers" | "requestPreProcessor" | "responsePostProcessor" | "errorResponsePostProcessor" | "timeoutMs" | "apiRequest" | "logRequest" | "logResponse">

const APIInterfaceInstance = {
    baseURL: "",
    authHeader: "",
    logEnabled: false,
    includeCredentials: false,
    headers: <{ [key: string]: string }>{},
    requestPreProcessor: <((apiRequest: IAPIRequest) => IAPIRequest) | undefined>undefined,
    responsePostProcessor: <((response: any) => any) | undefined>undefined,
    errorResponsePostProcessor: <((response: APIError) => APIError) | undefined>undefined,
    timeoutMs: 0,
    setAuthorizationHeader(authStr: string | undefined | null) {
        this.authHeader = authStr ?? "";
    },
    setIncludeCredentials(state: boolean) {
        this.includeCredentials = state;
    },
    getAPIBaseURL() {
        return this.baseURL;
    },
    setAPIBaseURL(url: string) {
        this.baseURL = url;
    },
    setRequestPreProcessor(processor: ((apiRequest: IAPIRequest) => IAPIRequest) | undefined) {
        this.requestPreProcessor = processor;
    },
    setResponsePostProcessor(processor: ((response: any) => any) | undefined) {
        this.responsePostProcessor = processor;
    },
    setErrorResponsePostProcessor(processor: ((response: APIError) => APIError) | undefined) {
        this.errorResponsePostProcessor = processor;
    },
    enableAPILog(logState: boolean) {
        this.logEnabled = logState;
    },
    apiGet<T = any>(path: string, queryParams?: IQueryParams): Promise<T> {
        return this.apiRequest<T>({method: APIMETHOD.GET, path: path, queryParams: queryParams});
    },
    apiDelete<T = any>(path: string, queryParams?: { [key: string]: string; }): Promise<T> {
        return this.apiRequest<T>({method: APIMETHOD.DELETE, path: path, queryParams: queryParams});
    },
    apiPost<TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }): Promise<TResp> {
        return this.apiRequest<TResp, TBody>({method: APIMETHOD.POST, path: path, data: data, queryParams: queryParams});
    },
    apiPostForm<TResp = any>(path: string, data?: { [key: string]: string | Blob }[], queryParams?: { [key: string]: string; }): Promise<TResp> {
        const formData = new FormData();
        if (data) {
            for (const d of data) {
                for (const k in d) {
                    formData.append(k, d[k]);
                }
            }
        }
        return this.apiRequest<TResp, FormData>({method: APIMETHOD.POST, path: path, data: formData, queryParams: queryParams});
    },
    apiPut<TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }): Promise<TResp> {
        return this.apiRequest<TResp, TBody>({method: APIMETHOD.PUT, path: path, data: data, queryParams: queryParams});
    },
    apiPatch<TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }): Promise<TResp> {
        return this.apiRequest<TResp, TBody>({method: APIMETHOD.PATCH, path: path, data: data, queryParams: queryParams});
    },
    setHeader(key: string, value: string): void {
        this.headers[key] = value;
    },
    rmHeader(key: string): void {
        delete this.headers[key];
    },
    clearHeaders() {
        this.headers = {};
    },
    setAPITimeout(msecs: number) {
        this.timeoutMs = msecs;
    },
    logRequest(request: IAPIRequest) {
        if (!this.logEnabled) return;
        console.log("[APIInterface]",
            "[Request]",
            request.method.toUpperCase(),
            formatUrl(request.apiBaseURL ?? "", request.path, request.queryParams),
            request.authorizationHeader,
            request.data ? (request.data instanceof FormData ? "FormData" : request.data) : null);
    },
    logResponse(response: Response | TypeError | DOMException, reason?: string) {
        if (!this.logEnabled) return;
        if (response instanceof TypeError) {
            console.log("[APIInterface]", "[" + response.name + "]", response.message, response.stack);
        } else if (response instanceof DOMException) {
            console.log("[APIInterface]", "[DOMException]", response.name, response.message, reason);
        } else {
            const respcln = response.clone();
            (async () => {
                const body = await respcln.text();
                try {
                    const jresp = JSON.parse(body);
                    console.log("[APIInterface]", "[Response]", respcln.status, respcln.statusText, jresp);
                } catch (e) {
                    console.log("[APIInterface]", "[Response]", respcln.status, respcln.statusText, body);
                }
            })();
        }
    },
    apiRequest: async function <TResp = any, TBody = unknown>(reqData: IAPIRequest & { data?: TBody }): Promise<TResp> {
        const self = this;
        reqData.authorizationHeader = self.authHeader;
        reqData.apiBaseURL = self.baseURL;
        if (this.requestPreProcessor) reqData = this.requestPreProcessor(reqData);
        const {method, path, data, queryParams, apiBaseURL, authorizationHeader} = reqData;
        this.logRequest(reqData);

        const myHeaders = new Headers();
        if (!data || !(data instanceof FormData)) {
            myHeaders.set("Content-Type", "application/json");
        }
        if (authorizationHeader) myHeaders.set("Authorization", authorizationHeader);
        Object.entries(self.headers).forEach(([k, v]) => myHeaders.set(k, v));
        let body: string | undefined | FormData = undefined;
        if (method != APIMETHOD.GET && method != APIMETHOD.DELETE && data) {
            if (data instanceof FormData) {
                body = data;
            } else {
                body = JSON.stringify(data as unknown as Record<string, unknown>);
            }
        }

        const fetchOptions: RequestInit = {
            method: method,
            cache: "no-cache",
            headers: myHeaders,
            body: body,
            mode: "cors",
        };
        if (self.includeCredentials) fetchOptions.credentials = "include";
        let timeoutId: NodeJS.Timeout | undefined = undefined;
        const controller = new AbortController();
        if (self.timeoutMs > 0) {
            timeoutId = setTimeout(() => controller.abort("TimeoutError"), self.timeoutMs);
            fetchOptions.signal = controller.signal;
        }
        const response = await fetch(formatUrl(apiBaseURL ?? "", path, queryParams), fetchOptions)
            .catch(errorData => {
                this.logResponse(errorData, controller.signal.aborted ? controller.signal.reason : undefined);
                throw new APIError(parseError(errorData, path, controller.signal.aborted ? controller.signal.reason : undefined));
            })
            .finally(() => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            });
        self.logResponse(response);
        if (response.ok) {
            if (response.status === 204 || response.status === 205) {
                // No content
                return undefined as unknown as TResp;
            }
            const jresp = await response.json().catch(err => {
                throw new APIError(parseError(err, path));
            });
            if (this.responsePostProcessor) {
                return this.responsePostProcessor(jresp) as TResp;
            }
            return jresp as TResp;
        } else {
            const errorObj = await response.json().catch(() => {
                const apie = new APIError(parseError(response, path));
                if (this.errorResponsePostProcessor) {
                    throw this.errorResponsePostProcessor(apie);
                }
                throw apie
            });
            if (!errorObj.status) errorObj.status = response.status;
            if (!errorObj.statusText) errorObj.statusText = response.statusText;
            const apie = new APIError(parseError(errorObj, path));
            if (this.errorResponsePostProcessor) {
                throw this.errorResponsePostProcessor(apie);
            }
            throw apie
        }
    }
}

const formatUrl = (apiBaseUrl: string, path: string, queryParams: { [key: string]: string; } | undefined): string => {
    if (!apiBaseUrl.endsWith("/")) apiBaseUrl += "/";
    if (!path) path = "";
    if (path.startsWith("/")) path = path.substring(1);
    const u = new URL(apiBaseUrl + path);
    if (queryParams) {
        for (const p in queryParams) {
            u.searchParams.append(p, queryParams[p]);
        }
    }
    return u.toString();
}

