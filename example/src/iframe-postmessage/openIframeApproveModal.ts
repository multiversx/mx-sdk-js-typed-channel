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

export async function openIframeApproveModal(): Promise<boolean> {
  const events = mountIframe();

  if (!events) return false;

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
