"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseClient = void 0;
const client_common_1 = require("@clickhouse/client-common");
class ClickHouseClient {
    constructor(config) {
        Object.defineProperty(this, "connectionParams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "connection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "makeResultSet", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "valuesEncoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "closeStream", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.connectionParams = getConnectionParams(config);
        this.sessionId = config.session_id;
        validateConnectionParams(this.connectionParams);
        this.connection = config.impl.make_connection(this.connectionParams);
        this.makeResultSet = config.impl.make_result_set;
        this.valuesEncoder = config.impl.values_encoder;
        this.closeStream = config.impl.close_stream;
    }
    getQueryParams(params) {
        return {
            clickhouse_settings: {
                ...this.connectionParams.clickhouse_settings,
                ...params.clickhouse_settings,
            },
            query_params: params.query_params,
            abort_signal: params.abort_signal,
            query_id: params.query_id,
            session_id: this.sessionId,
        };
    }
    /**
     * Used for most statements that can have a response, such as SELECT.
     * FORMAT clause should be specified separately via {@link QueryParams.format} (default is JSON)
     * Consider using {@link ClickHouseClient.insert} for data insertion,
     * or {@link ClickHouseClient.command} for DDLs.
     */
    async query(params) {
        const format = params.format ?? 'JSON';
        const query = formatQuery(params.query, format);
        const { stream, query_id } = await this.connection.query({
            query,
            ...this.getQueryParams(params),
        });
        return this.makeResultSet(stream, format, query_id);
    }
    /**
     * It should be used for statements that do not have any output,
     * when the format clause is not applicable, or when you are not interested in the response at all.
     * Response stream is destroyed immediately as we do not expect useful information there.
     * Examples of such statements are DDLs or custom inserts.
     * If you are interested in the response data, consider using {@link ClickHouseClient.exec}
     */
    async command(params) {
        const { stream, query_id, summary } = await this.exec(params);
        await this.closeStream(stream);
        return { query_id, summary };
    }
    /**
     * Similar to {@link ClickHouseClient.command}, but for the cases where the output is expected,
     * but format clause is not applicable. The caller of this method is expected to consume the stream,
     * otherwise, the request will eventually be timed out.
     */
    async exec(params) {
        const query = removeTrailingSemi(params.query.trim());
        return await this.connection.exec({
            query,
            ...this.getQueryParams(params),
        });
    }
    /**
     * The primary method for data insertion. It is recommended to avoid arrays in case of large inserts
     * to reduce application memory consumption and consider streaming for most of such use cases.
     * As the insert operation does not provide any output, the response stream is immediately destroyed.
     * In case of a custom insert operation, such as, for example, INSERT FROM SELECT,
     * consider using {@link ClickHouseClient.command}, passing the entire raw query there (including FORMAT clause).
     */
    async insert(params) {
        if (Array.isArray(params.values) && params.values.length === 0) {
            return { executed: false, query_id: '' };
        }
        const format = params.format || 'JSONCompactEachRow';
        this.valuesEncoder.validateInsertValues(params.values, format);
        const query = getInsertQuery(params, format);
        const result = await this.connection.insert({
            query,
            values: this.valuesEncoder.encodeValues(params.values, format),
            ...this.getQueryParams(params),
        });
        return { ...result, executed: true };
    }
    /**
     * Health-check request. It does not throw if an error occurs -
     * the error is returned inside the result object.
     */
    async ping() {
        return await this.connection.ping();
    }
    /**
     * Shuts down the underlying connection.
     * This method should ideally be called only once per application lifecycle,
     * for example, during the graceful shutdown phase.
     */
    async close() {
        return await this.connection.close();
    }
}
exports.ClickHouseClient = ClickHouseClient;
function formatQuery(query, format) {
    query = query.trim();
    query = removeTrailingSemi(query);
    return query + ' \nFORMAT ' + format;
}
function removeTrailingSemi(query) {
    let lastNonSemiIdx = query.length;
    for (let i = lastNonSemiIdx; i > 0; i--) {
        if (query[i - 1] !== ';') {
            lastNonSemiIdx = i;
            break;
        }
    }
    if (lastNonSemiIdx !== query.length) {
        return query.slice(0, lastNonSemiIdx);
    }
    return query;
}
function validateConnectionParams({ url }) {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Only http(s) protocol is supported, but given: [${url.protocol}]`);
    }
}
function createUrl(host) {
    try {
        return new URL(host);
    }
    catch (err) {
        throw new Error('Configuration parameter "host" contains malformed url.');
    }
}
function getConnectionParams(config) {
    return {
        application_id: config.application,
        url: createUrl(config.host ?? 'http://localhost:8123'),
        request_timeout: config.request_timeout ?? 300000,
        max_open_connections: config.max_open_connections ?? Infinity,
        compression: {
            decompress_response: config.compression?.response ?? true,
            compress_request: config.compression?.request ?? false,
        },
        username: config.username ?? 'default',
        password: config.password ?? '',
        database: config.database ?? 'default',
        clickhouse_settings: config.clickhouse_settings ?? {},
        logWriter: new client_common_1.LogWriter(config?.log?.LoggerClass
            ? new config.log.LoggerClass()
            : new client_common_1.DefaultLogger(), config.log?.level),
        additional_headers: config.additional_headers,
    };
}
function isInsertColumnsExcept(obj) {
    return (obj !== undefined &&
        obj !== null &&
        typeof obj === 'object' &&
        // Avoiding ESLint no-prototype-builtins error
        Object.prototype.hasOwnProperty.call(obj, 'except'));
}
function getInsertQuery(params, format) {
    let columnsPart = '';
    if (params.columns !== undefined) {
        if (Array.isArray(params.columns) && params.columns.length > 0) {
            columnsPart = ` (${params.columns.join(', ')})`;
        }
        else if (isInsertColumnsExcept(params.columns) &&
            params.columns.except.length > 0) {
            columnsPart = ` (* EXCEPT (${params.columns.except.join(', ')}))`;
        }
    }
    return `INSERT INTO ${params.table.trim()}${columnsPart} FORMAT ${format}`;
}
//# sourceMappingURL=client.js.map