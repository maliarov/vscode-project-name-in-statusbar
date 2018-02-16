'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let onDidChangeWorkspaceFoldersDisposable: vscode.Disposable | undefined;
    let onDidChangeActiveTextEditorDisposable: vscode.Disposable | undefined;

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);

    context.subscriptions.push(statusBarItem);

    vscode.workspace.onDidChangeConfiguration(() => {
        updateSubscribtion();
        updateStatusBarItem();
    });

    updateSubscribtion();
    updateStatusBarItem();

    function updateSubscribtion() {
        if (getMode() === 'none') {
            onDidChangeWorkspaceFoldersDisposable && onDidChangeWorkspaceFoldersDisposable.dispose();
            onDidChangeActiveTextEditorDisposable && onDidChangeActiveTextEditorDisposable.dispose();
            onDidChangeWorkspaceFoldersDisposable = undefined;
            onDidChangeActiveTextEditorDisposable = undefined;
        } else {
            !onDidChangeWorkspaceFoldersDisposable && (onDidChangeWorkspaceFoldersDisposable = vscode.workspace.onDidChangeWorkspaceFolders(() => updateStatusBarItem()));
            !onDidChangeActiveTextEditorDisposable && (onDidChangeActiveTextEditorDisposable = vscode.window.onDidChangeActiveTextEditor(() => updateStatusBarItem()));
        }
    }

    function getMode(): string | undefined {
        return vscode.workspace.getConfiguration('projectNameInStatusBar').get('mode');
    }

    function updateStatusBarItem() {
        let projectName: string | undefined;

        switch (getMode()) {
            case 'none':
                break;
            case 'folder':
                projectName = getProjectNameByFolder();
                break;
        }

        if (projectName) {
            statusBarItem.text = `[${projectName}]`;
            statusBarItem.show();
        } else {
            statusBarItem.text = '';
            statusBarItem.hide();
        }
    }


    function getProjectNameByFolder(): string | undefined {
        if (Array.isArray(vscode.workspace.workspaceFolders)) {
            if (vscode.workspace.workspaceFolders.length === 1) {
                return vscode.workspace.workspaceFolders[0].name;
            } else if (vscode.workspace.workspaceFolders.length > 1) {
                const activeTextEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
                if (activeTextEditor) {
                    const workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.workspaceFolders.find(folder =>
                        activeTextEditor.document.uri.path.startsWith(folder.uri.path)
                    );
                    if (workspaceFolder) {
                        return workspaceFolder.name;
                    }
                }
            }
        }
    }
}



export function deactivate() {
}
