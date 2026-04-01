import React from 'react';

export default function PrelimPage() {
  return (
    <div className="page-content" style={{ minHeight:'75vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>

      <div style={{ animation:'fadeUp 0.6s ease both', maxWidth:560, width:'100%' }}>

        <span className="material-symbols-outlined" style={{ fontSize:'3.5rem', color:'var(--gold)', filter:'drop-shadow(0 0 16px var(--gold-glow))', display:'block', marginBottom:'1rem' }}>
          description
        </span>

        <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.3em', color:'rgba(201,168,76,0.65)', textTransform:'uppercase', marginBottom:'0.5rem' }}>
          ✦ ECMEET'26 ✦
        </p>

        <h1 style={{ fontFamily:'Cinzel Decorative,serif', fontSize:'clamp(1.8rem,5vw,3rem)', color:'var(--gold-light)', textShadow:'0 0 24px var(--gold-glow)', marginBottom:'0.5rem', lineHeight:1.2 }}>
          Preliminary<br />Screening
        </h1>

        <div className="gold-rule" style={{ maxWidth:220, margin:'1rem auto' }} />

        <p style={{ fontFamily:'EB Garamond,serif', fontStyle:'italic', fontSize:'clamp(0.95rem,2vw,1.1rem)', color:'var(--parchment-dim)', maxWidth:440, margin:'0 auto 2rem', lineHeight:1.7 }}>
          "Before the grand tournament begins, all challengers must pass the preliminary trials of knowledge and skill…"
        </p>

        {/* Coming Soon card */}
        <div className="hp-card" style={{ padding:'2rem', textAlign:'center', maxWidth:440, margin:'0 auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize:'2rem', color:'var(--gold)', opacity:0.6, marginBottom:'0.75rem', display:'block' }}>
            hourglass_empty
          </span>
          <h2 style={{ fontFamily:'Cinzel,serif', color:'var(--gold-light)', fontSize:'0.95rem', marginBottom:'0.5rem', letterSpacing:'0.1em' }}>
            Details Coming Soon
          </h2>
          <p style={{ color:'var(--parchment-dim)', fontSize:'0.9rem', lineHeight:1.6 }}>
            Preliminary screening schedule and instructions will be announced by your coordinators closer to the event date.
          </p>
          <div className="gold-rule" />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontFamily:'Cinzel,serif', fontSize:'0.62rem', letterSpacing:'0.15em', color:'rgba(201,168,76,0.5)', textTransform:'uppercase' }}>
            <span className="material-symbols-outlined" style={{ fontSize:'0.85rem' }}>notifications</span>
            Check back closer to event date
          </div>
        </div>
      </div>
    </div>
  );
}
