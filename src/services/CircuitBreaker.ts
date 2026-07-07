// src/services/CircuitBreaker.ts

/**
 * @typedef {Object} BreakerState
 * @property {number} failureCount - Consecutive failures.
 * @property {number} lastFailureTime - Timestamp of last failure.
 * @property {boolean} isOpen - Whether the circuit is open (blocking calls).
 */

/**
 * Circuit Breaker implementation for external API calls (e.g., Anthropic, Supabase).
 * This prevents cascading failures and allows the system to degrade gracefully.
 */
class CircuitBreaker {
    /**
     * @param {number} threshold - Max consecutive failures before opening the circuit.
     * @param {number} resetTimeout - Time in ms the circuit remains open.
     */
    constructor(threshold = 5, resetTimeout = 30000) {
        this.threshold = threshold;
        this.resetTimeout = resetTimeout;
        /** @type {BreakerState} */
        this.state = { failureCount: 0, lastFailureTime: 0, isOpen: false };
    }

    /**
     * Executes a function with circuit breaker logic.
     * @param {function(): Promise<any>} fn - The function to execute (the API call).
     * @returns {Promise<any>} The result of the function.
     * @throws {Error} If the circuit is open.
     */
    async execute(fn) {
        if (this.state.isOpen) {
            const now = Date.now();
            if (now > this.state.lastFailureTime + this.resetTimeout) {
                this.attemptHalfOpen();
            } else {
                throw new Error("CIRCUIT_OPEN_BLOCKED: External service is unavailable. Serving cached response.");
            }
        }

        try {
            const result = await fn();
            this.success();
            return result;
        } catch (error) {
            this.fail();
            throw error;
        }
    }

    success() {
        this.state.failureCount = 0;
        this.state.isOpen = false;
        console.log("CB: Circuit closed successfully.");
    }

    fail() {
        this.state.failureCount++;
        if (this.state.failureCount >= this.threshold) {
            this.state.isOpen = true;
            this.state.lastFailureTime = Date.now();
            console.error("CB: Circuit tripped! Opening circuit.");
        }
    }

    attemptHalfOpen() {
        // In a real system, half-open would allow one test request.
        // For this conceptual model, we reset the state to allow a single attempt.
        this.state.failureCount = 0;
        this.state.isOpen = false;
        console.log("CB: Circuit attempting to reset (Half-Open state).");
    }
}

export const apiCircuitBreaker = new CircuitBreaker();