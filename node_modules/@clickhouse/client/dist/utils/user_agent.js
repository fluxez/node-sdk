"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = void 0;
const os = __importStar(require("os"));
const version_1 = __importDefault(require("../version"));
/**
 * Generate a user agent string like
 * clickhouse-js/0.0.11 (lv:nodejs/19.0.4; os:linux)
 * or
 * MyApplicationName clickhouse-js/0.0.11 (lv:nodejs/19.0.4; os:linux)
 */
function getUserAgent(application_id) {
    const defaultUserAgent = `clickhouse-js/${version_1.default} (lv:nodejs/${process.version}; os:${os.platform()})`;
    return application_id
        ? `${application_id} ${defaultUserAgent}`
        : defaultUserAgent;
}
exports.getUserAgent = getUserAgent;
//# sourceMappingURL=user_agent.js.map