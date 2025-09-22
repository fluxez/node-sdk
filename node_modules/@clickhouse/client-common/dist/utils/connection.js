"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuccessfulResponse = exports.withHttpSettings = exports.withCompressionHeaders = void 0;
function withCompressionHeaders({ headers, compress_request, decompress_response, }) {
    return {
        ...headers,
        ...(decompress_response ? { 'Accept-Encoding': 'gzip' } : {}),
        ...(compress_request ? { 'Content-Encoding': 'gzip' } : {}),
    };
}
exports.withCompressionHeaders = withCompressionHeaders;
function withHttpSettings(clickhouse_settings, compression) {
    return {
        ...(compression
            ? {
                enable_http_compression: 1,
            }
            : {}),
        ...clickhouse_settings,
    };
}
exports.withHttpSettings = withHttpSettings;
function isSuccessfulResponse(statusCode) {
    return Boolean(statusCode && 200 <= statusCode && statusCode < 300);
}
exports.isSuccessfulResponse = isSuccessfulResponse;
//# sourceMappingURL=connection.js.map