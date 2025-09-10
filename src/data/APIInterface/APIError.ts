/**
 * Normalized error data returned via APIError for any failed request.
 */
export interface APIErrorData {
    description: string;  //Err description: i.e. Authorization required
    code: string; //Err code: i.e.  EAuthRequired
    message: string;  //Extended error message
    status: number;  //HTTP status code
    statusText: string;  //HTTP status text
    requestPath: string | undefined;  //The path of the request that generated the error
    details?: {  //Extended error data, like fields that did not validate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        [field: string]: any;
    };
    [field: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * Convert different error shapes (fetch/DOMException/server JSON) into a canonical APIErrorData.
 * @param error Any error thrown or server response body.
 * @param requestPath Optional request path that triggered the error.
 * @param reason Optional abort reason (e.g., "TimeoutError").
 */
export const parseError = (error: any, requestPath?:string, reason?:string): APIErrorData => {
    let ed: APIErrorData = {
        description: "",
        code: reason??"",
        message: "",
        status: 0,
        statusText: "",
        requestPath: requestPath,
    };
    if (error === undefined) {
        ed.code = "UNKNOWNERROR";
        ed.message = "Unknown error";
    } else if (error instanceof DOMException) {
        ed.message = error.message;
        if(error.name!="AbortError") ed.code = error.name;
    } else if (typeof error === "string") {
        ed.message = error;
    } else {
        if(error.description) ed.description = error.description
        if(error.code) ed.code = error.code;
        if(error.message) ed.message = error.message;
        ed.details = error.details;
        if(error.status) ed.status = error.status;
        if(error.statusText) ed.statusText = error.statusText;
        if (error.ok != undefined) {
            ed.code = ed.status.toString();
            ed.message = ed.statusText;
        } else if(ed.message=="Failed to fetch") {
            ed.code = "UNREACHABLE"
        }
    }
    if(ed.message=="" && ed.description=="") ed.message = ed.statusText;
    ed.message = ed.message==""?ed.description:ed.message;
    ed.description = ed.description==""?ed.message:ed.description;
    return ed;
};

/**
 * Error thrown by the APIInterface on any failed request with normalized errorData.
 */
export class APIError extends Error {
    errorData: APIErrorData;
    constructor(errorData: APIErrorData) {
        super(errorData.message);
        this.errorData = errorData;
        this.name = 'APIError';
    }
}
