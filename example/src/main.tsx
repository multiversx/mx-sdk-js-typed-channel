import React from 'react';
import './style.css';
import { WebsiteDemo } from './WebsiteDemo';
import ReactDOM from 'react-dom/client';
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <WebsiteDemo />
    </React.StrictMode>
  );
}
