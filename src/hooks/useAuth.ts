import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const hadSession = useRef(false);
  const initTime = useRef(performance.now());

  useEffect(() => {
    async function initSession() {
      try {
        console.log('Initializing auth session...');
        const startTime = performance.now();

        const { data: { session }, error } = await supabase.auth.getSession();
        
        const endTime = performance.now();
        console.log(`Auth session initialized in ${endTime - startTime}ms`);
        console.log(`Total time since hook mount: ${endTime - initTime.current}ms`);

        if (error) throw error;
        hadSession.current = !!session;
        setSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const wasLoggedIn = hadSession.current;
      hadSession.current = !!session;
      setSession(session);
      
      if (wasLoggedIn && !session && location.pathname !== '/') {
        toast.error('Sitzung abgelaufen. Bitte melde dich erneut an.');
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  return { session, loading };
}