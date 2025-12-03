import React, { useEffect, useState } from 'react';
import { ApproveEventsEnum } from '../common/approveModal.types';

export const IframeModal = () => {
  const [subtitle, setSubtitle] = useState<string | null>(null);

  const onApprove = () => {
    window.parent.postMessage(
      {
        type: ApproveEventsEnum.LOGIN_RESPONSE,
        payload: true
      },
      '*'
    );
  };

  const onReject = () => {
    window.parent.postMessage(
      {
        type: ApproveEventsEnum.LOGIN_RESPONSE,
        payload: false
      },
      '*'
    );
  };

  useEffect(() => {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    const loginHandler = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case ApproveEventsEnum.LOGIN_REQUEST:
          if (typeof data.payload === 'string') {
            setSubtitle(data.payload);
          }
          break;
      }
    };

    window.addEventListener('message', loginHandler);
    return () => window.removeEventListener('message', loginHandler);
  }, []);

  return (
    <div className='modal-overlay' role='dialog' aria-modal='true'>
      <div className='modal'>
        <h2 className='modal-title'>Approve Modal</h2>
        <p className='modal-subtitle'>{subtitle}</p>
        <div className='modal-actions'>
          <button
            className='modal-button modal-button-approve'
            type='button'
            id='approve-modal-approve'
            onClick={onApprove}
          >
            Approve
          </button>
          <button
            className='modal-button modal-button-reject'
            type='button'
            id='approve-modal-reject'
            onClick={onReject}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
