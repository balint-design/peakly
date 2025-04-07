/*
  # Add Notifications System for Posts

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `data` (jsonb)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for notification management
*/

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  data jsonb NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_post_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_data record;
  participant_data record;
BEGIN
  -- Get post data
  SELECT title, user_id INTO post_data
  FROM peak_posts
  WHERE id = NEW.post_id;

  -- Get participant data
  SELECT username, full_name INTO participant_data
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notification for post creator
  IF NEW.status = 'confirmed' AND post_data.user_id != NEW.user_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    ) VALUES (
      post_data.user_id,
      'new_participant',
      jsonb_build_object(
        'post_id', NEW.post_id,
        'post_title', post_data.title,
        'participant_id', NEW.user_id,
        'participant_name', COALESCE(participant_data.full_name, participant_data.username)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for notifications
CREATE TRIGGER on_post_participant_added
  AFTER INSERT ON post_participants
  FOR EACH ROW
  EXECUTE FUNCTION create_post_notification();