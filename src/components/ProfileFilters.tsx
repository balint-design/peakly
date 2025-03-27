import React from 'react';
import { Filter, X } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { AVAILABLE_SKILLS, INTENT_TAGS, type Skill } from '../types/database';
import { LocationInput } from './LocationInput';
import { SKILL_LEVELS } from '../lib/skills';

type Filters = {
  ageRange: {
    min: string;
    max: string;
  };
  gender: string;
  location: string;
  radius: string;
  skill: string;
  skillLevelRange: {
    min: number;
    max: number;
  };
  intentTags: string[];
};

type ProfileFiltersProps = {
  filters: Filters;
  showFilters: boolean;
  onFiltersChange: (filters: Filters) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
};

export function ProfileFilters({
  filters,
  showFilters,
  onFiltersChange,
  onToggleFilters,
  onClearFilters,
}: ProfileFiltersProps) {
  const hasActiveFilters = 
    filters.ageRange.min || 
    filters.ageRange.max || 
    filters.gender || 
    filters.location || 
    filters.radius ||
    filters.skill ||
    (filters.skillLevelRange.min > 0 || filters.skillLevelRange.max < 100) ||
    filters.intentTags.length > 0;

  const handleAgeChange = (min: string, max: string) => {
    onFiltersChange({
      ...filters,
      ageRange: { min, max }
    });
  };

  const getSkillLevels = (skill: string) => {
    if (!skill || !SKILL_LEVELS[skill as keyof typeof SKILL_LEVELS]) return [];
    return SKILL_LEVELS[skill as keyof typeof SKILL_LEVELS];
  };

  const handleSkillLevelRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      skillLevelRange: { min: values[0], max: values[1] }
    });
  };

  const handleIntentTagToggle = (tag: string) => {
    const newTags = filters.intentTags.includes(tag)
      ? filters.intentTags.filter(t => t !== tag)
      : [...filters.intentTags, tag];
    
    onFiltersChange({
      ...filters,
      intentTags: newTags
    });
  };

  const currentSkillLevels = getSkillLevels(filters.skill);
  const selectedMinLevel = Math.floor((currentSkillLevels.length - 1) * (filters.skillLevelRange.min / 100));
  const selectedMaxLevel = Math.floor((currentSkillLevels.length - 1) * (filters.skillLevelRange.max / 100));

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">Tourenpartner:innen</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              showFilters 
                ? 'bg-black text-white hover:bg-gray-900' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alter
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={filters.ageRange.min}
                  onChange={(e) => handleAgeChange(e.target.value, filters.ageRange.max)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Von"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={filters.ageRange.max}
                  onChange={(e) => handleAgeChange(filters.ageRange.min, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Bis"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geschlecht
              </label>
              <select
                value={filters.gender}
                onChange={(e) => onFiltersChange({ ...filters, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Alle</option>
                <option value="m">Männlich</option>
                <option value="f">Weiblich</option>
                <option value="d">Divers</option>
              </select>
            </div>

            {/* Location and Radius */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standort
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <LocationInput
                    value={filters.location}
                    onChange={(value) => onFiltersChange({ ...filters, location: value })}
                    className="text-sm"
                  />
                </div>
                <select
                  value={filters.radius}
                  onChange={(e) => onFiltersChange({ ...filters, radius: e.target.value })}
                  className="w-full sm:w-32 px-3 py-2 border rounded-lg text-sm"
                  disabled={!filters.location}
                >
                  <option value="">Umkreis</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>
            </div>

            {/* Intent Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suchkriterien
              </label>
              <div className="flex flex-wrap gap-2">
                {INTENT_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleIntentTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.intentTags.includes(tag)
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill
              </label>
              <select
                value={filters.skill}
                onChange={(e) => {
                  const newSkill = e.target.value as Skill;
                  onFiltersChange({ 
                    ...filters, 
                    skill: newSkill,
                    skillLevelRange: { min: 0, max: 100 }
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Alle</option>
                {AVAILABLE_SKILLS.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Skill Level Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentSkillLevels[selectedMinLevel] || 'Min'}</span>
                  <span>{currentSkillLevels[selectedMaxLevel] || 'Max'}</span>
                </div>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[filters.skillLevelRange.min, filters.skillLevelRange.max]}
                  onValueChange={handleSkillLevelRangeChange}
                  min={0}
                  max={100}
                  step={1}
                  minStepsBetweenThumbs={1}
                  disabled={!filters.skill}
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-black rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 bg-black rounded-full hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    aria-label="Minimum level"
                  />
                  <Slider.Thumb
                    className="block w-4 h-4 bg-black rounded-full hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    aria-label="Maximum level"
                  />
                </Slider.Root>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}