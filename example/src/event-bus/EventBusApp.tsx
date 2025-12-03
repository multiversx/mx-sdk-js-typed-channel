import React from 'react';
import { boolean } from 'yup';
import { TypedChannel } from '@multiversx/typed-channel';
import { UiManager } from './UiManager';
import type { IEventBus } from './EventBus';
import {
  ApproveProtocol,
  ApproveEventsEnum,
  requestResponseMap
} from './ApproveModal/approveModal.types';

let eventBusPromise: Promise<IEventBus> | null = null;

async function mountApprovalModal(): Promise<IEventBus> {
  if (!eventBusPromise) {
    eventBusPromise = UiManager.getInstance().mount();
  }
  return eventBusPromise;
}

function unmountApprovalModal(): void {
  UiManager.getInstance().unmount();
  eventBusPromise = null;
}

export async function openEventBusApproveModal() {
  const eventBus = await mountApprovalModal();

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

  unmountApprovalModal();
  console.log(response.payload);
  return response.payload;
}

export function EventBusApp() {
  return (
    <div className='card'>
      <h1>Approve Modal Demo</h1>
      <p className='read-the-docs'>
        Click the button below to open the approve modal.
      </p>
      <button
        className='modal-button'
        type='button'
        onClick={openEventBusApproveModal}
      >
        Open Approve Modal
      </button>
    </div>
  );
}
