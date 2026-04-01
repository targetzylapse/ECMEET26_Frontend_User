import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, ToastContext } from './App';
import { userAPI } from './api';
import { TEAMS } from './config';
import SortingHatModel from './SortingHatModel';
import { getOrCreateCombo, finaliseHouseCombo, getAudio } from './revealCaptions';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Web Audio Context (module-level singleton) ────────────────────────────
// Kept outside the component so it survives re-renders and is shared
// across every audio element we create during the ceremony.
let _audioCtx = null;
let _analyser = null;

function getOrCreateAudioCtx() {
  if (_audioCtx) return { ctx: _audioCtx, analyser: _analyser };

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = ctx.createAnalyser();

  // fftSize 512 → frequencyBinCount 256; good resolution for speech (≈86 Hz/bin at 44 kHz)
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.78; // built-in smoothing before we read
  analyser.minDecibels = -80;
  analyser.maxDecibels = -10;

  // analyser → speakers (the analyser is just a tap — it doesn't change the audio)
  analyser.connect(ctx.destination);

  _audioCtx = ctx;
  _analyser = analyser;
  return { ctx, analyser };
}

/**
 * Connects an HTMLAudioElement into the shared Web Audio graph so the
 * AnalyserNode can read its frequency data in real time.
 * Each Audio() element must only be connected once.
 */
function connectToAnalyser(audio, ctx, analyser) {
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const src = ctx.createMediaElementSource(audio);
    // audio → analyser → destination
    src.connect(analyser);
  } catch (err) {
    // "HTMLMediaElement already connected" — safe to ignore
    console.warn('[LipSync] connect:', err.message);
  }
}

/**
 * Plays one audio file, wires it through the analyser for lip sync,
 * and calls setTalking(true/false) around the playback.
 */
