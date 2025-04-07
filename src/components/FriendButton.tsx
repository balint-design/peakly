import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type FriendButtonProps = {
  targetUserId: string;
  className?: string;
};

export function FriendButton({ targetUserId, className = '' }: FriendButtonProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriendshipStatus();
  }, [targetUserId]);

  async function loadFriendshipStatus() {
    try {
      const { data, error } = await supabase
        .rpc('get_friendship_status', {
          target_user_id: targetUserId
        });

      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error('Error loading friendship status:', error);
    }
  }

  async function sendFriendRequest() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          friend_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      setStatus('pending');
      toast.success('Freundschaftsanfrage gesendet');
    } catch (error) {
      toast.error('Fehler beim Senden der Anfrage');
    } finally {
      setLoading(false);
    }
  }

  async function respondToRequest(accept: boolean) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('friend_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('user_id', targetUserId);

      if (error) throw error;
      setStatus(accept ? 'accepted' : 'declined');
      toast.success(accept ? 'Freundschaftsanfrage angenommen' : 'Freundschaftsanfrage abgelehnt');
    } catch (error) {
      toast.error('Fehler beim Bearbeiten der Anfrage');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="hidden sm:inline">Lädt...</span>
      </button>
    );
  }

  if (status === 'accepted') {
    return (
      <button
        className={`flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full ${className}`}
      >
        <UserCheck className="w-4 h-4" />
        <span className="hidden sm:inline">Befreundet</span>
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <button
        className={`flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full ${className}`}
      >
        <Loader2 className="w-4 h-4" />
        <span className="hidden sm:inline">Ausstehend</span>
      </button>
    );
  }

  return (
    <button
      onClick={sendFriendRequest}
      className={`flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-900 transition-colors ${className}`}
    >
      <UserPlus className="w-4 h-4" />
      <span className="hidden sm:inline">Freund:in hinzufügen</span>
    </button>
  );
}