declare const supportedJSONFormats: readonly ["JSON", "JSONStrings", "JSONCompact", "JSONCompactStrings", "JSONColumnsWithMetadata", "JSONObjectEachRow", "JSONEachRow", "JSONStringsEachRow", "JSONCompactEachRow", "JSONCompactStringsEachRow", "JSONCompactEachRowWithNames", "JSONCompactEachRowWithNamesAndTypes", "JSONCompactStringsEachRowWithNames", "JSONCompactStringsEachRowWithNamesAndTypes"];
declare const supportedRawFormats: readonly ["CSV", "CSVWithNames", "CSVWithNamesAndTypes", "TabSeparated", "TabSeparatedRaw", "TabSeparatedWithNames", "TabSeparatedWithNamesAndTypes", "CustomSeparated", "CustomSeparatedWithNames", "CustomSeparatedWithNamesAndTypes", "Parquet"];
export type JSONDataFormat = (typeof supportedJSONFormats)[number];
export type RawDataFormat = (typeof supportedRawFormats)[number];
export type DataFormat = JSONDataFormat | RawDataFormat;
declare const streamableFormat: readonly ["JSONEachRow", "JSONStringsEachRow", "JSONCompactEachRow", "JSONCompactStringsEachRow", "JSONCompactEachRowWithNames", "JSONCompactEachRowWithNamesAndTypes", "JSONCompactStringsEachRowWithNames", "JSONCompactStringsEachRowWithNamesAndTypes", "CSV", "CSVWithNames", "CSVWithNamesAndTypes", "TabSeparated", "TabSeparatedRaw", "TabSeparatedWithNames", "TabSeparatedWithNamesAndTypes", "CustomSeparated", "CustomSeparatedWithNames", "CustomSeparatedWithNamesAndTypes", "Parquet"];
type StreamableDataFormat = (typeof streamableFormat)[number];
export declare function isSupportedRawFormat(dataFormat: DataFormat): boolean;
export declare function validateStreamFormat(format: any): format is StreamableDataFormat;
/**
 * Decodes a string in a ClickHouse format into a plain JavaScript object or an array of objects.
 * @param text a string in a ClickHouse data format
 * @param format One of the supported formats: https://clickhouse.com/docs/en/interfaces/formats/
 */
export declare function decode(text: string, format: DataFormat): any;
/**
 * Encodes a single row of values into a string in a JSON format acceptable by ClickHouse.
 * @param value a single value to encode.
 * @param format One of the supported JSON formats: https://clickhouse.com/docs/en/interfaces/formats/
 * @returns string
 */
export declare function encodeJSON(value: any, format: DataFormat): string;
export {};
