const vscode = require('vscode');

const SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'Stripe API Key', pattern: /sk_live_[0-9a-zA-Z]{24}/g },
    { name: 'Generic API Key', pattern: /(api|secret|token)_key\s*[:=]\s*['"][a-zA-Z0-9_.-]{16,}['"]/ig },
    { name: 'Password variable', pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/ig }
];

function scanDocumentForSecrets(document, diagnosticCollection) {
    const diagnostics = [];
    const text = document.getText();
    
    SECRET_PATTERNS.forEach(patternInfo => {
        const regex = patternInfo.pattern;
        let match;
        regex.lastIndex = 0; 
        
        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            const message = `[Potential Secret] Found a pattern matching: ${patternInfo.name}.`;
            const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
            diagnostic.source = 'Guardian IDE';
            diagnostic.code = 'hardcoded-secret';
            diagnostics.push(diagnostic);
        }
    });
    
    diagnosticCollection.set(document.uri, diagnostics);
}

function scanActiveEditorForSecrets(diagnosticCollection) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        scanDocumentForSecrets(editor.document, diagnosticCollection);
        vscode.window.showInformationMessage(`Guardian: Finished scanning ${editor.document.fileName.split(/[\\/]/).pop()} for secrets.`);
    } else {
        vscode.window.showInformationMessage('Guardian: No active editor found to scan.');
    }
}

module.exports = {
    scanDocumentForSecrets,
    scanActiveEditorForSecrets
};