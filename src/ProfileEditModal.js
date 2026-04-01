import React, { useState, useContext } from 'react';
import { AuthContext, ToastContext } from './App';
import { userAPI } from './api';

export default function ProfileEditModal({ onClose }) {
  const { user, updateUser } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Name cannot be empty', 'error');
    
    setLoading(true);
    try {
      const res = await userAPI.update({ name: name.trim() });
      if (res.data.success) {
        updateUser({ name: name.trim() });
        showToast('Profile updated successfully');
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      padding: '1rem',
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(15, 15, 15, 0.95)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 style={{ 
          fontFamily: 'Cinzel, serif', 
          color: 'var(--gold)', 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          fontSize: '1.25rem',
          letterSpacing: '0.1em'
        }}>
          Edit Profile
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.65rem', 
              fontFamily: 'Cinzel, serif', 
              color: 'rgba(255,255,255,0.5)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              marginBottom: '0.5rem'
            }}>
              Display Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your wizard name..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                color: '#fff',
                fontFamily: 'EB Garamond, serif',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-hp btn-hp-primary"
            style={{ width: '100%', padding: '0.8rem' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
}
