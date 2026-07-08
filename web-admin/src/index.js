import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/pro-admin.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      fontSize: '14px'
    }
  }} />
  </React.StrictMode>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
