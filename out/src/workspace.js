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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceRoot = getWorkspaceRoot;
exports.writeGeneratedFiles = writeGeneratedFiles;
exports.getOverwriteSetting = getOverwriteSetting;
exports.getDefaultDataBase = getDefaultDataBase;
exports.workspaceDisplayName = workspaceDisplayName;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
function getWorkspaceRoot() {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
        throw new Error('Abra uma pasta no VS Code antes de executar este comando.');
    }
    return folder.uri;
}
async function writeGeneratedFiles(files, overwrite) {
    const root = getWorkspaceRoot();
    const written = [];
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
async function exists(uri) {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    }
    catch {
        return false;
    }
}
function getOverwriteSetting() {
    return vscode.workspace.getConfiguration('orion.templates').get('overwriteExistingFiles', false);
}
function getDefaultDataBase() {
    return vscode.workspace.getConfiguration('orion.workspace').get('defaultDataBase', 'dev_riscos');
}
function workspaceDisplayName() {
    return vscode.workspace.workspaceFolders?.[0]?.name ?? 'workspace';
}
//# sourceMappingURL=workspace.js.map