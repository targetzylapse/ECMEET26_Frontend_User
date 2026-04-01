import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import { TEAMS } from './config';

const NAV = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/events', icon: 'auto_awesome', label: 'Events' },
  { path: '/prelim', icon: 'description', label: 'Screening' },
];

const HOUSE_SVG = {
  Gryffindor: 'gryffindor.svg',
  Hufflepuff: 'hufflepuff.svg',
  Ravenclaw: 'ravenclaw.svg',
  Slytherin: 'slytherin.svg',
};

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRevealed = user?.houseRevealed && user?.team;
  const teamInfo = isRevealed ? TEAMS[user.team] : null;
  const hc = teamInfo?.colors.secondary || '#c9a84c';
  const hp = teamInfo?.colors.primary || '#0a0c14';
  const houseSvg = isRevealed ? HOUSE_SVG[user.team] : null;
  const teamLogo = isRevealed ? teamInfo?.logo : null;

  return (
    <aside className="sidebar">

      {/* ── Brand ─────────────────────────────────── */}
      <div style={{
        padding: '1rem 1.25rem 0.75rem',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <img
          src="/assets/images/hero_title.png"
          alt="ECMEET'26"
          style={{
            width: '85%',
            height: 'auto',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 14px ${hc}80)`,
          }}
        />
      </div>

      {/* ── User Profile Card ─────────────────────── */}
      {user && (
        <div style={{
          margin: '1rem 0.85rem',
          padding: '1rem',
          borderRadius: 10,
          background: `linear-gradient(160deg, rgba(8,10,18,0.95) 0%, ${hp}40 100%)`,
          border: `1px solid ${hc}35`,
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* House SVG — large, centered, faded background */}
          {houseSvg && (
            <img
              src={`/assets/homeimages/${houseSvg}`}
              alt=""
              style={{
                position: 'absolute',
                top: '50%',
                left: '80%',
                transform: 'translate(-50%, -50%)',
                width: 130,
                height: 130,
                opacity: 0.03,
                filter: `brightness(2) sepia(1) saturate(3) hue-rotate(0deg)`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
            <div style={{
              flexShrink: 0,
              padding: 2,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${hc}, ${hc}50)`,
              boxShadow: `0 0 14px ${hc}55`,
            }}>
              {user.profilePicture
                ? <img
                  src={user.profilePicture}
                  alt=""
                  style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
                : <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'rgba(8,10,16,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel Decorative, serif', fontSize: '1.2rem', color: hc,
                }}>
                  {user.name?.[0]}
                </div>
              }
            </div>

            {/* Name + house badge */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.78rem',
                color: '#f0e0bc',
                letterSpacing: '0.04em',
                marginBottom: '0.25rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: `0 0 10px ${hc}40`,
              }}>
                {user.name}
              </p>

              {isRevealed && pathname !== '/reveal'
                ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: hc,
                    border: `1px solid ${hc}55`,
                    padding: '0.1rem 0.45rem',
                    borderRadius: 2,
                    display: 'inline-block',
                    textShadow: `0 0 8px ${hc}70`,
                  }}>
                    {user.team}
                  </span>
                </div>
                : <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(238,223,160,0.35)',
                }}>
                  Wizard
                </span>
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────── */}
      <nav className="sidebar-nav" style={{ padding: '0.25rem 0' }}>
        <div className="sidebar-nav-label" style={{ padding: '0.4rem 1.1rem 0.5rem' }}>
          Navigation
        </div>

        {NAV.map(n => {
          const isActive = pathname === n.path;
          const disabled = !user?.houseRevealed && n.path !== '/dashboard';
          return (
            <button
              key={n.path}
              onClick={() => !disabled && navigate(n.path)}
              disabled={disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                width: '100%',
                margin: '0.15rem 0',
                padding: '0.65rem 1.1rem',
                background: isActive ? `linear-gradient(90deg, ${hc}18 0%, transparent 100%)` : 'none',
                border: 'none',
                borderLeft: isActive ? `2px solid ${hc}` : '2px solid transparent',
                color: isActive ? hc : disabled ? 'rgba(238,223,160,0.22)' : 'rgba(238,223,160,0.6)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                textShadow: isActive ? `0 0 12px ${hc}80` : 'none',
                borderRadius: '0 6px 6px 0',
              }}
              onMouseEnter={e => {
                if (!disabled && !isActive) {
                  e.currentTarget.style.color = '#f5d97c';
                  e.currentTarget.style.background = 'rgba(201,168,76,0.07)';
                }
              }}
              onMouseLeave={e => {
                if (!disabled && !isActive) {
                  e.currentTarget.style.color = 'rgba(238,223,160,0.6)';
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.15rem', flexShrink: 0 }}>
                {n.icon}
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {isActive && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: hc,
                  boxShadow: `0 0 8px ${hc}`,
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Brand Logos ─────────────────────────── */}
      <div style={{
        marginTop: 'auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        borderTop: '1px solid rgba(201,168,76,0.08)'
      }}>
        {/* Crescent Logo */}
        <div style={{
          width: 54, height: 54,
          borderRadius: '50%',
          padding: 2,
          background: `linear-gradient(135deg, ${hc}40, transparent)`,
          boxShadow: `0 0 15px ${hc}25`,
        }}>
          <img
            src="/assets/images/crescent_logo.png"
            alt="Crescent University"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', display: 'block' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>

        {/* The "X" */}
        <span style={{
          fontFamily: 'times new roman',
          fontSize: '1.2rem',
          color: 'rgba(201,168,76,0.7)',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textShadow: `0 0 15px ${hc}60`,
          pointerEvents: 'none',
          userSelect: 'none',
          marginTop: '-4px'
        }}>×</span>

        {/* ECMEET Logo */}
        <div style={{
          width: 54, height: 54,
          borderRadius: '50%',
          padding: 2,
          background: `linear-gradient(135deg, ${hc}40, transparent)`,
          boxShadow: `0 0 15px ${hc}25`,
        }}>
          <img
            src="/assets/images/ecmeet_logo.jpeg"
            alt="ECMEET"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      </div>

      {/* ── Sign Out — clean, simple ─────────────── */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid rgba(201,168,76,0.12)',
      }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'rgba(255,140,140,0.5)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '0.4rem 0',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff9090'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,140,140,0.5)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>logout</span>
          Sign Out
        </button>
      </div>

    </aside>
  );
}
