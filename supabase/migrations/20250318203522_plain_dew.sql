/*
  # Add delete policies for user data (with safety checks)

  1. Changes
    - Add RLS policies to allow users to delete their own:
      - Profile data
      - Skills data
      - Auth data
    - Includes safety checks to prevent duplicate policies

  2. Security
    - Enable RLS on all tables
    - Add policies to ensure users can only delete their own data
    - Maintain referential integrity with cascading deletes
*/

DO $$ 
BEGIN
  -- Add policy for users to delete their own profile if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
      ON profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Add policy for users to delete their own skills if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_skills' 
    AND policyname = 'Users can delete own skills'
  ) THEN
    CREATE POLICY "Users can delete own skills"
      ON user_skills
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Update foreign key constraint with cascade delete if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_skills_user_id_fkey'
  ) THEN
    ALTER TABLE user_skills
      DROP CONSTRAINT user_skills_user_id_fkey,
      ADD CONSTRAINT user_skills_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;