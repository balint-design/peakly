/*
  # Fix Chat Policies to Prevent Recursion

  1. Changes
    - Drop and recreate all chat policies
    - Simplify policy logic to prevent recursion
    - Use EXISTS instead of IN where appropriate

  2. Security
    - Maintain proper access control
    - Keep basic security rules
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Conversations policies
CREATE POLICY "View conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "View participants"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Add participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Messages policies
CREATE POLICY "View messages"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);