"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBaseConnection = void 0;
const client_common_1 = require("@clickhouse/client-common");
const crypto_1 = __importDefault(require("crypto"));
const stream_1 = __importDefault(require("stream"));
const zlib_1 = __importDefault(require("zlib"));
const utils_1 = require("../utils");
const expiredSocketMessage = 'expired socket';
class NodeBaseConnection {
    constructor(params, agent) {
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: params
        });
        Object.defineProperty(this, "agent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: agent
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "retry_expired_sockets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "known_sockets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new WeakMap()
        });
        this.logger = params.logWriter;
        this.retry_expired_sockets =
            params.keep_alive.enabled && params.keep_alive.retry_on_expired_socket;
        this.headers = this.buildDefaultHeaders(params.username, params.password, params.additional_headers);
    }
    buildDefaultHeaders(username, password, additional_headers) {
        return {
            Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            'User-Agent': (0, utils_1.getUserAgent)(this.params.application_id),
            ...additional_headers,
        };
    }
    async request(params, retryCount = 0) {
        try {
            return await this._request(params);
        }
        catch (e) {
            if (e instanceof Error && e.message === expiredSocketMessage) {
                if (this.retry_expired_sockets && retryCount < 3) {
                    this.logger.trace({
                        module: 'Connection',
                        message: `Keep-Alive socket is expired, retrying with a new one, retries so far: ${retryCount}`,
                    });
                    return await this.request(params, retryCount + 1);
                }
                else {
                    throw new Error(`Socket hang up after ${retryCount} retries`);
                }
            }
            throw e;
        }
    }
    async _request(params) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const request = this.createClientRequest(params);
            function onError(err) {
                removeRequestListeners();
                reject(err);
            }
            const onResponse = async (_response) => {
                this.logResponse(request, params, _response, start);
                const decompressionResult = decompressResponse(_response);
                if (isDecompressionError(decompressionResult)) {
                    return reject(decompressionResult.error);
                }
                if ((0, client_common_1.isSuccessfulResponse)(_response.statusCode)) {
                    return resolve({
                        stream: decompressionResult.response,
                        summary: params.parse_summary
                            ? this.parseSummary(_response)
                            : undefined,
                    });
                }
                else {
                    reject((0, client_common_1.parseError)(await (0, utils_1.getAsText)(decompressionResult.response)));
                }
            };
            function onAbort() {
                // Prefer 'abort' event since it always triggered unlike 'error' and 'close'
                // see the full sequence of events https://nodejs.org/api/http.html#httprequesturl-options-callback
                removeRequestListeners();
                request.once('error', function () {
                    /**
                     * catch "Error: ECONNRESET" error which shouldn't be reported to users.
                     * see the full sequence of events https://nodejs.org/api/http.html#httprequesturl-options-callback
                     * */
                });
                reject(new Error('The user aborted a request.'));
            }
            function onClose() {
                // Adapter uses 'close' event to clean up listeners after the successful response.
                // It's necessary in order to handle 'abort' and 'timeout' events while response is streamed.
                // It's always the last event, according to https://nodejs.org/docs/latest-v14.x/api/http.html#http_http_request_url_options_callback
                removeRequestListeners();
            }
            function pipeStream() {
                // if request.end() was called due to no data to send
                if (request.writableEnded) {
                    return;
                }
                const bodyStream = (0, utils_1.isStream)(params.body)
                    ? params.body
                    : stream_1.default.Readable.from([params.body]);
                const callback = (err) => {
                    if (err) {
                        removeRequestListeners();
                        reject(err);
                    }
                };
                if (params.compress_request) {
                    stream_1.default.pipeline(bodyStream, zlib_1.default.createGzip(), request, callback);
                }
                else {
                    stream_1.default.pipeline(bodyStream, request, callback);
                }
            }
            const onSocket = (socket) => {
                if (this.retry_expired_sockets) {
                    // if socket is reused
                    const socketInfo = this.known_sockets.get(socket);
                    if (socketInfo !== undefined) {
                        this.logger.trace({
                            module: 'Connection',
                            message: `Reused socket ${socketInfo.id}`,
                        });
                        // if a socket was reused at an unfortunate time,
                        // and is likely about to expire
                        const isPossiblyExpired = Date.now() - socketInfo.last_used_time >
                            this.params.keep_alive.socket_ttl;
                        if (isPossiblyExpired) {
                            this.logger.trace({
                                module: 'Connection',
                                message: 'Socket should be expired - terminate it',
                            });
                            this.known_sockets.delete(socket);
                            socket.destroy(); // immediately terminate the connection
                            request.destroy();
                            reject(new Error(expiredSocketMessage));
                        }
                        else {
                            this.logger.trace({
                                module: 'Connection',
                                message: `Socket ${socketInfo.id} is safe to be reused`,
                            });
                            this.known_sockets.set(socket, {
                                id: socketInfo.id,
                                last_used_time: Date.now(),
                            });
                            pipeStream();
                        }
                    }
                    else {
                        const socketId = crypto_1.default.randomUUID();
                        this.logger.trace({
                            module: 'Connection',
                            message: `Using a new socket ${socketId}`,
                        });
                        this.known_sockets.set(socket, {
                            id: socketId,
                            last_used_time: Date.now(),
                        });
                        pipeStream();
                    }
                }
                else {
                    // no need to track the reused sockets;
                    // keep alive is disabled or retry mechanism is not enabled
                    pipeStream();
                }
                // this is for request timeout only.
                // The socket won't be actually destroyed,
                // and it will be returned to the pool.
                // TODO: investigate if can actually remove the idle sockets properly
                socket.setTimeout(this.params.request_timeout, onTimeout);
            };
            function onTimeout() {
                removeRequestListeners();
                request.destroy();
                reject(new Error('Timeout error.'));
            }
            function removeRequestListeners() {
                if (request.socket !== null) {
                    request.socket.setTimeout(0); // reset previously set timeout
                    request.socket.removeListener('timeout', onTimeout);
                }
                request.removeListener('socket', onSocket);
                request.removeListener('response', onResponse);
                request.removeListener('error', onError);
                request.removeListener('close', onClose);
                if (params.abort_signal !== undefined) {
                    request.removeListener('abort', onAbort);
                }
            }
            request.on('socket', onSocket);
            request.on('response', onResponse);
            request.on('error', onError);
            request.on('close', onClose);
            if (params.abort_signal !== undefined) {
                params.abort_signal.addEventListener('abort', onAbort, { once: true });
            }
            if (!params.body)
                return request.end();
        });
    }
    async ping() {
        try {
            const { stream } = await this.request({
                method: 'GET',
                url: (0, client_common_1.transformUrl)({ url: this.params.url, pathname: '/ping' }),
            });
            stream.destroy();
            return { success: true };
        }
        catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error,
                };
            }
            throw error; // should never happen
        }
    }
    async query(params) {
        const query_id = getQueryId(params.query_id);
        const clickhouse_settings = (0, client_common_1.withHttpSettings)(params.clickhouse_settings, this.params.compression.decompress_response);
        const searchParams = (0, client_common_1.toSearchParams)({
            database: this.params.database,
            clickhouse_settings,
            query_params: params.query_params,
            session_id: params.session_id,
            query_id,
        });
        const { stream } = await this.request({
            method: 'POST',
            url: (0, client_common_1.transformUrl)({ url: this.params.url, searchParams }),
            body: params.query,
            abort_signal: params.abort_signal,
            decompress_response: clickhouse_settings.enable_http_compression === 1,
        });
        return {
            stream,
            query_id,
        };
    }
    async exec(params) {
        const query_id = getQueryId(params.query_id);
        const searchParams = (0, client_common_1.toSearchParams)({
            database: this.params.database,
            clickhouse_settings: params.clickhouse_settings,
            query_params: params.query_params,
            session_id: params.session_id,
            query_id,
        });
        const { stream, summary } = await this.request({
            method: 'POST',
            url: (0, client_common_1.transformUrl)({ url: this.params.url, searchParams }),
            body: params.query,
            abort_signal: params.abort_signal,
            parse_summary: true,
        });
        return {
            stream,
            query_id,
            summary,
        };
    }
    async insert(params) {
        const query_id = getQueryId(params.query_id);
        const searchParams = (0, client_common_1.toSearchParams)({
            database: this.params.database,
            clickhouse_settings: params.clickhouse_settings,
            query_params: params.query_params,
            query: params.query,
            session_id: params.session_id,
            query_id,
        });
        const { stream, summary } = await this.request({
            method: 'POST',
            url: (0, client_common_1.transformUrl)({ url: this.params.url, searchParams }),
            body: params.values,
            abort_signal: params.abort_signal,
            compress_request: this.params.compression.compress_request,
            parse_summary: true,
        });
        await this.drainHttpResponse(stream);
        return { query_id, summary };
    }
    async close() {
        if (this.agent !== undefined && this.agent.destroy !== undefined) {
            this.agent.destroy();
        }
    }
    logResponse(request, params, response, startTimestamp) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { authorization, host, ...headers } = request.getHeaders();
        const duration = Date.now() - startTimestamp;
        this.params.logWriter.debug({
            module: 'HTTP Adapter',
            message: 'Got a response from ClickHouse',
            args: {
                request_method: params.method,
                request_path: params.url.pathname,
                request_params: params.url.search,
                request_headers: headers,
                response_status: response.statusCode,
                response_headers: response.headers,
                response_time_ms: duration,
            },
        });
    }
    async drainHttpResponse(stream) {
        return new Promise((resolve, reject) => {
            function dropData() {
                // We don't care about the data
            }
            function onEnd() {
                removeListeners();
                resolve();
            }
            function onError(err) {
                removeListeners();
                reject(err);
            }
            function onClose() {
                removeListeners();
            }
            function removeListeners() {
                stream.removeListener('data', dropData);
                stream.removeListener('end', onEnd);
                stream.removeListener('error', onError);
                stream.removeListener('onClose', onClose);
            }
            stream.on('data', dropData);
            stream.on('end', onEnd);
            stream.on('error', onError);
            stream.on('close', onClose);
        });
    }
    parseSummary(response) {
        const summaryHeader = response.headers['x-clickhouse-summary'];
        if (typeof summaryHeader === 'string') {
            try {
                return JSON.parse(summaryHeader);
            }
            catch (err) {
                this.logger.error({
                    module: 'Connection',
                    message: `Failed to parse X-ClickHouse-Summary header, got: ${summaryHeader}`,
                    err: err,
                });
            }
        }
    }
}
exports.NodeBaseConnection = NodeBaseConnection;
function decompressResponse(response) {
    const encoding = response.headers['content-encoding'];
    if (encoding === 'gzip') {
        return {
            response: stream_1.default.pipeline(response, zlib_1.default.createGunzip(), function pipelineCb(err) {
                if (err) {
                    console.error(err);
                }
            }),
        };
    }
    else if (encoding !== undefined) {
        return {
            error: new Error(`Unexpected encoding: ${encoding}`),
        };
    }
    return { response };
}
function isDecompressionError(result) {
    return result.error !== undefined;
}
function getQueryId(query_id) {
    return query_id || crypto_1.default.randomUUID();
}
//# sourceMappingURL=node_base_connection.js.map