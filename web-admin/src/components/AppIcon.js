
import React from 'react';

const paths = {
  dashboard: "M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-12h8V3h-8v6Z",
  users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13Z",
  building: "M3 21V3h10v18H3Zm12 0V8h6v13h-6ZM5 5v2h2V5H5Zm4 0v2h2V5H9Zm-4 4v2h2V9H5Zm4 0v2h2V9H9Zm-4 4v2h2v-2H5Zm4 0v2h2v-2H9Zm8-3v2h2v-2h-2Zm0 4v2h2v-2h-2Z",
  calendar: "M7 2v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7Zm12 8H5v10h14V10Z",
  clipboard: "M9 2h6l1 2h3v18H5V4h3l1-2Zm1.2 4-.6-1H7v15h10V5h-2.6l-.6 1h-3.6Z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z",
  megaphone: "M3 10v4h4l10 4V6L7 10H3Zm16-3.5v11l2 .8V5.7l-2 .8ZM7 16v3h2l1-2.2L7 16Z",
  alert: "M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z",
  report: "M5 3h14v18H5V3Zm3 12v3h2v-3H8Zm3-6v9h2V9h-2Zm3 3v6h2v-6h-2Z",
  bell: "M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a2.5 2.5 0 0 0-5 0v.68C6.63 5.36 5 7.92 5 11v5l-2 2v1h18v-1l-2-2Z",
  audit: "M4 3h16v18H4V3Zm3 4h10V5H7v2Zm0 4h10V9H7v2Zm0 4h7v-2H7v2Z",
  shield: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z",
  send: "M2 21 23 12 2 3v7l15 2-15 2v7Z",
  search: "M9.5 3a6.5 6.5 0 0 1 5.15 10.46l4.45 4.44-1.4 1.4-4.44-4.45A6.5 6.5 0 1 1 9.5 3Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  x: "M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z",
  plus: "M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2Z",
  logout: "M10 17v-2h4V9h-4V7h6v10h-6Zm-1-4H2v-2h7V8l4 4-4 4v-3Z",
  note: "M4 4h16v14H7l-3 3V4Zm4 4v2h8V8H8Zm0 4v2h6v-2H8Z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42L18.21 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 2-1.66Z",
 trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z",
};

export default function AppIcon({ name='dashboard', size=20, className='', style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name] || paths.dashboard} />
    </svg>
  );
}
