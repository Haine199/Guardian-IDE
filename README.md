Guardian IDE: Your Integrated Security Tutor


Guardian IDE is a developer-centric security extension for Visual Studio Code that finds vulnerabilities and bad practices in your code and helps you fix them. It acts as a real-time security tutor, embedding security seamlessly into your workflow without the noise and friction of traditional tools.

Guardian finds problems, explains why they are a risk, and provides one-click "Quick Fix" actions to resolve them, making the secure way the easiest way.

(Key Features in Action)

Dependency Scanning	Secret Detection	Dockerfile Analysis
[Finds vulnerabilities in NPM & Python packages]	[Detects hardcoded API keys and passwords]	[Flags security misconfigurations in your Dockerfiles]


Core Features
Guardian IDE provides a suite of scanners to cover the most common security issues in modern development:

📦 Dependency Scanning:

NPM: Analyzes your package.json file for dependencies with known vulnerabilities using npm audit.
Python: Analyzes your requirements.txt file for vulnerable packages using pip-audit.
🔑 Hardcoded Secret Detection:

Scans source code (.js, .ts) for patterns that look like API keys, passwords, and other sensitive tokens to prevent them from being committed to source control.
☁️ Infrastructure as Code (IaC) Scanning:

Dockerfile: Analyzes your Dockerfile for common security misconfigurations and violations of best practices (e.g., running as root, using floating tags).
💡 Quick Fix Actions:

Provides contextual, one-click lightbulb actions to resolve issues directly in the editor.
Run npm audit fix automatically.
Link directly to documentation about secret management and Dockerfile best practices.
⚙️ Fully Configurable:

Use a simple guardian.json file to ignore specific rules, suppress vulnerability IDs, and override the severity of any issue to fit your project's needs.
Getting Started
Go to the Extensions view in VS Code (Ctrl+Shift+X).
Search for "Guardian IDE".
Click Install.
Once installed, Guardian IDE will automatically activate when you open a project containing supported files.

Configuration
To customize Guardian's behavior for your project, create a guardian.json file in the root of your workspace.

Here is an example of a guardian.json file:

JSON

{
  "version": "1.0",
  "ignoreRules": [
    "DF002",
    "hardcoded-secret"
  ],
  "ignoreVulnerabilities": [
    "CVE-2023-32681"
  ],
  "severityOverrides": {
    "DF003": "Information"
  }
}


ignoreRules: An array of strings. Add any rule ID to this list to prevent it from being reported.
Example: "hardcoded-secret" will disable all secret scanning.
Example: "DF001" will disable only the "Avoid running as root user" check in Dockerfiles.
ignoreVulnerabilities: An array of strings. Add any specific vulnerability ID (e.g., a CVE number or GHS ID) to suppress it across all dependency scans.
severityOverrides: An object that maps a rule ID to a desired severity level ("Error", "Warning", "Information", or "Hint").

Commands and UI
Guardian IDE adds a shield icon to your Activity Bar. From here, you can manually trigger scans:

Run Dependency Scan: Scans package.json for vulnerabilities.
Run Python Dependency Scan: Scans requirements.txt for vulnerabilities.
Scan File for Secrets: Scans the currently active file for hardcoded secrets.
Scan Dockerfile: Scans the currently active Dockerfile for misconfigurations.


License
This extension is licensed under the MIT License.

Development & Contributing
Guardian IDE is open-source and we welcome contributions! 
