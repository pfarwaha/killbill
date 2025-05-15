declare function acquireVsCodeApi(): {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
};

interface Request {
    id: string;
    input1: number;
    input2: number;
    status: 'pending' | 'queued' | 'processing' | 'completed';
    result?: number;
}

interface State {
    requests: Request[];
}

// Initialize state
let state: State = {
    requests: []
};

// Get VS Code API
const vscode = acquireVsCodeApi();

// Restore state
const previousState = vscode.getState();
if (previousState) {
    state = previousState;
    updateRequestsTable();
}

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateRequests':
            state.requests = message.data;
            updateRequestsTable();
            vscode.setState(state);
            break;
    }
});

// Update the requests table
function updateRequestsTable() {
    const tbody = document.getElementById('requestsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    state.requests.forEach(request => {
        const row = document.createElement('tr');
        let actionCell = '';
        if (request.status === 'pending') {
            actionCell = `<button class="start-button" data-request-id="${request.id}">Start</button>`;
        } else if (request.status === 'processing') {
            actionCell = `<button class="start-button" disabled>Processing...</button>`;
        } else if (request.status === 'completed') {
            actionCell = `<span style="color: var(--vscode-charts-green); font-weight: bold;">✔ Done</span>`;
        } else {
            actionCell = '';
        }
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.input1} + ${request.input2}</td>
            <td>${actionCell}</td>
            <td>${request.result !== undefined ? request.result : '-'}</td>
        `;
        tbody.appendChild(row);

        // Add click handler for the Start button
        const startButton = row.querySelector('.start-button');
        if (startButton && request.status === 'pending') {
            startButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'startProcessing',
                    data: { requestId: request.id }
                });
            });
        }
    });
}

function submitRequest() {
    const num1 = document.getElementById('num1') as HTMLInputElement;
    const num2 = document.getElementById('num2') as HTMLInputElement;

    if (num1.value && num2.value) {
        vscode.postMessage({
            command: 'addRequest',
            data: {
                input1: Number(num1.value),
                input2: Number(num2.value)
            }
        });
        // Clear input fields after submit
        num1.value = '';
        num2.value = '';
    }
}

function switchExecutor() {
    const select = document.getElementById('executorSelect') as HTMLSelectElement;
    if (select) {
        vscode.postMessage({
            command: 'switchExecutor',
            data: { executorType: select.value }
        });
    }
}

// Add event listeners when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', submitRequest);
    }

    const executorSelect = document.getElementById('executorSelect');
    if (executorSelect) {
        executorSelect.addEventListener('change', switchExecutor);
    }
}); 