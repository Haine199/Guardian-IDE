const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.config = null;
        this.loadConfig();
        // Watch for changes to the config file to reload automatically
        const watcher = vscode.workspace.createFileSystemWatcher('**/guardian.json');
        watcher.onDidChange(() => this.loadConfig());
        watcher.onDidCreate(() => this.loadConfig());
        watcher.onDidDelete(() => this.loadConfig());
    }

    loadConfig() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const configPath = path.join(workspaceFolders[0].uri.fsPath, 'guardian.json');
            if (fs.existsSync(configPath)) {
                try {
                    const configContent = fs.readFileSync(configPath, 'utf8');
                    this.config = JSON.parse(configContent);
                    console.log('Guardian: Loaded configuration from guardian.json');
                    return;
                } catch (e) {
                    vscode.window.showErrorMessage(`Guardian: Error parsing guardian.json: ${e.message}`);
                }
            }
        }
        this.config = {}; // Default to empty config if not found or error
    }

    isRuleIgnored(ruleId) {
        return this.config.ignoreRules?.includes(ruleId) || false;
    }

    isVulnerabilityIgnored(vulnId) {
        return this.config.ignoreVulnerabilities?.includes(vulnId) || false;
    }

    getSeverity(ruleId, defaultSeverity) {
        if (this.config.severityOverrides && this.config.severityOverrides[ruleId]) {
            return this.mapConfigSeverity(this.config.severityOverrides[ruleId]);
        }
        return defaultSeverity;
    }

    mapConfigSeverity(severityString) {
        switch (severityString.toLowerCase()) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'information': return vscode.DiagnosticSeverity.Information;
            case 'hint': return vscode.DiagnosticSeverity.Hint;
            default: return vscode.DiagnosticSeverity.Warning;
        }
    }
}

// Export a single instance to be shared across the extension
const configManager = new ConfigManager();
module.exports = { configManager };