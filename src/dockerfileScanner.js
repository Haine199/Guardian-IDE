const vscode = require('vscode');

// Define our set of best-practice rules for Dockerfiles
const DOCKERFILE_RULES = [
    {
        id: 'DF001',
        name: 'Avoid running as root user',
        description: 'Running containers as a non-root user is a critical security best practice.',
        severity: vscode.DiagnosticSeverity.Error,
        pattern: /^\s*USER\s+root/im
    },
    {
        id: 'DF002',
        name: 'Pin base image version',
        description: 'Use a specific version for the base image instead of a floating tag like "latest".',
        severity: vscode.DiagnosticSeverity.Warning,
        pattern: /^\s*FROM\s+[a-zA-Z0-9-]+\s*$/im // Matches 'FROM image' without a tag
    },
    {
        id: 'DF003',
        name: 'Avoid ADD with remote URLs',
        description: 'Use curl or wget inside a RUN step to fetch remote files for better security and clarity.',
        severity: vscode.DiagnosticSeverity.Information,
        pattern: /^\s*ADD\s+https?:\/\//im
    }
];

/**
 * Scans a Dockerfile document for best-practice violations.
 * @param {vscode.TextDocument} document The Dockerfile to scan.
 * @param {vscode.DiagnosticCollection} diagnosticCollection The collection to add diagnostics to.
 */
/**
 * Scans a Dockerfile document for best-practice violations.
 * @param {import('vscode').TextDocument} document The Dockerfile to scan.
 * @param {import('vscode').DiagnosticCollection} diagnosticCollection The collection to add diagnostics to.
 */
function scanDockerfile(document, diagnosticCollection) {
    const diagnostics = [];
    const text = document.getText();
    const lines = text.split('\n');

    lines.forEach(
        /**
         * @param {string} lineText
         * @param {number} lineNumber
         */
        (lineText, lineNumber) => {
            DOCKERFILE_RULES.forEach(rule => {
                // Check if the rule is ignored before proceeding
                if (typeof configManager !== 'undefined' && configManager.isRuleIgnored && configManager.isRuleIgnored(rule.id)) {
                    return; // Skip this rule
                }

                if (rule.pattern.test(lineText)) {
                    const range = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, lineText.length));
                    // Get severity from config, or use the rule's default
                    const severity = (typeof configManager !== 'undefined' && configManager.getSeverity)
                        ? configManager.getSeverity(rule.id, rule.severity)
                        : rule.severity;
                    const message = `[Dockerfile] ${rule.name} (Rule: ${rule.id})`;

                    const diagnostic = new vscode.Diagnostic(range, message, severity);
                    diagnostic.source = 'Guardian IDE';
                    diagnostic.code = {
                        value: rule.id,
                        target: vscode.Uri.parse(`https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#${rule.id.toLowerCase()}`)
                    };
                    diagnostics.push(diagnostic);
                }
        });
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

const { configManager } = require('./configManager');

/**
 * Scans the currently active editor for Dockerfile issues.
 */
function scanActiveEditorForDockerfileIssues() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    if (document.languageId === 'dockerfile') {
        // Create or get a DiagnosticCollection for Dockerfiles
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('dockerfile');
        scanDockerfile(document, diagnosticCollection);
    }
}

module.exports = {
    scanDockerfile,
    scanActiveEditorForDockerfileIssues
};