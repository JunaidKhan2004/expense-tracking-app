import { Transaction } from '../types';

type EventMap = {
  'transaction:added': Transaction;
  'transaction:deleted': { id: string; walletId: string; amount: number; type: 'income' | 'expense' };
};

type Handler<T> = (payload: T) => void | Promise<void>;

class StoreEventBus {
  private listeners = new Map<string, Set<Handler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    handlers.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        console.error(`[StoreEventBus] Error in handler for "${event}":`, err);
      }
    });
  }
}

export const storeEvents = new StoreEventBus();
