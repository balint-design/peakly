import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile, UserSkill } from '../types/database';
import { SignUpModal } from './SignUpModal';
import { LoginModal } from './LoginModal';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ProfileFilters } from './ProfileFilters';
import { ProfileGrid } from './ProfileGrid';
import { PeakPostsSection } from './PeakPostsSection';
import { calculateDistance } from '../lib/cities';
import { SKILL_LEVELS } from '../lib/skills';
import toast from 'react-hot-toast';

export function LandingPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileSkills, setProfileSkills] = useState<Record<string, UserSkill[]>>({});
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    ageRange: {
      min: '',
      max: ''
    },
    gender: '',
    location: '',
    radius: '',
    skill: '',
    skillLevelRange: {
      min: 0,
      max: 100
    },
    intentTags: [] as string[]
  });

  useEffect(() => {
    loadProfiles();
  }, [filters]);

  async function loadProfiles() {
    try {
      setIsLoading(true);
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.ageRange.min) {
        query = query.gte('age', parseInt(filters.ageRange.min));
      }
      if (filters.ageRange.max) {
        query = query.lte('age', parseInt(filters.ageRange.max));
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.intentTags.length > 0) {
        query = query.contains('intent_tags', filters.intentTags);
      }

      const { data: profilesData, error: profilesError } = await query;
      
      if (profilesError) {
        throw profilesError;
      }

      if (profilesData) {
        if (!Array.isArray(profilesData)) {
          throw new Error('Invalid response format');
        }

        const skillsPromises = profilesData.map(async (profile) => {
          try {
            const { data: skillsData } = await supabase
              .from('user_skills')
              .select('*')
              .eq('user_id', profile.id);
            return { profileId: profile.id, skills: skillsData || [] };
          } catch (error) {
            console.error(`Error loading skills for profile ${profile.id}:`, error);
            return { profileId: profile.id, skills: [] };
          }
        });

        const skillsResults = await Promise.all(skillsPromises);
        const skillsMap = Object.fromEntries(
          skillsResults.map(({ profileId, skills }) => [profileId, skills])
        );

        // Filter profiles based on location, skills, and skill level range
        let filteredProfiles = profilesData;

        // Filter by location and radius if both are specified
        if (filters.location && filters.radius) {
          const radius = parseInt(filters.radius);
          filteredProfiles = filteredProfiles.filter(profile => {
            if (!profile.location) return false;
            const distance = calculateDistance(filters.location, profile.location);
            return distance <= radius;
          });
        }

        // Filter by skill and skill level range
        if (filters.skill) {
          const skillLevels = SKILL_LEVELS[filters.skill as keyof typeof SKILL_LEVELS];
          const minLevelIndex = Math.floor((skillLevels.length - 1) * (filters.skillLevelRange.min / 100));
          const maxLevelIndex = Math.floor((skillLevels.length - 1) * (filters.skillLevelRange.max / 100));
          
          filteredProfiles = filteredProfiles.filter(profile => {
            const profileSkills = skillsMap[profile.id] || [];
            const matchingSkill = profileSkills.find(skill => skill.skill === filters.skill);
            
            if (!matchingSkill) return false;
            
            const skillLevelIndex = skillLevels.indexOf(matchingSkill.experience_level);
            return skillLevelIndex >= minLevelIndex && skillLevelIndex <= maxLevelIndex;
          });
        }

        setProfiles(filteredProfiles);
        setProfileSkills(skillsMap);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading profiles:', errorMessage);
      toast.error(`Error loading profiles: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out');
    } else {
      navigate('/');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      ageRange: {
        min: '',
        max: ''
      },
      gender: '',
      location: '',
      radius: '',
      skill: '',
      skillLevelRange: {
        min: 0,
        max: 100
      },
      intentTags: []
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      <HeroSection
        session={session}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto pb-16 px-4">
          <PeakPostsSection />

          <ProfileFilters
            filters={filters}
            showFilters={showFilters}
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={handleClearFilters}
          />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading profiles...</div>
            </div>
          ) : (
            <ProfileGrid
              profiles={profiles}
              profileSkills={profileSkills}
              currentUserId={session?.user?.id}
            />
          )}
        </div>
      </div>

      {showSignUpModal && (
        <SignUpModal 
          onClose={() => setShowSignUpModal(false)}
          onLoginClick={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSignUpClick={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
        />
      )}
    </div>
  );
}

export default LandingPage;