"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(enabled = false, customLogger) {
        this.enabled = enabled;
        this.customLogger = customLogger;
    }
    log(level, message, data) {
        if (!this.enabled)
            return;
        if (this.customLogger) {
            this.customLogger(level, message, data);
        }
        else {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            switch (level) {
                case 'debug':
                    console.debug(logMessage, data || '');
                    break;
                case 'info':
                    console.info(logMessage, data || '');
                    break;
                case 'warn':
                    console.warn(logMessage, data || '');
                    break;
                case 'error':
                    console.error(logMessage, data || '');
                    break;
            }
        }
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, data) {
        this.log('error', message, data);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map