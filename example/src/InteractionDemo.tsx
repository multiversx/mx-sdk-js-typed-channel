import React, { useEffect, useRef, useState } from 'react';
import { openEventBusApproveModal } from './event-bus/openWebcomponentModal';
import { openBroadcastChannelApproveModal } from './broadcast-channel/BroadcastChannelDemo';
import { IframePortal } from './iframe-postmessage/IframePortal';
import { ApproveEventsEnum } from './common/approveModal.types';

export function InteractionDemo() {
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleOpenEventBusModal = async () => {
    const result = await openEventBusApproveModal();
    setLastResponse(result === undefined ? null : String(result));
  };

  const handleOpenBroadcastChannelModal = async () => {
    const result = await openBroadcastChannelApproveModal();
    setLastResponse(result === undefined ? null : String(result));
  };

  const handleOpenIframe = () => {
    setShowIframe(true);
    setLastResponse(null);
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
  };

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (event.target === event.currentTarget) {
      handleCloseIframe();
    }
  };

  useEffect(() => {
    if (!showIframe) return;

    const handleReady = (event: MessageEvent) => {
      if (event.data && event.data.type === 'IFRAME_READY') {
        window.postMessage(
          { type: ApproveEventsEnum.LOGIN_REQUEST, payload: 'Sample text' },
          '*'
        );
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseIframe();
      }
    };

    window.addEventListener('message', handleReady);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleReady);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIframe]);

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

      {showIframe && (
        <div className='iframe-overlay' onClick={handleOverlayClick}>
          <div className='iframe-stack'>
            <div className='iframe-window'>
              <button
                type='button'
                className='iframe-close-button'
                aria-label='Close iframe'
                onClick={handleCloseIframe}
              >
                ×
              </button>
              <iframe
                title='Approve Modal Iframe'
                className='iframe-frame'
                ref={iframeRef}
              />
              <IframePortal iframeRef={iframeRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
