import { ExecutionRequest } from '../webview/types';

export interface ProcessedRequest<T> extends ExecutionRequest<any, any, T> {
    result: T;
}

export interface RequestExecutor {
    processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>>;
} 