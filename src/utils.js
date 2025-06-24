const vscode = require('vscode');

function findDependencyRange(documentText, dependencyName) {
    const regex = new RegExp(`"${dependencyName}"\\s*:\\s*".*?"`, 'g');
    let match;
    if ((match = regex.exec(documentText)) !== null) {
        const startPos = match.index;
        const keyStart = startPos + 1;
        const keyEnd = keyStart + dependencyName.length;
        
        const startPosition = positionAt(documentText, keyStart);
        const endPosition = positionAt(documentText, keyEnd);

        return new vscode.Range(startPosition, endPosition);
    }
    return new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1));
}

function positionAt(text, offset) {
    let line = 0;
    let character = 0;
    for (let i = 0; i < offset; i++) {
        if (text[i] === '\n') {
            line++;
            character = 0;
        } else {
            character++;
        }
    }
    return new vscode.Position(line, character);
}

function mapSeverity(npmSeverity) {
    switch (npmSeverity) {
        case 'critical':
        case 'high':
            return vscode.DiagnosticSeverity.Error;
        case 'moderate':
            return vscode.DiagnosticSeverity.Warning;
        case 'low':
        case 'info':
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Warning;
    }
}

module.exports = {
    findDependencyRange,
    mapSeverity
};