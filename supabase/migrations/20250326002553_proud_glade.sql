/*
  # Fix Date Constraint in Peak Posts Table

  1. Changes
    - Make date column nullable in peak_posts table
    - Update existing records to handle null dates

  2. Security
    - Maintain existing RLS policies
*/

-- Make date column nullable
ALTER TABLE peak_posts
ALTER COLUMN date DROP NOT NULL;