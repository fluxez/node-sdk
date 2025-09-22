/// <reference types="node" />
import Stream from 'stream';
export declare function isStream(obj: any): obj is Stream.Readable;
export declare function getAsText(stream: Stream.Readable): Promise<string>;
export declare function mapStream(mapper: (input: unknown) => string): Stream.Transform;
