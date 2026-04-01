import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import { TEAMS } from './config';

const PAGE_TITLES = {
  '/dashboard': 'Great Hall',
  '/events': 'Event Spellbook',
  '/prelim': 'Preliminary Screening',
  '/reveal': 'Sorting Ceremony',
};

export default function Topbar() {
  const { user, logout, openProfileModal } = useContext(AuthContext);
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const teamInfo = user?.team ? TEAMS[user.team] : null;
  const houseColor = teamInfo?.colors.secondary || 'var(--gold)';
  const title = PAGE_TITLES[pathname] || 'ECMEET\'26';

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile only: brand image */}
        <img
          src="/assets/images/hero_title.png"
          alt="ECMEET'26"
          className="topbar-mobile-brand"
          style={{ height: '46px', width: 'auto', objectFit: 'contain', display: 'none' }}
        />
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right hide-on-pc">
        {user?.houseRevealed && user?.team && pathname !== '/reveal' && (
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: houseColor,
            border: `1px solid ${houseColor}50`,
            padding: '0.2rem 0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: `0 0 10px ${houseColor}20`,
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '2px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>shield</span>
            {user.team}
          </span>
        )}
        {user?.profilePicture && (
          <div style={{ position: 'relative', display: 'flex' }} ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                borderRadius: '50%',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src={user.profilePicture}
                alt=""
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: `1px solid ${houseColor}60`,
                  boxShadow: `0 0 8px ${houseColor}40`,
                  objectFit: 'cover'
                }}
              />
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${houseColor}30`,
                borderRadius: '12px',
                padding: '0.4rem',
                minWidth: '160px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                zIndex: 1000,
                animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.4rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#fff', fontFamily: 'Cinzel, serif', fontWeight: 600 }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'EB Garamond, serif' }}>Wizard</p>
                </div>

                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#ff5555',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    padding: '0.7rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 85, 85, 0.1)';
                    e.currentTarget.style.paddingLeft = '1.1rem';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.paddingLeft = '1rem';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          /* display: block works perfectly here to show the image on mobile */
          .topbar-mobile-brand { display: block !important; }
          .topbar-title { display: none; }
        }
      `}</style>
    </div>
  );
}