import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext, ToastContext } from './App';
import { authAPI } from './api';
import { GOOGLE_CLIENT_ID, COLLEGE } from './config';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/* ── GSAP Imports ── */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


/* ── Constants ───────────────────────────────────────────────────────────── */
const CORNERS = {
  topLeft: { img: 'ic_top_left_corner_gryffindor.png', fallback: 'corner_gold_tl.png' },
  topRight: { img: 'ic_top_left_corner_slytherin.png', fallback: 'corner_gold_tr.png' },
  bottomLeft: { img: 'ic_top_left_corner_hufflepuff.png', fallback: 'corner_gold_bl.png' },
  bottomRight: { img: 'ic_top_left_corner_ravenclaw.png', fallback: 'corner_gold_br.png' },
};

const TEAMS = [
  { id: 'gryffindor', logo: 'gryffindor.svg' },
  { id: 'hufflepuff', logo: 'hufflepuff.svg' },
  { id: 'ravenclaw', logo: 'ravenclaw.svg' },
  { id: 'slytherin', logo: 'slytherin.svg' },
];

const FEATURES = [
  {
    id: 'gryffindor',
    title: 'Gryffindor',
    desc: 'Where dwell the brave at heart. Their daring, nerve, and chivalry set Gryffindors apart.',
    logo: 'gryffindor.svg',
    color: 'rgba(238, 223, 160, 0.8)',
    filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(773%) hue-rotate(345deg) brightness(98%) contrast(88%)'
  },
  {
    id: 'hufflepuff',
    title: 'Hufflepuff',
    desc: 'Where they are just and loyal. Those patient Hufflepuffs are true and unafraid of toil.',
    logo: 'hufflepuff.svg',
    color: 'rgba(238, 223, 160, 0.8)',
    filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(773%) hue-rotate(345deg) brightness(98%) contrast(88%)'
  },
  {
    id: 'ravenclaw',
    title: 'Ravenclaw',
    desc: 'Where those of wit and learning, will always find their kind.',
    logo: 'ravenclaw.svg',
    color: 'rgba(238, 223, 160, 0.8)',
    filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(773%) hue-rotate(345deg) brightness(98%) contrast(88%)'
  },
  {
    id: 'slytherin',
    title: 'Slytherin',
    desc: 'Those cunning folks use any means to achieve their ends.',
    logo: 'slytherin.svg',
    color: 'rgba(238, 223, 160, 0.8)',
    filter: 'brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(773%) hue-rotate(345deg) brightness(98%) contrast(88%)'
  },
];


