import { supabase } from '../../../lib/supabase';
import type { Profile, UserSkill, FriendRequest } from '../../../types/database';

/**
 * Fetch a profile by username or ID
 */
export async function fetchProfile(usernameOrId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', usernameOrId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // If not found by ID, try username
      const { data: profileByUsername, error: usernameError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameOrId)
        .single();

      if (usernameError) {
        if (usernameError.code === 'PGRST116') {
          return null;
        }
        throw usernameError;
      }
      return profileByUsername;
    }
    throw error;
  }
  return data;
}

/**
 * Fetch user skills
 */
export async function fetchUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

/**
 * Update a profile
 */
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Update user skills
 */
export async function updateUserSkills(
  userId: string,
  skills: Array<{ skill: string; experience_level: string }>
) {
  // Delete existing skills
  await supabase.from('user_skills').delete().eq('user_id', userId);

  // Insert new skills
  if (skills.length > 0) {
    const { error } = await supabase.from('user_skills').insert(
      skills.map((s) => ({
        user_id: userId,
        skill: s.skill,
        experience_level: s.experience_level,
      }))
    );
    if (error) throw error;
  }
}

/**
 * Fetch profiles with optional filtering
 */
export async function fetchProfiles(filters: {
  skills?: string[];
  location?: string;
  intentTags?: string[];
  searchQuery?: string;
} = {}) {
  let query = supabase
    .from('profiles')
    .select('*')
    .not('username', 'is', null);

  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  if (filters.intentTags && filters.intentTags.length > 0) {
    // For array contains, we need to check if the intent_tags array contains any of the specified tags
    query = query.contains('intent_tags', filters.intentTags);
  }

  if (filters.searchQuery) {
    query = query.or(`username.ilike.%${filters.searchQuery}%,full_name.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Fetch friend requests for a user
 */
export async function fetchFriendRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('*, sender:sender_id(*), recipient:recipient_id(*)')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(senderId: string, recipientId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      status: 'pending'
    });

  if (error) throw error;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (error) throw error;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) throw error;
}

/**
 * Check if two users are friends
 */
export async function checkFriendship(userId1: string, userId2: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
    .eq('status', 'accepted');

  if (error) throw error;
  return (data && data.length > 0) || false;
}

/**
 * Fetch a user's friends
 */
export async function fetchFriends(userId: string): Promise<Profile[]> {
  // First, get all accepted friend requests where the user is either sender or recipient
  const { data: requests, error: requestsError } = await supabase
    .from('friend_requests')
    .select('sender_id, recipient_id')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (requestsError) throw requestsError;

  if (!requests || requests.length === 0) {
    return [];
  }

  // Extract friend IDs
  const friendIds = requests.map(req => 
    req.sender_id === userId ? req.recipient_id : req.sender_id
  );

  // Fetch friend profiles
  const { data: friends, error: friendsError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds);

  if (friendsError) throw friendsError;
  return friends || [];
}