function playAudioAsync(file, setTalking, ctx, analyser, audioRef, resolveRef) {
  return new Promise(resolve => {
    const audio = new Audio(`/assets/audio/${file}`);
    audio.volume = 0.85;
    if (audioRef) audioRef.current = audio;
    if (resolveRef) resolveRef.current = resolve;

    const done = () => {
      if (setTalking) setTalking(false);
      if (resolveRef) resolveRef.current = null;
      resolve();
    };

    audio.onended = done;
    audio.onerror = done;

    // Connect BEFORE play() so the analyser is ready from the first sample
    if (ctx && analyser) connectToAnalyser(audio, ctx, analyser);

    if (setTalking) setTalking(true);
    audio.play().catch(() => done());
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RevealPage() {
  const { user, updateUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [step, setStep] = useState('idle');
  const [team, setTeam] = useState(user?.team || null);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [showRevealText, setShowRevealText] = useState(false);
  const [comboRef] = useState(() => ({ current: null }));

  const currentAudioRef = useRef(null);
  const resolvePlayRef = useRef(null);
  const skipRef = useRef(false);

  // ── Stable ref to the AnalyserNode — passed directly to the hat ──────────
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const teamInfo = team ? TEAMS[team] : null;
  const hc = teamInfo?.colors?.secondary || '#c9a84c';
  const hp = teamInfo?.colors?.primary || '#1a1a1a';

  useEffect(() => {
    if (user?.team) setTeam(user.team);
  }, [user?.team]);

  useEffect(() => {
    if (user?.email) {
      // Use existing sorting combo from backend if available
      if (user.sortingCombo && user.sortingCombo.idleIdx !== undefined) {
        comboRef.current = user.sortingCombo;
      } else {
        comboRef.current = getOrCreateCombo(user.email, user.team || null);
      }
    }
  }, [user?.email, user?.sortingCombo]);

  const showCaption = useCallback((stepName, house = null) => {
    const combo = comboRef.current;
    if (!combo) return;
    const entry = getAudio(stepName === 'reveal' ? 'house' : stepName, combo, house || team);
    if (entry) setCaption(entry.caption);
  }, [team]);

  // ── Initialise Web Audio on the first user-gesture (button click) ─────────
  const initAudio = () => {
    if (audioCtxRef.current) return; // already done
    const { ctx, analyser } = getOrCreateAudioCtx();
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
  };

  // ── Convenience wrapper ───────────────────────────────────────────────────
  const play = (file) =>
    playAudioAsync(file, setIsTalking, audioCtxRef.current, analyserRef.current, currentAudioRef, resolvePlayRef);

  useEffect(() => {
    return () => {
      // Stop any playing audio on unmount
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = ""; // Release resources
        currentAudioRef.current = null;
      }
      // Resolve pending play promises
      if (typeof resolvePlayRef.current === 'function') {
        resolvePlayRef.current();
        resolvePlayRef.current = null;
      }
    };
  }, []);

  const triggerRevealNow = () => {
    if (!busy || !isBefore) return;
    skipRef.current = true;
    currentAudioRef.current?.pause();
    resolvePlayRef.current?.();
  };

  const startReveal = async () => {
    if (busy) return;

    // MUST happen synchronously inside the click handler (user-gesture requirement)
    initAudio();
    skipRef.current = false;

    setBusy(true);
    setCaption('');
    setShowRevealText(false);

    if (!comboRef.current && user?.email) {
      comboRef.current = getOrCreateCombo(user.email, user.team || null);
    }
    const combo = comboRef.current || {};

    try {
      // ── IDLE ───────────────────────────────────────────────────────────
      const idleAudio = getAudio('idle', combo, null);
      if (idleAudio) {
        setCaption(idleAudio.caption);
        await play(idleAudio.file);
      }
      if (skipRef.current) throw new Error('SKIP');
      await sleep(300);

      // ── THINKING ───────────────────────────────────────────────────────
      setStep('thinking');
      const thinkAudio = getAudio('thinking', combo, null);
      if (thinkAudio) {
        setCaption(thinkAudio.caption);
        await play(thinkAudio.file);
      } else {
        await sleep(2000);
      }
      if (skipRef.current) throw new Error('SKIP');
      await sleep(200);
      if (skipRef.current) throw new Error('SKIP');

      // ── READING ────────────────────────────────────────────────────────
      setStep('reading');
      const readAudio = getAudio('reading', combo, null);
      if (readAudio) {
        setCaption(readAudio.caption);
        await play(readAudio.file);
      } else {
        await sleep(2000);
      }
      if (skipRef.current) throw new Error('SKIP');
      await sleep(200);
      if (skipRef.current) throw new Error('SKIP');

      // ── CHOSEN ─────────────────────────────────────────────────────────
      setStep('chosen');
      const chosenAudio = getAudio('chosen', combo, null);
      if (chosenAudio) {
        setCaption(chosenAudio.caption);
        await play(chosenAudio.file);
      } else {
        await sleep(900);
      }
      if (skipRef.current) throw new Error('SKIP');
      await sleep(300);
    } catch (err) {
      if (err.message !== 'SKIP') throw err;
    }

    try {
      // ── API CALL (If we reached here, even via skip, we MUST get the house) ──
      // Send the generated/cached combo to the backend so it's persisted permanently
      const r = await userAPI.revealHouse({ sortingCombo: comboRef.current });
      const revealedTeam = r.data.team;
      const savedCombo = r.data.sortingCombo;

      if (!revealedTeam || !TEAMS[revealedTeam]) {
        showToast(`No team assigned (got: "${revealedTeam}"). Contact admin.`, 'error');
        setStep('idle');
        setCaption('');
        setBusy(false);
        return;
      }

      if (savedCombo) {
        comboRef.current = savedCombo;
      } else {
        comboRef.current = finaliseHouseCombo(user.email, revealedTeam);
      }
      setTeam(revealedTeam);
      await sleep(80);

      // ── REVEALED ───────────────────────────────────────────────────────
      setStep('revealed');

      const houseAudio = getAudio('house', comboRef.current, revealedTeam);
      if (houseAudio) {
        setCaption(houseAudio.caption);

        // Build the Audio element separately so we can connect it
        // to the analyser AND control timing (show reveal text 2s before end)
        const audio = new Audio(`/assets/audio/${houseAudio.file}`);
        audio.volume = 0.85;

        // Wire into Web Audio for lip sync
        if (audioCtxRef.current && analyserRef.current) {
          connectToAnalyser(audio, audioCtxRef.current, analyserRef.current);
        }

        // Wait for metadata so we know duration
        await new Promise(res => {
          if (audio.readyState >= 1) return res();
          audio.addEventListener('loadedmetadata', res, { once: true });
          audio.addEventListener('error', res, { once: true });
        });

        const dur = isNaN(audio.duration) ? 3 : audio.duration;
        const delayToReveal = Math.max(0, (dur - 2) * 1000);

        setIsTalking(true);
        audio.play().catch(e => console.warn('[RevealPage] Play blocked:', e));
        audio.onended = () => setIsTalking(false);

        await sleep(delayToReveal);
        setShowRevealText(true);
        updateUser({
          houseRevealed: true,
          team: revealedTeam,
          sortingCombo: comboRef.current
        });
        await sleep(2000);

      } else {
        setCaption(`Better be… ${revealedTeam}!`);
        await sleep(1500);
        setShowRevealText(true);
        updateUser({
          houseRevealed: true,
          team: revealedTeam,
          sortingCombo: comboRef.current
        });
        await sleep(1500);
      }

      await sleep(600);
      setStep('done');
      setCaption('');

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reveal house';
      showToast(msg, 'error');
      setStep('idle');
      setCaption('');
      setShowRevealText(false);
    } finally {
      setBusy(false);
    }
  };

  const replayReveal = () => {
    setCaption('');
    setShowRevealText(false);
    setStep('idle');
  };

  const hatSize = typeof window !== 'undefined'
    ? (window.innerWidth <= 480 ? 320 : window.innerWidth <= 768 ? 420 : 500)
    : 500;
  const isBefore = ['idle', 'thinking', 'reading', 'chosen'].includes(step);

  return (
    <div
      className="page-content reveal-wrapper"
      style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
        background: 'radial-gradient(circle at center, rgba(15,15,15,0) 0%, rgba(5,5,5,0.8) 100%)',
      }}
    >
      <div className={`reveal-main-grid ${step === 'done' ? 'is-done' : ''}`}>
        <div className="reveal-hat-column">
          {/* ── 3D Hat ─────────────────────────────────────────────────────── */}
          {(isBefore || step === 'revealed') && (
            <div style={{ position: 'relative', marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' }}>
              <SortingHatModel
                step={step}
                houseColor={hc}
                size={hatSize}
                isTalking={isTalking}
                analyserRef={analyserRef}   // ← lip sync feed
              />

              <div style={{
                position: 'absolute',
                inset: '-20px',
                borderRadius: '50%',
                zIndex: -1,
                background: `radial-gradient(circle, ${hc}25 0%, transparent 60%)`,
                pointerEvents: 'none',
                animation: step === 'chosen' || step === 'revealed'
                  ? 'glowPulse 0.8s ease-in-out infinite alternate'
                  : 'none',
              }} />
            </div>
          )}
        </div>

        <div className="reveal-content-column" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '550px'
        }}>
          {/* ── User profile (idle only) ────────────────────────────────────── */}
          {step === 'idle' && !busy && (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '2rem',
              animation: 'fadeUp 0.5s ease 0.2s both',
              background: 'rgba(20,20,20,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(201,168,76,0.15)',
              padding: '1.25rem 2rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              textAlign: 'left'
            }}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--gold)', boxShadow: '0 0 16px rgba(201,168,76,0.3)', display: 'block', objectFit: 'cover' }} />
                : <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel,serif', fontSize: '1.6rem', color: 'var(--gold)', background: 'rgba(201,168,76,0.1)', boxShadow: '0 0 16px rgba(201,168,76,0.3)' }}>
                  {user?.name?.[0] || '?'}
                </div>
              }
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: 0, opacity: 0.7 }}>
                  Welcome, Wizard
                </p>
                <p style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--gold-light)', textShadow: '0 2px 8px rgba(0,0,0,0.8)', margin: 0 }}>
                  {user?.name?.split('_')[0] || user?.name}
                </p>
              </div>
            </div>
          )}

          {/* ── Caption ─────────────────────────────────────────────────────── */}
          {caption && (isBefore || step === 'revealed') && (
            <div key={caption} style={{
              width: '100%',
              padding: '0.5rem 1rem',
              margin: '0.5rem auto',
              fontFamily: 'EB Garamond, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: '#e8e6e3',
              lineHeight: 1.6,
              background: 'transparent',
              border: 'none',
              textShadow: '0 4px 16px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
              animation: 'captionFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
              textAlign: 'center',
            }}>
              "{caption}"
            </div>
          )}

          {/* ── Thinking dots & Skip ───────────────────────────────────────── */}
          {(busy && (step === 'thinking' || step === 'reading' || step === 'chosen' || step === 'idle')) && (
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 10px #ffffff, 0 0 20px rgba(255,255,255,0.4)',
                    animation: `particleRise 1.2s ease-in-out ${i * 0.2}s infinite`,
                    opacity: isTalking ? 1 : 0.4,
                    transition: 'opacity 0.3s ease'
                  }} />
                ))}
              </div>

              <button
                onClick={triggerRevealNow}
                className="btn-hp"
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  padding: '0.6rem 1.5rem',
                  opacity: 0.6,
                  animation: 'fadeUp 0.6s ease both'
                }}
              >
                Reveal Now
              </button>
            </div>
          )}

          {/* ── Reveal flash ────────────────────────────────────────────────── */}
          {step === 'revealed' && showRevealText && (
            <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', marginTop: '1rem', width: '100%' }}>
              <h1 style={{
                fontFamily: 'Cinzel Decorative,serif',
                fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
                color: hc,
                textShadow: `0 0 30px ${hc}80, 0 4px 20px rgba(0,0,0,0.8)`,
                animation: 'reveal 0.7s cubic-bezier(0.16,1,0.3,1) both',
                letterSpacing: '0.05em',
                margin: 0,
                wordBreak: 'break-word'
              }}>
                {team?.toUpperCase()}!
              </h1>
            </div>
          )}

          {/* ── Idle button ─────────────────────────────────────────────────── */}
          {step === 'idle' && !busy && (
            <button
              className="btn-hp btn-hp-primary"
              onClick={startReveal}
              disabled={busy}
              style={{ padding: '1rem 2.5rem', fontSize: '0.85rem', letterSpacing: '0.1em', marginTop: '1rem', animation: 'fadeUp 0.5s ease 0.4s both', boxShadow: '0 8px 24px rgba(201,168,76,0.2)' }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>auto_fix_high</span>
              Begin Sorting Ceremony
            </button>
          )}

          {/* ── Done card ───────────────────────────────────────────────────── */}
          {step === 'done' && teamInfo && (
            <div className="reveal-done-card" style={{
              animation: 'fadeUp 0.6s ease both',
              maxWidth: 550,
              width: '100%',
              textAlign: 'center',
              borderColor: `${hc}60`,
              background: `linear-gradient(160deg, rgba(15,15,15,0.98), ${hp}40)`,
              boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px ${hc}30`,
              borderRadius: '24px',
              padding: '3rem 2rem',
              margin: '0 auto',
            }}>
              <img
                src={`/assets/images/logos/${teamInfo.logo}`}
                alt={team}
                style={{
                  width: 110, height: 110, objectFit: 'contain',
                  filter: `drop-shadow(0 0 25px ${hc}80)`,
                  marginBottom: '1rem',
                  animation: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both'
                }}
                onError={e => e.target.style.display = 'none'}
              />
              <h2 className="reveal-done-house" style={{
                fontFamily: 'Cinzel Decorative,serif', color: hc, fontSize: '2rem',
                textShadow: `0 0 20px ${hc}70`, margin: '0 0 0.5rem 0',
                animation: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both'
              }}>
                {team}
              </h2>
              <p style={{ fontFamily: 'Cinzel,serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#ffffff', opacity: 0.8, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {teamInfo.traits}
              </p>

              <div style={{ width: '60px', height: '1px', background: `linear-gradient(90deg, transparent, ${hc}, transparent)`, margin: '0 auto 1.5rem' }} />

              <p style={{ fontStyle: 'italic', color: 'var(--parchment-dim)', maxWidth: 320, margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                "{teamInfo.description}"
              </p>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-hp btn-hp-primary" onClick={() => navigate('/dashboard')} style={{ fontSize: '0.8rem', padding: '0.9rem 2rem', width: '100%' }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>castle</span>
                  Enter Castle
                </button>
                <button className="btn-hp" onClick={() => downloadExcel(team)} style={{ fontSize: '0.75rem', flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '6px' }}>group</span>
                  Members
                </button>
                <button className="btn-hp" onClick={replayReveal} style={{ fontSize: '0.75rem', flex: 1 }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '6px' }}>replay</span>
                  Replay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes glowPulse {
          from { opacity:0.3; transform:scale(0.95); }
          to   { opacity:1;   transform:scale(1.05); }
        }
        @keyframes captionFade {
          from { opacity:0; transform:translateY(15px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes reveal {
          from { opacity:0; transform:scale(0.6); letter-spacing:0.6em; filter:blur(10px); }
          60%  { transform:scale(1.05); filter:blur(0px); }
          to   { opacity:1; transform:scale(1);  letter-spacing:0.08em; }
        }
        @keyframes particleRise {
          0%   { transform:translateY(0)   scale(1);   opacity:0.5; }
          50%  { transform:translateY(-8px) scale(1.2); opacity:1;   }
          100% { transform:translateY(0)   scale(1);   opacity:0.5; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .reveal-main-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 100%;
          gap: 2rem;
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .reveal-main-grid {
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            max-width: 1200px;
            margin-top: 6rem; /* Top space for PC */
            padding-left: 40px; /* Sidebar clearance */
          }
          .reveal-hat-column {
            flex: 1;
            display: flex;
            justify-content: flex-end;
            min-width: 0;
            margin-left: 20px; /* Specific push from sidebar */
          }
          .reveal-content-column {
            flex: 1.2;
            display: flex;
            flex-direction: column;
            align-items: flex-start !important;
            text-align: left !important;
            min-width: 0;
            overflow: visible; /* ensure glowing text shows */
          }
          /* Override centered elements for desktop during ceremony */
          .reveal-content-column > div,
          .reveal-content-column > button {
            text-align: left !important;
          }

          /* Final Results: Back to center */
          .reveal-main-grid.is-done {
            flex-direction: column !important;
            margin-top: 1rem !important; /* Increased margin for the final card */
          }
          .reveal-main-grid.is-done .reveal-hat-column {
            display: none !important;
          }
          .reveal-main-grid.is-done .reveal-content-column {
            align-items: center !important;
            text-align: center !important;
            max-width: 100% !important;
          }
          .reveal-main-grid.is-done .reveal-content-column > div {
            text-align: center !important;
          }
          .reveal-done-house {
            font-size: 1.6rem !important; /* Smaller size on PC */
          }
          .reveal-done-card {
            margin-top: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}

const downloadExcel = team => {
  const a = document.createElement('a');
  a.href = `/assets/data/team_${team?.toLowerCase()}.xlsx`;
  a.download = `ECMEET26_${team}_members.xlsx`;
  a.click();
};