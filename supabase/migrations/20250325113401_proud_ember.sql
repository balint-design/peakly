/*
  # Create Intent Tags Table with Trigger-based Validation

  1. New Tables
    - `intent_tags`
      - `tag` (text, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Create intent_tags table to store available tags
    - Create trigger function to validate profile intent tags
    - Add initial tags
    - Remove old constraint and add trigger-based validation

  3. Security
    - Enable RLS
    - Add policy for public viewing
*/

-- Create intent_tags table
CREATE TABLE IF NOT EXISTS intent_tags (
  tag text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE intent_tags ENABLE ROW LEVEL SECURITY;

-- Add policy for public viewing
CREATE POLICY "Intent tags are viewable by everyone"
  ON intent_tags
  FOR SELECT
  TO public
  USING (true);

-- Insert initial tags
INSERT INTO intent_tags (tag) VALUES
  ('Tourenpartner:in gesucht'),
  ('Trainingspartner:in gesucht'),
  ('Flexibel für spontane Touren'),
  ('Unter der Woche verfügbar'),
  ('Nur am Wochenende verfügbar'),
  ('Neu in der Region');

-- Drop existing constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS intent_tags_valid_values;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_intent_tags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invalid_tag text;
BEGIN
  -- Check if any tag in the array is not in intent_tags table
  SELECT tag INTO invalid_tag
  FROM unnest(NEW.intent_tags) AS tag
  WHERE tag NOT IN (SELECT tag FROM intent_tags);

  IF FOUND THEN
    RAISE EXCEPTION 'Invalid intent tag: %', invalid_tag;
  END IF;

  -- Check array size
  IF array_length(NEW.intent_tags, 1) > 2 THEN
    RAISE EXCEPTION 'Maximum of 2 intent tags allowed';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS validate_intent_tags_trigger ON profiles;
CREATE TRIGGER validate_intent_tags_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_intent_tags();