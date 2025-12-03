import { boolean } from 'yup';
import {
  ApproveEventsEnum,
  ApproveProtocol,
  requestResponseMap
} from '../common/approveModal.types';
import { IframeManager } from './IframeManager';
import { TypedChannel } from '@multiversx/typed-channel';

function mountIframe() {
  return IframeManager.getInstance().mount();
}

async function waitForIframeReady(): Promise<void> {
  const iframe = document.getElementById('iframe-frame') as HTMLIFrameElement;
  if (!iframe || !iframe.contentWindow) return;

  const targetWindow = iframe.contentWindow;

  return new Promise<void>((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.source !== targetWindow) return;
      const data = event.data;
      if (data && data.type === 'IFRAME_READY') {
        window.removeEventListener('message', handler);
        resolve();
      }
    };

    window.addEventListener('message', handler);

    // Timeout after 1 seconds
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve();
    }, 1000);
  });
}

export async function openIframeApproveModal(): Promise<boolean> {
  const events = mountIframe();

  if (!events) return false;

  // Wait for iframe to be ready
  await waitForIframeReady();

  const manager = new TypedChannel<ApproveProtocol>(
    (type, data) => events.publish(type, data),
    (event, callback) => events.subscribe(event, callback),
    requestResponseMap
  );

  const response = await manager.sendMessage({
    type: ApproveEventsEnum.LOGIN_REQUEST,
    payload: 'Sample text',
    validate: (data) => boolean().isValid(data)
  });

  return response.payload;
}
