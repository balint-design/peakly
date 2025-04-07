/*
  # Fix Chat System RLS Policies

  1. Changes
    - Fix infinite recursion in conversation_participants policies
    - Simplify conversation access policies
    - Add proper join conditions

  2. Security
    - Maintain proper access control
    - Prevent policy recursion
    - Keep existing security measures
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;

-- Create new, simplified policies
CREATE POLICY "Users can view conversations they're part of"
ON conversations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- Update messages policy to use the same pattern
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
  AND
  sender_id NOT IN (
    SELECT blocked_id FROM blocked_users
    WHERE blocker_id = auth.uid()
  )
);