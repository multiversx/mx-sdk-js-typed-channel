import { TypedChannel } from '@multiversx/typed-channel';
import {
  ApproveEventsEnum,
  type ApproveProtocol,
  requestResponseMap
} from '../common/approveModal.types';

type EventCallback = (payload: unknown) => void;

const IFRAME_CHANNEL = 'iframe-approve';

export async function createIframeTypedChannel(
  iframe: HTMLIFrameElement
): Promise<TypedChannel<ApproveProtocol>> {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) {
    throw new Error('Iframe contentWindow is not available');
  }

  let ready = false;
  const subscribers = new Map<ApproveEventsEnum, Set<EventCallback>>();

  const handleMessage = (event: MessageEvent) => {
    if (event.source !== targetWindow) return;
    const data = event.data;
    if (!data || data.channel !== IFRAME_CHANNEL) return;

    if (data.type === 'IFRAME_READY') {
      ready = true;
      return;
    }

    const callbacks = subscribers.get(data.type as ApproveEventsEnum);
    if (!callbacks) return;
    callbacks.forEach((cb) => cb(data.payload));
  };

  window.addEventListener('message', handleMessage);

  const publish = <T>(type: ApproveEventsEnum, payload: T) => {
    targetWindow.postMessage({ channel: IFRAME_CHANNEL, type, payload }, '*');
  };

  const subscribe = (type: ApproveEventsEnum, callback: EventCallback) => {
    const set = subscribers.get(type) ?? new Set<EventCallback>();
    set.add(callback);
    subscribers.set(type, set);

    return () => {
      const current = subscribers.get(type);
      if (!current) return;
      current.delete(callback);
      if (current.size === 0) {
        subscribers.delete(type);
      }
    };
  };

  // Wait once for IFRAME_READY before returning the channel
  if (!ready) {
    await new Promise<void>((resolve) => {
      const once = (event: MessageEvent) => {
        if (event.source !== targetWindow) return;
        const data = event.data;
        if (!data || data.channel !== IFRAME_CHANNEL) return;
        if (data.type === 'IFRAME_READY') {
          ready = true;
          window.removeEventListener('message', once);
          resolve();
        }
      };
      window.addEventListener('message', once);
    });
  }

  const channel = new TypedChannel<ApproveProtocol>(
    (type, data) => publish(type as ApproveEventsEnum, data),
    (event, cb) => subscribe(event as ApproveEventsEnum, cb),
    requestResponseMap
  );

  return channel;
}
