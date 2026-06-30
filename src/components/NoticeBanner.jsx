import React from 'react';

export default function NoticeBanner({ type = 'error', title, message, onClose }) {
  const iconMap = {
    error: 'ti-alert-circle',
    success: 'ti-circle-check',
    info: 'ti-info-circle',
  };

  return (
    <div className={`notice-banner ${type}`} role="alert">
      <div className="notice-icon">
        <i className={`ti ${iconMap[type] || iconMap.info}`}></i>
      </div>
      <div className="notice-content">
        {title && <p className="notice-title">{title}</p>}
        {message && <p className="notice-message">{message}</p>}
      </div>
      {onClose && (
        <button type="button" className="notice-close" onClick={onClose} aria-label="Cerrar mensaje">
          <i className="ti ti-x"></i>
        </button>
      )}
    </div>
  );
}
