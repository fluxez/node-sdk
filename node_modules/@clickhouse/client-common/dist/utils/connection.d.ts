import type { ClickHouseSettings } from '../settings';
export type HttpHeader = number | string | string[];
export type HttpHeaders = Record<string, HttpHeader | undefined>;
export declare function withCompressionHeaders({ headers, compress_request, decompress_response, }: {
    headers: HttpHeaders;
    compress_request: boolean | undefined;
    decompress_response: boolean | undefined;
}): Record<string, string>;
export declare function withHttpSettings(clickhouse_settings?: ClickHouseSettings, compression?: boolean): ClickHouseSettings;
export declare function isSuccessfulResponse(statusCode?: number): boolean;
