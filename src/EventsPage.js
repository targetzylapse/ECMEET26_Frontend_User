import React, { useContext, useState } from 'react';
import { AuthContext, ToastContext } from './App';
import { useData } from './DataContext';
import { eventsAPI } from './api';
import { TEAMS } from './config';

export default function EventsPage() {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { events, registrations: regs, refreshData } = useData();
  const teamInfo = user?.team ? TEAMS[user.team] : null;
  const hc = teamInfo?.colors.secondary || 'var(--gold)';

  const [selected, setSelected] = useState(null); // event for form
  const [rulesEv, setRulesEv] = useState(null); // event for rules modal
  const [activeRuleIdx, setActiveRuleIdx] = useState(0);
  const [submitting, setSub] = useState(false);
  const [form, setForm] = useState({ name: '', contactNumber: '' });

  const [fullscreenRule, setFullscreenRule] = useState(null);

  const isReg = id => regs.some(r => r.eventId === id);
  const regCount = regs.length;

  const openForm = ev => {
    setForm({ name: user?.name || '', contactNumber: user?.contactNumber || '' });
    setSelected(ev);
  };

  const submit = async e => {
    e.preventDefault();
    if (!selected) return;
    setSub(true);
    try {
      await eventsAPI.register({ 
        eventId: selected.id, 
        name: user?.name, 
        contactNumber: form.contactNumber, 
        profilePicture: user?.profilePicture 
      });
      // Refresh global data after registration
      await refreshData(true);
      setSelected(null);
      showToast(`Registered for ${selected.name}!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally { setSub(false); }
  };

  return (
    <>
      <div className="page-content">

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.25em', color: `${hc}80`, textTransform: 'uppercase', marginBottom: '0.3rem' }}>ECMEET'26</p>
          <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 'clamp(1.4rem,3.5vw,2.2rem)', color: hc, textShadow: `0 0 20px ${hc}40`, marginBottom: '0.5rem' }}>
            Event Spellbook
          </h1>
          <div className="gold-rule" style={{ margin: '0.75rem 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--parchment-dim)', fontSize: '0.92rem' }}>
              Choose your magical challenges wisely.
            </p>
            <span style={{
              fontFamily: 'Cinzel,serif', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: regCount >= 3 ? '#ff8080' : hc,
              border: `1px solid ${regCount >= 3 ? 'rgba(220,80,80,0.4)' : `${hc}40`}`,
              padding: '0.2rem 0.65rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: regCount >= 3 ? 'rgba(220,80,80,0.08)' : `${hc}08`,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.82rem' }}>{regCount >= 3 ? 'block' : 'how_to_reg'}</span>
              {regCount}/3 Registered
            </span>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '1.25rem' }}>
          {events.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              registered={isReg(ev.id)}
              canReg={regCount < 3 && !isReg(ev.id)}
              regOpen={ev.registrationOpen !== false}
              hc={hc}
              onRegister={() => openForm(ev)}
              onRules={() => { setRulesEv(ev); setActiveRuleIdx(0); }}
            />
          ))}
          {events.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--parchment-dim)', fontStyle: 'italic' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', opacity: 0.3, display: 'block', marginBottom: '0.75rem' }}>auto_awesome</span>
              Events are being conjured by the faculty wizards…
            </div>
          )}
        </div>
      </div>

      {/* ── Registration Form Modal ───────────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: `${hc}80`, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Register for</p>
            <h2 style={{ fontFamily: 'Cinzel Decorative,serif', color: hc, fontSize: '1.3rem', marginBottom: '0.25rem' }}>{selected.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--parchment-dim)', marginBottom: '1.25rem' }}>{selected.description}</p>
            <div className="gold-rule" />

            <form onSubmit={submit} style={{ marginTop: '1.25rem' }}>
              {/* Avatar preview */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                {user?.profilePicture && (
                  <img src={user.profilePicture} alt="" style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid ${hc}`, boxShadow: `0 0 12px ${hc}40` }} />
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="hp-label">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', marginRight: 4 }}>person</span>
                  Full Name
                </label>
                <input className="hp-input" type="text" readOnly value={user?.name || '—'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="hp-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', marginRight: 4 }}>school</span>
                    Department
                  </label>
                  <input className="hp-input" type="text" readOnly value={user?.department || '—'} />
                </div>
                <div>
                  <label className="hp-label">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', marginRight: 4 }}>sort</span>
                    Section
                  </label>
                  <input className="hp-input" type="text" readOnly value={user?.section || '—'} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="hp-label">
                  <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', marginRight: 4 }}>call</span>
                  Contact Number
                </label>
                <input className="hp-input" type="tel" required value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="10-digit number" />
              </div>



              <button type="submit" className="btn-hp btn-hp-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ animation: submitting ? 'spin 1s linear infinite' : 'none' }}>
                  {submitting ? 'progress_activity' : 'how_to_reg'}
                </span>
                {submitting ? 'Casting Spell…' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Rules Modal ──────────────────────────────────────────────── */}
      {rulesEv && (
        <div className="modal-overlay" onClick={() => setRulesEv(null)}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRulesEv(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: `${hc}80`, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Event Details</p>
            <h2 style={{ fontFamily: 'Cinzel Decorative,serif', color: hc, fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="material-symbols-outlined">gavel</span>
              {rulesEv.name}
            </h2>

            {/* Coordinator Info Pill */}
            {rulesEv.coordinator && (
              <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(8,10,16,0.6)', border: `1px solid ${hc}30`, borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hc }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person_pin</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.6rem', letterSpacing: '0.12em', color: hc, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Coordinator</p>
                    <p style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>{rulesEv.coordinator.name}</p>
                  </div>
                </div>
                <a href={`tel:${rulesEv.coordinator.contact}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.85rem', borderRadius: '20px', color: hc, fontSize: '0.82rem', border: `1px solid ${hc}40`, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span>
                  {rulesEv.coordinator.contact}
                </a>
              </div>
            )}

            <div className="gold-rule" style={{ marginBottom: '1.25rem' }} />

            {/* Rules Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rulesEv.rules?.length > 0 ? (
                <>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {rulesEv.rules.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveRuleIdx(i)}
                        style={{
                          background: activeRuleIdx === i ? hc : 'transparent',
                          color: activeRuleIdx === i ? '#000' : hc,
                          border: `1px solid ${hc}`,
                          padding: '0.25rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.65rem',
                          fontFamily: 'Cinzel,serif',
                          cursor: 'pointer',
                          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                          boxShadow: activeRuleIdx === i ? `0 0 15px ${hc}40` : 'none'
                        }}
                      >
                        {rulesEv.rules.length > 1 ? `Page ${i + 1}` : 'Rules'}
                      </button>
                    ))}
                  </div>

                  {/* Rule Image Thumbnails as Pills */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {rulesEv.rules.map((rule, i) => (
                      <div
                        key={i}
                        onClick={() => setFullscreenRule(rule)}
                        style={{
                          width: 72,
                          height: 90,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: `1px solid ${hc}40`,
                          cursor: 'zoom-in',
                          position: 'relative',
                          flexShrink: 0,
                          boxShadow: `0 2px 12px rgba(0,0,0,0.4)`,
                          transition: 'border-color 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = hc; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${hc}40`; e.currentTarget.style.transform = 'scale(1)'; }}
                        title={`View Page ${i + 1}`}
                      >
                        <img
                          src={`/assets/images/rules/${rule}`}
                          alt={`Rule ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', opacity: 0.8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: hc, display: 'block', marginBottom: '1rem', opacity: 0.4 }}>auto_stories</span>
                  <p style={{ fontFamily: 'Cinzel,serif', fontSize: '1rem', color: 'var(--parchment)', marginBottom: '0.5rem' }}>Rules are being inscribed...</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--parchment-dim)', fontStyle: 'italic' }}>The faculty wizards are still finalizing the competition scrolls. Please check back shortly for full details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ── Fullscreen Rules Viewer ────────────────────────────────── */}
      {fullscreenRule && (
        <div className="fullscreen-img-overlay" onClick={() => setFullscreenRule(null)}>
          <img 
            src={`/assets/images/rules/${fullscreenRule}`} 
            className="fullscreen-img-content"
            alt="Fullscreen Rule"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.classList.toggle('zoomed');
            }}
          />
          <button className="modal-close" style={{ top: '2rem', right: '2rem', color: '#fff' }} onClick={() => setFullscreenRule(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>close</span>
          </button>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

function EventCard({ event, registered, canReg, regOpen, hc, onRegister, onRules }) {
  return (
    <div className="hp-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: registered ? 'default' : 'pointer' }}>

      {/* Rules Info Icon (Top Right) */}
      <span
        className="material-symbols-outlined"
        onClick={(e) => { e.stopPropagation(); onRules(); }}
        style={{
          position: 'absolute', top: '0.82rem', right: '0.82rem',
          fontSize: '1.2rem', color: hc, cursor: 'pointer', opacity: 0.6,
          transition: 'opacity 0.2s', zIndex: 5
        }}
        title="See Rules"
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        info
      </span>

      {registered && (
        <span style={{ position: 'absolute', top: '0.75rem', right: '2.8rem', fontFamily: 'Cinzel,serif', fontSize: '0.58rem', letterSpacing: '0.1em', color: '#80dd80', border: '1px solid rgba(80,200,80,0.35)', padding: '0.15rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.72rem' }}>check_circle</span>
          Registered
        </span>
      )}

      <div>
        <span style={{ fontFamily: 'Cinzel,serif', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: hc, border: `1px solid ${hc}35`, padding: '0.15rem 0.5rem', display: 'inline-block', marginBottom: '0.6rem' }}>
          {event.category}
        </span>
        <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '1rem', color: hc, marginBottom: '0.4rem' }}>{event.name}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--parchment-dim)', lineHeight: 1.55 }}>{event.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--parchment-dim)' }}>
        {event.venue && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: hc, opacity: 0.7 }}>location_on</span>{event.venue}</span>}
        {event.date && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: hc, opacity: 0.7 }}>calendar_month</span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
        {event.time && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: hc, opacity: 0.7 }}>schedule</span>{event.time}</span>}
        {event.teamSize && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: hc, opacity: 0.7 }}>group</span>{event.teamSize} members</span>}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
        {!regOpen ? (
          <button
            className="btn-hp btn-hp-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '0.55rem 1rem', opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--parchment-dim)' }}
            disabled
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>lock</span>
            Registration Closed
          </button>
        ) : (
          <button
            className="btn-hp btn-hp-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.72rem', padding: '0.55rem 1rem' }}
            disabled={registered || !canReg}
            onClick={!registered && canReg ? onRegister : undefined}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>
              {registered ? 'check_circle' : canReg ? 'how_to_reg' : 'block'}
            </span>
            {registered ? 'Registered' : canReg ? 'Register' : 'Limit Reached'}
          </button>
        )}
      </div>
    </div>
  );
}
