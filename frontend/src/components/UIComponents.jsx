// Modal/Dialog Component
import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon" onClick={onClose}>
            <CloseIcon width={20} height={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Spinner Component
export const Spinner = ({ size = 'md' }) => (
  <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`}></div>
);

// Alert Component
export const Alert = ({ type = 'info', children, onClose }) => (
  <div className={`alert alert-${type}`}>
    <div style={{ flex: 1 }}>{children}</div>
    {onClose && (
      <button className="btn-icon" onClick={onClose} style={{ marginLeft: 'auto' }}>
        <CloseIcon width={16} height={16} />
      </button>
    )}
  </div>
);
