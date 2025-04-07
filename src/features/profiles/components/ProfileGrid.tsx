import React from 'react';
import { Link } from 'react-router-dom';
import type { Profile, UserSkill } from '../types/database';
import { ProfileCard } from './ProfileCard';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

type ProfileGridProps = {
  profiles: Profile[];
  profileSkills: Record<string, UserSkill[]>;
  currentUserId?: string;
};

export function ProfileGrid({ profiles, profileSkills, currentUserId }: ProfileGridProps) {
  const [friendships, setFriendships] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUserId) return;

    async function loadFriendships() {
      const { data, error } = await supabase
        .from('friendships')
        .select('user_id, friend_id, status')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading friendships:', error);
        return;
      }

      const friendMap = data.reduce((acc, friendship) => {
        const friendId = friendship.user_id === currentUserId
          ? friendship.friend_id
          : friendship.user_id;
        acc[friendId] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setFriendships(friendMap);
    }

    loadFriendships();
  }, [currentUserId]);

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Keine Profile gefunden, die deinen Filterkriterien entsprechen.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 ">
      {profiles.map((profile) => (
        <Link 
          key={profile.id} 
          to={currentUserId === profile.id ? '/profile' : `/profile/${profile.username}`}
          className="w-full"
        >
          <ProfileCard
            profile={profile}
            skills={profileSkills[profile.id] || []}
            isFriend={friendships[profile.id] || false}
            onClick={() => {}}
          />
        </Link>
      ))}
    </div>
  );
}