import { RequestProcessor } from './externalProcessExecutor';
import { ExecutionRequest } from '../webview/types';

// Get the singleton instance
const processor = RequestProcessor.getInstance();

// Handle messages from the parent process
process.on('message', async (message: any) => {
    if (message.type === 'REQUEST') {
        try {
            const request: ExecutionRequest<any, any, any> = {
                id: Date.now().toString(),
                status: 'pending',
                input1: message.input1,
                input2: message.input2,
                execute: async () => {
                    // Simulate some work
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return message.input1 + message.input2;
                }
            };
            const result = await processor.processRequest(request);
            process.send!({ type: 'RESULT', result });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            process.send!({ type: 'ERROR', error: errorMessage });
        }
    }
});

// Signal that we're ready to process requests
process.send?.({ type: 'READY' }); 