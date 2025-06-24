const vscode = require('vscode');

class ActionsTreeDataProvider {
    /**
     * @param {vscode.TreeItem | undefined} element
     */
    getTreeItem(element) {
        return element;
    }

    /**
     * @param {vscode.TreeItem | undefined} element
     */
    getChildren(element) {
        if (element) {
            return Promise.resolve([]); // No children for our actions
        } else {
            // Return the root level actions
            const npmScanItem = new vscode.TreeItem('Run Dependency Scan', vscode.TreeItemCollapsibleState.None);
            npmScanItem.command = { command: 'guardian-ide.runNpmScan', title: 'Run Dependency Scan' };
            npmScanItem.iconPath = new vscode.ThemeIcon('search-view-icon');
            npmScanItem.tooltip = 'Run `npm audit` on the workspace\'s package.json.';

            const secretScanItem = new vscode.TreeItem('Scan File for Secrets', vscode.TreeItemCollapsibleState.None);
            secretScanItem.command = { command: 'guardian-ide.runSecretScan', title: 'Scan Current File for Secrets' };
            secretScanItem.iconPath = new vscode.ThemeIcon('key');
            secretScanItem.tooltip = 'Scan the currently active file for hardcoded secrets.';

            // ... inside the getChildren method
            const dockerScanItem = new vscode.TreeItem('Scan Dockerfile', vscode.TreeItemCollapsibleState.None);
            dockerScanItem.command = { command: 'guardian-ide.runDockerfileScan', title: 'Scan Active Dockerfile' };
            dockerScanItem.iconPath = new vscode.ThemeIcon('cloud');
            dockerScanItem.tooltip = 'Scan the currently active Dockerfile for security best practices.';

            // ... inside the getChildren method
            const pythonScanItem = new vscode.TreeItem('Run Python Dependency Scan', vscode.TreeItemCollapsibleState.None);
            pythonScanItem.command = { command: 'guardian-ide.runPythonScan', title: 'Run Python Dependency Scan' };
            pythonScanItem.iconPath = new vscode.ThemeIcon('python');
            pythonScanItem.tooltip = 'Run `pip-audit` on the workspace\'s requirements.txt.';

            return Promise.resolve([npmScanItem, pythonScanItem, secretScanItem, dockerScanItem]); // Add the new item
        }
    }
}

module.exports = { ActionsTreeDataProvider };