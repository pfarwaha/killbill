import { RequestExecutor, ProcessedRequest } from './types';
import { ExecutionRequest } from '../webview/types';
import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

interface WorkerInfo {
    process: child_process.ChildProcess;
    queue: Array<{
        request: ExecutionRequest<any, any, any>;
        resolve: (value: ProcessedRequest<any>) => void;
        reject: (reason: any) => void;
    }>;
    isProcessing: boolean;
}

// Inner class for request processing
export class RequestProcessor {
    private static instance: RequestProcessor;
    private isProcessing: boolean = false;

    private constructor() {}

    static getInstance(): RequestProcessor {
        if (!RequestProcessor.instance) {
            RequestProcessor.instance = new RequestProcessor();
        }
        return RequestProcessor.instance;
    }

    async processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>> {
        try {
            this.isProcessing = true;
            const result = await request.execute();
            this.isProcessing = false;
            return {
                ...request,
                status: 'completed',
                result
            };
        } catch (error) {
            this.isProcessing = false;
            throw error;
        }
    }

    isBusy(): boolean {
        return this.isProcessing;
    }
}

export class ExternalProcessExecutor implements RequestExecutor {
    private workers: WorkerInfo[] = [];
    private numWorkers: number;
    private nextWorkerIndex: number = 0;

    constructor(numWorkers: number = os.cpus().length) {
        this.numWorkers = numWorkers;
        this.startWorkers();
    }

    private startWorkers() {
        for (let i = 0; i < this.numWorkers; i++) {
            const workerProcess = child_process.fork(
                path.join(__dirname, 'worker.js'),
                [],
                {
                    cwd: path.join(__dirname, '..', '..'),
                    execArgv: ['-r', 'ts-node/register']
                }
            );
            const workerInfo: WorkerInfo = {
                process: workerProcess,
                queue: [],
                isProcessing: false
            };

            workerProcess.on('message', (message: any) => {
                if (message.type === 'RESULT') {
                    const { resolve } = workerInfo.queue.shift()!;
                    resolve(message.result);
                    workerInfo.isProcessing = false;
                    this.processNextRequest(workerInfo);
                } else if (message.type === 'ERROR') {
                    const { reject } = workerInfo.queue.shift()!;
                    reject(new Error(message.error));
                    workerInfo.isProcessing = false;
                    this.processNextRequest(workerInfo);
                }
            });

            workerProcess.on('error', (error) => {
                console.error('Worker process error:', error);
                this.restartWorker(i);
            });

            workerProcess.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker process exited with code ${code}`);
                    this.restartWorker(i);
                }
            });

            this.workers.push(workerInfo);
        }
    }

    private restartWorker(index: number) {
        const oldWorker = this.workers[index];
        oldWorker.process.kill();
        const workerProcess = child_process.fork(
            path.join(__dirname, 'worker.js'),
            [],
            {
                cwd: path.join(__dirname, '..', '..'),
                execArgv: ['-r', 'ts-node/register']
            }
        );
        const workerInfo: WorkerInfo = {
            process: workerProcess,
            queue: [],
            isProcessing: false
        };
        workerProcess.on('message', (message: any) => {
            if (message.type === 'RESULT') {
                const { resolve } = workerInfo.queue.shift()!;
                resolve(message.result);
                workerInfo.isProcessing = false;
                this.processNextRequest(workerInfo);
            } else if (message.type === 'ERROR') {
                const { reject } = workerInfo.queue.shift()!;
                reject(new Error(message.error));
                workerInfo.isProcessing = false;
                this.processNextRequest(workerInfo);
            }
        });
        workerProcess.on('error', (error) => {
            console.error('Worker process error:', error);
            this.restartWorker(index);
        });
        workerProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker process exited with code ${code}`);
                this.restartWorker(index);
            }
        });
        this.workers[index] = workerInfo;
    }

    private processNextRequest(worker: WorkerInfo) {
        if (worker.isProcessing || worker.queue.length === 0) {
            return;
        }
        const { request } = worker.queue[0];
        worker.isProcessing = true;
        worker.process.send({
            type: 'REQUEST',
            input1: request.input1,
            input2: request.input2
        });
    }

    async processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>> {
        // Round-robin assignment
        const worker = this.workers[this.nextWorkerIndex];
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.numWorkers;
        return new Promise((resolve, reject) => {
            worker.queue.push({ request, resolve, reject });
            this.processNextRequest(worker);
        });
    }

    dispose() {
        for (const worker of this.workers) {
            worker.process.kill();
        }
        this.workers = [];
    }
} 