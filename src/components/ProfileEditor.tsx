import React, { useState, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';
import { updateProfile, getUserSkills, updateUserSkills } from '../lib/auth';
import { uploadAvatar } from '../lib/storage';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { LanguageSelect } from './LanguageSelect';
import { LocationInput } from './LocationInput';
import { IntentTagSelect } from './IntentTagSelect';
import { SkillsEditor } from './SkillsEditor';
import toast from 'react-hot-toast';

type ProfileEditorProps = {
  profile: Profile;
  onClose: () => void;
  onUpdate: (profile: Profile) => void;
};

export function ProfileEditor({ profile, onClose, onUpdate }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    age: profile.age || '',
    gender: profile.gender || '',
    location: profile.location || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    languages: profile.languages || ['DE'],
    intent_tags: profile.intent_tags || [],
    whatsapp: profile.whatsapp || '',
    telegram: profile.telegram || '',
    social_media: profile.social_media || '',
    other_contact: profile.other_contact || '',
    contact_visibility: profile.contact_visibility || 'public'
  });
  
  const [skills, setSkills] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadSkills();
  }, [profile.id]);

  async function loadSkills() {
    try {
      const userSkills = await getUserSkills(profile.id);
      const skillMap = Object.fromEntries(
        userSkills.map(skill => [skill.skill, skill.experience_level])
      );
      setSkills(skillMap);
    } catch (error) {
      toast.error('Failed to load skills');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadAvatar(file, profile.id);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      await updateProfile(profile.id, {
        ...formData,
        age: formData.age ? parseInt(formData.age.toString()) : null,
      });

      const skillUpdates = Object.entries(skills).map(([skill, level]) => ({
        skill,
        experience_level: level,
      }));
      await updateUserSkills(profile.id, skillUpdates);

      toast.success('Profile updated successfully');
      onUpdate({
        ...profile,
        ...formData,
        age: formData.age ? parseInt(formData.age.toString()) : null,
      });
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-[1000px] w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-6">
            {/* Avatar */}
            <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Avatar</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Basic Info</h2>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Gender</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="d">Other</option>
                </select>
              </div>
            </div>

            {/* Location & Bio */}
            <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Location & Bio</h2>
            <div>
              <LocationInput
                value={formData.location || ''}
                onChange={(value) => setFormData({ ...formData, location: value })}
                className="border-gray-300"
              />
            </div>

            <div>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="About me"
                className="w-full px-4 py-2 border rounded-lg h-32"
              />
            </div>

            {/* Languages & Tags */}
            <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Languages</h2>
            <LanguageSelect
              selected={formData.languages}
              onChange={(languages) => setFormData({ ...formData, languages })}
            />

            <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Status-Tags</h2>
            <IntentTagSelect
              selectedTags={formData.intent_tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, intent_tags: tags }))}
            />
          </div>

          {/* Contact Links */}
          <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Kontaktdaten</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Nummer
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+49123456789"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram Username
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Media Link
              </label>
              <input
                type="url"
                value={formData.social_media}
                onChange={(e) => setFormData({ ...formData, social_media: e.target.value })}
                placeholder="https://instagram.com/username"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sonstige Kontaktmöglichkeit
              </label>
              <input
                type="text"
                value={formData.other_contact}
                onChange={(e) => setFormData({ ...formData, other_contact: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sichtbarkeit der Kontaktdaten
              </label>
              <select
                value={formData.contact_visibility}
                onChange={(e) => setFormData({ ...formData, contact_visibility: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="public">Öffentlich</option>
                <option value="friends_only">Nur für Freund:innen</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <h2 className="text-lg font-medium uppercase text-gray-500 mb-4">Skills</h2>
          <SkillsEditor
            skills={skills} 
            onChange={setSkills} 
          />

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-gray-600 hover:text-gray-900"
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {saving ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}