/*
  # Add Cities Table with Text Search

  1. Changes
    - Enable pg_trgm extension for text search
    - Create cities table with proper indexes
    - Add search function with text pattern matching
    
  2. Security
    - Enable RLS
    - Allow public viewing
*/

-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create cities table
CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  country text NOT NULL CHECK (country IN ('DE', 'AT', 'CH')),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  population integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, state, country)
);

-- Create indexes for search performance
CREATE INDEX cities_name_trgm_idx ON cities USING gin (name gin_trgm_ops);
CREATE INDEX cities_country_idx ON cities(country);
CREATE INDEX cities_state_trgm_idx ON cities USING gin (state gin_trgm_ops);

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Add policy for public viewing
CREATE POLICY "Cities are viewable by everyone"
  ON cities
  FOR SELECT
  TO public
  USING (true);

-- Create function to search cities
CREATE OR REPLACE FUNCTION search_cities(search_term text, limit_count integer DEFAULT 8)
RETURNS TABLE (
  id uuid,
  name text,
  state text,
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
  SELECT c.id, c.name, c.state, c.country, c.lat, c.lng, c.population
  FROM cities c
  WHERE 
    c.name ILIKE '%' || search_term || '%'
    OR c.state ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN c.name ILIKE search_term THEN 0
         WHEN c.name ILIKE search_term || '%' THEN 1
         ELSE 2
    END,
    c.population DESC NULLS LAST
  LIMIT limit_count;
END;
$$;