interface ParsedClickHouseError {
    message: string;
    code: string;
    type?: string;
}
export declare class ClickHouseError extends Error {
    readonly code: string;
    readonly type: string | undefined;
    constructor({ message, code, type }: ParsedClickHouseError);
}
export declare function parseError(input: string | Error): ClickHouseError | Error;
export {};
