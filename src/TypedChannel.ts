import type {
  Protocol,
  RequestPayloadMapOf,
  RequestTypeMapOf,
  ResponsePayloadMapOf
} from './protocol';

export class TypedChannel<P extends Protocol> {
  private activeListeners: Map<string, () => void> = new Map();

  private publish: <T>(type: string, data: T) => void;
  private subscribe: (
    event: string,
    callback: (data?: unknown) => void
  ) => () => void;

  private responseTypeMap: RequestTypeMapOf<P>;

  protected initialized = false;

  constructor(
    publish: <T>(type: string, data: T) => void,
    subscribe: (
      event: string,
      callback: (data?: unknown) => void
    ) => () => void,
    responseTypeMap: RequestTypeMapOf<P>
  ) {
    this.publish = publish;
    this.subscribe = subscribe;
    this.responseTypeMap = responseTypeMap;
  }

  async sendMessage<K extends keyof RequestPayloadMapOf<P>>(params: {
    type: K;
    payload: RequestPayloadMapOf<P>[K];
    validate?: (
      data: ResponsePayloadMapOf<P>[RequestTypeMapOf<P>[K]]
    ) => Promise<boolean>;
  }): Promise<{
    type: RequestTypeMapOf<P>[K];
    payload: ResponsePayloadMapOf<P>[RequestTypeMapOf<P>[K]];
  }> {
    await this.handshake();

    this.publish(params.type as string, params.payload);

    const responseType = this.responseTypeMap[params.type];
    const data = await this.listenOnce(responseType);

    await params.validate?.(data.payload);

    return data;
  }

  private async listenOnce<K extends string>(
    action: K
  ): Promise<{ type: K; payload: unknown }> {
    return new Promise((resolve) => {
      const existingUnsubscribe = this.activeListeners.get(action);
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      const unsubscribe = this.subscribe(action, (payload) => {
        this.activeListeners.delete(action);
        unsubscribe();

        resolve({
          type: action,
          payload
        });
      });

      this.activeListeners.set(action, unsubscribe);
    });
  }

  async handshake(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    this.initialized = true;
    return true;
  }

  async closeConnection(): Promise<boolean> {
    this.initialized = false;
    return true;
  }
}
