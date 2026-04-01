import React from 'react';

export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast ${type}`}>
      <span className="material-symbols-outlined" style={{ fontSize:'1.1rem', flexShrink:0 }}>
        {type === 'success' ? 'check_circle' : 'warning'}
      </span>
      {message}
    </div>
  );
}
