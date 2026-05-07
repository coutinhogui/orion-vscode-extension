export type OrionLogLevel = 'info' | 'warn' | 'error';

export function summarizeText(value: string): string {
  return `${value.length} chars`;
}

export function formatLogEntry(level: OrionLogLevel, message: string, fields: Record<string, unknown> = {}): string {
  const timestamp = new Date().toISOString();
  const details = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(' ');
  return details
    ? `${timestamp} [${level.toUpperCase()}] ${message} ${details}`
    : `${timestamp} [${level.toUpperCase()}] ${message}`;
}
