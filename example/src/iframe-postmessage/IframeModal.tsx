import React, { useEffect, useState } from 'react';

export const IframeModal = () => {
  const [subtitle, setSubtitle] = useState('Sample text');

  const onApprove = () => {
    console.log('Approve');
  };

  const onReject = () => {
    console.log('Reject');
  };

  useEffect(() => {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'IFRAME_SUBTITLE') {
        setSubtitle(data.text);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
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
