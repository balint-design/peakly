/*
  # Fix Chat Policies

  1. Changes
    - Drop and recreate policies for conversations, participants, and messages
    - Fix policy naming conflicts
    - Ensure proper access control for chat functionality

  2. Security
    - Maintain RLS
    - Allow proper chat functionality
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create new, simplified policies for conversations
CREATE POLICY "View conversations as participant"
ON conversations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Create new conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new policies for conversation participants
CREATE POLICY "View conversation members"
ON conversation_participants
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants self_check
    WHERE self_check.conversation_id = conversation_participants.conversation_id
    AND self_check.user_id = auth.uid()
  )
);

CREATE POLICY "Add conversation members"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  OR
  conversation_id IN (
    SELECT id 
    FROM conversations 
    WHERE NOT EXISTS (
      SELECT 1 
      FROM conversation_participants
      WHERE conversation_id = conversations.id
    )
  )
);

-- Create new policies for messages
CREATE POLICY "View conversation messages"
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

CREATE POLICY "Create new messages"
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