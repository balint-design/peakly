/*
  # Add difficulty field to outdoor_goals table

  1. Changes
    - Add difficulty column to outdoor_goals table
    - Remove target_date column from outdoor_goals table
    - Update existing goals to have null difficulty

  2. Security
    - Maintain existing RLS policies
*/

-- Add difficulty column
ALTER TABLE outdoor_goals
ADD COLUMN difficulty text;

-- Remove target_date column
ALTER TABLE outdoor_goals
DROP COLUMN IF EXISTS target_date;