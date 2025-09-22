"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultSet = void 0;
const client_common_1 = require("@clickhouse/client-common");
const buffer_1 = require("buffer");
const stream_1 = __importStar(require("stream"));
const utils_1 = require("./utils");
const NEWLINE = 0x0a;
class ResultSet {
    constructor(_stream, format, query_id) {
        Object.defineProperty(this, "_stream", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stream
        });
        Object.defineProperty(this, "format", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: format
        });
        Object.defineProperty(this, "query_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: query_id
        });
    }
    async text() {
        if (this._stream.readableEnded) {
            throw Error(streamAlreadyConsumedMessage);
        }
        return (await (0, utils_1.getAsText)(this._stream)).toString();
    }
    async json() {
        if (this._stream.readableEnded) {
            throw Error(streamAlreadyConsumedMessage);
        }
        return (0, client_common_1.decode)(await this.text(), this.format);
    }
    stream() {
        // If the underlying stream has already ended by calling `text` or `json`,
        // Stream.pipeline will create a new empty stream
        // but without "readableEnded" flag set to true
        if (this._stream.readableEnded) {
            throw Error(streamAlreadyConsumedMessage);
        }
        (0, client_common_1.validateStreamFormat)(this.format);
        let incompleteChunks = [];
        const toRows = new stream_1.Transform({
            transform(chunk, _encoding, callback) {
                const rows = [];
                let lastIdx = 0;
                // first pass on the current chunk
                // using the incomplete row from the previous chunks
                let idx = chunk.indexOf(NEWLINE);
                if (idx !== -1) {
                    let text;
                    if (incompleteChunks.length > 0) {
                        text = buffer_1.Buffer.concat([...incompleteChunks, chunk.subarray(0, idx)], incompleteChunks.reduce((sz, buf) => sz + buf.length, 0) + idx).toString();
                        incompleteChunks = [];
                    }
                    else {
                        text = chunk.subarray(0, idx).toString();
                    }
                    rows.push({
                        text,
                        json() {
                            return JSON.parse(text);
                        },
                    });
                    lastIdx = idx + 1; // skipping newline character
                    // consequent passes on the current chunk with at least one row parsed
                    // all previous chunks with incomplete rows were already processed
                    do {
                        idx = chunk.indexOf(NEWLINE, lastIdx);
                        if (idx !== -1) {
                            const text = chunk.subarray(lastIdx, idx).toString();
                            rows.push({
                                text,
                                json() {
                                    return JSON.parse(text);
                                },
                            });
                        }
                        else {
                            // to be processed during the first pass for the next chunk
                            incompleteChunks.push(chunk.subarray(lastIdx));
                            this.push(rows);
                        }
                        lastIdx = idx + 1; // skipping newline character
                    } while (idx !== -1);
                }
                else {
                    incompleteChunks.push(chunk); // this chunk does not contain a full row
                }
                callback();
            },
            autoDestroy: true,
            objectMode: true,
        });
        return stream_1.default.pipeline(this._stream, toRows, function pipelineCb(err) {
            if (err) {
                console.error(err);
            }
        });
    }
    close() {
        this._stream.destroy();
    }
}
exports.ResultSet = ResultSet;
const streamAlreadyConsumedMessage = 'Stream has been already consumed';
//# sourceMappingURL=result_set.js.map