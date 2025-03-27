import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { PeakPost, Profile, PostParticipant } from '../types/database';
import { PeakPostCard } from './PeakPostCard';
import { PeakPostForm } from './PeakPostForm';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function PeakPostsSection() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PeakPost[]>([]);
  const [organizers, setOrganizers] = useState<Record<string, Profile>>({});
  const [participants, setParticipants] = useState<Record<string, PostParticipant[]>>({});
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, Profile>>({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);

      // Load posts with organizer profiles
      const postsData = await handleSupabaseError(
        supabase
          .from('peak_posts')
          .select(`
            *,
            user:profiles!peak_posts_user_id_fkey(*)
          `)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true }),
        'Error loading posts'
      );

      if (!postsData) {
        setError('No posts found');
        return;
      }

      // Extract organizer profiles
      const organizerMap = Object.fromEntries(
        postsData.map(post => [post.user_id, post.user])
      );

      setPosts(postsData);
      setOrganizers(organizerMap);

      // Load participants for each post
      const participantPromises = postsData.map(post =>
        handleSupabaseError(
          supabase
            .from('post_participants')
            .select('*')
            .eq('post_id', post.id)
            .eq('status', 'confirmed'),
          `Error loading participants for post ${post.id}`
        )
      );

      const participantResults = await Promise.all(participantPromises);
      const participantMap: Record<string, PostParticipant[]> = {};
      
      participantResults.forEach((result, index) => {
        if (result) {
          participantMap[postsData[index].id] = result;
        }
      });

      setParticipants(participantMap);

      // Load participant profiles
      const participantIds = new Set(
        Object.values(participantMap)
          .flat()
          .map(p => p.user_id)
      );

      if (participantIds.size > 0) {
        const profiles = await handleSupabaseError(
          supabase
            .from('profiles')
            .select('*')
            .in('id', Array.from(participantIds)),
          'Error loading participant profiles'
        );

        if (profiles) {
          const profileMap = Object.fromEntries(
            profiles.map(profile => [profile.id, profile])
          );
          setParticipantProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error('Error in loadPosts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  const handlePostCreated = (post: PeakPost) => {
    setPosts(prev => [post, ...prev]);
    setOrganizers(prev => ({
      ...prev,
      [post.user_id]: session?.user || null
    }));
    setParticipants(prev => ({
      ...prev,
      [post.id]: []
    }));
  };

  if (error) {
    return (
      <div className="py-12">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center text-gray-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Peak Posts</h2>
        {session && (
          <button
            onClick={() => setShowPostForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => {
          const postParticipants = participants[post.id] || [];
          const participantsList = postParticipants
            .map(p => participantProfiles[p.user_id])
            .filter(Boolean);

          return (
            <PeakPostCard
              key={post.id}
              post={post}
              organizer={organizers[post.user_id]}
              participantCount={postParticipants.length}
              participants={participantsList}
            />
          );
        })}

        {posts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No upcoming posts
          </div>
        )}
      </div>

      {showPostForm && (
        <PeakPostForm
          onClose={() => setShowPostForm(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}