/*
  # Add Skill Approvals System

  1. New Tables
    - `skill_approvals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill_id` (uuid, references user_skills)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for:
      - Public viewing of approvals
      - Friends-only approval creation
*/

-- Create skill_approvals table
CREATE TABLE skill_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES user_skills(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE skill_approvals ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Skill approvals are viewable by everyone"
ON skill_approvals
FOR SELECT
TO public
USING (true);

CREATE POLICY "Friends can approve skills"
ON skill_approvals
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if the user is friends with the skill owner
  EXISTS (
    SELECT 1 FROM user_skills
    JOIN friendships ON (
      (friendships.user_id = auth.uid() AND friendships.friend_id = user_skills.user_id)
      OR 
      (friendships.friend_id = auth.uid() AND friendships.user_id = user_skills.user_id)
    )
    WHERE user_skills.id = skill_id
    AND friendships.status = 'accepted'
  )
  -- Prevent self-approval
  AND auth.uid() != (
    SELECT user_id FROM user_skills WHERE id = skill_id
  )
);

-- Create function to check if user has approved a skill
CREATE OR REPLACE FUNCTION has_approved_skill(skill_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM skill_approvals
    WHERE skill_approvals.skill_id = $1
    AND skill_approvals.user_id = auth.uid()
  );
END;
$$;