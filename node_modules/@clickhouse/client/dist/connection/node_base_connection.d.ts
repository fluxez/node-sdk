/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ConnBaseQueryParams, Connection, ConnectionParams, ConnExecResult, ConnInsertParams, ConnInsertResult, ConnPingResult, ConnQueryResult } from '@clickhouse/client-common';
import type Http from 'http';
import Stream from 'stream';
export type NodeConnectionParams = ConnectionParams & {
    tls?: TLSParams;
    keep_alive: {
        enabled: boolean;
        socket_ttl: number;
        retry_on_expired_socket: boolean;
    };
};
export type TLSParams = {
    ca_cert: Buffer;
    type: 'Basic';
} | {
    ca_cert: Buffer;
    cert: Buffer;
    key: Buffer;
    type: 'Mutual';
};
export interface RequestParams {
    method: 'GET' | 'POST';
    url: URL;
    body?: string | Stream.Readable;
    abort_signal?: AbortSignal;
    decompress_response?: boolean;
    compress_request?: boolean;
    parse_summary?: boolean;
}
export declare abstract class NodeBaseConnection implements Connection<Stream.Readable> {
    protected readonly params: NodeConnectionParams;
    protected readonly agent: Http.Agent;
    protected readonly headers: Http.OutgoingHttpHeaders;
    private readonly logger;
    private readonly retry_expired_sockets;
    private readonly known_sockets;
    protected constructor(params: NodeConnectionParams, agent: Http.Agent);
    protected buildDefaultHeaders(username: string, password: string, additional_headers?: Record<string, string>): Http.OutgoingHttpHeaders;
    protected abstract createClientRequest(params: RequestParams): Http.ClientRequest;
    private request;
    private _request;
    ping(): Promise<ConnPingResult>;
    query(params: ConnBaseQueryParams): Promise<ConnQueryResult<Stream.Readable>>;
    exec(params: ConnBaseQueryParams): Promise<ConnExecResult<Stream.Readable>>;
    insert(params: ConnInsertParams<Stream.Readable>): Promise<ConnInsertResult>;
    close(): Promise<void>;
    private logResponse;
    private drainHttpResponse;
    private parseSummary;
}
