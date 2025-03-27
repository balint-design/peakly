import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { PeakPost, Profile } from '../types/database';

type PeakPostCardProps = {
  post: PeakPost;
  organizer: Profile;
  participantCount: number;
  participants: Profile[];
};

export function PeakPostCard({ post, organizer, participantCount, participants }: PeakPostCardProps) {
  const spotsAvailable = post.max_participants ? post.max_participants - participantCount : null;

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="flex bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="block grow p-6 flex flex-col">
        
        <div className="flex-1"> 
        {/* Title */}
        <h3 className="font-safiro text-lg mb-3 line-clamp-2">{post.title}</h3>
        
        {/* Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {post.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.date), 'dd.MM')}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{post.location}</span>
          </div>

          {post.max_participants && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{spotsAvailable}</span>
            </div>
          )}
        </div>

        {/* Skill Badge */}
        {post.required_skill && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {post.required_skill} {post.required_level && `• ${post.required_level}`}
            </span>
          </div>
        )}
        </div>
        {/* Bottom Row with Profiles */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
          {/* Organizer */}
          <div className="flex items-center gap-2">
            {organizer.avatar_url ? (
              <img
                src={organizer.avatar_url}
                alt={organizer.username}
                className="w-8 h-8 rounded-[4px] object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-[4px]" />
            )}
          </div>

          {/* Participants */}
          {participants.length > 0 && (
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                >
                  {participant.avatar_url ? (
                    <img
                      src={participant.avatar_url}
                      alt={participant.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}