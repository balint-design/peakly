import React from 'react';
import { User, UserCheck } from 'lucide-react';
import type { Profile, UserSkill } from '../types/database';

type ProfileCardProps = {
  profile: Profile;
  skills: UserSkill[];
  isFriend: boolean;
  onClick: () => void;
};

export function ProfileCard({ profile, skills, isFriend, onClick }: ProfileCardProps) {
  const displayedSkills = skills.slice(0, 2);
  const remainingCount = Math.max(0, skills.length - 2);

  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col relative border border-gray-100"
    >
      {isFriend && (
        <div className="absolute top-4 right-4">
          <UserCheck className="w-4 h-4" />
        </div>
      )}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-12 h-12 rounded-full object-cover bg-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
        )}
        <div>
          <h3 className="font-safiro">{profile.full_name || profile.username}</h3>
          <p className="text-gray-500">
            {profile.age && `${profile.gender === 'm' ? 'm' : 'w'}${profile.age}`}
            {profile.location && ` aus ${profile.location}`}
          </p>
        </div>
      </div>
      {profile.bio && (
        <p className="mt-4 text-gray-600 text-sm line-clamp-2 ">{profile.bio}</p>
      )}
      {profile.intent_tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.intent_tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {displayedSkills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {skill.skill} <span className="mx-1">•</span> {skill.experience_level}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              +{remainingCount} weitere
            </span>
          )}
        </div>
      )}
    </button>
  );
}