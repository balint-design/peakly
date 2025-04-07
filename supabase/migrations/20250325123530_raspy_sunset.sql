/*
  # Fix Chat Policies

  1. Changes
    - Fix NEW reference in RLS policies
    - Simplify policy structure
    - Maintain security while fixing syntax

  2. Security
    - Maintain proper access control
    - Keep existing functionality
    - Ensure secure chat operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;

-- Create new, simplified policies for conversations
CREATE POLICY "Users can view conversations they're part of"
ON conversations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new policies for conversation participants
CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants self_check
    WHERE self_check.conversation_id = conversation_id
    AND self_check.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add conversation participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 
    FROM conversations 
    WHERE id = conversation_participants.conversation_id
    AND NOT EXISTS (
      SELECT 1 
      FROM conversation_participants existing
      WHERE existing.conversation_id = conversation_participants.conversation_id
    )
  )
);

-- Create new policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON messages
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
  AND
  sender_id NOT IN (
    SELECT blocked_id 
    FROM blocked_users
    WHERE blocker_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
  AND
  auth.uid() = sender_id
);