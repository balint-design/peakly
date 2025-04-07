import { supabase } from '../../../lib/supabase';
import type { PeakPost, Profile } from '../../../types/database';

/**
 * Fetches a single post by ID with details about organizer and participants
 */
export async function fetchPostById(postId: string): Promise<{
  post: PeakPost | null;
  organizer: Profile | null;
  participants: Profile[];
  participantCount: number;
}> {
  // Fetch the post
  const { data: post, error: postError } = await supabase
    .from('peak_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (postError) {
    console.error('Error fetching post:', postError);
    throw postError;
  }

  if (!post) {
    return { post: null, organizer: null, participants: [], participantCount: 0 };
  }

  // Fetch the organizer profile
  const { data: organizer, error: organizerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.user_id)
    .single();

  if (organizerError) {
    console.error('Error fetching organizer:', organizerError);
    throw organizerError;
  }

  // Fetch participants
  const { data: participations, error: participationsError } = await supabase
    .from('post_participants')
    .select('user_id')
    .eq('post_id', postId);

  if (participationsError) {
    console.error('Error fetching participants:', participationsError);
    throw participationsError;
  }

  const participantCount = participations?.length || 0;
  
  // Get all participant profiles
  let participants: Profile[] = [];
  if (participations && participations.length > 0) {
    const userIds = participations.map(p => p.user_id);
    const { data: participantProfiles, error: participantsError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (participantsError) {
      console.error('Error fetching participant profiles:', participantsError);
      throw participantsError;
    }

    participants = participantProfiles || [];
  }

  return {
    post,
    organizer,
    participants,
    participantCount
  };
}

/**
 * Fetches all posts with basic details
 */
export async function fetchAllPosts() {
  const { data: posts, error: postsError } = await supabase
    .from('peak_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    throw postsError;
  }

  return posts || [];
}

/**
 * Joins a user to a post
 */
export async function joinPost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_participants')
    .insert({ post_id: postId, user_id: userId });

  if (error) {
    console.error('Error joining post:', error);
    throw error;
  }
}

/**
 * Leaves a post the user has joined
 */
export async function leavePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_participants')
    .delete()
    .match({ post_id: postId, user_id: userId });

  if (error) {
    console.error('Error leaving post:', error);
    throw error;
  }
}

/**
 * Creates a new post
 */
export async function createPost(postData: Omit<PeakPost, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('peak_posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
}

/**
 * Updates an existing post
 */
export async function updatePost(postId: string, postData: Partial<PeakPost>) {
  const { error } = await supabase
    .from('peak_posts')
    .update(postData)
    .eq('id', postId);

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Deletes a post
 */
export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('peak_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/**
 * Checks if a user has joined a post
 */
export async function hasUserJoinedPost(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('post_participants')
    .select('*')
    .match({ post_id: postId, user_id: userId });

  if (error) {
    console.error('Error checking post participation:', error);
    throw error;
  }

  return (data && data.length > 0) || false;
}