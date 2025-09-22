/// <reference types="node" />
/// <reference types="node" />
import type { Connection } from '@clickhouse/client-common';
import Http from 'http';
import type Stream from 'stream';
import type { NodeConnectionParams, RequestParams } from './node_base_connection';
import { NodeBaseConnection } from './node_base_connection';
export declare class NodeHttpConnection extends NodeBaseConnection implements Connection<Stream.Readable> {
    constructor(params: NodeConnectionParams);
    protected createClientRequest(params: RequestParams): Http.ClientRequest;
}
