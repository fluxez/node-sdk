"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeJSON = exports.decode = exports.validateStreamFormat = exports.isSupportedRawFormat = void 0;
const streamableJSONFormats = [
    'JSONEachRow',
    'JSONStringsEachRow',
    'JSONCompactEachRow',
    'JSONCompactStringsEachRow',
    'JSONCompactEachRowWithNames',
    'JSONCompactEachRowWithNamesAndTypes',
    'JSONCompactStringsEachRowWithNames',
    'JSONCompactStringsEachRowWithNamesAndTypes',
];
const singleDocumentJSONFormats = [
    'JSON',
    'JSONStrings',
    'JSONCompact',
    'JSONCompactStrings',
    'JSONColumnsWithMetadata',
    'JSONObjectEachRow',
];
const supportedJSONFormats = [
    ...singleDocumentJSONFormats,
    ...streamableJSONFormats,
];
const supportedRawFormats = [
    'CSV',
    'CSVWithNames',
    'CSVWithNamesAndTypes',
    'TabSeparated',
    'TabSeparatedRaw',
    'TabSeparatedWithNames',
    'TabSeparatedWithNamesAndTypes',
    'CustomSeparated',
    'CustomSeparatedWithNames',
    'CustomSeparatedWithNamesAndTypes',
    'Parquet',
];
// TODO add others formats
const streamableFormat = [
    ...streamableJSONFormats,
    ...supportedRawFormats,
];
function isNotStreamableJSONFamily(format) {
    // @ts-expect-error JSON is not assignable to notStreamableJSONFormats
    return singleDocumentJSONFormats.includes(format);
}
function isStreamableJSONFamily(format) {
    // @ts-expect-error JSON is not assignable to streamableJSONFormats
    return streamableJSONFormats.includes(format);
}
function isSupportedRawFormat(dataFormat) {
    return supportedRawFormats.includes(dataFormat);
}
exports.isSupportedRawFormat = isSupportedRawFormat;
function validateStreamFormat(format) {
    if (!streamableFormat.includes(format)) {
        throw new Error(`${format} format is not streamable. Streamable formats: ${streamableFormat.join(',')}`);
    }
    return true;
}
exports.validateStreamFormat = validateStreamFormat;
/**
 * Decodes a string in a ClickHouse format into a plain JavaScript object or an array of objects.
 * @param text a string in a ClickHouse data format
 * @param format One of the supported formats: https://clickhouse.com/docs/en/interfaces/formats/
 */
function decode(text, format) {
    if (isNotStreamableJSONFamily(format)) {
        return JSON.parse(text);
    }
    if (isStreamableJSONFamily(format)) {
        return text
            .split('\n')
            .filter(Boolean)
            .map((l) => decode(l, 'JSON'));
    }
    if (isSupportedRawFormat(format)) {
        throw new Error(`Cannot decode ${format} to JSON`);
    }
    throw new Error(`The client does not support [${format}] format decoding.`);
}
exports.decode = decode;
/**
 * Encodes a single row of values into a string in a JSON format acceptable by ClickHouse.
 * @param value a single value to encode.
 * @param format One of the supported JSON formats: https://clickhouse.com/docs/en/interfaces/formats/
 * @returns string
 */
function encodeJSON(value, format) {
    if (supportedJSONFormats.includes(format)) {
        return JSON.stringify(value) + '\n';
    }
    throw new Error(`The client does not support JSON encoding in [${format}] format.`);
}
exports.encodeJSON = encodeJSON;
//# sourceMappingURL=formatter.js.map