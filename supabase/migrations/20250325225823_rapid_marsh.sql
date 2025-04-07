/*
  # Fix Skill Approvals System

  1. Changes
    - Add missing policies if they don't exist
    - Add helper function if it doesn't exist
    - Handle existing table gracefully

  2. Security
    - Maintain RLS policies
    - Keep friend-only approval restriction
*/

-- Ensure RLS is enabled
ALTER TABLE skill_approvals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Skill approvals are viewable by everyone" ON skill_approvals;
DROP POLICY IF EXISTS "Friends can approve skills" ON skill_approvals;

-- Recreate policies
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

-- Drop function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS has_approved_skill(uuid);

-- Create or replace function
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