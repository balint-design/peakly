import { supabase } from './supabase';
import type { Profile, UserSkill, Skill } from '../types/database';

async function getProfile(usernameOrId: string): Promise<Profile | null> {
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

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (error && error.code === 'PGRST116') {
    return true; // Username is available
  }

  return false; // Username is taken
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  profile: Partial<Profile>,
  skills: Array<{ skill: Skill; experience_level: string }>
) {
  // First check if username is taken
  const isAvailable = await checkUsernameAvailability(username);
  if (!isAvailable) {
    throw new Error('Username already taken');
  }

  // Create auth user with email confirmation disabled
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/profile`,
      data: {
        username,
        ...profile
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('rate_limit')) {
      throw new Error('Please wait a few seconds before trying again');
    }
    throw signUpError;
  }

  if (!authData.user) {
    throw new Error('No user returned after signup');
  }

  try {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        full_name: profile.full_name || null,
        age: profile.age || null,
        gender: profile.gender || null,
        location: profile.location || null,
        bio: profile.bio || null,
        languages: ['DE'],
        avatar_url: null
      });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Create skills
    if (skills.length > 0) {
      const { error: skillsError } = await supabase
        .from('user_skills')
        .insert(
          skills.map(s => ({
            user_id: authData.user.id,
            skill: s.skill,
            experience_level: s.experience_level,
          }))
        );

      if (skillsError) {
        // If skills creation fails, clean up profile
        await supabase.from('profiles').delete().eq('id', authData.user.id);
        throw skillsError;
      }
    }

    return authData;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('email_not_confirmed')) {
      throw new Error('Please confirm your email address before signing in');
    }
    throw error;
  }
  return data;
}

export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserSkills(
  userId: string,
  skills: Array<{ skill: Skill; experience_level: string }>
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

export async function deleteAccount(password: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');
  
  // Verify password before deletion
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });

  if (signInError) throw new Error('Invalid password');

  try {
    // 1. Delete user skills
    const { error: skillsError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id);
    
    if (skillsError) throw skillsError;

    // 2. Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    if (profileError) throw profileError;

    // 3. Delete user's storage files (like avatar)
    const { error: storageError } = await supabase.storage
      .from('avatars')
      .remove([`${user.id}`]);
    if (storageError && storageError.message !== 'Object not found') {
      throw storageError;
    }

    // 4. Sign out the user - this will trigger the cascade delete of the auth user
    // due to our migration setup
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account. Please try again.');
  }
}