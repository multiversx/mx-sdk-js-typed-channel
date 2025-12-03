import { createRoot, Root } from 'react-dom/client';
import { IframeModal } from './IframeModal';
import { ApproveEventsEnum } from '../common/approveModal.types';

export class IframeManager {
  private static _instance: IframeManager | null = null;
  private root: Root | null = null;

  static getInstance(): IframeManager {
    if (!IframeManager._instance) {
      IframeManager._instance = new IframeManager();
    }
    return IframeManager._instance;
  }

  mount() {
    const iframe = document.getElementById('iframe-frame') as HTMLIFrameElement;
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

    const rootElement = doc.getElementById('iframe-root');

    if (!rootElement) return null;

    this.root = createRoot(rootElement);
    this.root.render(<IframeModal />);
    const targetWindow = iframe.contentWindow;

    function publish<T>(type: string, payload: T) {
      targetWindow?.postMessage({ type, payload }, '*');
    }

    function subscribe(type: string, callback: (payload: any) => void) {
      const handler = (event: MessageEvent) => {
        if (event.source !== targetWindow) return;
        const data = event.data;
        if (!data || data.type !== type) return;
        callback(data.payload);
      };

      window.addEventListener('message', handler);

      return () => {
        window.removeEventListener('message', handler);
      };
    }

    return { publish, subscribe };
  }

  unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    const iframe = document.getElementById('iframe-frame') as HTMLIFrameElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && doc.body) {
        doc.body.innerHTML = '';
      }
    }
  }
}
