export interface LogParams {
    module: string;
    message: string;
    args?: Record<string, unknown>;
}
export type ErrorLogParams = LogParams & {
    err: Error;
};
export interface Logger {
    trace(params: LogParams): void;
    debug(params: LogParams): void;
    info(params: LogParams): void;
    warn(params: LogParams): void;
    error(params: ErrorLogParams): void;
}
export declare class DefaultLogger implements Logger {
    trace({ module, message, args }: LogParams): void;
    debug({ module, message, args }: LogParams): void;
    info({ module, message, args }: LogParams): void;
    warn({ module, message, args }: LogParams): void;
    error({ module, message, args, err }: ErrorLogParams): void;
}
export declare class LogWriter {
    private readonly logger;
    private readonly logLevel;
    constructor(logger: Logger, logLevel?: ClickHouseLogLevel);
    trace(params: LogParams): void;
    debug(params: LogParams): void;
    info(params: LogParams): void;
    warn(params: LogParams): void;
    error(params: ErrorLogParams): void;
}
export declare enum ClickHouseLogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    OFF = 127
}
