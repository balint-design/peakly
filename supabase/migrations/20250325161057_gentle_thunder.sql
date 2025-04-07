/*
  # Fix Messages Policy

  1. Changes
    - Drop existing message policies
    - Create new policy to allow viewing messages in conversations
    - Maintain security while fixing visibility issue

  2. Security
    - Enable proper message access
    - Keep blocked user filtering
*/

-- Drop existing policies
DROP POLICY IF EXISTS "message_view_policy" ON messages;
DROP POLICY IF EXISTS "message_insert_policy" ON messages;

-- Create new policies for messages
CREATE POLICY "message_view_policy"
ON messages
FOR SELECT
TO authenticated
USING (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  AND
  sender_id NOT IN (
    SELECT blocked_id 
    FROM blocked_users
    WHERE blocker_id = auth.uid()
  )
);

CREATE POLICY "message_insert_policy"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
  AND
  sender_id = auth.uid()
);