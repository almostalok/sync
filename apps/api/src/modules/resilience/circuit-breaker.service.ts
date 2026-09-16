/**
 * SiteSync Circuit Breaker Service (Master Prompt 12 Section 45)
 *
 * Implements the Circuit Breaker pattern with states CLOSED, OPEN, and HALF_OPEN.
 * Protects downstream services from cascading failure when external AI, speech,
 * or embedding providers become unavailable or timeout.
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // consecutive failures before tripping OPEN
  resetTimeoutMs: number; // time in OPEN before attempting HALF_OPEN
  halfOpenSuccessThreshold: number; // successful calls in HALF_OPEN to transition CLOSED
}

export class CircuitBreakerService {
  private static circuits: Map<
    string,
    {
      state: CircuitState;
      failureCount: number;
      successCount: number;
      lastFailureTime: number;
      config: CircuitBreakerConfig;
    }
  > = new Map();

  private static readonly DEFAULT_CONFIG: CircuitBreakerConfig = {
    failureThreshold: 3,
    resetTimeoutMs: 5000,
    halfOpenSuccessThreshold: 2,
  };

  /**
   * Executes an operation protected by the circuit breaker.
   * If OPEN, immediately invokes fallback without stressing the failing provider.
   */
  public async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback: (error?: Error) => Promise<T> | T,
    customConfig?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(serviceName, customConfig);
    const now = Date.now();

    // Check if OPEN circuit has timed out and can transition to HALF_OPEN
    if (circuit.state === CircuitState.OPEN) {
      if (now - circuit.lastFailureTime >= circuit.config.resetTimeoutMs) {
        circuit.state = CircuitState.HALF_OPEN;
        circuit.successCount = 0;
      } else {
        // Fast-fail while OPEN
        return fallback(new Error(`CircuitBreaker[${serviceName}] is OPEN. Fast-failing to fallback.`));
      }
    }

    try {
      const result = await operation();
      this.onSuccess(serviceName);
      return result;
    } catch (err: any) {
      this.onFailure(serviceName);
      return fallback(err);
    }
  }

  public getState(serviceName: string): CircuitState {
    const circuit = CircuitBreakerService.circuits.get(serviceName);
    return circuit ? circuit.state : CircuitState.CLOSED;
  }

  private onSuccess(serviceName: string): void {
    const circuit = CircuitBreakerService.circuits.get(serviceName);
    if (!circuit) return;

    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.successCount++;
      if (circuit.successCount >= circuit.config.halfOpenSuccessThreshold) {
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
        circuit.successCount = 0;
      }
    } else if (circuit.state === CircuitState.CLOSED) {
      circuit.failureCount = 0;
    }
  }

  private onFailure(serviceName: string): void {
    const circuit = CircuitBreakerService.circuits.get(serviceName);
    if (!circuit) return;

    circuit.lastFailureTime = Date.now();
    circuit.failureCount++;

    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.state = CircuitState.OPEN;
    } else if (circuit.failureCount >= circuit.config.failureThreshold) {
      circuit.state = CircuitState.OPEN;
    }
  }

  private getOrCreateCircuit(serviceName: string, customConfig?: Partial<CircuitBreakerConfig>) {
    let circuit = CircuitBreakerService.circuits.get(serviceName);
    if (!circuit) {
      circuit = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        config: { ...CircuitBreakerService.DEFAULT_CONFIG, ...customConfig },
      };
      CircuitBreakerService.circuits.set(serviceName, circuit);
    }
    return circuit;
  }

  public static reset(serviceName?: string): void {
    if (serviceName) {
      CircuitBreakerService.circuits.delete(serviceName);
    } else {
      CircuitBreakerService.circuits.clear();
    }
  }
}
