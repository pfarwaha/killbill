// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getTemplate } from './webview/template';
import { SameThreadExecutor } from './executors/sameThreadExecutor';
import { MultiThreadedExecutor } from './executors/multiThreadedExecutor';
import { ExternalProcessExecutor } from './executors/externalProcessExecutor';
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

    // Create all executors
    const sameThreadExecutor = new SameThreadExecutor();
    const multiThreadedExecutor = new MultiThreadedExecutor();
    const externalProcessExecutor = new ExternalProcessExecutor();
    
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
            const scriptPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'dist', 'webview', 'script.js');
            const scriptUri = currentPanel.webview.asWebviewUri(scriptPathOnDisk);

            currentPanel.webview.html = getTemplate(scriptUri.toString());

            currentPanel.webview.onDidReceiveMessage(async message => {
                try {
                    switch (message.command) {
                        case 'addRequest':
                            const request = new AdditionRequest(
                                message.data.input1,
                                message.data.input2
                            );
                            stateManager.addRequest(request);
                            currentPanel?.webview.postMessage({
                                command: 'updateRequests',
                                data: stateManager.getAllRequests()
                            });
                            break;

                        case 'startProcessing':
                            const requestToProcess = stateManager.findRequest(message.data.requestId);
                            if (requestToProcess) {
                                // Set status to 'processing' before starting
                                stateManager.updateRequest(
                                    requestToProcess.id,
                                    'processing',
                                    requestToProcess.result
                                );
                                currentPanel?.webview.postMessage({
                                    command: 'updateRequests',
                                    data: stateManager.getAllRequests()
                                });
                                try {
                                    const result = await currentExecutor.processRequest(requestToProcess);
                                    stateManager.updateRequest(
                                        requestToProcess.id,
                                        result.status,
                                        result.result
                                    );
                                    currentPanel?.webview.postMessage({
                                        command: 'updateRequests',
                                        data: stateManager.getAllRequests()
                                    });
                                } catch (error: unknown) {
                                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                    vscode.window.showErrorMessage(`Error processing request: ${errorMessage}`);
                                }
                            }
                            break;

                        case 'switchExecutor':
                            // Switch between executors based on selection
                            switch (message.data.executorType) {
                                case 'single':
                                    currentExecutor = sameThreadExecutor;
                                    break;
                                case 'multi':
                                    currentExecutor = multiThreadedExecutor;
                                    break;
                                case 'external':
                                    currentExecutor = externalProcessExecutor;
                                    break;
                            }
                            vscode.window.showInformationMessage(
                                `Switched to ${message.data.executorType} executor`
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
