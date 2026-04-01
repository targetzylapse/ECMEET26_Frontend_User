import React from 'react';

/**
 * props:
 * step       — 'idle' | 'thinking' | 'reading' | 'chosen' | 'revealed' | 'done'
 * houseColor — hex string for glow colour (e.g. '#D3A625')
 * size       — display size in px (default 320)
 */
export default function SortingHatModel({ size = 320 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <img
        src="/assets/images/sorting-hat.png"
        alt="Sorting Hat"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}