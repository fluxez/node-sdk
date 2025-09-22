"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseError = exports.ClickHouseError = void 0;
const errorRe = /(Code|Error): (?<code>\d+).*Exception: (?<message>.+)\((?<type>(?=.+[A-Z]{3})[A-Z0-9_]+?)\)/s;
class ClickHouseError extends Error {
    constructor({ message, code, type }) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.code = code;
        this.type = type;
        // Set the prototype explicitly, see:
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, ClickHouseError.prototype);
    }
}
exports.ClickHouseError = ClickHouseError;
function parseError(input) {
    const inputIsError = input instanceof Error;
    const message = inputIsError ? input.message : input;
    const match = message.match(errorRe);
    const groups = match?.groups;
    if (groups) {
        return new ClickHouseError(groups);
    }
    else {
        return inputIsError ? input : new Error(input);
    }
}
exports.parseError = parseError;
//# sourceMappingURL=parse_error.js.map