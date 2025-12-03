import React, { useEffect, useRef, useState } from 'react';
import { openEventBusApproveModal } from './event-bus/openWebcomponentModal';
import { openBroadcastChannelApproveModal } from './broadcast-channel/BroadcastChannelDemo';
import { openIframeApproveModal } from './iframe-postmessage/openIframeApproveModal';

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

  const handleOpenIframe = async () => {
    setShowIframe(true);

    // Wait for React to render the iframe
    await new Promise<void>((resolve) => {
      const checkIframe = () => {
        const iframe = document.getElementById(
          'iframe-frame'
        ) as HTMLIFrameElement | null;
        if (iframe && iframe.contentWindow) {
          resolve();
        } else {
          requestAnimationFrame(checkIframe);
        }
      };
      requestAnimationFrame(checkIframe);
    });

    try {
      const result = await openIframeApproveModal();
      setLastResponse(result === undefined ? null : String(result));
    } catch (e) {
      console.error('Iframe flow failed', e);
    } finally {
      setShowIframe(false);
    }
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseIframe();
    }
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
                id='iframe-frame'
                ref={iframeRef}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
