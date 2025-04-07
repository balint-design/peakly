/*
  # Translate Skills and Descriptions to German

  1. Changes
    - Create backup of current skill descriptions
    - Update references in dependent tables first
    - Then update primary skill descriptions
    - Add restore function
    
  2. Security
    - Maintain referential integrity
    - Keep existing RLS policies
*/

-- First create a backup of current skill descriptions
CREATE TABLE skill_descriptions_backup AS
SELECT * FROM skill_descriptions;

-- Safely drop constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'outdoor_goals_related_skill_fkey'
  ) THEN
    ALTER TABLE outdoor_goals DROP CONSTRAINT outdoor_goals_related_skill_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'peak_posts_required_skill_fkey'
  ) THEN
    ALTER TABLE peak_posts DROP CONSTRAINT peak_posts_required_skill_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_skills_skill_fkey'
  ) THEN
    ALTER TABLE user_skills DROP CONSTRAINT user_skills_skill_fkey;
  END IF;
END $$;

-- Update existing user skills to match new names
UPDATE user_skills
SET skill = CASE skill
  WHEN 'Mountaineering' THEN 'Bergsteigen'
  WHEN 'Ice climbing' THEN 'Eisklettern'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Rock climbing (Trad)' THEN 'Felsklettern (Trad)'
  WHEN 'Rock climbing (Sport)' THEN 'Felsklettern (Sport)'
  WHEN 'Indoor climbing' THEN 'Hallenklettern'
  WHEN 'Bouldering' THEN 'Bouldern'
  ELSE skill
END;

-- Update peak posts required skills
UPDATE peak_posts
SET required_skill = CASE required_skill
  WHEN 'Mountaineering' THEN 'Bergsteigen'
  WHEN 'Ice climbing' THEN 'Eisklettern'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Rock climbing (Trad)' THEN 'Felsklettern (Trad)'
  WHEN 'Rock climbing (Sport)' THEN 'Felsklettern (Sport)'
  WHEN 'Indoor climbing' THEN 'Hallenklettern'
  WHEN 'Bouldering' THEN 'Bouldern'
  ELSE required_skill
END;

-- Update outdoor goals related skills
UPDATE outdoor_goals
SET related_skill = CASE related_skill
  WHEN 'Mountaineering' THEN 'Bergsteigen'
  WHEN 'Ice climbing' THEN 'Eisklettern'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Rock climbing (Trad)' THEN 'Felsklettern (Trad)'
  WHEN 'Rock climbing (Sport)' THEN 'Felsklettern (Sport)'
  WHEN 'Indoor climbing' THEN 'Hallenklettern'
  WHEN 'Bouldering' THEN 'Bouldern'
  ELSE related_skill
END;

-- Now update the skill descriptions
UPDATE skill_descriptions
SET 
  skill = CASE skill
    WHEN 'Mountaineering' THEN 'Bergsteigen'
    WHEN 'Ice climbing' THEN 'Eisklettern'
    WHEN 'Drytooling' THEN 'Drytooling'
    WHEN 'Rock climbing (Trad)' THEN 'Felsklettern (Trad)'
    WHEN 'Rock climbing (Sport)' THEN 'Felsklettern (Sport)'
    WHEN 'Indoor climbing' THEN 'Hallenklettern'
    WHEN 'Bouldering' THEN 'Bouldern'
    ELSE skill
  END,
  description = CASE skill
    WHEN 'Mountaineering' THEN 'Alpine Kletterei und Hochgebirgsbergsteigen'
    WHEN 'Ice climbing' THEN 'Technisches Eisklettern an gefrorenen Wasserfällen und Gletschern'
    WHEN 'Drytooling' THEN 'Klettern am Fels mit Eisgeräten und Steigeisen'
    WHEN 'Rock climbing (Trad)' THEN 'Traditionelles Klettern mit mobilen Sicherungen'
    WHEN 'Rock climbing (Sport)' THEN 'Sportklettern an eingerichteten Routen'
    WHEN 'Indoor climbing' THEN 'Klettern an künstlichen Wänden'
    WHEN 'Bouldering' THEN 'Klettern ohne Seil an Felsblöcken und niedrigen Wänden'
    ELSE description
  END,
  difficulty_scale = CASE skill
    WHEN 'Mountaineering' THEN 'F, PD, AD, D, TD, ED (UIAA-Skala)'
    WHEN 'Ice climbing' THEN 'WI1 bis WI7, AI1 bis AI6'
    WHEN 'Drytooling' THEN 'D1 bis D16'
    WHEN 'Rock climbing (Trad)' THEN 'UIAA-Skala (I-XII)'
    WHEN 'Rock climbing (Sport)' THEN 'UIAA-Skala (I-XII)'
    WHEN 'Indoor climbing' THEN 'UIAA-Skala für Routen, FB für Boulder'
    WHEN 'Bouldering' THEN 'Fontainebleau-Skala (Fb 3 bis 8C+)'
    ELSE difficulty_scale
  END;

-- Recreate the foreign key constraints
ALTER TABLE outdoor_goals 
  ADD CONSTRAINT outdoor_goals_related_skill_fkey 
  FOREIGN KEY (related_skill) 
  REFERENCES skill_descriptions(skill);

ALTER TABLE peak_posts 
  ADD CONSTRAINT peak_posts_required_skill_fkey 
  FOREIGN KEY (required_skill) 
  REFERENCES skill_descriptions(skill);

ALTER TABLE user_skills 
  ADD CONSTRAINT user_skills_skill_fkey 
  FOREIGN KEY (skill) 
  REFERENCES skill_descriptions(skill);

-- Create a function to restore the backup if needed
CREATE OR REPLACE FUNCTION restore_skill_descriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete current data
  DELETE FROM skill_descriptions;
  
  -- Restore from backup
  INSERT INTO skill_descriptions
  SELECT * FROM skill_descriptions_backup;
END;
$$;