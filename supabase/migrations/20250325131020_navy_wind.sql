/*
  # Fix Conversation Policies

  1. Changes
    - Drop existing policies
    - Create new policies for conversations table
    - Fix incorrect column references
    - Simplify policy logic

  2. Security
    - Maintain proper access control
    - Allow authenticated users to manage their conversations
    - Keep basic security rules
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can select their own conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can delete their own conversations" ON conversations;

-- Create new, simplified policies for conversations
CREATE POLICY "Authenticated users can select their own conversations" 
ON conversations 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert conversations" 
ON conversations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own conversations" 
ON conversations 
FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can delete their own conversations" 
ON conversations 
FOR DELETE 
TO authenticated 
USING (
  id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);