/*
  # Fix Friendship RLS Policies

  1. Changes
    - Drop existing friendship policies
    - Create new, more permissive policies for:
      - Viewing friendships
      - Sending friend requests
      - Updating friendship status
    
  2. Security
    - Allow users to view their own friendships
    - Allow users to send friend requests
    - Allow recipients to accept/decline requests
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update friendship status" ON friendships;

-- Create new policies
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
  -- Must be authenticated user sending the request
  auth.uid() = user_id AND
  -- Can't send request to self
  user_id != friend_id AND
  -- Can't send duplicate requests
  NOT EXISTS (
    SELECT 1 FROM friendships
    WHERE 
      (user_id = auth.uid() AND friend_id = friendships.friend_id)
      OR 
      (friend_id = auth.uid() AND user_id = friendships.friend_id)
  )
);

CREATE POLICY "Users can update friendship status"
ON friendships
FOR UPDATE
TO authenticated
USING (
  -- Must be the request recipient
  auth.uid() = friend_id
)
WITH CHECK (
  -- Must be the request recipient
  auth.uid() = friend_id AND
  -- Can only update to accepted or declined
  NEW.status IN ('accepted', 'declined')
);

-- Ensure RLS is enabled
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;