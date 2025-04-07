/*
  # Fix Chat RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Fix conversation creation policy

  2. Security
    - Maintain basic access control
    - Allow proper conversation creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
DROP POLICY IF EXISTS "Add participants" ON conversation_participants;
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;

-- Create new policies for conversations
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

CREATE POLICY "Delete conversations"
ON conversations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Create new policies for conversation participants
CREATE POLICY "View participants"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants my_convos
    WHERE my_convos.conversation_id = conversation_id
    AND my_convos.user_id = auth.uid()
  )
);

CREATE POLICY "Add participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new policies for messages
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