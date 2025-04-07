/*
  # Fix Route Descriptions Table and Policies

  1. Changes
    - Drop existing policies if they exist
    - Recreate policies with proper checks
    - Ensure table exists with correct structure

  2. Security
    - Maintain RLS
    - Keep user-specific route management
    - Allow public viewing
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own routes" ON route_descriptions;
DROP POLICY IF EXISTS "Routes are viewable by everyone" ON route_descriptions;

-- Create or update table
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