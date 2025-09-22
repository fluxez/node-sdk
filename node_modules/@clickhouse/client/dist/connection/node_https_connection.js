"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeHttpsConnection = void 0;
const client_common_1 = require("@clickhouse/client-common");
const https_1 = __importDefault(require("https"));
const node_base_connection_1 = require("./node_base_connection");
class NodeHttpsConnection extends node_base_connection_1.NodeBaseConnection {
    constructor(params) {
        const agent = new https_1.default.Agent({
            keepAlive: params.keep_alive.enabled,
            maxSockets: params.max_open_connections,
            ca: params.tls?.ca_cert,
            key: params.tls?.type === 'Mutual' ? params.tls.key : undefined,
            cert: params.tls?.type === 'Mutual' ? params.tls.cert : undefined,
        });
        super(params, agent);
    }
    buildDefaultHeaders(username, password, additional_headers) {
        if (this.params.tls?.type === 'Mutual') {
            return {
                'X-ClickHouse-User': username,
                'X-ClickHouse-Key': password,
                'X-ClickHouse-SSL-Certificate-Auth': 'on',
            };
        }
        if (this.params.tls?.type === 'Basic') {
            return {
                'X-ClickHouse-User': username,
                'X-ClickHouse-Key': password,
            };
        }
        return super.buildDefaultHeaders(username, password, additional_headers);
    }
    createClientRequest(params) {
        return https_1.default.request(params.url, {
            method: params.method,
            agent: this.agent,
            headers: (0, client_common_1.withCompressionHeaders)({
                headers: this.headers,
                compress_request: params.compress_request,
                decompress_response: params.decompress_response,
            }),
            signal: params.abort_signal,
        });
    }
}
exports.NodeHttpsConnection = NodeHttpsConnection;
//# sourceMappingURL=node_https_connection.js.map