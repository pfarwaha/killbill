import { styles } from './styles';

export function getTemplate(scriptUri: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                ${styles}
            </style>
        </head>
        <body>
            <div class="form-group">
                <label for="num1">First Number:</label>
                <input type="number" id="num1" placeholder="Enter first number">
            </div>
            <div class="form-group">
                <label for="num2">Second Number:</label>
                <input type="number" id="num2" placeholder="Enter second number">
            </div>
            <div class="form-group">
                <button id="submitButton">Submit Request</button>
            </div>
            <div class="executor-controls">
                <label for="executorSelect">Select Executor:</label>
                <select id="executorSelect">
                    <option value="single">Single Threaded</option>
                    <option value="multi" selected>Multi Threaded</option>
                    <option value="external">External Process</option>
                </select>
            </div>
            <table class="request-table">
                <thead>
                    <tr>
                        <th>RequestID</th>
                        <th>Request</th>
                        <th>Action</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody id="requestsTable">
                </tbody>
            </table>
            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
} 