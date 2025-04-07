/*
  # Remove Chat System

  1. Changes
    - Drop all chat-related tables if they exist
    - Remove associated triggers and functions
    - Clean up any remaining chat artifacts
    - Add proper error handling

  2. Security
    - Remove all chat-related RLS policies
*/

DO $$ 
BEGIN
  -- Drop tables if they exist (in correct order)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP TABLE messages CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_participants') THEN
    DROP TABLE conversation_participants CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    DROP TABLE conversations CASCADE;
  END IF;

  -- Drop function if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_conversation_timestamp') THEN
    DROP FUNCTION update_conversation_timestamp CASCADE;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but continue execution
    RAISE NOTICE 'Error during chat system removal: %', SQLERRM;
END $$;