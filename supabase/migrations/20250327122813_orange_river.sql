/*
  # Fix City Search Function

  1. Changes
    - Update search_cities function to handle state column properly
    - Improve search performance
    - Fix column references

  2. Security
    - Maintain RLS policies
    - Keep function security settings
*/

-- Drop existing function
DROP FUNCTION IF EXISTS search_cities(text, integer);

-- Create updated function
CREATE OR REPLACE FUNCTION search_cities(search_term text, limit_count integer DEFAULT 8)
RETURNS TABLE (
  id uuid,
  name text,
  country text,
  lat numeric,
  lng numeric,
  population integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.country, c.lat, c.lng, c.population
  FROM cities c
  WHERE 
    c.name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN c.name ILIKE search_term THEN 0
         WHEN c.name ILIKE search_term || '%' THEN 1
         ELSE 2
    END,
    c.population DESC NULLS LAST
  LIMIT limit_count;
END;
$$;