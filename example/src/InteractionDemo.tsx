import React, { useEffect, useRef, useState } from 'react';
import { openEventBusApproveModal } from './event-bus/openWebcomponentModal';
import { openBroadcastChannelApproveModal } from './broadcast-channel/BroadcastChannelDemo';
import { openIframeApproveModal } from './iframe-postmessage/openIframeApproveModal';

export function InteractionDemo() {
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleOpenEventBusModal = async () => {
    const result = await openEventBusApproveModal();
    setLastResponse(result === undefined ? null : String(result));
  };

  const handleOpenBroadcastChannelModal = async () => {
    const result = await openBroadcastChannelApproveModal();
    setLastResponse(result === undefined ? null : String(result));
  };

  const handleOpenIframe = async () => {
    const result = await openIframeApproveModal();
    setLastResponse(result === undefined ? null : String(result));
  };

  return (
    <div className='demo-page'>
      <div className='demo-card'>
        <header className='demo-header'>
          <h1 className='demo-title'>Interaction Demo</h1>
        </header>

        <div className='demo-actions'>
          <button
            type='button'
            className='demo-action-button'
            onClick={handleOpenEventBusModal}
          >
            EventBus Modal
          </button>
          <button
            type='button'
            className='demo-action-button'
            onClick={handleOpenBroadcastChannelModal}
          >
            BroadcastChannel Modal
          </button>
          <button
            type='button'
            className='demo-action-button'
            onClick={handleOpenIframe}
          >
            Open Iframe
          </button>
        </div>

        {lastResponse !== null && (
          <p className='demo-last-response'>Last response: {lastResponse}</p>
        )}
      </div>

      <iframe
        title='Approve Modal Iframe'
        className='iframe-frame'
        id='iframe-frame'
      />
    </div>
  );
}
