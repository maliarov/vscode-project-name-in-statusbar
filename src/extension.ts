'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let onDidChangeWorkspaceFoldersDisposable: vscode.Disposable | undefined;
    let onDidChangeActiveTextEditorDisposable: vscode.Disposable | undefined;

    const statusBarItem = vscode.window.createStatusBarItem(getAlign(), alignPriority());

    context.subscriptions.push(statusBarItem);

    vscode.workspace.onDidChangeConfiguration(() => {
        updateSubscribtion();
        updateStatusBarItem();
    });

    updateSubscribtion();
    updateStatusBarItem();


    function updateSubscribtion() {
        if (getSource() === 'none') {
            onDidChangeWorkspaceFoldersDisposable && onDidChangeWorkspaceFoldersDisposable.dispose();
            onDidChangeActiveTextEditorDisposable && onDidChangeActiveTextEditorDisposable.dispose();
            onDidChangeWorkspaceFoldersDisposable = undefined;
            onDidChangeActiveTextEditorDisposable = undefined;
        } else {
            !onDidChangeWorkspaceFoldersDisposable &&
                (onDidChangeWorkspaceFoldersDisposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
                    updateSubscribtion();
                    updateStatusBarItem();
                }));

            Array.isArray(vscode.workspace.workspaceFolders) && (vscode.workspace.workspaceFolders.length > 1)
                ? !onDidChangeActiveTextEditorDisposable && (onDidChangeActiveTextEditorDisposable =
                    vscode.window.onDidChangeActiveTextEditor(() => updateStatusBarItem()))
                : onDidChangeActiveTextEditorDisposable && onDidChangeActiveTextEditorDisposable.dispose();;
        }
    }

    function getSource(): string {
        return <string>vscode.workspace.getConfiguration('projectNameInStatusBar').get('source');
    }

    function getTextStyle(): string {
        return <string>vscode.workspace.getConfiguration('projectNameInStatusBar').get('textStyle');
    }

    function getAlign(): vscode.StatusBarAlignment {
        const align: string = <string>vscode.workspace.getConfiguration('projectNameInStatusBar').get('align');
        switch (align) {
            case 'left':
                return vscode.StatusBarAlignment.Left;
            case 'right':
                return vscode.StatusBarAlignment.Right;
            default:
                return vscode.StatusBarAlignment.Right;
        }
    }

    function alignPriority(): number {
        return <number>vscode.workspace.getConfiguration('projectNameInStatusBar').get('alignPriority');
    }

    function getTemplate(): string {
        return <string>vscode.workspace.getConfiguration('projectNameInStatusBar').get('template');
    }

    function updateStatusBarItem() {
        let projectName: string | undefined;

        switch (getSource()) {
            case 'none':
                break;
            case 'folderName':
                projectName = getProjectNameByFolder();
                break;
        }

        if (projectName) {
            switch (getTextStyle()) {
                case 'uppercase':
                    projectName = projectName.toUpperCase();
                    break;
                case 'lowercase':
                    projectName = projectName.toLowerCase();
                    break;
            }

            statusBarItem.text = getTemplate().replace('${project-name}', projectName);
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
                    const workspaceFolder: vscode.WorkspaceFolder | undefined =
                        vscode.workspace.workspaceFolders.find(folder =>
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
