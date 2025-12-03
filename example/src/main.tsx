import React from 'react';
import './style.css';
import { EventBusApp } from './event-bus/EventBusApp';
import ReactDOM from 'react-dom/client';
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <EventBusApp />
    </React.StrictMode>
  );
}
