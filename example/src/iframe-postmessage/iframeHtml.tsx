import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createApproveTemplate } from '../common/createApproveTemplate';

const IframeApproveModalPage = () => (
  <html lang='en'>
    <head>
      <meta charSet='UTF-8' />
      <title>Approve Modal Iframe</title>
      <link rel='stylesheet' href='/src/style.css' />
    </head>
    <body>
      <div
        dangerouslySetInnerHTML={{
          __html: createApproveTemplate('Sample text')
        }}
      />
    </body>
  </html>
);

export const IFRAME_HTML = `<!DOCTYPE html>${renderToStaticMarkup(
  <IframeApproveModalPage />
)}`;
