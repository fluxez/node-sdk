"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseLogLevel = exports.LogWriter = exports.DefaultLogger = void 0;
class DefaultLogger {
    trace({ module, message, args }) {
        console.trace(formatMessage({ module, message }), args);
    }
    debug({ module, message, args }) {
        console.debug(formatMessage({ module, message }), args);
    }
    info({ module, message, args }) {
        console.info(formatMessage({ module, message }), args);
    }
    warn({ module, message, args }) {
        console.warn(formatMessage({ module, message }), args);
    }
    error({ module, message, args, err }) {
        console.error(formatMessage({ module, message }), args, err);
    }
}
exports.DefaultLogger = DefaultLogger;
class LogWriter {
    constructor(logger, logLevel) {
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: logger
        });
        Object.defineProperty(this, "logLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logLevel = logLevel ?? ClickHouseLogLevel.OFF;
        this.info({
            module: 'Logger',
            message: `Log level is set to ${ClickHouseLogLevel[this.logLevel]}`,
        });
    }
    trace(params) {
        if (this.logLevel <= ClickHouseLogLevel.TRACE) {
            this.logger.trace(params);
        }
    }
    debug(params) {
        if (this.logLevel <= ClickHouseLogLevel.DEBUG) {
            this.logger.debug(params);
        }
    }
    info(params) {
        if (this.logLevel <= ClickHouseLogLevel.INFO) {
            this.logger.info(params);
        }
    }
    warn(params) {
        if (this.logLevel <= ClickHouseLogLevel.WARN) {
            this.logger.warn(params);
        }
    }
    error(params) {
        if (this.logLevel <= ClickHouseLogLevel.ERROR) {
            this.logger.error(params);
        }
    }
}
exports.LogWriter = LogWriter;
var ClickHouseLogLevel;
(function (ClickHouseLogLevel) {
    ClickHouseLogLevel[ClickHouseLogLevel["TRACE"] = 0] = "TRACE";
    ClickHouseLogLevel[ClickHouseLogLevel["DEBUG"] = 1] = "DEBUG";
    ClickHouseLogLevel[ClickHouseLogLevel["INFO"] = 2] = "INFO";
    ClickHouseLogLevel[ClickHouseLogLevel["WARN"] = 3] = "WARN";
    ClickHouseLogLevel[ClickHouseLogLevel["ERROR"] = 4] = "ERROR";
    ClickHouseLogLevel[ClickHouseLogLevel["OFF"] = 127] = "OFF";
})(ClickHouseLogLevel = exports.ClickHouseLogLevel || (exports.ClickHouseLogLevel = {}));
function formatMessage({ module, message, }) {
    return `[@clickhouse/client][${module}] ${message}`;
}
//# sourceMappingURL=logger.js.map