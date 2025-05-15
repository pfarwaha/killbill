import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { ExecutionRequest } from './webview/types';

interface ProcessedRequest<T> extends ExecutionRequest<any, any, T> {
    result: T;
}

class RequestProcessor {
    private workers: Map<string, Worker> = new Map();
    private requestQueue: Map<string, ExecutionRequest<any, any, any>> = new Map();
    private maxWorkers: number;

    constructor(maxWorkers: number = 4) {
        this.maxWorkers = maxWorkers;
    }

    async processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>> {
        return new Promise((resolve, reject) => {
            if (this.workers.size < this.maxWorkers) {
                const worker = new Worker(__filename, {
                    workerData: { request }
                });

                this.workers.set(request.id, worker);

                worker.on('message', (result: ProcessedRequest<T>) => {
                    this.workers.delete(request.id);
                    resolve(result);
                });

                worker.on('error', (error) => {
                    this.workers.delete(request.id);
                    reject(error);
                });

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        this.workers.delete(request.id);
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            } else {
                this.requestQueue.set(request.id, request);
            }
        });
    }

    private async processQueuedRequests() {
        if (this.requestQueue.size > 0 && this.workers.size < this.maxWorkers) {
            const entry = this.requestQueue.entries().next().value;
            if (entry) {
                const [requestId, request] = entry;
                this.requestQueue.delete(requestId);
                await this.processRequest(request);
            }
        }
    }
}

// Worker thread code
if (!isMainThread) {
    const { request }: { request: ExecutionRequest<any, any, any> } = workerData;
    
    // Execute the request
    request.execute().then((result: any) => {
        parentPort?.postMessage({
            ...request,
            status: 'completed',
            result
        });
    }).catch((error: Error) => {
        parentPort?.postMessage({
            ...request,
            status: 'completed',
            error: error.message
        });
    });
}

export { RequestProcessor, ProcessedRequest }; 