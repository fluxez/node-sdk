"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStream = exports.getAsText = exports.isStream = void 0;
const stream_1 = __importDefault(require("stream"));
function isStream(obj) {
    return obj !== null && typeof obj.pipe === 'function';
}
exports.isStream = isStream;
async function getAsText(stream) {
    let result = '';
    const textDecoder = new TextDecoder();
    for await (const chunk of stream) {
        result += textDecoder.decode(chunk, { stream: true });
    }
    // flush
    result += textDecoder.decode();
    return result;
}
exports.getAsText = getAsText;
function mapStream(mapper) {
    return new stream_1.default.Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            callback(null, mapper(chunk));
        },
    });
}
exports.mapStream = mapStream;
//# sourceMappingURL=stream.js.map