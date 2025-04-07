/*
  # Add Contact Links to Profiles

  1. New Fields
    - Add contact fields to profiles table:
      - `whatsapp` (text, nullable)
      - `telegram` (text, nullable)
      - `social_media` (text, nullable)
      - `other_contact` (text, nullable)
      - `contact_visibility` (text, default 'public')

  2. Security
    - Add check constraint for visibility options
    - Maintain existing RLS policies
*/

-- Add contact fields to profiles table
ALTER TABLE profiles
ADD COLUMN whatsapp text,
ADD COLUMN telegram text,
ADD COLUMN social_media text,
ADD COLUMN other_contact text,
ADD COLUMN contact_visibility text DEFAULT 'public' CHECK (contact_visibility IN ('public', 'friends_only'));

-- Create function to check if users are friends
CREATE OR REPLACE FUNCTION are_friends(user_id_1 uuid, user_id_2 uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (user_id = user_id_1 AND friend_id = user_id_2)
      OR
      (user_id = user_id_2 AND friend_id = user_id_1)
    )
  );
END;
$$;