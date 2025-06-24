const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
// const { mapSeverity } = require('./utils'); // We'll create this file next

async function runNpmScan(diagnosticCollection) {
    const packageJsonUri = await findPackageJson();
    if (!packageJsonUri) {
        vscode.window.showInformationMessage('Guardian: No package.json found to scan.');
        return;
    }

    // Ensure packageJsonUri is a vscode.Uri
    /** @type {vscode.Uri} */
    const pkgUri = packageJsonUri;

    diagnosticCollection.delete(pkgUri);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(pkgUri).uri.fsPath;

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Guardian: Running NPM dependency scan...",
        cancellable: false
    }, () => {
        return new Promise((resolve) => {
            exec('npm audit --json', { cwd: workspaceFolder }, (error, stdout) => {
                if (stdout) {
                    const auditReport = JSON.parse(stdout);
                    const vulnerabilities = auditReport.vulnerabilities || {};
                    const documentText = fs.readFileSync(pkgUri.fsPath, 'utf8');
                    const diagnostics = createNpmDiagnostics(vulnerabilities, documentText);
                    diagnosticCollection.set(pkgUri, diagnostics);
                    vscode.window.showInformationMessage(`Guardian: Scan complete. Found ${diagnostics.length} vulnerabilities.`);
                }
                resolve();
            });
        });
    });
}

function createNpmDiagnostics(vulnerabilities, documentText) {
    const diagnostics = [];
    for (const [pkg, vuln] of Object.entries(vulnerabilities)) {
        if (vuln.via && Array.isArray(vuln.via)) {
            vuln.via.forEach(issue => {
                if (typeof issue === 'object' && issue.title) {
                    // Find the line number of the package in package.json
                    const regex = new RegExp(`"${pkg}"\\s*:\\s*"[^"]+"`, 'g');
                    const match = regex.exec(documentText);
                    let line = 0;
                    if (match) {
                        const before = documentText.slice(0, match.index);
                        line = before.split('\n').length - 1;
                    }
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER),
                        `Vulnerability in ${pkg}: ${issue.title} (${issue.severity})`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            });
        }
    }
    return diagnostics;
}
async function findPackageJson() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        return undefined;
    }
    for (const folder of folders) {
        const packageJsonPath = vscode.Uri.joinPath(folder.uri, 'package.json');
        try {
            await vscode.workspace.fs.stat(packageJsonPath);
            return packageJsonPath;
        } catch {
            // File does not exist, continue searching
        }
    }
    return undefined;
}

module.exports = { runNpmScan };