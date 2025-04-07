/*
  # Add Skill Descriptions Table

  1. New Tables
    - `skill_descriptions`
      - `skill` (text, primary key)
      - `description` (text)
      - `difficulty_scale` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for public viewing
    - Add initial skill data
*/

-- Create skill descriptions table
CREATE TABLE IF NOT EXISTS skill_descriptions (
  skill text PRIMARY KEY,
  description text NOT NULL,
  difficulty_scale text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE skill_descriptions ENABLE ROW LEVEL SECURITY;

-- Add policy for public viewing
CREATE POLICY "Skill descriptions are viewable by everyone"
  ON skill_descriptions
  FOR SELECT
  TO public
  USING (true);

-- Insert initial skill data
INSERT INTO skill_descriptions (skill, description, difficulty_scale) VALUES
  ('Mountaineering', 'Alpine climbing and high-altitude mountaineering skills', 'F, PD, AD, D, TD, ED'),
  ('Ice climbing', 'Technical ice climbing on frozen waterfalls and glaciers', 'WI1 to WI7, AI1 to AI6'),
  ('Drytooling', 'Climbing rock with ice tools and crampons', 'D1 to D16'),
  ('Rock climbing (Trad)', 'Traditional climbing using removable protection', 'Yosemite Decimal System (5.0-5.15)'),
  ('Rock climbing (Sport)', 'Sport climbing on bolted routes', 'French grade system (3-9c)'),
  ('Indoor climbing', 'Climbing on artificial walls', 'Font scale for bouldering, French grades for routes'),
  ('Bouldering', 'Climbing short routes without rope protection', 'Font scale (3 to 8C+)')
ON CONFLICT (skill) DO UPDATE SET
  description = EXCLUDED.description,
  difficulty_scale = EXCLUDED.difficulty_scale,
  updated_at = now();