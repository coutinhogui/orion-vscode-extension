import * as path from 'node:path';
import * as vscode from 'vscode';
import { GeneratedFile } from './types';

export function getWorkspaceRoot(): vscode.Uri {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error('Abra uma pasta no VS Code antes de executar este comando.');
  }
  return folder.uri;
}

export async function writeGeneratedFiles(files: readonly GeneratedFile[], overwrite: boolean): Promise<string[]> {
  const root = getWorkspaceRoot();
  const written: string[] = [];

  for (const file of files) {
    const target = vscode.Uri.joinPath(root, ...file.relativePath.split('/'));
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.dirname(target.fsPath)));

    if (!overwrite && await exists(target)) {
      continue;
    }

    await vscode.workspace.fs.writeFile(target, Buffer.from(file.content, 'utf8'));
    written.push(file.relativePath);
  }

  return written;
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

export function getOverwriteSetting(): boolean {
  return vscode.workspace.getConfiguration('orion.templates').get<boolean>('overwriteExistingFiles', false);
}

export function getDefaultDataBase(): string {
  return vscode.workspace.getConfiguration('orion.workspace').get<string>('defaultDataBase', 'dev_riscos');
}

export function workspaceDisplayName(): string {
  return vscode.workspace.workspaceFolders?.[0]?.name ?? 'workspace';
}

