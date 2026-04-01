import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/';

  // Landing page has its own built-in topbar
  if (isLanding) return null;

  return (
    <nav className="navbar">
      {/* Logo / Brand */}
      <div
        className="navbar-logo"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(user ? '/dashboard' : '/')}
      >
        ✦ ECMEET'26
      </div>

      {/* Right: User info or nothing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-gold)' }}
                />
              )}
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.05em' }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: '1px solid rgba(201,168,76,0.3)',
                color: 'var(--parchment-dim)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.35rem 0.8rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--gold)'; e.target.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--parchment-dim)'; e.target.style.borderColor = 'rgba(201,168,76,0.3)'; }}
            >
              Exit
            </button>
          </>
        )}
      </div>
    </nav>
  );
}