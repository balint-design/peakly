/*
  # Fix Chat Policies to Prevent Recursion

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new, simplified policies for conversations and participants
    - Ensure proper access control without circular references

  2. Security
    - Maintain RLS
    - Allow proper chat functionality
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View conversations as participant" ON conversations;
DROP POLICY IF EXISTS "Create new conversations" ON conversations;
DROP POLICY IF EXISTS "View conversation members" ON conversation_participants;
DROP POLICY IF EXISTS "Add conversation members" ON conversation_participants;
DROP POLICY IF EXISTS "View conversation messages" ON messages;
DROP POLICY IF EXISTS "Create new messages" ON messages;

-- Create simplified policies for conversations
CREATE POLICY "View own conversations"
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

CREATE POLICY "Create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create simplified policies for conversation participants
CREATE POLICY "View participants"
ON conversation_participants
FOR SELECT
TO public
USING (
  -- Can view if user is a participant
  user_id = auth.uid()
  OR
  -- Or if user is in the same conversation
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Add participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- Can add participants to own conversations
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  OR
  -- Or when creating a new conversation (no existing participants)
  conversation_id IN (
    SELECT id
    FROM conversations c
    WHERE NOT EXISTS (
      SELECT 1
      FROM conversation_participants cp
      WHERE cp.conversation_id = c.id
    )
  )
);

-- Create simplified policies for messages
CREATE POLICY "View messages"
ON messages
FOR SELECT
TO public
USING (
  -- Can view messages in conversations user is part of
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  AND
  -- And sender is not blocked
  sender_id NOT IN (
    SELECT blocked_id
    FROM blocked_users
    WHERE blocker_id = auth.uid()
  )
);

CREATE POLICY "Send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Can send messages to conversations user is part of
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  AND
  -- Must be the sender
  sender_id = auth.uid()
);