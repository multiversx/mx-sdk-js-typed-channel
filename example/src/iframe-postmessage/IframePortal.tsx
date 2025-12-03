import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { IframeModal } from './IframeModal';

interface IframePortalProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function IframePortal({ iframeRef }: IframePortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    if (!doc.body || !doc.getElementById('iframe-root')) {
      doc.open();
      doc.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Approve Modal Iframe</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="iframe-root"></div>
  </body>
</html>`);
      doc.close();
    }

    const root = doc.getElementById('iframe-root');
    setContainer(root);
  }, [iframeRef]);

  if (!container) return null;

  return ReactDOM.createPortal(<IframeModal />, container);
}
