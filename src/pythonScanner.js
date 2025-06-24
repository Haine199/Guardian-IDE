const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const { mapSeverity } = require('./utils'); // We can reuse this!

/**
 * Scans a requirements.txt file for vulnerabilities using pip-audit.
 * @param {vscode.Uri} requirementsUri The URI of the requirements.txt file.
 * @param {vscode.DiagnosticCollection} diagnosticCollection The collection to add diagnostics to.
 */
async function runPythonScan(requirementsUri, diagnosticCollection) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(requirementsUri).uri.fsPath;
    
    // Command to run pip-audit and get a JSON report
    const command = `pip-audit -r ${requirementsUri.fsPath} --format json`;

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Guardian: Running Python dependency scan...",
        cancellable: false
    }, () => {
        return new Promise((resolve) => {
            exec(command, { cwd: workspaceFolder }, (error, stdout, stderr) => {
                diagnosticCollection.delete(requirementsUri); // Clear old diagnostics

                if (stderr && stderr.includes('command not found')) {
                    vscode.window.showErrorMessage('Guardian: `pip-audit` command not found. Please install it by running "pip install pip-audit".');
                    resolve();
                    return;
                }

                if (stdout) {
                    const auditReport = JSON.parse(stdout);
                    const documentText = fs.readFileSync(requirementsUri.fsPath, 'utf8');
                    const diagnostics = createPythonDiagnostics(auditReport, documentText);
                    if (diagnostics.length > 0) {
                        diagnosticCollection.set(requirementsUri, diagnostics);
                        vscode.window.showWarningMessage(`Guardian: Scan complete. Found ${diagnostics.length} vulnerabilities in Python packages.`);
                    } else {
                        vscode.window.showInformationMessage('Guardian: Python scan complete. No vulnerabilities found.');
                    }
                }
                resolve();
            });
        });
    });
}

/**
 * Creates Diagnostic objects from a pip-audit report.
 * @param {Array<object>} auditReport The JSON report from pip-audit.
 * @param {string} documentText The text content of requirements.txt.
 * @returns {Array<vscode.Diagnostic>}
 */
function createPythonDiagnostics(auditReport, documentText) {
    const diagnostics = [];
    auditReport.forEach(vuln => {
        const dependencyName = vuln.name.toLowerCase();
        const range = findPythonDependencyRange(documentText, dependencyName);
        const severity = mapSeverity(vuln.vulns.length > 0 ? vuln.vulns[0].fix_versions.length > 0 ? 'high' : 'moderate' : 'low'); // Simplified severity logic
        
        const message = `[Python Dep] ${vuln.name} ${vuln.version} - ${vuln.vulns[0].description}`;
        
        const diagnostic = new vscode.Diagnostic(range, message, severity);
        diagnostic.source = 'Guardian IDE';
        diagnostic.code = {
            value: vuln.vulns[0].id,
            target: vscode.Uri.parse(`https://pypi.org/p/pip-audit`) // Link to the tool for now
        };
        diagnostics.push(diagnostic);
    });
    return diagnostics;
}


/**
 * Finds the line and character range of a dependency in a requirements.txt file.
 * @param {string} documentText 
 * @param {string} dependencyName 
 * @returns {vscode.Range}
 */
function findPythonDependencyRange(documentText, dependencyName) {
    const lines = documentText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        // Simple case-insensitive match for the package name at the start of a line
        if (lines[i].trim().toLowerCase().startsWith(dependencyName)) {
            return new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, lines[i].length));
        }
    }
    return new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1));
}


module.exports = {
    runPythonScan
};