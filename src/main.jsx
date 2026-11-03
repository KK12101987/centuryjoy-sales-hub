import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAntiTamperWatcher } from './utils/integrity.js'

// Initialize Rule 19 continuous integrity check
initAntiTamperWatcher((err) => {
  console.error("Integrity error:", err);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
