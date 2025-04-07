/*
  # Add Chat System Tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `conversation_participants`
      - `conversation_id` (uuid, references conversations)
      - `user_id` (uuid, references profiles)
      - `last_read_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `media_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `blocked_users`
      - `blocker_id` (uuid, references profiles)
      - `blocked_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Handle message visibility for blocked users
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blocked_users table
CREATE TABLE blocked_users (
  blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view conversations they're part of"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their last read timestamp"
  ON conversation_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    ) AND
    sender_id NOT IN (
      SELECT blocked_id FROM blocked_users
      WHERE blocker_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages if not blocked"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    ) AND
    sender_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = auth.uid() AND blocked_id IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
      )) OR
      (blocked_id = auth.uid() AND blocker_id IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
      ))
    )
  );

-- Blocked users policies
CREATE POLICY "Users can view their blocked list"
  ON blocked_users
  FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others"
  ON blocked_users
  FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others"
  ON blocked_users
  FOR DELETE
  USING (blocker_id = auth.uid());

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();