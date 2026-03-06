/**
 * Domain Event interface.
 * Base shape for all events emitted across bounded contexts.
 */
export interface IDomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}

export abstract class BaseDomainEvent implements IDomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly payload: Record<string, unknown>,
  ) {
    this.occurredAt = new Date();
  }
}
