import * as vscode from 'vscode';
import { formatLogEntry, OrionLogLevel } from './logging';

let channel: vscode.OutputChannel | undefined;

export function getOrionOutputChannel(): vscode.OutputChannel {
  channel ??= vscode.window.createOutputChannel('ORION');
  return channel;
}

export function logOrion(level: OrionLogLevel, message: string, fields: Record<string, unknown> = {}): void {
  getOrionOutputChannel().appendLine(formatLogEntry(level, message, fields));
}

export function showOrionLogs(): void {
  getOrionOutputChannel().show(true);
}
