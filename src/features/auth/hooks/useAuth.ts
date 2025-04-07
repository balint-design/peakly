import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const hadSession = useRef(false);

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            // Clear the invalid session
            await supabase.auth.signOut();
            if (location.pathname !== '/') {
              navigate('/');
            }
          }
          throw error;
        }

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const wasLoggedIn = hadSession.current;
      hadSession.current = !!session;
      setSession(session);

      // Handle session errors and expiration
      if (wasLoggedIn && !session) {
        if (event === 'TOKEN_REFRESHED' && !session) {
          await supabase.auth.signOut();
          if (location.pathname !== '/') {
            toast.error('Sitzung abgelaufen. Bitte melde dich erneut an.');
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          if (location.pathname !== '/') {
            navigate('/');
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  return { session, loading };
}