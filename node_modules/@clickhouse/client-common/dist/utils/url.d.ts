import type { ClickHouseSettings } from '../settings';
export declare function transformUrl({ url, pathname, searchParams, }: {
    url: URL;
    pathname?: string;
    searchParams?: URLSearchParams;
}): URL;
type ToSearchParamsOptions = {
    database: string;
    clickhouse_settings?: ClickHouseSettings;
    query_params?: Record<string, unknown>;
    query?: string;
    session_id?: string;
    query_id?: string;
};
export declare function toSearchParams({ database, query, query_params, clickhouse_settings, session_id, query_id, }: ToSearchParamsOptions): URLSearchParams | undefined;
export {};
