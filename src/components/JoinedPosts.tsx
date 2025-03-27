import React from 'react';
import { PeakPostCard } from './PeakPostCard';
import type { PeakPost, Profile } from '../types/database';

type JoinedPostsProps = {
  posts: PeakPost[];
  participants: Record<string, Profile[]>;
  isPublic: boolean;
  onLeave: (postId: string) => void;
};

export function JoinedPosts({ posts, participants, isPublic, onLeave }: JoinedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-white pb-6 pt-6">
      <h2 className="text-lg font-safira text-black dark:text-gray-400 pb-4">
        Ich nehme teil
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map(post => (
          <div key={post.id} className="relative">
            <PeakPostCard
              post={post}
              organizer={post.user}
              participantCount={participants[post.id]?.length || 0}
              participants={participants[post.id] || []}
            />
            {!isPublic && (
              <button
                onClick={() => onLeave(post.id)}
                className="absolute top-2 right-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
              >
                Leave
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}