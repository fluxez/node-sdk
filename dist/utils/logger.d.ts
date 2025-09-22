export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare class Logger {
    private enabled;
    private customLogger?;
    constructor(enabled?: boolean, customLogger?: (level: string, message: string, data?: any) => void);
    private log;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
}
//# sourceMappingURL=logger.d.ts.map