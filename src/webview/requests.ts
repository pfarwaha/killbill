import { ExecutionRequest } from './types';

export class AdditionRequest implements ExecutionRequest<number, number, number> {
    id: string;
    input1: number;
    input2: number;
    status: 'pending' | 'queued' | 'processing' | 'completed';
    result?: number;

    constructor(num1: number, num2: number) {
        this.id = Date.now().toString();
        this.input1 = num1;
        this.input2 = num2;
        this.status = 'pending';
    }

    async execute(): Promise<number> {
        // Simulate CPU-intensive work that blocks the thread
        const start = Date.now();
        while (Date.now() - start < 2000) {
            // Busy wait - this will actually block the thread
            Math.sqrt(Math.random() * 1000000);
        }
        return this.input1 + this.input2;
    }
} 