import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { RequestExecutor, ProcessedRequest } from './types';
import { ExecutionRequest } from '../webview/types';
import { AdditionRequest } from '../webview/requests';

export class MultiThreadedExecutor implements RequestExecutor {
    private workers: Map<string, Worker> = new Map();
    private requestQueue: Map<string, { 
        request: ExecutionRequest<any, any, any>, 
        resolve: (value: ProcessedRequest<any>) => void, 
        reject: (reason?: any) => void 
    }> = new Map();
    private maxWorkers: number;

    constructor(maxWorkers: number = 4) {
        this.maxWorkers = maxWorkers;
    }

    async processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>> {
        return new Promise((resolve, reject) => {
            if (this.workers.size < this.maxWorkers) {
                this.startWorker(request, resolve, reject);
            } else {
                console.log(`Queueing request ${request.id} - ${this.workers.size} workers active`);
                this.requestQueue.set(request.id, { request, resolve, reject });
            }
        });
    }

    private startWorker<T>(
        request: ExecutionRequest<any, any, T>,
        resolve: (value: ProcessedRequest<T>) => void,
        reject: (reason?: any) => void
    ) {
        const worker = new Worker(__filename, {
            workerData: { request }
        });

        this.workers.set(request.id, worker);

        worker.on('message', (result: ProcessedRequest<T>) => {
            this.workers.delete(request.id);
            resolve(result);
            // Process next queued request if any
            this.processQueuedRequests().catch(error => {
                console.error('Error processing queued requests:', error);
            });
        });

        worker.on('error', (error) => {
            this.workers.delete(request.id);
            reject(error);
            // Process next queued request if any
            this.processQueuedRequests().catch(error => {
                console.error('Error processing queued requests:', error);
            });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                this.workers.delete(request.id);
                reject(new Error(`Worker stopped with exit code ${code}`));
                // Process next queued request if any
                this.processQueuedRequests().catch(error => {
                    console.error('Error processing queued requests:', error);
                });
            }
        });
    }

    private async processQueuedRequests(): Promise<void> {
        if (this.requestQueue.size > 0 && this.workers.size < this.maxWorkers) {
            const entry = this.requestQueue.entries().next().value;
            if (entry) {
                const [requestId, { request, resolve, reject }] = entry;
                this.requestQueue.delete(requestId);
                console.log(`Processing queued request ${requestId}`);
                try {
                    await this.startWorker(request, resolve, reject);
                } catch (error) {
                    reject(error);
                }
            }
        }
    }
}

// Worker thread code
if (!isMainThread) {
    const { request }: { request: ExecutionRequest<any, any, any> } = workerData;
    
    // Reconstruct the AdditionRequest object since it gets serialized when passed to worker
    const reconstructedRequest = new AdditionRequest(request.input1, request.input2);
    reconstructedRequest.id = request.id;
    reconstructedRequest.status = request.status;
    reconstructedRequest.result = request.result;
    
    // Execute the request
    reconstructedRequest.execute().then((result: any) => {
        parentPort?.postMessage({
            ...reconstructedRequest,
            status: 'completed',
            result
        });
    }).catch((error: Error) => {
        parentPort?.postMessage({
            ...reconstructedRequest,
            status: 'completed',
            error: error.message
        });
    });
}