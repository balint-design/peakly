import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SKILL_LEVELS, SKILL_LEVEL_DESCRIPTIONS } from '../lib/skills';
import type { SkillDescription } from '../types/database';
import toast from 'react-hot-toast';

type SkillsEditorProps = {
  skills: Record<string, string>;
  onChange: (skills: Record<string, string>) => void;
};

export function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const [descriptions, setDescriptions] = useState<Record<string, SkillDescription>>({});

  useEffect(() => {
    loadDescriptions();
  }, []);

  async function loadDescriptions() {
    const { data, error } = await supabase.from('skill_descriptions').select('*');
    if (error) {
      toast.error('Failed to load skill descriptions');
      return;
    }
    if (data) {
      setDescriptions(Object.fromEntries(data.map(d => [d.skill, d])));
    }
  }

  return (
    <div>
      <div className="space-y-2">
        {Object.entries(descriptions).map(([skill, desc]) => {
          const hasSkill = skill in skills;
          return (
            <div key={skill} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={skill}
                    checked={hasSkill}
                    onChange={(e) => {
                      const newSkills = { ...skills };
                      if (e.target.checked) {
                        newSkills[skill] = '';
                      } else {
                        delete newSkills[skill];
                      }
                      onChange(newSkills);
                    }}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor={skill} className="font-medium text-gray-900">
                    {skill}
                  </label>
                </div>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <div className="hidden group-hover:block absolute right-0 top-full mt-2 p-4 bg-white rounded-lg shadow-lg z-10 w-64">
                    <p className="text-sm text-gray-700 mb-2">{desc.description}</p>
                    <p className="text-xs text-gray-500">Scale: {desc.difficulty_scale}</p>
                  </div>
                </div>
              </div>
              
              {hasSkill && (
                <div className="pl-7">
                  <select
                    value={skills[skill]}
                    onChange={(e) => {
                      onChange({
                        ...skills,
                        [skill]: e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="">Select Level</option>
                    {SKILL_LEVELS[skill as keyof typeof SKILL_LEVELS]?.map((level) => (
                      <option key={level} value={level}>
                        {level}
                        {SKILL_LEVEL_DESCRIPTIONS[skill as keyof typeof SKILL_LEVEL_DESCRIPTIONS]?.[
                          level as keyof typeof SKILL_LEVEL_DESCRIPTIONS[keyof typeof SKILL_LEVEL_DESCRIPTIONS]
                        ] && ` - ${SKILL_LEVEL_DESCRIPTIONS[skill as keyof typeof SKILL_LEVEL_DESCRIPTIONS][
                          level as keyof typeof SKILL_LEVEL_DESCRIPTIONS[keyof typeof SKILL_LEVEL_DESCRIPTIONS]
                        ]}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}