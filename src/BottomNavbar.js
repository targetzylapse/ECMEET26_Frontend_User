import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';

const NAV = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/events', icon: 'auto_awesome', label: 'Events' },
  { path: '/prelim', icon: 'description', label: 'Screening' },
];

export default function BottomNavbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-navbar">
      {NAV.map(n => {
        const disabled = !user?.houseRevealed && n.path !== '/dashboard';
        return (
          <button
            key={n.path}
            className={`bn-item${pathname === n.path ? ' active' : ''}`}
            onClick={() => !disabled && navigate(n.path)}
            disabled={disabled}
          >
            <span className="material-symbols-outlined"
              style={{ fontVariationSettings: pathname === n.path ? "'FILL' 1" : "'FILL' 0" }}>
              {n.icon}
            </span>
            {n.label}
          </button>
        );
      })}
    </nav>
  );
}