export default function LandingPage() {
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isMobile, setIsMobile] = useState(false);
  const gsiDone = useRef(false);
  const googleBtnRef = useRef(null);

  /* ── GSAP Main Ref ── */
  const mainRef = useRef(null);

  /* ── Detect Mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Custom Cursor Tracking (Global) ── */
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseLeave = () => setMousePos({ x: -100, y: -100 });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile]);

  /* ── Bootstrap Google GSI exactly once ──────────────────────────────────── */
  useEffect(() => {
    if (gsiDone.current) return;
    const boot = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      gsiDone.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        ux_mode: 'popup',
        cancel_on_tap_outside: true,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard', theme: 'outline', size: 'large', width: 280,
        });
      }
    };
    if (window.google) { boot(); }
    else {
      const t = setInterval(() => { if (window.google) { boot(); clearInterval(t); } }, 150);
      return () => clearInterval(t);
    }
  }, []);

  const handleCredential = async (resp) => {
    setSigningIn(true); setError('');
    try {
      const r = await authAPI.googleLogin(resp.credential);
      login(r.data.user, r.data.token);
      showToast(`Welcome, ${r.data.user.name}! ✨`, 'success');
    } catch (e) {
      const errCode = e.response?.data?.error;
      if (errCode === 'NOT_REGISTERED') {
        setError('Your name does not appear in the Book of Admittance. Only registered students of ECMEET\'26 may enter.');
      } else if (errCode === 'ACCESS_DENIED') {
        setError(e.response?.data?.message || 'Access denied. Only authorized accounts may pass.');
      } else {
        setError('Sign in failed. Please try again.');
      }
      setSigningIn(false);
    }
  };

  /* ── High-End GSAP Anti-Gravity Effect ── */
  useEffect(() => {
    // gsap.context safely handles cleanup in React 18+ strict mode
    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray('.anti-gravity');

      elements.forEach((el, index) => {
        // Extract depth data attribute for parallax intensity, fallback to random
        const depth = parseFloat(el.dataset.depth) || (Math.random() * 0.5 + 0.5);
        const direction = index % 2 === 0 ? 1 : -1; // Alternate sway directions

        gsap.to(el, {
          y: () => -150 * depth,             // Float up slightly
          x: () => 15 * depth * direction,   // Gentle sway
          rotation: () => 2 * depth * direction, // Micro rotation
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom", // Start when top of element hits bottom of viewport
            end: "bottom top",   // End when bottom of element hits top of viewport
            scrub: 1.5,          // Smooth catching-up effect (1.5 seconds)
          }
        });
      });
    }, mainRef);

    return () => ctx.revert(); // Cleanup on unmount
  }, []);



  const handleSignIn = () => {
    if (signingIn) return;
    if (!GOOGLE_CLIENT_ID) { setError('Google Client ID not configured.'); return; }
    const realBtn = googleBtnRef.current?.querySelector('div[role=button]');
    if (realBtn) { realBtn.click(); return; }
    window.google?.accounts.id.prompt();
  };

  const CornerImg = ({ slot, className }) => {
    const c = CORNERS[slot];
    return (
      <img
        src={`/assets/images/corners/${c.img}`}
        alt=""
        className={`hp-corner ${className}`}
        onError={e => { e.target.src = `/assets/images/corners/${c.fallback}`; e.onerror = null; }}
      />
    );
  };

  /* ── Background Global Elements ── */
  const FloatingParticles = () => (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${10 + Math.random() * 10}s`
        }} />
      ))}
    </div>
  );

  const handleEmailClick = (e) => {
    e.preventDefault();
    const email = "ecmeet2k26@gmail.com";
    const subject = "Technical Issue - ECMEET'26";
    const body = "Dear ECMEET'26 Team,\n\nI am encountering the following technical issue:\n\n[Describe your issue here]";

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // If mobile, try specific app schemes then fallback to mailto
    if (isMobile) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        // Try Gmail app scheme for iOS
        window.location.href = `googlegmail:///co?to=${email}&subject=${encodedSubject}&body=${encodedBody}`;
        // Fallback to mailto if Gmail app is not installed
        setTimeout(() => {
          window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
        }, 500);
      } else {
        // Android/Other: mailto handles app choice/defaults well
        window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
      }
    } else {
      // Desktop: Open Gmail web compose in new tab
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}&body=${encodedBody}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="landing-layout" ref={mainRef}>
      {/* ── Custom Glowing Wand Cursor (Desktop Only) ── */}
      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            pointerEvents: 'none',
            zIndex: 99999,
            filter: 'drop-shadow(-15px -15px 35px rgba(255, 223, 0, 1)) drop-shadow(-5px -5px 15px rgba(255, 215, 0, 0.8))',
            transition: 'transform 0.05s linear'
          }}
        >
          <img
            src="/assets/magic_stick_cursor.png"
            alt=""
            style={{ width: '32px', height: 'auto', display: mousePos.x > -50 ? 'block' : 'none' }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      )}

      {/* Global Particles */}
      <FloatingParticles />

      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="hero-section">
        {/* Background Elements */}
        <div className={`hero-bg-fallback ${videoReady ? 'hidden' : ''}`} />
        <video
          className={`hero-video ${videoReady ? 'visible' : ''}`}
          autoPlay loop muted playsInline preload="auto"
          onCanPlay={() => setVideoReady(true)}
        >
          <source src="/assets/videos/hogwarts_moonlight.mp4" type="video/mp4" />
          <source src="/assets/videos/hero_video.webm" type="video/webm" />
        </video>
        <div
          className="hero-video-tint"
          style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: isMobile
              ? `radial-gradient(circle 380px at 50% 28%, rgba(0,0,0,0) 5%, rgba(8,10,14,0.85) 65%)`
              : mousePos.x > -50
                ? `radial-gradient(circle 650px at ${mousePos.x}px ${mousePos.y}px, rgba(201, 168, 76, 0.05) 0%, rgba(8, 10, 14, 0.8) 80%)`
                : 'rgba(8, 10, 14, 0.75)',
          }}
        />

        {/* Overlays / Gradients */}
        <div className="hero-overlay-dark" />
        <div className="hero-border-bottom" />
        <CornerImg slot="topLeft" className="corner-tl" />
        <CornerImg slot="topRight" className="corner-tr" />
        <CornerImg slot="bottomLeft" className="corner-bl" />
        <CornerImg slot="bottomRight" className="corner-br" />

        {/* Content - Wrapped in anti-gravity */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="anti-gravity" data-depth="0.4">
            <img
              src="/assets/images/logos/crescent_logo.png"
              alt="Crescent University"
              className="brand-logo"
              onError={e => e.target.style.display = 'none'}
            />
            <p className="subtitle-presents">✦ Crescent University Present ✦</p>

            <div className="title-wrapper">
              <img
                src="/assets/images/hero_hp_title1.png"
                alt="ECMEET'26"
                className="title-image"
                onError={e => {
                  e.target.style.display = 'none';
                  document.getElementById('ecmeet_fallback').style.display = 'block';
                }}
              />
              <h1 id="ecmeet_fallback" className="title-fallback">ECMEET'26</h1>
            </div>

            <p className="tagline">A Technical Symposium of Magic & Mastery</p>

            <div className="divider" style={{ margin: '0 auto' }}>
              <div className="divider-line" />
              <span className="divider-gem">◆</span>
              <div className="divider-line" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="error-alert">
                <span className="material-symbols-outlined icon">warning</span>
                {error}
              </motion.div>
            )}

            <div ref={googleBtnRef} className="hidden-google-btn" />

            <button className="btn-magic-primary" onClick={handleSignIn} disabled={signingIn}>
              <span className="btn-star">✦</span>
              {signingIn ? (
                <>
                  <span className="material-symbols-outlined loading-spinner">auto_awesome</span>
                  <span>Entering Castle...</span>
                </>
              ) : (
                <>
                  <GoogleColorIcon />
                  <span>Enter Portkey</span>
                </>
              )}
              <span className="btn-star">✦</span>
            </button>

            <p className="domain-restriction">
              <span className="material-symbols-outlined icon">lock</span>
              Only authorized students of @{COLLEGE?.allowedDomain || 'crescent.education'} may pass
            </p>

          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES / "Curriculum of Magic"
      ════════════════════════════════════════════════════ */}
      <section className="features-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="anti-gravity" data-depth="0.2">
              <h2 className="section-title">ECMEET HOUSES</h2>
              <div className="divider center">
                <div className="divider-line" />
                <span className="divider-gem">◆</span>
                <div className="divider-line" />
              </div>
            </div>
          </motion.div>

          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                style={{ '--house-color': feature.color, '--house-filter': feature.filter }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Note the custom depth for dynamic parallax rendering */}
                <div className="feature-card anti-gravity" data-depth={0.6 + (i * 0.1)}>
                  <div className="feature-icon-wrapper">
                    <img src={`/assets/homeimages/${feature.logo}`} alt={feature.title} className="house-feature-logo" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CALL TO ACTION / "Sorting Hat"
      ════════════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-ambient-glow" />
        <motion.div
          className="cta-content container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="anti-gravity" data-depth="0.7">
            <img src="/assets/images/logos/mail_icon.png" alt="" className="cta-icon" onError={e => e.target.style.display = 'none'} />
            <h2 className="cta-title">Your Letter Has Arrived</h2>
            <p className="cta-subtitle">The Portkey activates soon. Will you answer the call and claim your destiny?</p>

            <button className="btn-magic-primary large" onClick={handleSignIn}>
              Unlock The Gates
              <ChevronRight className="btn-icon-right" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          MINIMALIST GIANT TYPE FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="footer-section">
        <div className="footer-container anti-gravity" data-depth="0.3">
          {/* Top Row: Houses & Contact */}
          <div className="footer-top">
            <div className="footer-houses-row">
              {TEAMS.map(t => (
                <div key={t.id} className="team-logo-wrap" title={`House ${t.id}`}>
                  <img
                    src={`/assets/homeimages/${t.logo}`}
                    alt={t.id}
                    className="team-logo"
                    onError={e => e.target.style.display = 'none'}
                  />
                </div>
              ))}
            </div>

            <div className="footer-contact-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(238, 223, 160, 0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>For technical issues contact:</span>
                <a
                  href="#"
                  onClick={handleEmailClick}
                >
                  <span className="material-symbols-outlined">mail</span>
                  ecmeet2k26@gmail.com
                </a>
              </div>
            </div>
          </div>


          {/* Bottom Row: Massive Text */}
          <div className="footer-middle">
            <h1 className="footer-giant-text">Ecmeet'26</h1>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════
          STYLESHEET
      ════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        @font-face {
          font-family: 'EB Garamond', serif;
          src: url('/assets/font/HarryBeastDisplay-Regular.woff2') format('woff2');
          font-weight: normal; font-style: normal; font-display: swap;
        }

        /* ── Base Reset & Layout ── */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { 
          margin: 0; padding: 0; 
          background: #080a0e; 
          color: #f8f1e6;     
          font-family: 'EB Garamond', serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .landing-layout { position: relative; overflow-x: hidden; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 10; }

        /* Custom Cursor handling */
        .landing-layout { cursor: none !important; }
        .landing-layout * { cursor: none !important; }
        @media (max-width: 768px) {
          .landing-layout, .landing-layout * { cursor: default !important; }
          a, button, .team-logo-wrap { cursor: pointer !important; }
        }

        /* ── Typography & Globals ── */
        h1, h2, h3, h4, h5, h6 { font-family: 'HarryBeast', 'Cinzel', serif; margin: 0; }
        p { margin: 0; line-height: 1.6; }

        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-title { font-size: clamp(2rem, 5vw, 3.5rem); color: rgba(238, 223, 160, 0.8); }

        .divider { display: flex; align-items: center; gap: 1rem; width: 100%; max-width: 300px; }
        .divider.center { margin: 1.5rem auto 0; }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent); }
        .divider-gem { color: #c9a84c; font-size: 0.5rem; }

        /* ── Background Particles ── */
        @keyframes floatUp {
          0% { transform: translateY(100vh) translateX(0) scale(0.5); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-20vh) translateX(20px) scale(1); opacity: 0; }
        }

        .particles-container { position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; height: 100%; }
        .particle {
          position: absolute; bottom: 0; width: 4px; height: 4px;
          background: #c9a84c; border-radius: 50%; opacity: 0;
          box-shadow: 0 0 10px 2px rgba(201,168,76,0.8);
          animation: floatUp linear infinite;
        }

        /* ── Magic Button Component ── */
        .btn-magic-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 1rem;
          background: rgba(20, 25, 30, 0.7);
          border: 1px solid rgba(201, 168, 76, 0.5);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          color: rgba(238, 223, 160, 0.8); font-family: 'Cinzel', serif; font-size: 1rem;
          text-transform: uppercase; letter-spacing: 0.2em;
          padding: 0 3rem; height: 60px; border-radius: 2px;
          margin-top: 2.5rem;
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        }
        .btn-magic-primary::before {
          content: ''; position: absolute; inset: -5px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg) translateX(-150%); transition: transform 0.8s ease;
        }
        .btn-magic-primary:hover {
          background: rgba(201, 168, 76, 0.1); border-color: #e8c96f;
          box-shadow: 0 0 30px rgba(201,168,76,0.2), inset 0 0 20px rgba(201,168,76,0.1);
          transform: translateY(-3px); color: #c9a84c;
        }
        .btn-magic-primary:hover::before { transform: skewX(-20deg) translateX(150%); }
        .btn-magic-primary.large { font-size: 1.1rem; height: 68px; }
        .btn-icon-right { transition: transform 0.3s; }
        .btn-magic-primary:hover .btn-icon-right { transform: translateX(5px); }
        .btn-star { font-size: 0.8rem; color: #c9a84c; text-shadow: 0 0 10px rgba(201,168,76,0.5); transition: all 0.4s; }
        .btn-magic-primary:hover .btn-star { color: #f8f1e6; transform: scale(1.2) rotate(180deg); }
        .loading-spinner { animation: spin 1s linear infinite; font-size: 1.2rem; color: #f8f1e6; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Hero Section ── */
        .hero-section {
          position: relative; height: 100vh; width: 100%;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          padding: 2rem 1rem; border-bottom: 1px solid rgba(201,168,76,0.2);
        }

        /* ── Adaptive Scaling for Height (PC Screen Sizes) ── */
        @media (max-height: 850px) {
          .hero-section { padding: 1rem; }
          .brand-logo { height: 48px; margin-bottom: 0.25rem; }
          .subtitle-presents { font-size: 0.65rem; margin-bottom: 0.25rem; }
          .title-image { max-width: 420px; }
          .tagline { font-size: 1.1rem; margin-bottom: 1rem; }
          .btn-magic-primary { height: 52px; margin-top: 1.5rem; padding: 0 2.5rem; }
          .hp-corner { width: max(80px, 8vw); height: max(80px, 8vw); }
        }

        @media (max-height: 720px) {
          .brand-logo { height: 40px; }
          .title-image { max-width: 360px; }
          .tagline { font-size: 1rem; margin-bottom: 0.75rem; }
          .btn-magic-primary { height: 48px; margin-top: 1rem; padding: 0 2rem; font-size: 0.9rem; }
          .divider { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
        }

        @media (max-height: 600px) {
          .brand-logo { height: 32px; }
          .title-image { max-width: 300px; }
          .subtitle-presents { font-size: 0.55rem; }
          .tagline { font-size: 0.9rem; }
          .hp-corner { width: 60px; height: 60px; }
        }

        .hero-bg-fallback {
          position: absolute; inset: 0; background: url('/assets/images/herobg2.png') center/cover no-repeat;
          z-index: 0; transition: opacity 1.5s ease;
        }
        .hero-bg-fallback.hidden { opacity: 0; }
        .hero-video {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          z-index: 1; opacity: 0; transition: opacity 1.5s ease;
        }
        .hero-video.visible { opacity: 1; }
        .hero-overlay-dark {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(180deg, rgba(4,5,10,0.4) 0%, rgba(4,5,10,0.2) 40%, rgba(4,5,10,0.8) 80%, #04050a 100%);
        }
        .hero-border-bottom {
          position: absolute; left: 0; right: 0; bottom: 0; height: 1px; z-index: 10;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          opacity: 0.7;
        }

        .hp-corner {
          position: absolute; z-index: 10; width: max(100px, 10vw); height: max(100px, 10vw);
          opacity: 0.7; filter: drop-shadow(0 0 10px rgba(201,168,76,0.1));
        }
        .corner-tl { top: 0; left: 0; } .corner-tr { top: 0; right: 0; transform: scaleX(-1); }
        .corner-bl { bottom: 0; left: 0; transform: scaleY(-1); } .corner-br { bottom: 0; right: 0; transform: scale(-1,-1); }

        .hero-content {
          position: relative; z-index: 20; display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 600px; width: 100%;
        }
        .brand-logo { height: 60px; margin-bottom: 0.5rem; filter: drop-shadow(0 4px 12px rgba(201,168,76,0.4)); }
        .subtitle-presents { font-family: 'Cinzel', serif; font-size: 0.75rem; letter-spacing: 0.2em; color: rgba(201,168,76,0.8); text-transform: uppercase; margin-bottom: 0.5rem; }
        .title-wrapper { width: 100%; margin-bottom: 1rem; }
        .title-image { width: 100%; max-width: 500px; height: auto; }
        .title-fallback { display: none; font-size: 3.5rem; color: #e8c96f; text-shadow: 0 4px 20px rgba(201,168,76,0.5); }
        .tagline { font-size: 1.25rem; font-style: italic; color: #e8d5b0; margin-bottom: 1.5rem; }

        .error-alert {
          background: rgba(40, 10, 10, 0.6); border: 1px solid rgba(220, 80, 80, 0.4);
          color: #ffb0b0; padding: 0.75rem 1.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;
          backdrop-filter: blur(8px);
        }
        .hidden-google-btn { position: absolute; opacity: 0; pointer-events: none; }
        .domain-restriction { margin-top: 0.8rem; font-size: 0.6rem; color: rgba(201,168,76,0.4); display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
        .domain-restriction .icon { font-size: 0.75rem; color: inherit; }

        /* ── Features Section ── */
        .features-section { padding: 8rem 0; position: relative; background: #080a0e; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .feature-card {
          padding: 3rem 2rem; background: rgba(30, 35, 40, 0.5); border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 8px; position: relative; overflow: hidden; transition: all 0.4s ease;
          display: flex; flex-direction: column; align-items: flex-start;
          backdrop-filter: blur(12px);
          height: 100%; /* Important for the wrapper setup */
        }
        .feature-icon-wrapper { position: relative; width: 80px; height: 80px; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; }
        .house-feature-logo { 
          width: 100%; height: 100%; object-fit: contain; 
          filter: var(--house-filter); 
          transition: all 0.4s;
        }
        .feature-title { font-size: 1.8rem; color: var(--house-color); margin-bottom: 1rem; }
        .feature-desc { font-size: 1.1rem; color: rgba(238, 223, 160, 0.8); line-height: 1.6; }
        
        .feature-card:hover { transform: translateY(-5px); border-color: var(--house-color); background: rgba(30,35,45,0.7); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .feature-card:hover .house-feature-logo { 
          transform: scale(1.1); 
          filter: var(--house-filter) brightness(1.2); 
        }

        /* ── CTA Section ── */
        .cta-section { padding: 8rem 0; position: relative; text-align: center; overflow: hidden; border-top: 1px solid rgba(201,168,76,0.1); border-bottom: 1px solid rgba(201,168,76,0.1); }
        .cta-ambient-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle at center, rgba(201,168,76,0.08) 0%, transparent 60%); border-radius: 50%; z-index: 0; pointer-events: none; }
        .cta-content { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; }
        .cta-icon { width: 80px; height: auto; margin-bottom: 1.5rem; filter: drop-shadow(0 0 15px rgba(201,168,76,0.3)); }
        .cta-title { font-size: clamp(2.5rem, 6vw, 4rem); color: rgba(238, 223, 160, 0.8); text-shadow: none; margin-bottom: 1rem; }
        .cta-subtitle { font-size: 1.25rem; color: rgba(238, 223, 160, 0.8); max-width: 600px; margin: 0 auto 3rem auto; }

        /* ── Footer Section ── */
        .footer-section { background: #020305; padding: 6rem 4rem 2rem 4rem; position: relative; z-index: 30; color: rgba(238, 223, 160, 0.8); }
        .footer-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; }
        .footer-top { display: flex; justify-content: flex-start; align-items: center; margin-bottom: 3rem; gap: 4rem; }
        .footer-houses-row { display: flex; gap: 2rem; }
        .team-logo-wrap { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
        .team-logo { width: 100%; height: 100%; object-fit: contain; filter: brightness(0) invert(1) opacity(0.5); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .team-logo-wrap:hover .team-logo { filter: none; transform: scale(1.15) translateY(-5px); opacity: 1; }
        .footer-contact-row { display: flex; gap: 1rem; align-items: center; margin-left: auto; text-align: right; }
        .footer-contact-row a { display: flex; align-items: center; gap: 0.6rem; color: rgba(255,255,255,0.6); text-decoration: none; font-family: sans-serif; font-size: 0.95rem; font-weight: 500; transition: color 0.3s; justify-content: flex-end; }
        .footer-contact-row a:hover { color: #c9a84c; }
        .footer-contact-row .material-symbols-outlined { font-size: 1.25rem; }
        .footer-middle { display: flex; justify-content: flex-start; overflow: hidden; text-align: left; margin-left: 0; }
        .footer-giant-text { font-family: 'Cinzel', serif; font-size: clamp(5rem, 12vw, 12rem); color: #f8f1e6; margin: 0; line-height: 1; letter-spacing: 0.02em; text-transform: uppercase; font-weight: 700; text-align: left; opacity: 0.8; margin-left: -0.5rem; }

        /* ── Responsive Design ── */
        @media (max-width: 900px) {
          .footer-section { padding: 4rem 1.5rem 2rem 1.5rem; }
          .footer-top { flex-direction: column; gap: 3rem; align-items: center; }
          .footer-houses-row { gap: 1.5rem; justify-content: center; }
          .team-logo-wrap { width: 50px; height: 50px; }
          .footer-contact-row { flex-direction: column; gap: 1rem; align-items: center; margin-left: 0; }
          .footer-contact-row > div { align-items: center !important; }
          .footer-contact-row a { justify-content: center; }
          .footer-middle { justify-content: center; text-align: center; }
          .footer-giant-text { font-size: clamp(2.5rem, 12vw, 6rem); padding-top: 2rem; text-align: center; margin-left: 0; }
        }

        @media (max-width: 480px) {
          .hero-section { height: 100dvh; min-height: unset; padding: 1rem; overflow: hidden; }
          .btn-magic-primary { font-size: 0.95rem; height: 50px; padding: 0 1.5rem; width: 100%; max-width: 280px; }
          .btn-magic-primary.large { font-size: 0.85rem; height: 54px; letter-spacing: 0.1em; }
          .btn-star { display: none; }
          .title-image { max-width: 85%; }
          .domain-restriction { font-size: 0.5rem; letter-spacing: 0.05em; }
          .domain-restriction .icon { font-size: 0.6rem; }
        }
      `}</style>
    </div>
  );
}

/* ── Google Color Icon ───────────────────────────────────────────────────── */
function GoogleColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor" />
    </svg>
  );
}
