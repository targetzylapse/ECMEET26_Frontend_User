import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return null; // Inner pages don't need a separate footer — sidebar handles branding
}
