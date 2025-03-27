import React, { useState } from 'react';
import { Plus, PencilLine, X, Check } from 'lucide-react';
import type { OutdoorGoal, UserSkill } from '../types/database';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type GoalsListProps = {
  goals: OutdoorGoal[];
  userSkills: UserSkill[];
  isPublic: boolean;
  onGoalAdded?: (goal: OutdoorGoal) => void;
};

export function GoalsList({ goals: initialGoals, userSkills, isPublic, onGoalAdded }: GoalsListProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    related_skill: '',
    difficulty: '',
  });
  const [editingGoal, setEditingGoal] = useState({
    title: '',
    description: '',
    related_skill: '',
    difficulty: '',
    status: '',
  });

  const handleAddGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('outdoor_goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description || null,
          related_skill: newGoal.related_skill || null,
          difficulty: newGoal.difficulty || null,
          status: 'planned'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setGoals([data, ...goals]);
      onGoalAdded?.(data);

      // Reset form
      setNewGoal({
        title: '',
        description: '',
        related_skill: '',
        difficulty: '',
      });
      setIsAddingGoal(false);
      
      toast.success('Ziel erfolgreich hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Ziels');
    }
  };

  const handleEditGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('outdoor_goals')
        .update({
          title: editingGoal.title,
          description: editingGoal.description,
          related_skill: editingGoal.related_skill || null,
          difficulty: editingGoal.difficulty || null,
          status: editingGoal.status,
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...editingGoal }
          : goal
      ));
      setEditingGoalId(null);
      toast.success('Ziel erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Ziels');
    }
  };

  const startEditing = (goal: OutdoorGoal) => {
    setEditingGoalId(goal.id);
    setEditingGoal({
      title: goal.title,
      description: goal.description || '',
      related_skill: goal.related_skill || '',
      difficulty: goal.difficulty || '',
      status: goal.status,
    });
  };
  return (
    <div className="space-y-6">
      {!isPublic && (
        <div>
          {isAddingGoal ? (
            <div className="border rounded-lg p-4 space-y-4">
              <input
                type="text"
                placeholder="Titel des Ziels"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Beschreibung (optional)"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
              <select
                value={newGoal.related_skill}
                onChange={(e) => setNewGoal({ ...newGoal, related_skill: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Verbundener Skill (optional)</option>
                {userSkills.map((skill) => (
                  <option key={skill.id} value={skill.skill}>
                    {skill.skill}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Schwierigkeitsgrad (optional)"
                value={newGoal.difficulty}
                onChange={(e) => setNewGoal({ ...newGoal, difficulty: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.title}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingGoal(true)}
              className="w-full py-3 text-center border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600"
            >
              <Plus className="w-5 h-5" />
              Neues Ziel hinzufügen
            </button>
          )}
        </div>
      )}
      {goals.map((goal) => (
        <div key={goal.id} className="border rounded-lg p-4">
          {editingGoalId === goal.id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editingGoal.title}
                onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                value={editingGoal.description}
                onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editingGoal.related_skill}
                  onChange={(e) => setEditingGoal({ ...editingGoal, related_skill: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Skill (optional)</option>
                  {userSkills.map((skill) => (
                    <option key={skill.id} value={skill.skill}>
                      {skill.skill}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Schwierigkeit (optional)"
                  value={editingGoal.difficulty}
                  onChange={(e) => setEditingGoal({ ...editingGoal, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={editingGoal.status}
                onChange={(e) => setEditingGoal({ ...editingGoal, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="planned">Geplant</option>
                <option value="in_progress">In Arbeit</option>
                <option value="completed">Erreicht</option>
                <option value="cancelled">Abgebrochen</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingGoalId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEditGoal(goal.id)}
                  className="p-2 hover:bg-gray-100 rounded-full text-green-600"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{goal.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                    {goal.status === 'planned' ? 'Geplant' :
                     goal.status === 'in_progress' ? 'In Arbeit' :
                     goal.status === 'completed' ? 'Erreicht' : 'Abgebrochen'}
                  </span>
                  {!isPublic && (
                    <button
                      onClick={() => startEditing(goal)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {goal.description && (
                <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                {goal.related_skill && (
                  <span>Skill: {goal.related_skill}</span>
                )}
                {goal.difficulty && (
                  <span>Schwierigkeit: {goal.difficulty}</span>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}