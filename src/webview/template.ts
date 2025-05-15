import { styles } from './styles';

export function getTemplate(scriptUri: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>KillBill Calculator</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="form-group">
                <label for="num1">First Number:</label>
                <input type="number" id="num1" required>
            </div>
            <div class="form-group">
                <label for="num2">Second Number:</label>
                <input type="number" id="num2" required>
            </div>
            <button id="submitButton">Submit</button>

            <table class="requests-table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Request</th>
                        <th>Action</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody id="requestsTableBody">
                </tbody>
            </table>

            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
} 