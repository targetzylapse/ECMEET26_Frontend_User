import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './App';
import { useData } from './DataContext';
import { TEAMS } from './config';

const WHATSAPP_LINKS = {
  Gryffindor: 'https://chat.whatsapp.com/CDOV1uULhIr6TTY9utOaME?mode=gi_t',
  Hufflepuff: 'https://chat.whatsapp.com/KNlqEhYNkCH9kjvNgkqymg?mode=gi_t',
  Ravenclaw: 'https://chat.whatsapp.com/LDGCCFzi6Kt5RGsrnQJULW?mode=gi_t',
  Slytherin: 'https://chat.whatsapp.com/Ga0onuQMGloFRcf5n2zrxW?mode=gi_t',
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { registrations, loading } = useData();
  const navigate = useNavigate();
  const teamInfo = user?.team ? TEAMS[user.team] : null;
  const hc = teamInfo?.colors.secondary || 'var(--gold)';
  const hp = teamInfo?.colors.primary || '#1a1a1a';

  if (!user) return null;

  return (
    <div className="page-content">

      {/* ── Profile Hero Card ──────────────────────────────────────────── */}
      <div className="hp-card" style={{
        padding: '1.75rem',
        marginBottom: '1.5rem',
        background: `linear-gradient(135deg, rgba(8,10,16,0.96) 0%, ${hp}22 100%)`,
        borderColor: `${hc}35`,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* House color wash behind */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 100% 50%, ${hp}30, transparent 65%)`, pointerEvents: 'none' }} />

        {/* House SVG Background Emblem */}
        {user.team && (
          <img
            src={`/assets/homeimages/${user.team.toLowerCase()}.svg`}
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              right: '-8%',
              width: '280px',
              height: 'auto',
              opacity: 0.05,
              pointerEvents: 'none',
              transform: 'translateY(-50%) rotate(-12deg)',
              zIndex: 0,
              filter: `drop-shadow(0 0 30px ${hc}40)`,
              maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
            }}
            onError={e => e.target.style.display = 'none'}
          />
        )}

        <div className="profile-hero-content" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
          {/* Avatar */}
          <div className="profile-avatar-wrap" style={{ position: 'relative', flexShrink: 0 }}>
            {user.profilePicture
              ? <img src={user.profilePicture} alt="" style={{ width: 80, height: 80, borderRadius: '50%', border: `2px solid ${hc}`, boxShadow: `0 0 20px ${hc}50` }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', border: `2px solid ${hc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel,serif', fontSize: '2rem', color: hc, background: `${hp}40` }}>
                {user.name?.[0]}
              </div>
            }
          </div>

          {/* Info Container (Added flex column here so we can reorder children on mobile) */}
          <div className="profile-info-container" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p className="info-welcome" style={{ fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.2em', color: `${hc}90`, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Welcome back, wizard
            </p>

            <h2 className="info-name" style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', color: hc, textShadow: `0 0 16px ${hc}50`, marginBottom: '0.4rem', lineHeight: 1.2 }}>
              {user.name}
            </h2>

            <p className="info-email" style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              {user.email}
            </p>

            <div className="profile-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: hc, border: `1px solid ${hc}50`, padding: '0.2rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>shield</span>
                {user.team || 'House Unrevealed'}
              </span>
              {user.rrn && (
                <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--parchment-dim)', border: '1px solid var(--border)', padding: '0.2rem 0.7rem', whiteSpace: 'nowrap' }}>
                  {user.rrn}
                </span>
              )}
            </div>
          </div>

          {/* Team logo large */}
          {teamInfo && (
            <img
              className="team-logo-large"
              src={`/assets/images/logos/${teamInfo.logo}`}
              alt={user.team}
              style={{ width: 'clamp(60px,8vw,90px)', height: 'clamp(60px,8vw,90px)', objectFit: 'contain', opacity: 0.7, filter: `drop-shadow(0 0 12px ${hc}50)`, flexShrink: 0 }}
              onError={e => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Details row */}
        {(user.department || user.section || user.contactNumber) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${hc}20` }}>
            {[
              { icon: 'school', label: 'Department', value: user.department },
              { icon: 'class', label: 'Class', value: user.class },
              { icon: 'sort', label: 'Section', value: user.section },
              { icon: 'call', label: 'Contact', value: user.contactNumber },
            ].filter(f => f.value).map(f => (
              <div key={f.label}>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.58rem', letterSpacing: '0.12em', color: `${hc}80`, textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>{f.icon}</span>
                  {f.label}
                </p>
                <p style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>{f.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <p className="section-title">
        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>auto_awesome</span>
        Quick Actions
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {user.team && WHATSAPP_LINKS[user.team] && (
          <ActionCard
            icon="groups"
            title="House Group"
            desc="Join the communal chat"
            hc={hc}
            isWhatsApp={true}
            onClick={() => window.open(WHATSAPP_LINKS[user.team], '_blank')}
          />
        )}
        <ActionCard
          icon="celebration"
          title="Sorting Ceremony"
          desc={user.houseRevealed ? 'Replay the ceremony' : 'Discover your house'}
          disabled={false}
          hc={hc}
          onClick={() => navigate('/reveal')}
        />
        <ActionCard
          icon="auto_awesome"
          title="Register Event"
          desc={`${registrations.length}/3 events registered`}
          hc={hc}
          badge={registrations.length > 0 ? String(registrations.length) : null}
          onClick={() => navigate('/events')}
        />
        <ActionCard
          icon="description"
          title="Preliminary Screen"
          desc="View screening info"
          hc={hc}
          onClick={() => navigate('/prelim')}
        />
      </div>

      {/* ── House Info ─────────────────────────────────────────────────── */}
      {teamInfo && (
        <div className="hp-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: `${hc}30`, background: `linear-gradient(135deg, rgba(6,8,12,0.9), ${hp}18)` }}>
          <p className="section-title">
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>shield</span>
            House {user.team}
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--parchment-dim)', marginBottom: '0.4rem', fontSize: '1rem' }}>
            "{teamInfo.description}"
          </p>
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.68rem', letterSpacing: '0.12em', color: hc, opacity: 0.8 }}>
            {teamInfo.traits}
          </p>
        </div>
      )}

      {/* ── My Registrations ──────────────────────────────────────────── */}
      {!loading && registrations.length > 0 && (
        <>
          <p className="section-title">
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>how_to_reg</span>
            My Registrations
          </p>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {registrations.map(r => (
              <div key={r._id} className="hp-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ color: hc, fontSize: '1.1rem' }}>auto_awesome</span>
                  <div>
                    <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.82rem', color: 'var(--gold-light)' }}>{r.eventName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--parchment-dim)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#80dd80', border: '1px solid rgba(80,200,80,0.3)', padding: '0.18rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>check_circle</span>
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActionCard({ icon, title, desc, disabled, onClick, hc, badge, isWhatsApp }) {
  return (
    <div
      className="hp-card"
      onClick={!disabled ? onClick : undefined}
      style={{ padding: '1.25rem', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, transition: 'all 0.25s', position: 'relative' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = hc; e.currentTarget.style.transform = disabled ? '' : 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
    >
      {badge && (
        <span style={{ position: 'absolute', top: '0.7rem', right: '0.7rem', background: hc, color: '#000', fontFamily: 'Cinzel,serif', fontSize: '0.62rem', borderRadius: '20px', padding: '0.1rem 0.45rem', fontWeight: 700 }}>
          {badge}
        </span>
      )}

      {isWhatsApp ? (
        <svg viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem', fill: hc, display: 'block', marginBottom: '0.65rem' }}>
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.984-.365-1.747-.762-2.875-2.507-2.961-2.621-.088-.116-.708-.94-.708-1.793 0-.853.444-1.273.604-1.441.159-.168.348-.21.463-.21.117 0 .232.001.334.007.109.004.256-.041.401.31.144.352.493 1.203.536 1.29.044.088.073.19.014.305-.06.115-.088.19-.174.288-.088.101-.188.225-.268.304-.099.098-.202.204-.087.401.115.197.511.84.115 1.025 0 0 .511-1.025.115-1.025.511.921.944 1.218 1.139 1.391.196.174.31.225.426.096.115-.129.493-.573.623-.77.129-.197.26-.168.441-.101.181.067 1.144.536 1.341.634.197.099.328.146.376.228.048.083.048.477-.101.882z" />
        </svg>
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: hc, display: 'block', marginBottom: '0.65rem' }}>{icon}</span>
      )}

      <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.8rem', letterSpacing: '0.08em', color: hc, marginBottom: '0.3rem' }}>{title}</p>
      <p style={{ fontSize: '0.82rem', color: 'var(--parchment-dim)' }}>{desc}</p>
    </div>
  );
}
