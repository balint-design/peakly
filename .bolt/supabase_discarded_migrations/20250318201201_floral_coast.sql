/*
  # Add skill descriptions table

  1. New Tables
    - `skill_descriptions`
      - `skill` (text, primary key) - The skill name
      - `description` (text) - Detailed description of the skill
      - `difficulty_scale` (text) - Explanation of the difficulty rating system
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `skill_descriptions` table
    - Add policy for public viewing
*/

CREATE TABLE IF NOT EXISTS skill_descriptions (
  skill text PRIMARY KEY,
  description text NOT NULL,
  difficulty_scale text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skill_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill descriptions are viewable by everyone"
  ON skill_descriptions
  FOR SELECT
  TO public
  USING (true);

-- Insert initial skill descriptions
INSERT INTO skill_descriptions (skill, description, difficulty_scale) VALUES
  ('Mountaineering', 'Alpine climbing and hiking on mountains, often involving snow and ice travel.', 'F (Facile) to ED (Extremely Difficult)'),
  ('Ice climbing', 'Climbing ice formations using specialized equipment like ice axes and crampons.', 'WI1 (Easy) to WI7 (Extremely Hard)'),
  ('Drytooling', 'Using ice climbing tools on rock when ice is not available or mixed.', 'D1 to D16'),
  ('Rock climbing (Trad)', 'Traditional climbing using removable protection placed by the climber.', '5.1 to 5.15d (YDS)'),
  ('Rock climbing (Sport)', 'Climbing using permanent anchors fixed to the rock for protection.', '5.1 to 5.15d (YDS)'),
  ('Indoor climbing', 'Climbing on artificial walls with clearly marked routes.', '5.1 to 5.15d (YDS)'),
  ('Bouldering', 'Climbing without ropes on shorter walls or boulders.', 'V0 to V17 (Hueco)');