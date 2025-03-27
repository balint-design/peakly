import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Trash2 } from 'lucide-react';
import type { UserSkill, SkillDescription, RouteDescription } from '../types/database';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type SkillsListProps = {
  skills: UserSkill[];
  skillDescriptions: Record<string, SkillDescription>;
  isPublic: boolean;
  isFriend: boolean;
  onEditClick: () => void;
};

export function SkillsList({ skills, skillDescriptions, isPublic, isFriend, onEditClick }: SkillsListProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Record<string, RouteDescription[]>>({});
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [approvalCounts, setApprovalCounts] = useState<Record<string, number>>({});
  const [approvedSkills, setApprovedSkills] = useState<string[]>([]);
  const [routeCounts, setRouteCounts] = useState<Record<string, number>>({});
  const [newRoute, setNewRoute] = useState({
    route_name: '',
    description: '',
    grade: '',
  });

  useEffect(() => {
    if (skills.length > 0) {
      loadApprovals();
      loadRouteCounts();
    }
  }, [skills]);

  async function loadRouteCounts() {
    try {
      const promises = skills.map(async (skill) => {
        const { data, error } = await supabase
          .from('route_descriptions')
          .select('id')
          .eq('skill', skill.skill)
          .eq('user_id', skill.user_id);

        if (error) throw error;
        return { skill: skill.skill, count: data?.length || 0 };
      });

      const results = await Promise.all(promises);
      const counts = Object.fromEntries(
        results.map(({ skill, count }) => [skill, count])
      );
      setRouteCounts(counts);
    } catch (error) {
      console.error('Error loading route counts:', error);
      toast.error('Error loading route counts');
    }
  }

  async function loadApprovals() {
    try {
      const { data: approvals, error: countsError } = await supabase
        .from('skill_approvals')
        .select('skill_id')
        .in('skill_id', skills.map(s => s.id));

      if (countsError) throw countsError;

      const countMap: Record<string, number> = {};
      approvals?.forEach(({ skill_id }) => {
        countMap[skill_id] = (countMap[skill_id] || 0) + 1;
      });
      setApprovalCounts(countMap);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const promises = skills.map(skill =>
          supabase.rpc('has_approved_skill', { skill_id: skill.id })
        );
        
        const results = await Promise.all(promises);
        const approvedSkills = skills
          .filter((_, index) => results[index].data)
          .map(skill => skill.id);

        setApprovedSkills(approvedSkills);
      }
    } catch (error) {
      console.error('Error loading approvals:', error);
    }
  }

  async function handleApproval(skillId: string) {
    try {
      const { error } = await supabase
        .from('skill_approvals')
        .insert({ skill_id: skillId });

      if (error) throw error;

      setApprovalCounts(prev => ({
        ...prev,
        [skillId]: (prev[skillId] || 0) + 1
      }));
      setApprovedSkills(prev => [...prev, skillId]);
      
      toast.success('Skill bestätigt');
    } catch (error) {
      toast.error('Fehler beim Bestätigen des Skills');
    }
  }

  const skillCategories = {
    'Alpin': ['Mountaineering', 'Ice climbing', 'Drytooling'],
    'Fels': ['Rock climbing (Trad)', 'Rock climbing (Sport)'],
    'Indoor': ['Indoor climbing', 'Bouldering']
  };

  const categorizedSkills = skills.reduce((acc, skill) => {
    for (const [category, categorySkills] of Object.entries(skillCategories)) {
      if (categorySkills.includes(skill.skill)) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
      }
    }
    return acc;
  }, {} as Record<string, UserSkill[]>);

  const toggleSkill = async (skill: string) => {
    if (expandedSkill === skill) {
      setExpandedSkill(null);
      return;
    }

    setExpandedSkill(skill);

    try {
      const { data, error } = await supabase
        .from('route_descriptions')
        .select('*')
        .eq('skill', skill)
        .eq('user_id', skills[0].user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(prev => ({ ...prev, [skill]: data || [] }));
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Error loading routes');
    }
  };

  const handleAddRoute = async (skill: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('route_descriptions')
        .insert({
          skill,
          ...newRoute,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setRoutes(prev => ({
        ...prev,
        [skill]: [...(prev[skill] || []), data]
      }));

      setRouteCounts(prev => ({
        ...prev,
        [skill]: (prev[skill] || 0) + 1
      }));

      setNewRoute({
        route_name: '',
        description: '',
        grade: '',
      });
      setIsAddingRoute(false);
      toast.success('Route hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen der Route');
    }
  };

  const handleDeleteRoute = async (routeId: string, skill: string) => {
    try {
      const { error } = await supabase
        .from('route_descriptions')
        .delete()
        .eq('id', routeId);

      if (error) throw error;

      setRoutes(prev => ({
        ...prev,
        [skill]: prev[skill].filter(route => route.id !== routeId)
      }));

      setRouteCounts(prev => ({
        ...prev,
        [skill]: Math.max(0, (prev[skill] || 0) - 1)
      }));

      toast.success('Route gelöscht');
    } catch (error) {
      toast.error('Fehler beim Löschen der Route');
    }
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-2">Noch keine Skills hinzugefügt</p>
        {!isPublic && (
          <button
            onClick={onEditClick}
            className="text-black hover:underline flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Skills hinzufügen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(categorizedSkills).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="text-md font-semibold mb-2 text-gray-500">{category}</h3>
          <div className="space-y-2">
            {categorySkills.map((skill) => (
              <div key={skill.id}>
                <div 
                  className="relative bg-white border border-gray-100 rounded-xl p-3 hover:bg-gray-50 border-gray-150 transition-bg cursor-pointer"
                  onClick={() => toggleSkill(skill.skill)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      <h4 className="font-medium">{skill.skill}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {routeCounts[skill.skill] || 0} Routen
                        </span>
                        {isFriend && !isPublic && !approvedSkills.includes(skill.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproval(skill.id);
                            }}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="px-2 py-0.5 bg-gray-100 rounded-full text-sm font-medium">
                        {skill.experience_level}
                      </div>
                      <ChevronRight 
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedSkill === skill.skill ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedSkill === skill.skill && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    <div className="bg-white rounded-xl p-4 space-y-4">
                      <div className="text-sm text-gray-600">
                        {skillDescriptions[skill.skill]?.description}
                      </div>

                      <div className="space-y-3">
                        {routes[skill.skill]?.map((route) => (
                          <div 
                            key={route.id}
                            className="border rounded-lg p-3 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium">{route.route_name}</h5>
                                {route.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {route.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                                  {route.grade}
                                </span>
                                {!isPublic && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRoute(route.id, skill.skill);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {!isPublic && (
                          <div>
                            {isAddingRoute ? (
                              <div className="border rounded-lg p-3 space-y-3">
                                <input
                                  type="text"
                                  placeholder="Route name"
                                  value={newRoute.route_name}
                                  onChange={(e) => setNewRoute(prev => ({
                                    ...prev,
                                    route_name: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Grade"
                                  value={newRoute.grade}
                                  onChange={(e) => setNewRoute(prev => ({
                                    ...prev,
                                    grade: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <textarea
                                  placeholder="Description (optional)"
                                  value={newRoute.description}
                                  onChange={(e) => setNewRoute(prev => ({
                                    ...prev,
                                    description: e.target.value
                                  }))}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingRoute(false)}
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                                  >
                                    Abbrechen
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddRoute(skill.skill)}
                                    className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-900"
                                    disabled={!newRoute.route_name || !newRoute.grade}
                                  >
                                    Hinzufügen
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setIsAddingRoute(true)}
                                className="w-full py-2 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600 text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                Hinzufügen
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}