import React, { useState, useEffect } from 'react';
import { Share2, PencilLine, User, MapPin, Calendar, Phone, MessageCircle, Globe } from 'lucide-react';
import type { Profile } from '../types/database';
import { ShareModal } from './ShareModal';
import { FriendButton } from './FriendButton'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

type ProfileHeaderProps = {
  profile: Profile;
  isPublic: boolean;
  onEditClick: () => void;
};

export function ProfileHeader({ profile, isPublic, onEditClick }: ProfileHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    async function checkFriendship() {
      if (!session?.user?.id || session.user.id === profile.id) return;

      const { data, error } = await supabase
        .rpc('are_friends', {
          user_id_1: session.user.id,
          user_id_2: profile.id
        });

      if (error) {
        console.error('Error checking friendship:', error);
        return;
      }

      setIsFriend(data);
    }

    checkFriendship();
  }, [session?.user?.id, profile.id]);

  const canViewContacts = !isPublic || 
    profile.contact_visibility === 'public' || 
    (profile.contact_visibility === 'friends_only' && isFriend);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Profil`,
          url: window.location.href,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  
  return (
    <div className="bg-white dark:bg-black border-b border-gray-100 pb-6 sm: mt-20  ">
      <div className="flex flex-col pt-6  sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-50 mx-auto sm:mx-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold leading-none">{profile.full_name || profile.username}</h1>
            <div className="space-y-4 mt-2 sm:mt-3">
              <div className="flex items-center justify-center sm:justify-start gap-4 text-gray-500">
                {profile.age && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{profile.age} Jahre</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              {(profile.whatsapp || profile.telegram || profile.social_media) && (
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  {canViewContacts && profile.whatsapp && (
                    <a
                      href={`https://wa.me/${profile.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                  {canViewContacts && profile.telegram && (
                    <a
                      href={`https://t.me/${profile.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Telegram
                    </a>
                  )}
                  {canViewContacts && profile.social_media && (
                    <a
                      href={profile.social_media}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Social Media
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          {session?.user?.id && session.user.id !== profile.id && (
            <FriendButton targetUserId={profile.id} />
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Teilen</span>
          </button>
        </div>
      </div>
      {!isPublic && (
        <button
          onClick={onEditClick}
          className="w-full mt-6 py-3 text-center bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <PencilLine className="w-5 h-5" />
          Bearbeiten
        </button>
      )}

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}