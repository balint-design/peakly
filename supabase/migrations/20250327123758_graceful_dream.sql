/*
  # Fix City Search and Filtering

  1. Changes
    - Drop existing search_cities function
    - Create new function with proper filtering
    - Add index for performance

  2. Security
    - Maintain RLS policies
    - Keep public access
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
  SELECT 
    c.city_id,
    c.name,
    c.country,
    c.lat,
    c.lng
  FROM city c
  WHERE 
    LOWER(c.name) LIKE LOWER('%' || search_term || '%')
  ORDER BY 
    -- Exact matches first
    CASE 
      WHEN LOWER(c.name) = LOWER(search_term) THEN 0
      -- Then matches at start of name
      WHEN LOWER(c.name) LIKE LOWER(search_term || '%') THEN 1
      -- Then partial matches
      ELSE 2
    END,
    -- Secondary sort by name length (shorter names first)
    LENGTH(c.name)
  LIMIT limit_count;
END;
$$;

-- Create index for case-insensitive search if it doesn't exist
CREATE INDEX IF NOT EXISTS city_name_lower_idx ON city (LOWER(name));