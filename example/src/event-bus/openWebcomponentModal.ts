import { boolean } from 'yup';
import { TypedChannel } from '@multiversx/typed-channel';
import { UiManager } from './UiManager';
import type { IEventBus } from './EventBus';
import {
  ApproveProtocol,
  ApproveEventsEnum,
  requestResponseMap
} from '../common/approveModal.types';

export async function openEventBusApproveModal() {
  const eventBus = await UiManager.getInstance().mount();

  const manager = new TypedChannel<ApproveProtocol>(
    (type, data) => eventBus.publish(type, data),
    (event, callback) => eventBus.subscribe(event, callback),
    requestResponseMap
  );

  const response = await manager.sendMessage({
    type: ApproveEventsEnum.LOGIN_REQUEST,
    payload: 'Sample text',
    validate: (data) => boolean().isValid(data)
  });

  UiManager.getInstance().unmount();
  return response.payload;
}
