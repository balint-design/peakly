/*
  # Add Peak Posts System

  1. New Tables
    - `peak_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `date` (date)
      - `whatsapp_link` (text)
      - `max_participants` (integer)
      - `required_skill` (text, references skill_descriptions)
      - `required_level` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `post_participants`
      - `post_id` (uuid, references peak_posts)
      - `user_id` (uuid, references profiles)
      - `status` (text): 'confirmed', 'pending', 'declined'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for post management
    - Add policies for participant management
*/

-- Create peak_posts table
CREATE TABLE peak_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text NOT NULL,
  date date NOT NULL,
  whatsapp_link text,
  max_participants integer,
  required_skill text REFERENCES skill_descriptions(skill),
  required_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_max_participants CHECK (max_participants > 0)
);

-- Create post_participants table
CREATE TABLE post_participants (
  post_id uuid REFERENCES peak_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'declined')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Enable RLS
ALTER TABLE peak_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_participants ENABLE ROW LEVEL SECURITY;

-- Add policies for peak_posts
CREATE POLICY "Posts are viewable by everyone"
  ON peak_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create posts"
  ON peak_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON peak_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON peak_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add policies for post_participants
CREATE POLICY "Participants are viewable by everyone"
  ON post_participants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own participation"
  ON post_participants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to check if post is full
CREATE OR REPLACE FUNCTION is_post_full(post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_count integer;
  current_count integer;
BEGIN
  -- Get max participants
  SELECT max_participants INTO max_count
  FROM peak_posts
  WHERE id = post_id;

  -- If no max set, post is not full
  IF max_count IS NULL THEN
    RETURN false;
  END IF;

  -- Get current confirmed participants count
  SELECT COUNT(*) INTO current_count
  FROM post_participants
  WHERE post_participants.post_id = post_id
  AND status = 'confirmed';

  RETURN current_count >= max_count;
END;
$$;