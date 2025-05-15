declare function acquireVsCodeApi(): {
    postMessage(message: any): void;
};

import { AdditionRequest } from './requests';

let requests: AdditionRequest[] = [];

function submitRequest() {
    console.log('Attempting to submit request...');
    const num1 = document.getElementById('num1') as HTMLInputElement;
    const num2 = document.getElementById('num2') as HTMLInputElement;
    
    if (num1.value && num2.value) {
        const request = new AdditionRequest(
            Number(num1.value),
            Number(num2.value)
        );
        
        console.log('Submitting request:', request);
        vscode.postMessage({
            command: 'addRequest',
            data: request
        });
        // Clear input fields after submit
        num1.value = '';
        num2.value = '';
    } else {
        console.warn('Submit failed: Missing input values');
    }
}

function startProcessing(requestId: string) {
    console.log('Starting processing for request:', requestId);
    vscode.postMessage({
        command: 'startProcessing',
        data: { requestId }
    });
}

function updateTable() {
    console.log('Updating table with requests:', requests);
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) {
        console.error('Table body element not found');
        return;
    }

    tbody.innerHTML = requests.map(request => 
        '<tr>' +
            '<td>' + request.id + '</td>' +
            '<td>Add ' + request.input1 + ' + ' + request.input2 + '</td>' +
            '<td>' +
                (request.status === 'pending' ? 
                    '<button class="process-button" data-request-id="' + request.id + '">Start</button>' :
                    request.status === 'queued' ? 
                    '<button disabled>Queued...</button>' :
                    request.status === 'processing' ? 
                    '<button disabled>Processing...</button>' :
                    '<button disabled>Completed</button>'
                ) +
            '</td>' +
            '<td class="status-' + request.status + '">' +
                (request.result !== undefined ? request.result : '-') +
            '</td>' +
        '</tr>'
    ).join('');

    // Add event listeners to the new process buttons
    document.querySelectorAll('.process-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const requestId = (e.currentTarget as HTMLElement).getAttribute('data-request-id');
            if (requestId) {
                startProcessing(requestId);
            }
        });
    });
}

// Initialize VS Code API
const vscode = acquireVsCodeApi();
console.log('VS Code API initialized');

// Add event listeners when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', submitRequest);
    } else {
        console.error('Submit button not found');
    }
});

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    console.log('Received message:', message);
    
    switch (message.command) {
        case 'updateRequests':
            console.log('Updating requests list');
            requests = message.data;
            updateTable();
            break;
        case 'requestComplete':
            console.log('Request completed:', message.data);
            const { requestId, result } = message.data;
            requests = requests.map(req => {
                if (req.id === requestId) {
                    const updated = new AdditionRequest(req.input1, req.input2);
                    updated.status = 'completed';
                    updated.result = result;
                    return updated;
                }
                return req;
            });
            updateTable();
            break;
        default:
            console.warn('Unknown message command:', message.command);
    }
}); 