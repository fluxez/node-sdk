/// <reference types="node" />
/// <reference types="node" />
import type { Connection } from '@clickhouse/client-common';
import type Http from 'http';
import type Stream from 'stream';
import type { NodeConnectionParams, RequestParams } from './node_base_connection';
import { NodeBaseConnection } from './node_base_connection';
export declare class NodeHttpsConnection extends NodeBaseConnection implements Connection<Stream.Readable> {
    constructor(params: NodeConnectionParams);
    protected buildDefaultHeaders(username: string, password: string, additional_headers?: Record<string, string>): Http.OutgoingHttpHeaders;
    protected createClientRequest(params: RequestParams): Http.ClientRequest;
}
