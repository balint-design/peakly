/*
  # Remove Chat System Tables

  1. Changes
    - Remove all chat-related tables and functions
    - Clean up in correct dependency order
    - Use safe DROP IF EXISTS statements

  2. Security
    - Remove associated RLS policies automatically via CASCADE
    - Clean removal of dependent objects
*/

-- First disable RLS to avoid policy recursion issues
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;

-- Drop tables in correct dependency order
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Clean up any remaining functions
DROP FUNCTION IF EXISTS update_conversation_timestamp() CASCADE;