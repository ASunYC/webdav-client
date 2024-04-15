import * as Stream from "node:stream";
import { Response } from "node-fetch";
export { Request, Response } from "node-fetch";
export type AuthHeader = string;

export enum AuthType {
    Auto = "auto",
    Digest = "digest",
    None = "none",
    Password = "password",
    Token = "token"
}

export type BufferLike = Buffer | ArrayBuffer;

export interface CreateDirectoryOptions extends WebDAVMethodOptions {
    recursive?: boolean;
}

export interface CreateReadStreamOptions extends WebDAVMethodOptions {
    callback?: (response: Response) => void;
    range?: {
        start: number;
        end?: number;
    };
}

export type CreateWriteStreamCallback = (response: Response) => void;

export interface CreateWriteStreamOptions extends WebDAVMethodOptions {
    overwrite?: boolean;
}

/** <propstat> as per http://www.webdav.org/specs/rfc2518.html#rfc.section.12.9.1.1 */
interface DAVPropStat {
    prop: DAVResultResponseProps;
    status: string;
    responsedescription?: string;
}

/**
 * DAV response can either be (href, propstat, responsedescription?) or (href, status, responsedescription?)
 * @see http://www.webdav.org/specs/rfc2518.html#rfc.section.12.9.1
 */
interface DAVResultBaseResponse {
    href: string;
    responsedescription?: string;
}

export interface DAVResultPropstatResponse extends DAVResultBaseResponse {
    propstat: DAVPropStat;
}

export interface DAVResultStatusResponse extends DAVResultBaseResponse {
    status: string;
}

export type DAVResultResponse = DAVResultBaseResponse &
    Partial<DAVResultPropstatResponse> &
    Partial<DAVResultStatusResponse>;

export interface DAVResultResponseProps {
    displayname: string;
    resourcetype: {
        collection?: boolean;
    };
    getlastmodified?: string;
    getetag?: string;
    getcontentlength?: string;
    getcontenttype?: string;
    "quota-available-bytes"?: any;
    "quota-used-bytes"?: string;

    [additionalProp: string]: unknown;
}

export interface DAVResult {
    multistatus: {
        response: Array<DAVResultResponse>;
    };
}

export interface DAVResultRawMultistatus {
    response: DAVResultResponse | [DAVResultResponse];
}

export interface DAVResultRaw {
    multistatus: "" | DAVResultRawMultistatus | [DAVResultRawMultistatus];
}

export interface DigestContext {
    username: string;
    password: string;
    nc: number;
    algorithm: string;
    hasDigestAuth: boolean;
    cnonce?: string;
    nonce?: string;
    realm?: string;
    qop?: string;
    opaque?: string;
    ha1?: string;
}

export interface DiskQuota {
    used: number;
    available: DiskQuotaAvailable;
}

export type DiskQuotaAvailable = "unknown" | "unlimited" | number;

export enum ErrorCode {
    DataTypeNoLength = "data-type-no-length",
    InvalidAuthType = "invalid-auth-type",
    InvalidOutputFormat = "invalid-output-format",
    LinkUnsupportedAuthType = "link-unsupported-auth",
    InvalidUpdateRange = "invalid-update-range",
    NotSupported = "not-supported"
}

export interface FileStat {
    filename: string;
    basename: string;
    lastmod: string;
    size: number;
    type: "file" | "directory";
    etag: string | null;
    mime?: string;
    props?: DAVResultResponseProps;
}

export interface SearchResult {
    truncated: boolean;
    results: FileStat[];
}

export interface DAVCompliance {
    compliance: string[];
    server: string;
}

export interface GetDirectoryContentsOptions extends WebDAVMethodOptions {
    deep?: boolean;
    details?: boolean;
    glob?: string;
    includeSelf?: boolean;
}

export interface GetFileContentsOptions extends WebDAVMethodOptions {
    details?: boolean;
    format?: "binary" | "text";
    onDownloadProgress?: ProgressEventCallback;
}

export interface GetQuotaOptions extends WebDAVMethodOptions {
    details?: boolean;
    path?: string;
}

export interface MoveFileOptions extends WebDAVMethodOptions {
    /**
     * Set to false to disable overwriting an existing resource during MOVE or COPY.
     * @default true
     */
    overwrite?: boolean;
}

export interface CopyFileOptions extends MoveFileOptions {
    /**
     * Set to true to create a shallow copy only by only copying the resource with its properties but without its children.
     * By default the collection itself with all children is copied (WebDAV Depth header of 'infinity')
     * @default false
     */
    shallow?: boolean;
}

export interface Headers {
    [key: string]: string;
}

export interface LockOptions extends WebDAVMethodOptions {
    refreshToken?: string;
    timeout?: string;
}

export interface LockResponse {
    serverTimeout: string;
    token: string;
}

