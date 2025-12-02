import { TypedChannel } from '../../../src/TypedChannel';
import type { IEventBus } from './EventBus';
import { EventBus } from './EventBus';
import {
  ApproveEventsEnum,
  ApproveProtocol
} from './ApproveModal/approveModal.types';
import { requestResponseMap } from './ApproveModal/approveModal.types';

let eventBusPromise: Promise<IEventBus> | null = null;

async function mountApprovalApp(): Promise<IEventBus> {
  if (!eventBusPromise) {
    eventBusPromise = Promise.resolve(new EventBus());
  }

  return eventBusPromise;
}

function unmountApprovalApp(): void {
  eventBusPromise = null;
}

export async function openApproveModal() {
  const eventBus = await mountApprovalApp();

  const channel = new TypedChannel<ApproveProtocol>(
    (type, data) => eventBus.publish(type as string, data),
    (event, callback) => eventBus.subscribe(event, callback),
    requestResponseMap
  );

  const response = await channel.sendMessage({
    type: ApproveEventsEnum.LOGIN_REQUEST,
    payload: 'TEST',
    validate: async (data) => typeof data === 'boolean'
  });

  unmountApprovalApp();

  return response;
}
