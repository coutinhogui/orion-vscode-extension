"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeText = summarizeText;
exports.formatLogEntry = formatLogEntry;
function summarizeText(value) {
    return `${value.length} chars`;
}
function formatLogEntry(level, message, fields = {}) {
    const timestamp = new Date().toISOString();
    const details = Object.entries(fields)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(' ');
    return details
        ? `${timestamp} [${level.toUpperCase()}] ${message} ${details}`
        : `${timestamp} [${level.toUpperCase()}] ${message}`;
}
//# sourceMappingURL=logging.js.map