/*
  # Add Friend System

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `friend_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `status` (text): 'pending', 'accepted', 'declined'

  2. Security
    - Enable RLS
    - Add policies for friend management
    - Ensure users can only manage their own friend requests
*/

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own friendships"
ON friendships
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = friend_id
);

CREATE POLICY "Users can send friend requests"
ON friendships
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  user_id != friend_id AND
  NOT EXISTS (
    SELECT 1 FROM friendships
    WHERE (user_id = auth.uid() AND friend_id = friendships.friend_id)
    OR (friend_id = auth.uid() AND user_id = friendships.friend_id)
  )
);

CREATE POLICY "Users can update friendship status"
ON friendships
FOR UPDATE
TO authenticated
USING (auth.uid() = friend_id)
WITH CHECK (
  auth.uid() = friend_id AND
  status IN ('accepted', 'declined')
);

-- Create function to check friendship status
CREATE OR REPLACE FUNCTION get_friendship_status(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT status
    FROM friendships
    WHERE (user_id = auth.uid() AND friend_id = target_user_id)
    OR (friend_id = auth.uid() AND user_id = target_user_id)
    LIMIT 1
  );
END;
$$;