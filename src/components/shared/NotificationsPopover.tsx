import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { Profile } from '../../types/database';
import toast from 'react-hot-toast';

type FriendRequest = {
  id: string;
  user_id: string;
  created_at: string;
  user: Profile;
};

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFriendRequests();

    // Set up real-time subscription
    const channel = supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships'
        },
        () => {
          loadFriendRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadFriendRequests() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRequests([]);
        return;
      }

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          created_at,
          user:profiles!friendships_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast.error('Fehler beim Laden der Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest(requestId: string, accept: boolean) {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(accept ? 'Freundschaftsanfrage angenommen' : 'Freundschaftsanfrage abgelehnt');
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Fehler beim Bearbeiten der Anfrage');
    }
  }

  return (
    <div ref={popoverRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {requests.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {requests.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-bold mb-4">Benachrichtigungen</h3>
            {loading ? (
              <p className="text-gray-500 text-center py-4">Lädt...</p>
            ) : requests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Keine neuen Benachrichtigungen
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-start gap-3">
                    <Link
                      to={`/profile/${request.user.username}`}
                      className="flex-shrink-0"
                      onClick={() => setIsOpen(false)}
                    >
                      {request.user.avatar_url ? (
                        <img
                          src={request.user.avatar_url}
                          alt={request.user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/profile/${request.user.username}`}
                        className="font-medium hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        {request.user.full_name || request.user.username}
                      </Link>
                      <p className="text-sm text-gray-500">
                        möchte dich als Freund:in hinzufügen
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRequest(request.id, true)}
                          className="px-3 py-1 bg-black text-white text-sm rounded-full hover:bg-gray-900"
                        >
                          Annehmen
                        </button>
                        <button
                          onClick={() => handleRequest(request.id, false)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                        >
                          Ablehnen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}