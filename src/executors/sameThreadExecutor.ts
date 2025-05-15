import { RequestExecutor, ProcessedRequest } from './types';
import { ExecutionRequest } from '../webview/types';

export class SameThreadExecutor implements RequestExecutor {
    async processRequest<T>(request: ExecutionRequest<any, any, T>): Promise<ProcessedRequest<T>> {
        try {
            const result = await request.execute();
            return {
                ...request,
                status: 'completed',
                result
            };
        } catch (error) {
            throw error;
        }
    }
} 