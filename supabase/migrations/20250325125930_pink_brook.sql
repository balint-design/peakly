/*
  # Simplify RLS Policies

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Move complex logic to application queries
    - Keep basic security checks at RLS level

  2. Security
    - Maintain basic access control
    - Prevent unauthorized access
    - Allow application-level filtering
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View own conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "View participants" ON conversation_participants;
DROP POLICY IF EXISTS "Add participants" ON conversation_participants;
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;

-- Create basic policies for conversations
CREATE POLICY "View conversations"
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

-- Create basic policies for conversation participants
CREATE POLICY "View participants"
ON conversation_participants
FOR SELECT
TO public
USING (user_id = auth.uid());

CREATE POLICY "Add participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create basic policies for messages
CREATE POLICY "View messages"
ON messages
FOR SELECT
TO public
USING (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);