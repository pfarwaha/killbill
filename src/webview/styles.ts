export const styles = `
    body {
        padding: 20px;
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
    }
    .form-group {
        margin-bottom: 15px;
    }
    label {
        display: block;
        margin-bottom: 5px;
    }
    input {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
    }
    button {
        padding: 8px 16px;
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        cursor: pointer;
    }
    button:hover {
        background: var(--vscode-button-hoverBackground);
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .requests-table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse;
    }
    .requests-table th,
    .requests-table td {
        padding: 8px;
        text-align: left;
        border: 1px solid var(--vscode-input-border);
    }
    .requests-table th {
        background: var(--vscode-editor-background);
        font-weight: bold;
    }
    .status-pending {
        color: var(--vscode-charts-yellow);
    }
    .status-queued {
        color: var(--vscode-charts-orange);
    }
    .status-processing {
        color: var(--vscode-charts-blue);
    }
    .status-completed {
        color: var(--vscode-charts-green);
    }
`; 