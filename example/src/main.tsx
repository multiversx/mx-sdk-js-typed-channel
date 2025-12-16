import React from 'react';
import './style.css';
import { InteractionDemo } from './InteractionDemo';
import ReactDOM from 'react-dom/client';
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<InteractionDemo />);
}
