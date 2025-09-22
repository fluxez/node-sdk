"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnection = exports.createClient = void 0;
const client_common_1 = require("@clickhouse/client-common");
const connection_1 = require("./connection");
const result_set_1 = require("./result_set");
const utils_1 = require("./utils");
function createClient(config) {
    let tls = undefined;
    if (config?.tls) {
        if ('cert' in config.tls && 'key' in config.tls) {
            tls = {
                type: 'Mutual',
                ...config.tls,
            };
        }
        else {
            tls = {
                type: 'Basic',
                ...config.tls,
            };
        }
    }
    const keep_alive = {
        enabled: config?.keep_alive?.enabled ?? true,
        socket_ttl: config?.keep_alive?.socket_ttl ?? 2500,
        retry_on_expired_socket: config?.keep_alive?.retry_on_expired_socket ?? false,
    };
    return new client_common_1.ClickHouseClient({
        impl: {
            make_connection: (params) => {
                switch (params.url.protocol) {
                    case 'http:':
                        return new connection_1.NodeHttpConnection({ ...params, keep_alive });
                    case 'https:':
                        return new connection_1.NodeHttpsConnection({ ...params, tls, keep_alive });
                    default:
                        throw new Error('Only HTTP(s) adapters are supported');
                }
            },
            make_result_set: (stream, format, session_id) => new result_set_1.ResultSet(stream, format, session_id),
            values_encoder: new utils_1.NodeValuesEncoder(),
            close_stream: async (stream) => {
                stream.destroy();
            },
        },
        ...(config || {}),
    });
}
exports.createClient = createClient;
function createConnection(params) {
    // TODO throw ClickHouseClient error
    switch (params.url.protocol) {
        case 'http:':
            return new connection_1.NodeHttpConnection(params);
        case 'https:':
            return new connection_1.NodeHttpsConnection(params);
        default:
            throw new Error('Only HTTP(s) adapters are supported');
    }
}
exports.createConnection = createConnection;
//# sourceMappingURL=client.js.map