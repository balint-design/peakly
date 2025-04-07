import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount } from '../lib/auth';
import toast from 'react-hot-toast';
import type { Profile, UserSkill, OutdoorGoal, SkillDescription, PeakPost } from '../types/database';
import { ProfileEditor } from './ProfileEditor';
import { Navbar } from './Navbar';
import { ProfileHeader } from './ProfileHeader';
import { AboutSection } from './AboutSection';
import { TabsSection } from './TabsSection';
import { SkillsList } from './SkillsList';
import { GoalsList } from './GoalsList';
import { PeakPostCard } from './PeakPostCard';
import { JoinedPosts } from './JoinedPosts';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { updateMetaTags } from '../lib/meta';

type ProfileProps = Partial<{
  userId: string;
  isPublic: boolean;
}>;

export function UserProfile(props: ProfileProps) {
  const navigate = useNavigate();
  const { username } = useParams();
  const userId = props.userId;
  const isPublic = props.isPublic || !props.userId;
  const { session } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [outdoorGoals, setOutdoorGoals] = useState<OutdoorGoal[]>([]);
  const [skillDescriptions, setSkillDescriptions] = useState<Record<string, SkillDescription>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'goals' | 'posts'>('skills');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [createdPosts, setCreatedPosts] = useState<PeakPost[]>([]);
  const [joinedPosts, setJoinedPosts] = useState<PeakPost[]>([]);
  const [postParticipants, setPostParticipants] = useState<Record<string, Profile[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId, username]);

  useEffect(() => {
    if (profile) {
      loadPosts();
      loadJoinedPosts();
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId && !username) return;

      console.log('Loading profile for:', userId || username);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(userId ? 'id' : 'username', userId || username)
        .single();

      const endTime = performance.now();
      console.log(`Profile load took ${endTime - startTime}ms`);

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Profil nicht gefunden');
          toast.error('Profil nicht gefunden');
          navigate('/');
          return;
        }
        throw error;
      }

      if (!data) {
        setError('Profil nicht gefunden');
        toast.error('Profil nicht gefunden');
        navigate('/');
        return;
      }

      setProfile(data);
      loadSkills(data.id);
      loadGoals(data.id);
      loadSkillDescriptions();

      updateMetaTags({
        title: `${data.full_name || data.username} | Peakly`,
        description: data.bio || 'Peakly Profile',
        image: data.avatar_url || 'https://peakly.app/default-avatar.png',
        url: window.location.href
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Fehler beim Laden des Profils');
      if (userId || username) {
        toast.error('Fehler beim Laden des Profils');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async (profileId: string) => {
    try {
      console.log('Loading skills for:', profileId);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', profileId);

      const endTime = performance.now();
      console.log(`Skills load took ${endTime - startTime}ms`);

      if (error) throw error;
      setUserSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Fehler beim Laden der Skills');
    }
  };

  const loadGoals = async (profileId: string) => {
    try {
      console.log('Loading goals for:', profileId);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('outdoor_goals')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      const endTime = performance.now();
      console.log(`Goals load took ${endTime - startTime}ms`);

      if (error) throw error;
      setOutdoorGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Fehler beim Laden der Ziele');
    }
  };

  const loadSkillDescriptions = async () => {
    try {
      console.log('Loading skill descriptions');
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('skill_descriptions')
        .select('*');
      
      const endTime = performance.now();
      console.log(`Skill descriptions load took ${endTime - startTime}ms`);

      if (error) throw error;
      
      if (data) {
        setSkillDescriptions(Object.fromEntries(data.map(d => [d.skill, d])));
      }
    } catch (error) {
      console.error('Error loading skill descriptions:', error);
      toast.error('Fehler beim Laden der Skill-Beschreibungen');
    }
  };

  const loadPosts = async () => {
    if (!profile) return;

    try {
      console.log('Loading posts for:', profile.id);
      const startTime = performance.now();

      const { data: posts, error } = await supabase
        .from('peak_posts')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      const endTime = performance.now();
      console.log(`Posts load took ${endTime - startTime}ms`);

      if (error) throw error;
      setCreatedPosts(posts);

      const participantsMap = await loadParticipants(posts);
      setPostParticipants(participantsMap);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Fehler beim Laden der Posts');
    }
  };

  const loadJoinedPosts = async () => {
    if (!profile) return;

    try {
      console.log('Loading joined posts for:', profile.id);
      const startTime = performance.now();

      const { data: participations, error: participationsError } = await supabase
        .from('post_participants')
        .select('post_id, post:peak_posts(*, user_id)')
        .eq('user_id', profile.id)
        .eq('status', 'confirmed');

      if (participationsError) throw participationsError;

      if (!participations?.length) {
        setJoinedPosts([]);
        return;
      }

      const organizerIds = [...new Set(participations.map(p => p.post.user_id))];
      const { data: organizers, error: organizersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', organizerIds);

      const endTime = performance.now();
      console.log(`Joined posts load took ${endTime - startTime}ms`);

      if (organizersError) throw organizersError;

      const posts = participations
        .map(p => ({
          ...p.post,
          user: organizers.find(o => o.id === p.post.user_id)
        }))
        .filter(post => post.user_id !== profile.id);

      setJoinedPosts(posts);

      const participantsMap = await loadParticipants(posts);
      setPostParticipants(prev => ({ ...prev, ...participantsMap }));
    } catch (error) {
      console.error('Error loading joined posts:', error);
      toast.error('Fehler beim Laden der teilgenommenen Posts');
    }
  };

  const loadParticipants = async (posts: PeakPost[]) => {
    const participantsMap: Record<string, Profile[]> = {};
    
    try {
      const participantsPromises = posts.map(post =>
        supabase
          .from('post_participants')
          .select('*, user:profiles(*)')
          .eq('post_id', post.id)
          .eq('status', 'confirmed')
      );

      const participantsResults = await Promise.all(participantsPromises);
      
      participantsResults.forEach((result, index) => {
        if (result.error) throw result.error;
        participantsMap[posts[index].id] = result.data.map(p => p.user);
      });
    } catch (error) {
      console.error('Error loading participants:', error);
    }

    return participantsMap;
  };

  const handleLeavePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('post_participants')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile?.id);

      if (error) throw error;

      setJoinedPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post erfolgreich verlassen');
    } catch (error) {
      console.error('Error leaving post:', error);
      toast.error('Fehler beim Verlassen des Posts');
    }
  };

  if (!userId && !username) {
    return (
      <div className="max-w-layout mx-auto">
        <Navbar 
          onLogout={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) toast.error('Error logging out');
            navigate('/');
          }}
          onLoginClick={() => setShowLoginModal(true)}
          onSignUpClick={() => setShowSignUpModal(true)}
        />
        
        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)}
            onSignUpClick={() => {
              setShowLoginModal(false);
              setShowSignUpModal(true);
            }}
          />
        )}

        {showSignUpModal && (
          <SignUpModal 
            onClose={() => setShowSignUpModal(false)}
            onLoginClick={() => {
              setShowSignUpModal(false);
              setShowLoginModal(true);
            }}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Lade Profil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900"
        >
          Zur Startseite
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Profil nicht gefunden</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900"
        >
          Zur Startseite
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-layout mx-auto px-4 pb-8">
      <Navbar 
        onLogout={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) toast.error('Error logging out');
          navigate('/');
        }}
        onLoginClick={() => setShowLoginModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      <ProfileHeader
        profile={profile}
        isPublic={isPublic}
        onEditClick={() => setIsEditing(true)}
      />

      <AboutSection
        profile={profile}
        isPublic={isPublic}
      />

      <JoinedPosts
        posts={joinedPosts}
        participants={postParticipants}
        isPublic={isPublic}
        onLeave={handleLeavePost}
      />

      <div className="mt-4">
        <TabsSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'skills' && (
            <SkillsList
              skills={userSkills}
              skillDescriptions={skillDescriptions}
              isPublic={isPublic}
              onEditClick={() => setIsEditing(true)}
            />
          )}
          {activeTab === 'goals' && (
            <GoalsList
              goals={outdoorGoals}
              userSkills={userSkills}
              isPublic={isPublic}
            />
          )}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {createdPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {createdPosts.map(post => (
                    <PeakPostCard
                      key={post.id}
                      post={post}
                      organizer={profile}
                      participantCount={postParticipants[post.id]?.length || 0}
                      participants={postParticipants[post.id] || []}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Posts erstellt
                </div>
              )}
            </div>
          )}
        </TabsSection>
      </div>

      {isEditing && profile && (
        <ProfileEditor
          profile={profile}
          onClose={() => setIsEditing(false)}
          onUpdate={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditing(false);
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

      {showSignUpModal && (
        <SignUpModal 
          onClose={() => setShowSignUpModal(false)}
          onLoginClick={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

export default UserProfile;