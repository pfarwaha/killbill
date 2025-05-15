# KillBill VS Code Extension

A powerful VS Code extension for processing and managing requests with a modern webview interface.

## Features

- 🧮 Basic calculator functionality with number addition
- 📊 Real-time request status tracking
- 🔄 Asynchronous request processing with worker threads
- 📋 Request queue management
- 🎨 Modern webview interface
- 📈 Status persistence across sessions

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open the Extensions view
3. Search for "KillBill"
4. Click "Install"

## Usage

### Starting the Extension

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "KillBill" and select "KillBill: Start"

### Using the Calculator

1. The webview interface will open in a new panel
2. Enter two numbers in the input fields
3. Click "Submit" to process the addition
4. View the results in the table below
5. Track request status (pending, processing, completed) in real-time

### Request Management

- The extension supports up to 4 concurrent worker threads
- Requests are automatically queued if all workers are busy
- Each request shows its current status and result
- Results persist across VS Code sessions

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- VS Code Extension Development Tools

### Building from Source

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run webpack
   ```
4. Press F5 to start debugging

### Project Structure

- `src/extension.ts` - Main extension entry point
- `src/webview/` - Webview interface implementation
  - `template.ts` - HTML template and styling
  - `script.ts` - Webview client-side logic
- `src/requestProcessor.ts` - Request processing and worker management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.
