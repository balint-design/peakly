/*
  # Add Route Descriptions Table

  1. New Tables
    - `route_descriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill` (text, references skill_descriptions)
      - `route_name` (text)
      - `description` (text)
      - `grade` (text)
      - `date_completed` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Add public viewing policy
*/

CREATE TABLE IF NOT EXISTS route_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill text REFERENCES skill_descriptions(skill),
  route_name text NOT NULL,
  description text,
  grade text NOT NULL,
  date_completed date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE route_descriptions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage their own routes"
  ON route_descriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Routes are viewable by everyone"
  ON route_descriptions
  FOR SELECT
  TO public
  USING (true);