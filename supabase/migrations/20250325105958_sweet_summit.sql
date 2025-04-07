/*
  # Add Intent Tags to Profiles

  1. Changes
    - Add intent_tags array column to profiles table
    - Add check constraint to limit array size to 2 elements
    - Add check constraint to validate tag values

  2. Security
    - Maintain existing RLS policies
*/

-- Add intent_tags column with constraints
ALTER TABLE profiles
ADD COLUMN intent_tags text[] DEFAULT ARRAY[]::text[],
ADD CONSTRAINT intent_tags_max_size CHECK (array_length(intent_tags, 1) <= 2),
ADD CONSTRAINT intent_tags_valid_values CHECK (
  intent_tags <@ ARRAY[
    'Trainingspartner:in gesucht',
    'Projektpartner:in gesucht',
    'Mentor:in gesucht',
    'Mentee gesucht',
    'Reisepartner:in gesucht',
    'Routenempfehlungen willkommen',
    'Offen für Spontanes'
  ]::text[]
);