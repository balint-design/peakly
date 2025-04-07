export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  languages: string[];
  intent_tags: string[];
  created_at: string;
  updated_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill: string;
  experience_level: string;
  created_at: string;
  updated_at: string;
};

export type RouteDescription = {
  id: string;
  user_id: string;
  skill: string;
  route_name: string;
  description: string | null;
  grade: string;
  date_completed: string | null;
  created_at: string;
  updated_at: string;
};

export type SkillDescription = {
  skill: string;
  description: string;
  difficulty_scale: string;
  created_at: string;
  updated_at: string;
};

export type OutdoorGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  related_skill: string | null;
  difficulty: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type PeakPost = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  date: string;
  whatsapp_link: string | null;
  max_participants: number | null;
  required_skill: string | null;
  required_level: string | null;
  created_at: string;
  updated_at: string;
};

export type PostParticipant = {
  post_id: string;
  user_id: string;
  status: 'confirmed' | 'pending' | 'declined';
  created_at: string;
};

export const AVAILABLE_SKILLS = [
  'Mountaineering',
  'Ice climbing',
  'Drytooling',
  'Rock climbing (Trad)',
  'Rock climbing (Sport)',
  'Indoor climbing',
  'Bouldering',
] as const;

const SKILL_TRANSLATIONS: Record<string, string> = {
  'Bergsteigen': 'Mountaineering',
  'Eisklettern': 'Ice climbing',
  'Drytoolen': 'Drytooling',
  'Felsklettern (Trad)': 'Rock climbing (Trad)',
  'Felsklettern (Sport)': 'Rock climbing (Sport)',
  'Indoor Klettern': 'Indoor climbing',
  'Bouldern': 'Bouldering',
};

const SKILL_TRANSLATIONS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(SKILL_TRANSLATIONS).map(([k, v]) => [v, k])
);

export type Skill = typeof AVAILABLE_SKILLS[number];

export const INTENT_TAGS = [
  'Tourenpartner:in gesucht',
  'Trainingspartner:in gesucht',
  'Flexibel für spontane Touren',
  'Unter der Woche verfügbar',
  'Nur am Wochenende verfügbar',
  'Neu in der Region'
] as const;

type IntentTag = typeof INTENT_TAGS[number];

type IntentTagRecord = {
  tag: string;
  created_at: string;
  updated_at: string;
};