// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getTemplate } from './webview/template';
import { SameThreadExecutor } from './executors/sameThreadExecutor';
import { MultiThreadedExecutor } from './executors/multiThreadedExecutor';
import { RequestExecutor } from './executors/types';
import { AdditionRequest } from './webview/requests';

class StateManager {
    private requests: AdditionRequest[] = [];

    addRequest(request: AdditionRequest) {
        this.requests.push(request);
        return this.requests;
    }

    findRequest(id: string): AdditionRequest | undefined {
        return this.requests.find(r => r.id === id);
    }

    updateRequest(id: string, status: 'pending' | 'queued' | 'processing' | 'completed', result?: number) {
        this.requests = this.requests.map(r => {
            if (r.id === id) {
                const updated = new AdditionRequest(r.input1, r.input2);
                updated.id = r.id;
                updated.status = status;
                updated.result = result;
                return updated;
            }
            return r;
        });
        return this.requests;
    }

    getAllRequests(): AdditionRequest[] {
        return this.requests;
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated');

    // Create both executors
    const sameThreadExecutor = new SameThreadExecutor();
    const multiThreadedExecutor = new MultiThreadedExecutor();
    
    // Use multi-threaded executor by default
    let currentExecutor: RequestExecutor = multiThreadedExecutor;
    
    const stateManager = new StateManager();
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    let disposable = vscode.commands.registerCommand('killbill.helloWorld', () => {
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.One);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                'killbill',
                'KillBill Calculator',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Generate the webview-safe URI for the script
            const scriptPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview', 'webview.js');
            const scriptUri = currentPanel.webview.asWebviewUri(scriptPathOnDisk);

            currentPanel.webview.html = getTemplate(scriptUri.toString());

            currentPanel.webview.onDidReceiveMessage(async message => {
                try {
                    switch (message.command) {
                        case 'addRequest':
                            // Store the request in memory
                            const requests = stateManager.addRequest(message.data);
                            
                            // Update the webview with the new request
                            currentPanel?.webview.postMessage({
                                command: 'updateRequests',
                                data: requests
                            });
                            break;

                        case 'startProcessing':
                            const request = stateManager.findRequest(message.data.requestId);
                            if (request) {
                                try {
                                    // Reconstruct the AdditionRequest object
                                    const reconstructedRequest = new AdditionRequest(request.input1, request.input2);
                                    reconstructedRequest.id = request.id;
                                    reconstructedRequest.status = request.status;
                                    reconstructedRequest.result = request.result;

                                    // Update status to queued before processing
                                    stateManager.updateRequest(request.id, 'queued');
                                    currentPanel?.webview.postMessage({
                                        command: 'updateRequests',
                                        data: stateManager.getAllRequests()
                                    });

                                    // Process the request using the current executor without awaiting
                                    currentExecutor.processRequest(reconstructedRequest)
                                        .then(result => {
                                            // Update the request in memory
                                            stateManager.updateRequest(request.id, 'completed', result.result);
                                            
                                            // Notify the webview
                                            currentPanel?.webview.postMessage({
                                                command: 'requestComplete',
                                                data: { requestId: request.id, result: result.result }
                                            });
                                        })
                                        .catch(error => {
                                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                            vscode.window.showErrorMessage(`Failed to process request: ${errorMessage}`);
                                        });
                                } catch (error: unknown) {
                                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                    vscode.window.showErrorMessage(`Failed to process request: ${errorMessage}`);
                                }
                            }
                            break;

                        case 'switchExecutor':
                            // Switch between executors
                            currentExecutor = message.data.useMultiThreaded ? multiThreadedExecutor : sameThreadExecutor;
                            vscode.window.showInformationMessage(
                                `Switched to ${message.data.useMultiThreaded ? 'multi-threaded' : 'single-threaded'} executor`
                            );
                            break;
                    }
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    vscode.window.showErrorMessage(`Error handling message: ${errorMessage}`);
                }
            });

            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            });
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension deactivated');
}
