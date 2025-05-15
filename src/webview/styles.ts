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
    select {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
        cursor: pointer;
    }
    select:hover {
        border-color: var(--vscode-focusBorder);
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
    .executor-controls {
        margin: 20px 0;
        padding: 10px;
        background: var(--vscode-editor-background);
        border: 1px solid var(--vscode-input-border);
    }
    .switch-executor {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
    }
    .switch-executor:hover {
        background: var(--vscode-button-secondaryHoverBackground);
    }
    .request-table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse;
        table-layout: fixed;
    }
    .request-table th,
    .request-table td {
        padding: 12px;
        text-align: left;
        border: 1px solid var(--vscode-panel-border);
        word-wrap: break-word;
    }
    .request-table th {
        background: var(--vscode-editor-background);
        font-weight: bold;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    .request-table th:nth-child(1) { width: 15%; }  /* RequestID */
    .request-table th:nth-child(2) { width: 35%; }  /* Request */
    .request-table th:nth-child(3) { width: 20%; }  /* Action */
    .request-table th:nth-child(4) { width: 30%; }  /* Result */
    .start-button {
        padding: 4px 8px;
        font-size: 0.9em;
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        min-width: 60px;
    }
    .start-button:hover {
        background: var(--vscode-button-secondaryHoverBackground);
    }
    .start-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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