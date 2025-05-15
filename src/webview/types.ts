export interface ExecutionRequest<X, Y, T> {
    id: string;
    input1: X;
    input2: Y;
    status: 'pending' | 'queued' | 'processing' | 'completed';
    result?: T;
    execute(): Promise<T>;
}

export interface WebviewMessage {
    command: string;
    data?: any;
} 