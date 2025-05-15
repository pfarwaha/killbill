# Changelog

All notable changes to the KillBill VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2024-03-21

### Added
- Initial release of KillBill VS Code extension
  - Basic extension structure with command registration (`extension.ts`: `activate()`)
  - Extension activation on command execution (`package.json`: `contributes.commands`)
  - Proper cleanup on deactivation (`extension.ts`: `deactivate()`)

- Basic calculator functionality with number addition
  - Support for adding two numbers (`src/requestProcessor.ts`: `AdditionRequest` class)
  - Input validation for numeric values (`src/webview/script.ts`: `submitRequest()`)
  - Error handling for invalid inputs (`src/webview/script.ts`: `handleError()`)

- Webview interface for input and results display
  - Clean, modern UI with form inputs (`src/webview/template.ts`: `getWebviewContent()`)
  - Real-time table updates (`src/webview/script.ts`: `updateTable()`)
  - Responsive design with proper styling (`src/webview/template.ts`: CSS styles)
  - Clear visual feedback for request status (`src/webview/script.ts`: `updateStatus()`)

- Request processing with worker threads
  - Asynchronous request handling (`src/requestProcessor.ts`: `RequestProcessor` class)
  - Parallel processing capability (`src/requestProcessor.ts`: `processRequest()`)
  - Worker thread management (`src/requestProcessor.ts`: `WorkerManager` class)
  - Error handling and recovery (`src/requestProcessor.ts`: `handleError()`)

- Request queue management
  - Queue system for handling multiple requests (`src/requestProcessor.ts`: `RequestQueue` class)
  - Maximum worker limit (4 concurrent workers) (`src/requestProcessor.ts`: `MAX_WORKERS`)
  - Automatic queue processing (`src/requestProcessor.ts`: `processQueue()`)
  - Request prioritization (`src/requestProcessor.ts`: `Request` interface)

- Status tracking for requests (pending, processing, completed)
  - Visual status indicators (`src/webview/template.ts`: status CSS classes)
  - State persistence using workspace storage (`src/extension.ts`: `Memento` usage)
  - Real-time status updates (`src/webview/script.ts`: `updateStatus()`)
  - Error state handling (`src/webview/script.ts`: `handleError()`)