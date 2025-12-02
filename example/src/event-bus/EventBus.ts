export type EventCallback = (payload: unknown) => void;

export interface IEventBus {
  publish<T>(type: string, payload: T): void;
  subscribe(type: string, callback: EventCallback): () => void;
}

export class EventBus implements IEventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  publish<T>(type: string, payload: T): void {
    const callbacks = this.listeners.get(type);
    if (!callbacks) {
      return;
    }

    for (const cb of callbacks) {
      cb(payload);
    }
  }

  subscribe(type: string, callback: EventCallback): () => void {
    const existing = this.listeners.get(type);
    if (existing) {
      existing.add(callback);
    } else {
      this.listeners.set(type, new Set([callback]));
    }

    return () => {
      const set = this.listeners.get(type);
      if (!set) {
        return;
      }

      set.delete(callback);

      if (set.size === 0) {
        this.listeners.delete(type);
      }
    };
  }
}
