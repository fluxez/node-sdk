/// <reference types="node" />
import type { BaseResultSet, DataFormat } from '@clickhouse/client-common';
import Stream from 'stream';
export declare class ResultSet implements BaseResultSet<Stream.Readable> {
    private _stream;
    private readonly format;
    readonly query_id: string;
    constructor(_stream: Stream.Readable, format: DataFormat, query_id: string);
    text(): Promise<string>;
    json<T>(): Promise<T>;
    stream(): Stream.Readable;
    close(): void;
}
