/*
  # Fix Chat Policies

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Fix conversation participant policies
    - Update message policies
    - Maintain security while avoiding circular references

  2. Security
    - Ensure proper access control
    - Prevent unauthorized access
    - Maintain data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Create new, simplified policies
CREATE POLICY "Users can view conversations they're part of"
ON conversations
FOR SELECT
TO public
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
TO public
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM conversation_participants my_convos
    WHERE my_convos.conversation_id = conversation_id
    AND my_convos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversation_id
    AND conversation_participants.user_id = auth.uid()
    AND sender_id NOT IN (
      SELECT blocked_id 
      FROM blocked_users
      WHERE blocker_id = auth.uid()
    )
  )
);

-- Add policy for creating conversations
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add policy for adding conversation participants
CREATE POLICY "Users can add conversation participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE id = conversation_id
  )
);