import React, { useState } from 'react';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { LocationInput } from './LocationInput';
import { supabase } from '../lib/supabase';
import type { PeakPost, Skill } from '../types/database';
import { AVAILABLE_SKILLS } from '../types/database';
import { SKILL_LEVELS } from '../lib/skills';
import toast from 'react-hot-toast';

type PeakPostFormProps = {
  onClose: () => void;
  onSuccess?: (post: PeakPost) => void;
};

export function PeakPostForm({ onClose, onSuccess }: PeakPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    whatsapp_link: '',
    max_participants: '',
    required_skill: '' as Skill | '',
    required_level: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('peak_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          date: formData.date.toISOString().split('T')[0],
          whatsapp_link: formData.whatsapp_link || null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          required_skill: formData.required_skill || null,
          required_level: formData.required_level || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Post created successfully');
      onSuccess?.(data);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const validateWhatsAppLink = (link: string) => {
    if (!link) return true;
    return link.startsWith('https://chat.whatsapp.com/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create Peak Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Give your post a title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe your planned activity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                    dateFormat="dd.MM.yyyy"
                    minDate={new Date()}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <LocationInput
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Group Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.whatsapp_link}
                  onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    formData.whatsapp_link && !validateWhatsAppLink(formData.whatsapp_link)
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="https://chat.whatsapp.com/..."
                />
                {formData.whatsapp_link && !validateWhatsAppLink(formData.whatsapp_link) && (
                  <p className="mt-1 text-sm text-red-500">
                    Please enter a valid WhatsApp group invite link
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Participants (optional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skill (optional)
                  </label>
                  <select
                    value={formData.required_skill}
                    onChange={(e) => setFormData({
                      ...formData,
                      required_skill: e.target.value as Skill,
                      required_level: ''
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">No specific skill required</option>
                    {AVAILABLE_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Level (optional)
                  </label>
                  <select
                    value={formData.required_level}
                    onChange={(e) => setFormData({ ...formData, required_level: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={!formData.required_skill}
                  >
                    <option value="">Any level</option>
                    {formData.required_skill && SKILL_LEVELS[formData.required_skill]?.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-white sticky bottom-0">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (formData.whatsapp_link && !validateWhatsAppLink(formData.whatsapp_link))}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}