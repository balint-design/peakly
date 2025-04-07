/*
  # Fix Message Policies

  1. Changes
    - Drop existing policies
    - Recreate policies with unique names
    - Maintain same security rules with simplified structure

  2. Security
    - Keep basic access control
    - Prevent unauthorized access
    - Allow proper message viewing and sending
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages if not blocked" ON messages;

-- Create new policies for messages with unique names
CREATE POLICY "message_view_policy"
ON messages
FOR SELECT
TO public
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