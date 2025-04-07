/*
  # Add Outdoor Goals Table

  1. New Tables
    - `outdoor_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `related_skill` (text, references skill_descriptions)
      - `target_date` (date)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Add public viewing policy
*/

CREATE TABLE IF NOT EXISTS outdoor_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  related_skill text REFERENCES skill_descriptions(skill),
  target_date date,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE outdoor_goals ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage their own goals"
  ON outdoor_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Goals are viewable by everyone"
  ON outdoor_goals
  FOR SELECT
  TO public
  USING (true);