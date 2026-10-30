import React from 'react';

const typeIcons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Xabarnomalar">
      {toasts.map((toast, index) => (
        <div
          className={`toast-item toast-${toast.type || 'info'}`}
          key={toast.id}
          style={{ animationDelay: `${index * 60}ms` }}
          role="status"
        >
          <span className="toast-icon">{typeIcons[toast.type] || typeIcons.info}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-dismiss"
            aria-label="Yopish"
            onClick={() => onDismiss?.(toast.id)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
