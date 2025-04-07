/*
  # Revert Skills and Descriptions to English

  1. Changes
    - Revert all skill names back to English
    - Update all related tables
    - Maintain referential integrity
    
  2. Security
    - Keep existing RLS policies
    - Safely handle constraints
*/

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

-- Update existing user skills back to English
UPDATE user_skills
SET skill = CASE skill
  WHEN 'Bergsteigen' THEN 'Mountaineering'
  WHEN 'Eisklettern' THEN 'Ice climbing'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Felsklettern (Trad)' THEN 'Rock climbing (Trad)'
  WHEN 'Felsklettern (Sport)' THEN 'Rock climbing (Sport)'
  WHEN 'Hallenklettern' THEN 'Indoor climbing'
  WHEN 'Bouldern' THEN 'Bouldering'
  ELSE skill
END;

-- Update peak posts required skills
UPDATE peak_posts
SET required_skill = CASE required_skill
  WHEN 'Bergsteigen' THEN 'Mountaineering'
  WHEN 'Eisklettern' THEN 'Ice climbing'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Felsklettern (Trad)' THEN 'Rock climbing (Trad)'
  WHEN 'Felsklettern (Sport)' THEN 'Rock climbing (Sport)'
  WHEN 'Hallenklettern' THEN 'Indoor climbing'
  WHEN 'Bouldern' THEN 'Bouldering'
  ELSE required_skill
END;

-- Update outdoor goals related skills
UPDATE outdoor_goals
SET related_skill = CASE related_skill
  WHEN 'Bergsteigen' THEN 'Mountaineering'
  WHEN 'Eisklettern' THEN 'Ice climbing'
  WHEN 'Drytooling' THEN 'Drytooling'
  WHEN 'Felsklettern (Trad)' THEN 'Rock climbing (Trad)'
  WHEN 'Felsklettern (Sport)' THEN 'Rock climbing (Sport)'
  WHEN 'Hallenklettern' THEN 'Indoor climbing'
  WHEN 'Bouldern' THEN 'Bouldering'
  ELSE related_skill
END;

-- Now update the skill descriptions back to English
UPDATE skill_descriptions
SET 
  skill = CASE skill
    WHEN 'Bergsteigen' THEN 'Mountaineering'
    WHEN 'Eisklettern' THEN 'Ice climbing'
    WHEN 'Drytooling' THEN 'Drytooling'
    WHEN 'Felsklettern (Trad)' THEN 'Rock climbing (Trad)'
    WHEN 'Felsklettern (Sport)' THEN 'Rock climbing (Sport)'
    WHEN 'Hallenklettern' THEN 'Indoor climbing'
    WHEN 'Bouldern' THEN 'Bouldering'
    ELSE skill
  END,
  description = CASE skill
    WHEN 'Bergsteigen' THEN 'Alpine climbing and high-altitude mountaineering skills'
    WHEN 'Eisklettern' THEN 'Technical ice climbing on frozen waterfalls and glaciers'
    WHEN 'Drytooling' THEN 'Climbing rock with ice tools and crampons'
    WHEN 'Felsklettern (Trad)' THEN 'Traditional climbing using removable protection'
    WHEN 'Felsklettern (Sport)' THEN 'Sport climbing on bolted routes'
    WHEN 'Hallenklettern' THEN 'Climbing on artificial walls'
    WHEN 'Bouldern' THEN 'Climbing short routes without rope protection'
    ELSE description
  END,
  difficulty_scale = CASE skill
    WHEN 'Bergsteigen' THEN 'F, PD, AD, D, TD, ED'
    WHEN 'Eisklettern' THEN 'WI1 to WI7, AI1 to AI6'
    WHEN 'Drytooling' THEN 'D1 to D16'
    WHEN 'Felsklettern (Trad)' THEN 'Yosemite Decimal System (5.0-5.15)'
    WHEN 'Felsklettern (Sport)' THEN 'French grade system (3-9c)'
    WHEN 'Hallenklettern' THEN 'Font scale for bouldering, French grades for routes'
    WHEN 'Bouldern' THEN 'Font scale (3 to 8C+)'
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

-- Drop the backup table if it exists
DROP TABLE IF EXISTS skill_descriptions_backup;