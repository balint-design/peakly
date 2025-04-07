-- Drop existing tables and policies
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view participants"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view messages"
ON messages
FOR SELECT
TO authenticated
USING (
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE user_id = auth.uid()
  )
);