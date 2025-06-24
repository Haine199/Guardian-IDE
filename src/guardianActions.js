const vscode = require('vscode');

/**
 * @typedef {import('vscode').TextDocument} TextDocument
 * @typedef {import('vscode').Range} Range
 * @typedef {import('vscode').CodeActionContext} CodeActionContext
 * @typedef {import('vscode').Diagnostic} Diagnostic
 */

class GuardianCodeActionProvider {
    /**
     * @param {TextDocument} document
     * @param {Range} range
     * @param {CodeActionContext} context
     */
    provideCodeActions(document, range, context) {
        return context.diagnostics
            .filter(diagnostic => diagnostic.source === 'Guardian IDE')
            .flatMap(diagnostic => {
                if (diagnostic.code === 'dependency-vulnerability') {
                    return [this.createFixDependencyAction(diagnostic)];
                }
                if (diagnostic.code === 'hardcoded-secret') {
                    return [this.createEducateSecretAction(diagnostic)];
                }
                // Dockerfile rule: diagnostic.code may be an object with value and target
                if (
                    diagnostic.code &&
                    typeof diagnostic.code === 'object' &&
                    typeof diagnostic.code.value === 'string' &&
                    diagnostic.code.value.startsWith('DF')
                ) {
                    return [this.createEducateDockerAction(diagnostic)];
                }
                return [];
            });
    }

    /**
     * @param {Diagnostic} diagnostic
     */
    createFixDependencyAction(diagnostic) {
        const action = new vscode.CodeAction('Fix with `npm audit fix`', vscode.CodeActionKind.QuickFix);
        action.command = { command: 'guardian-ide.runNpmAuditFix', title: 'Run `npm audit fix`' };
        action.isPreferred = true;
        action.diagnostics = [diagnostic];
        return action;
    }

    /**
     * @param {Diagnostic} diagnostic
     */
    createEducateSecretAction(diagnostic) {
        const action = new vscode.CodeAction('Learn about secret management', vscode.CodeActionKind.QuickFix);
        action.command = { 
            command: 'vscode.open', 
            arguments: [vscode.Uri.parse('https://docs.github.com/en/actions/security-guides/encrypted-secrets')],
            title: 'Learn Best Practices for Managing Secrets'
        };
        action.diagnostics = [diagnostic];
        return action;
    }

    /**
     * @param {Diagnostic} diagnostic
     */
    createEducateDockerAction(diagnostic) {
        const action = new vscode.CodeAction('Learn about Dockerfile best practices', vscode.CodeActionKind.QuickFix);
        action.command = { 
            command: 'vscode.open', 
            arguments: [
                diagnostic.code && typeof diagnostic.code === 'object' && diagnostic.code.target
                    ? diagnostic.code.target
                    : vscode.Uri.parse('https://docs.docker.com/develop/develop-images/dockerfile_best-practices/')
            ],
            title: 'Learn Best Practices for Dockerfiles'
        };
        action.diagnostics = [diagnostic];
        return action;
    }
}

module.exports = { GuardianCodeActionProvider };