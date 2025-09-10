import {createAPIInterface, IAPIInterface, IAPIRequest} from "./APIInterfaceInstance";
import {APIError} from "./APIError";

export const defInst = createAPIInterface();

export const setAPIBaseURL = (url: string) => defInst.setAPIBaseURL(url);
export const setAuthorizationHeader = (authStr: string | null | undefined) => defInst.setAuthorizationHeader(authStr);
export const enableAPILog = (logState: boolean) => defInst.enableAPILog(logState);
export const setRequestPreProcessor = (processor?:((apiRequest: IAPIRequest) => IAPIRequest)) => defInst.setRequestPreProcessor(processor);
export const setResponsePostProcessor = (processor?:((response: any) => any)) => defInst.setResponsePostProcessor(processor);
export const setErrorResponsePostProcessor = (processor?:((response: APIError) => APIError)) => defInst.setErrorResponsePostProcessor(processor);
export const apiGet = <T = any>(path: string, queryParams?: { [key: string]: string; }) => defInst.apiGet<T>(path, queryParams);
export const apiDelete = <T = any>(path: string, queryParams?: { [key: string]: string; }) => defInst.apiDelete<T>(path, queryParams);
export const apiPost = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => defInst.apiPost<TResp, TBody>(path, data, queryParams);
export const apiPostForm = <TResp = any>(path: string, data?: { [key: string]: string | Blob }[], queryParams?: { [key: string]: string; }) => defInst.apiPostForm<TResp>(path, data, queryParams);
export const apiPut = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => defInst.apiPut<TResp, TBody>(path, data, queryParams);
export const apiPatch = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => defInst.apiPatch<TResp, TBody>(path, data, queryParams);
export const setHeader = (key: string, value: string)=>{defInst.setHeader(key,value)};
export const rmHeader = (key: string)=>{defInst.rmHeader(key)};
export const clearHeaders = ()=>{defInst.clearHeaders()};
export const setAPITimeout = (msecs: number)=>{defInst.setAPITimeout(msecs)};



/**
 * Create a new API interface instance for React components.
 *
 * Note: If you need a single shared instance across your whole app, you can use the default instance helpers exported from this module.
 *
 * @param apiBaseURL Optional base URL that will be prepended to relative request paths.
 * @param authorizationHeader Optional Authorization header value (e.g., "Bearer <token>").
 * @param enableLog Enable console logging of requests/responses for debugging.
 * @param apiTimeout Optional timeout in milliseconds for requests. 0 disables timeout.
 */
export const useAPIInterface = (apiBaseURL?: string, authorizationHeader?: string, enableLog?: boolean, apiTimeout?: number): Omit<IAPIInterface, "whatAmI"> => {
    const inst = createAPIInterface({
        apiBaseURL: apiBaseURL??"",
        authorizationHeader: authorizationHeader,
        enableAPILog: enableLog??false,
        apiTimeout: apiTimeout ?? 0,
    });

    const getAPIBaseURL = () => inst.getAPIBaseURL();
    const setAPIBaseURL = (url: string) => inst.setAPIBaseURL(url);
    const setAuthorizationHeader = (authStr: string | null | undefined) => inst.setAuthorizationHeader(authStr);
    const enableAPILog = (logState: boolean) => inst.enableAPILog(logState);
    const setRequestPreProcessor = (processor:((apiRequest: IAPIRequest) => IAPIRequest) | undefined) => inst.setRequestPreProcessor(processor);
    const setResponsePostProcessor = (processor?:((response: any) => any)) => inst.setResponsePostProcessor(processor);
    const setErrorResponsePostProcessor = (processor?:((response: APIError) => APIError)) => inst.setErrorResponsePostProcessor(processor);
    const apiGet = <T = any>(path: string, queryParams?: { [key: string]: string; }) => inst.apiGet<T>(path, queryParams);
    const apiDelete = <T = any>(path: string, queryParams?: { [key: string]: string; }) => inst.apiDelete<T>(path, queryParams);
    const apiPost = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => inst.apiPost<TResp, TBody>(path, data, queryParams);
    const apiPostForm = <TResp = any>(path: string, data?: { [key: string]: string | Blob }[], queryParams?: { [key: string]: string; }) => inst.apiPostForm<TResp>(path, data, queryParams);
    const apiPut = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => inst.apiPut<TResp, TBody>(path, data, queryParams);
    const apiPatch = <TResp = any, TBody = unknown>(path: string, data?: TBody, queryParams?: { [key: string]: string; }) => inst.apiPatch<TResp, TBody>(path, data, queryParams);
    const setHeader = (key: string, value: string)=>{inst.setHeader(key,value)};
    const rmHeader = (key: string)=>{inst.rmHeader(key)};
    const clearHeaders = ()=>{inst.clearHeaders()};
    const setAPITimeout = (msecs: number)=>{inst.setAPITimeout(msecs)};
    return {
        getAPIBaseURL,
        apiGet,
        apiDelete,
        apiPatch,
        apiPost,
        apiPostForm,
        apiPut,
        setAPIBaseURL,
        setAuthorizationHeader,
        enableAPILog,
        setRequestPreProcessor,
        setResponsePostProcessor,
        setErrorResponsePostProcessor,
        setHeader,
        rmHeader,
        clearHeaders,
        setAPITimeout
    }
}
