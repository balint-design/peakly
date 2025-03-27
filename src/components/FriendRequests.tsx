import React, { useState, useEffect } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

type FriendRequest = {
  id: string;
  user_id: string;
  created_at: string;
  user: Profile;
};

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    loadFriendRequests();
  }, []);

  async function loadFriendRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    if (error) {
      console.error('Error loading friend requests:', error);
      return;
    }

    setRequests(data || []);
  }

  async function handleRequest(requestId: string, accept: boolean) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);

    if (error) {
      console.error('Error handling friend request:', error);
      return;
    }

    setRequests(requests.filter(r => r.id !== requestId));
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
      <h3 className="font-bold mb-4">Freundschaftsanfragen</h3>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {request.user.avatar_url ? (
                <img
                  src={request.user.avatar_url}
                  alt={request.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200" />
              )}
              <div>
                <p className="font-medium">
                  {request.user.full_name || request.user.username}
                </p>
                <p className="text-sm text-gray-500">
                  möchte dich als Freund:in hinzufügen
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRequest(request.id, true)}
                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRequest(request.id, false)}
                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}