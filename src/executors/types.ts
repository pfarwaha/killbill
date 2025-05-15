import { ExecutionRequest as WebviewExecutionRequest } from '../webview/types';

export type ExecutionRequest<TInput1, TInput2, TResult> = WebviewExecutionRequest<TInput1, TInput2, TResult>;

export interface ProcessedRequest<T> extends ExecutionRequest<any, any, T> {
    status: 'pending' | 'queued' | 'processing' | 'completed';
    result?: T;
    error?: string;
}

export interface RequestExecutor {
    processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>>;
} 