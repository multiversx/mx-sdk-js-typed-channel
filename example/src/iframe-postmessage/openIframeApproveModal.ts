import { boolean } from 'yup';
import { TypedChannel } from '@multiversx/typed-channel';
import {
  ApproveEventsEnum,
  ApproveProtocol,
  requestResponseMap
} from '../common/approveModal.types';
import { IframeManager } from './IframeManager';

async function handshake(): Promise<boolean> {
  let isHandshake = false;
  const iframe = document.getElementById('iframe-frame') as HTMLIFrameElement;

  if (!iframe || !iframe.contentWindow) {
    return false;
  }

  if (isHandshake) {
    // use the cached value for multiple messages
    return true;
  }

  const targetWindow = iframe.contentWindow;

  return new Promise<boolean>((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.source !== targetWindow) {
        return resolve(false);
      }

      const data = event.data;

      if (data && data.type === 'HANDSHAKE_RESPONSE') {
        isHandshake = true;
        window.removeEventListener('message', handler);
        resolve(true);
      }
    };

    window.addEventListener('message', handler);

    // Timeout after 1 second
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(false);
    }, 1000);
  });
}

export async function openIframeApproveModal(): Promise<boolean> {
  const events = IframeManager.getInstance().mount();

  if (!events) {
    return false;
  }

  const manager = new TypedChannel<ApproveProtocol>(
    (type, data) => events.publish(type, data),
    (event, callback) => events.subscribe(event, callback),
    requestResponseMap
  );

  manager.handshake = handshake;

  const response = await manager.sendMessage({
    type: ApproveEventsEnum.LOGIN_REQUEST,
    payload: 'Sample text',
    validate: (data) => boolean().isValid(data)
  });

  IframeManager.getInstance().unmount();

  return response.payload;
}
