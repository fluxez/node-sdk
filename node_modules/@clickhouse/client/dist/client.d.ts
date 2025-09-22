/// <reference types="node" />
/// <reference types="node" />
import type { BaseClickHouseClientConfigOptions, Connection } from '@clickhouse/client-common';
import { ClickHouseClient } from '@clickhouse/client-common';
import type Stream from 'stream';
import type { NodeConnectionParams } from './connection';
export type NodeClickHouseClientConfigOptions = BaseClickHouseClientConfigOptions<Stream.Readable> & {
    tls?: BasicTLSOptions | MutualTLSOptions;
    /** HTTP Keep-Alive related settings */
    keep_alive?: {
        /** Enable or disable HTTP Keep-Alive mechanism. Default: true */
        enabled?: boolean;
        /** How long to keep a particular open socket alive
         * on the client side (in milliseconds).
         * Should be less than the server setting
         * (see `keep_alive_timeout` in server's `config.xml`).
         * Currently, has no effect if {@link retry_on_expired_socket}
         * is unset or false. Default value: 2500
         * (based on the default ClickHouse server setting, which is 3000) */
        socket_ttl?: number;
        /** If the client detects a potentially expired socket based on the
         * {@link socket_ttl}, this socket will be immediately destroyed
         * before sending the request, and this request will be retried
         * with a new socket up to 3 times. Default: false (no retries) */
        retry_on_expired_socket?: boolean;
    };
};
interface BasicTLSOptions {
    ca_cert: Buffer;
}
interface MutualTLSOptions {
    ca_cert: Buffer;
    cert: Buffer;
    key: Buffer;
}
export declare function createClient(config?: NodeClickHouseClientConfigOptions): ClickHouseClient<Stream.Readable>;
export declare function createConnection(params: NodeConnectionParams): Connection<Stream.Readable>;
export {};
