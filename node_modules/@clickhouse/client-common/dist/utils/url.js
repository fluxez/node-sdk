"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSearchParams = exports.transformUrl = void 0;
const data_formatter_1 = require("../data_formatter");
function transformUrl({ url, pathname, searchParams, }) {
    const newUrl = new URL(url);
    if (pathname) {
        // See https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
        // > value for such "special scheme" URLs can never be the empty string,
        // > but will instead always have at least one / character.
        if (newUrl.pathname === '/') {
            newUrl.pathname = pathname;
        }
        else {
            newUrl.pathname += pathname;
        }
    }
    if (searchParams) {
        newUrl.search = searchParams?.toString();
    }
    return newUrl;
}
exports.transformUrl = transformUrl;
// TODO validate max length of the resulting query
// https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string
function toSearchParams({ database, query, query_params, clickhouse_settings, session_id, query_id, }) {
    if (clickhouse_settings === undefined &&
        query_params === undefined &&
        query === undefined &&
        database === 'default') {
        return;
    }
    const params = new URLSearchParams();
    if (query_params !== undefined) {
        for (const [key, value] of Object.entries(query_params)) {
            params.set(`param_${key}`, (0, data_formatter_1.formatQueryParams)(value));
        }
    }
    if (clickhouse_settings !== undefined) {
        for (const [key, value] of Object.entries(clickhouse_settings)) {
            if (value !== undefined) {
                params.set(key, (0, data_formatter_1.formatQuerySettings)(value));
            }
        }
    }
    if (database !== 'default') {
        params.set('database', database);
    }
    if (query) {
        params.set('query', query);
    }
    if (session_id) {
        params.set('session_id', session_id);
    }
    if (query_id) {
        params.set('query_id', query_id);
    }
    return params;
}
exports.toSearchParams = toSearchParams;
//# sourceMappingURL=url.js.map