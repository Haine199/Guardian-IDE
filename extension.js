const vscode = require('vscode');
const { GuardianCodeActionProvider } = require('./src/guardianActions');
const { runNpmScan } = require('./src/npmScanner');
const { scanDocumentForSecrets, scanActiveEditorForSecrets } = require('./src/secretScanner');
const { ActionsTreeDataProvider } = require('./src/actionsTreeView');
const { scanDockerfile, scanActiveEditorForDockerfileIssues } = require('./src/dockerfileScanner');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Guardian IDE is now active.');

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('Guardian IDE');
    context.subscriptions.push(diagnosticCollection);

    // --- Register the Tree View for our sidebar ---
    const treeDataProvider = new ActionsTreeDataProvider();
    context.subscriptions.push(vscode.window.createTreeView('guardian-ide-commands', { treeDataProvider }));

    // --- Register Commands (which call imported functions) ---
    context.subscriptions.push(vscode.commands.registerCommand('guardian-ide.runNpmScan', () => {
        runNpmScan(diagnosticCollection);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('guardian-ide.runSecretScan', () => {
        scanActiveEditorForSecrets(diagnosticCollection);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('guardian-ide.runNpmAuditFix', () => {
        const terminal = vscode.window.createTerminal(`Guardian Fix`);
        terminal.sendText('npm audit fix');
        terminal.show();
    }));

    // --- Register Dockerfile scan command ---
    context.subscriptions.push(vscode.commands.registerCommand('guardian-ide.runDockerfileScan', () => {
        scanActiveEditorForDockerfileIssues();
    }));

    // --- Register Python scan command ---
    context.subscriptions.push(vscode.commands.registerCommand('guardian-ide.runPythonScan', () => {
        vscode.workspace.findFiles('**/requirements.txt', '**/node_modules/**', 1).then(files => {
            if (files.length > 0) {
                runPythonScan(files[0], diagnosticCollection);
            } else {
                vscode.window.showInformationMessage('Guardian: No requirements.txt file found in this workspace.');
            }
        });
    }));

    // --- Register Code Action Provider for Quick Fixes ---
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(['json', 'javascript', 'typescript'], 
            new GuardianCodeActionProvider(), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] })
    );

    // --- Automatic scans on save ---
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        const fileName = document.fileName.toLowerCase();
        if (fileName.endsWith('package.json')) {
            runNpmScan(diagnosticCollection);
        } else if (fileName.endsWith('requirements.txt')) {
            runPythonScan(document.uri, diagnosticCollection);
        } else if (document.languageId === 'javascript' || document.languageId === 'typescript') {
            scanDocumentForSecrets(document, diagnosticCollection);
        } else if (fileName.endsWith('dockerfile')) {
            scanDockerfile(document, diagnosticCollection);
        }
    }));

    // --- Initial scan for any already open files when activated ---
    // (Optional: Add logic here if you want to scan already open files on activation)
}

const { runPythonScan } = require('./src/pythonScanner');

function deactivate() {}

module.exports = {
    activate,
    deactivate
};