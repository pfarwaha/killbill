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
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.input1 + this.input2;
    }
} 