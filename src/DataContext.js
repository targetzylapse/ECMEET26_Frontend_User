import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { eventsAPI } from './api';
import socket from './socket';

const DataContext = createContext(null);

export const DataProvider = ({ children, user }) => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  
  const isInitialised = useRef(false);

  // ── Load from sessionStorage ───────────────────────────────────────────
  const loadFromCache = useCallback(() => {
    try {
      const cachedEvents = sessionStorage.getItem('ecmeet_events');
      const cachedRegs = sessionStorage.getItem('ecmeet_registrations');
      const cachedTime = sessionStorage.getItem('ecmeet_cache_time');

      if (cachedEvents && cachedRegs) {
        setEvents(JSON.parse(cachedEvents));
        setRegistrations(JSON.parse(cachedRegs));
        setLastFetched(Number(cachedTime));
        return true;
      }
    } catch (e) {
      console.error('Failed to load from cache', e);
    }
    return false;
  }, []);

  // ── Save to sessionStorage ─────────────────────────────────────────────
  const saveToCache = useCallback((eventsData, regsData) => {
    try {
      sessionStorage.setItem('ecmeet_events', JSON.stringify(eventsData));
      sessionStorage.setItem('ecmeet_registrations', JSON.stringify(regsData));
      const now = Date.now();
      sessionStorage.setItem('ecmeet_cache_time', now.toString());
      setLastFetched(now);
    } catch (e) {
      console.error('Failed to save to cache', e);
    }
  }, []);

  // ── Fetch All Data ─────────────────────────────────────────────────────
  const refreshData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    
    try {
      // Fetch in parallel for speed
      const [evRes, regRes] = await Promise.all([
        eventsAPI.getAll(),
        eventsAPI.myRegistrations()
      ]);

      const eventsData = evRes.data.events || [];
      const regsData = regRes.data.registrations || [];

      setEvents(eventsData);
      setRegistrations(regsData);
      saveToCache(eventsData, regsData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, saveToCache]);

  // ── Handle Socket Updates ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const handleUpdate = (data) => {
      console.log('[DataContext] Real-time update received:', data.type);
      // Silent refresh in background
      refreshData(true);
    };

    socket.on('data-updated', handleUpdate);
    return () => socket.off('data-updated', handleUpdate);
  }, [user, refreshData]);

  // ── Initial Load ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user && !isInitialised.current) {
      isInitialised.current = true;
      const hasCache = loadFromCache();
      
      // Even if we have cache, do a silent refresh to ensure it's up to date
      // but only if it's older than 1 minute
      const cachedTime = sessionStorage.getItem('ecmeet_cache_time');
      const isStale = !cachedTime || (Date.now() - Number(cachedTime) > 60000);

      if (!hasCache || isStale) {
        refreshData(!hasCache ? false : true);
      }
    } else if (!user) {
      // Clear data on logout
      setEvents([]);
      setRegistrations([]);
      setLastFetched(null);
      sessionStorage.removeItem('ecmeet_events');
      sessionStorage.removeItem('ecmeet_registrations');
      sessionStorage.removeItem('ecmeet_cache_time');
      isInitialised.current = false;
    }
  }, [user, loadFromCache, refreshData]);

  return (
    <DataContext.Provider value={{ 
      events, 
      registrations, 
      loading, 
      refreshData, 
      lastFetched 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