export interface OAuthToken {
    access_token: string;
    token_type: string;
    refresh_token?: string;
}

export interface ProgressEvent {
    loaded: number;
    total: number;
}

export type ProgressEventCallback = (e: ProgressEvent) => void;

export interface PutFileContentsOptions extends WebDAVMethodOptions {
    contentLength?: boolean | number;
    overwrite?: boolean;
    onUploadProgress?: UploadProgressCallback;
}

export type RequestDataPayload = string | Buffer | ArrayBuffer | Record<string, any>;

interface RequestOptionsBase {
    data?: RequestDataPayload;
    headers?: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    maxRedirects?: number;
    method: string;
    onDownloadProgress?: ProgressEventCallback;
    onUploadProgress?: ProgressEventCallback;
    signal?: AbortSignal;
    transformResponse?: Array<(value: any) => any>;
    url?: string;
    withCredentials?: boolean;
}

export interface RequestOptionsCustom extends RequestOptionsBase {}

export interface RequestOptions extends RequestOptionsBase {
    url: string;
}

export interface RequestOptionsWithState extends RequestOptions {
    _digest?: DigestContext;
}

export type ResponseData = string | Buffer | ArrayBuffer | Object | Array<any>;

export interface ResponseDataDetailed<T> {
    data: T;
    headers: Headers;
    status: number;
    statusText: string;
}

export interface ResponseStatusValidator {
    (status: number): boolean;
}

export interface StatOptions extends WebDAVMethodOptions {
    details?: boolean;
}

export interface SearchOptions extends WebDAVMethodOptions {
    details?: boolean;
}

export type UploadProgress = ProgressEvent;

export type UploadProgressCallback = ProgressEventCallback;

export interface WebDAVClient {
    copyFile: (filename: string, destination: string, options?: CopyFileOptions) => Promise<void>;
    createDirectory: (path: string, options?: CreateDirectoryOptions) => Promise<void>;
    createReadStream: (filename: string, options?: CreateReadStreamOptions) => Stream.Readable;
    createWriteStream: (
        filename: string,
        options?: CreateWriteStreamOptions,
        callback?: CreateWriteStreamCallback
    ) => Stream.Writable;
    customRequest: (path: string, requestOptions: RequestOptionsCustom) => Promise<Response>;
    deleteFile: (filename: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    getDAVCompliance: (path: string) => Promise<DAVCompliance>;
    getDirectoryContents: (
        path: string,
        options?: GetDirectoryContentsOptions
    ) => Promise<Array<FileStat> | ResponseDataDetailed<Array<FileStat>>>;
    getFileContents: (
        filename: string,
        options?: GetFileContentsOptions
    ) => Promise<BufferLike | string | ResponseDataDetailed<BufferLike | string>>;
    getFileDownloadLink: (filename: string) => string;
    getFileUploadLink: (filename: string) => string;
    getHeaders: () => Headers;
    getQuota: (
        options?: GetQuotaOptions
    ) => Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>>;
    lock: (path: string, options?: LockOptions) => Promise<LockResponse>;
    moveFile: (
        filename: string,
        destinationFilename: string,
        options?: MoveFileOptions
    ) => Promise<void>;
    putFileContents: (
        filename: string,
        data: string | BufferLike | Stream.Readable,
        options?: PutFileContentsOptions
    ) => Promise<boolean>;
    partialUpdateFileContents: (
        filePath: string,
        start: number,
        end: number,
        data: string | BufferLike | Stream.Readable,
        options?: WebDAVMethodOptions
    ) => Promise<void>;
    search: (
        path: string,
        options?: SearchOptions
    ) => Promise<SearchResult | ResponseDataDetailed<SearchResult>>;
    setHeaders: (headers: Headers) => void;
    stat: (
        path: string,
        options?: StatOptions
    ) => Promise<FileStat | ResponseDataDetailed<FileStat>>;
    unlock: (path: string, token: string, options?: WebDAVMethodOptions) => Promise<void>;
}

export interface WebDAVClientContext {
    authType: AuthType;
    remoteBasePath?: string;
    contactHref: string;
    digest?: DigestContext;
    ha1?: string;
    headers: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    password?: string;
    remotePath: string;
    remoteURL: string;
    token?: OAuthToken;
    username?: string;
    withCredentials?: boolean;
}

export interface WebDAVClientError extends Error {
    status?: number;
    response?: Response;
}

export interface WebDAVClientOptions {
    authType?: AuthType;
    remoteBasePath?: string;
    contactHref?: string;
    ha1?: string;
    headers?: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    maxBodyLength?: number;
    maxContentLength?: number;
    password?: string;
    token?: OAuthToken;
    username?: string;
    withCredentials?: boolean;
}

export interface WebDAVMethodOptions {
    data?: RequestDataPayload;
    headers?: Headers;
    signal?: AbortSignal;
}
