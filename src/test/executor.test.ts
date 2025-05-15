import * as assert from 'assert';
import { SameThreadExecutor } from '../executors/sameThreadExecutor';
import { MultiThreadedExecutor } from '../executors/multiThreadedExecutor';
import { ExternalProcessExecutor } from '../executors/externalProcessExecutor';
import { AdditionRequest } from '../webview/requests';

suite('Executor Test Suite', function() {
    this.timeout(30000);
    test('Single Threaded Executor - Sequential Processing', async () => {
        const executor = new SameThreadExecutor();
        const startTime = Date.now();

        // Create 4 requests
        const requests = [
            new AdditionRequest(1, 2),
            new AdditionRequest(3, 4),
            new AdditionRequest(5, 6),
            new AdditionRequest(7, 8)
        ];

        // Submit all requests first
        const promises = [];
        for (const request of requests) {
            promises.push(executor.processRequest(request));
        }

        // Then wait for all results
        const results = [];
        for (const promise of promises) {
            const result = await promise;
            results.push(result);
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Verify results
        assert.strictEqual(results.length, 4);
        results.forEach((result, index) => {
            assert.strictEqual(result.status, 'completed');
            assert.strictEqual(result.result, requests[index].input1 + requests[index].input2);
        });

        // Each request takes 2 seconds, so total time should be around 8 seconds
        // Adding some buffer for overhead
        assert.ok(totalTime >= 7000, `Expected at least 7 seconds, got ${totalTime}ms`);
        console.log(`Single-threaded execution took ${totalTime}ms`);
    });

    test('Multi Threaded Executor - Parallel Processing', async () => {
        const executor = new MultiThreadedExecutor(4); // 4 workers
        const startTime = Date.now();

        // Create 4 requests
        const requests = [
            new AdditionRequest(1, 2),
            new AdditionRequest(3, 4),
            new AdditionRequest(5, 6),
            new AdditionRequest(7, 8)
        ];

        // Submit all requests first
        const promises = [];
        for (const request of requests) {
            promises.push(executor.processRequest(request));
        }

        // Then wait for all results
        const results = [];
        for (const promise of promises) {
            const result = await promise;
            results.push(result);
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Verify results
        assert.strictEqual(results.length, 4);
        results.forEach((result, index) => {
            assert.strictEqual(result.status, 'completed');
            assert.strictEqual(result.result, requests[index].input1 + requests[index].input2);
        });

        // With 4 parallel workers, all requests should complete in around 2 seconds
        // Adding some buffer for overhead
        assert.ok(totalTime <= 3000, `Expected at most 3 seconds, got ${totalTime}ms`);
        console.log(`Multi-threaded execution took ${totalTime}ms`);
    });

    test('External Process Executor - Parallel Processing', async () => {
        const executor = new ExternalProcessExecutor(4); // 4 workers
        const startTime = Date.now();

        // Create 4 requests
        const requests = [
            new AdditionRequest(1, 2),
            new AdditionRequest(3, 4),
            new AdditionRequest(5, 6),
            new AdditionRequest(7, 8)
        ];

        // Submit all requests first
        const promises = [];
        for (const request of requests) {
            promises.push(executor.processRequest(request));
        }

        // Then wait for all results
        const results = [];
        for (const promise of promises) {
            const result = await promise;
            results.push(result);
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Verify results
        assert.strictEqual(results.length, 4);
        results.forEach((result, index) => {
            assert.strictEqual(result.status, 'completed');
            assert.strictEqual(result.result, requests[index].input1 + requests[index].input2);
        });

        // With 4 parallel workers, all requests should complete in around 2 seconds
        // Adding some buffer for overhead
        assert.ok(totalTime <= 3000, `Expected at most 3 seconds, got ${totalTime}ms`);
        console.log(`External process execution took ${totalTime}ms`);

        // Clean up
        executor.dispose();
    });
}); 