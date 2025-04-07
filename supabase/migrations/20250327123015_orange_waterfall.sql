/*
  # Fix City Search Function

  1. Changes
    - Remove population column from search results
    - Update function to match city table schema
    - Keep core search functionality

  2. Security
    - Maintain RLS policies
    - Keep function security settings
*/

-- Drop existing function
DROP FUNCTION IF EXISTS search_cities(text, integer);

-- Create updated function
CREATE OR REPLACE FUNCTION search_cities(search_term text, limit_count integer DEFAULT 8)
RETURNS TABLE (
  city_id uuid,
  name text,
  country text,
  lat double precision,
  lng double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.city_id, c.name, c.country, c.lat, c.lng
  FROM city c
  WHERE 
    c.name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN c.name ILIKE search_term THEN 0
         WHEN c.name ILIKE search_term || '%' THEN 1
         ELSE 2
    END
  LIMIT limit_count;
END;
$$;