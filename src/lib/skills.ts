// Skill level definitions for each climbing discipline
export const SKILL_LEVELS = {
  'Mountaineering': ['F', 'PD', 'AD', 'D', 'TD', 'ED'],
  'Ice climbing': ['WI1', 'WI2', 'WI3', 'WI4', 'WI5', 'WI6', 'WI7'],
  'Drytooling': ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'],
  'Rock climbing (Trad)': ['3', '4', '5', '6a', '6b', '6c', '7a', '7b', '7c', '8a'],
  'Rock climbing (Sport)': ['3', '4', '5', '6a', '6b', '6c', '7a', '7b', '7c', '8a'],
  'Indoor climbing': ['3', '4', '5', '6a', '6b', '6c', '7a', '7b', '7c', '8a'],
  'Bouldering': ['3', '4', '5', '6A', '6B', '6C', '7A', '7B', '7C', '8A']
} as const;

// Skill level descriptions
export const SKILL_LEVEL_DESCRIPTIONS = {
  'Mountaineering': {
    'F': 'Facile - Easy terrain, basic skills needed',
    'PD': 'Peu Difficile - Slightly difficult, some technical skills required',
    'AD': 'Assez Difficile - Fairly difficult, good technical skills needed',
    'D': 'Difficile - Difficult, extensive experience required',
    'TD': 'Très Difficile - Very difficult, expert level',
    'ED': 'Extrêmement Difficile - Extremely difficult, highest level'
  },
  'Ice climbing': {
    'WI1': 'Low-angle ice, basic skills needed',
    'WI2': 'Consistent 60° ice, good technique required',
    'WI3': 'Sustained 70° ice with possible bulges',
    'WI4': 'Near-vertical ice with technical sections',
    'WI5': 'Vertical ice with extended technical sections',
    'WI6': 'Vertical to overhanging ice, expert level',
    'WI7': 'Overhanging ice with minimal rests, highest level'
  }
} as const;