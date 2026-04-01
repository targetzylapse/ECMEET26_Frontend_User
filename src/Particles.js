import React, { useMemo } from 'react';

export default function Particles() {
  const items = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.8,
      dur: `${Math.random() * 12 + 7}s`,
      delay: `${Math.random() * 10}s`,
    }))
    , []);

  return (
    <div className="particles-layer">
      {items.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          width: p.size,
          height: p.size,
          '--dur': p.dur,
          '--delay': p.delay,
          bottom: '-10px',
        }} />
      ))}
    </div>
  );
}
