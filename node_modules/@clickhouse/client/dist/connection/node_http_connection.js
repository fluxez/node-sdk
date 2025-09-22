"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeHttpConnection = void 0;
const client_common_1 = require("@clickhouse/client-common");
const http_1 = __importDefault(require("http"));
const node_base_connection_1 = require("./node_base_connection");
class NodeHttpConnection extends node_base_connection_1.NodeBaseConnection {
    constructor(params) {
        const agent = new http_1.default.Agent({
            keepAlive: params.keep_alive.enabled,
            maxSockets: params.max_open_connections,
        });
        super(params, agent);
    }
    createClientRequest(params) {
        return http_1.default.request(params.url, {
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
exports.NodeHttpConnection = NodeHttpConnection;
//# sourceMappingURL=node_http_connection.js.map