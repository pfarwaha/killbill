// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getTemplate } from './webview/template';
import { RequestProcessor } from './requestProcessor';
import { AdditionRequest } from './webview/requests';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension activated');

	const processor = new RequestProcessor();
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

			currentPanel.webview.html = getTemplate();

			currentPanel.webview.onDidReceiveMessage(async message => {
				try {
					const requests = context.workspaceState.get<AdditionRequest[]>('requests') || [];
					
					switch (message.command) {
						case 'addRequest':
							// Store the request in extension state
							requests.push(message.data);
							await context.workspaceState.update('requests', requests);
							
							// Update the webview with the new request
							currentPanel?.webview.postMessage({
								command: 'updateRequests',
								data: requests
							});
							break;

						case 'startProcessing':
							const request = requests.find(r => r.id === message.data.requestId);
							if (request) {
								try {
									// Process the request in a separate thread
									const result = await processor.processRequest(request);
									
									// Update the request in storage
									const updatedRequests = requests.map(r => 
										r.id === request.id ? { ...r, status: 'completed', result: result.result } : r
									);
									await context.workspaceState.update('requests', updatedRequests);
									
									// Notify the webview
									currentPanel?.webview.postMessage({
										command: 'requestComplete',
										data: { requestId: request.id, result: result.result }
									});
								} catch (error: unknown) {
									const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
									vscode.window.showErrorMessage(`Failed to process request: ${errorMessage}`);
								}
							}
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
