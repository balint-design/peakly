import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, MessageSquare, Plus, Check, X, Share2, ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { PeakPost, Profile } from '../types/database';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from './Navbar';
import { ShareModal } from './ShareModal';
import toast from 'react-hot-toast';

export function PeakPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PeakPost | null>(null);
  const [organizer, setOrganizer] = useState<Profile | null>(null);
  const [participants, setParticipants] = useState<(Profile & { status: string })[]>([]);
  const [userParticipation, setUserParticipation] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAddingWhatsAppLink, setIsAddingWhatsAppLink] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      setLoading(true);
      if (!id) return;

      const { data: post, error: postError } = await supabase
        .from('peak_posts')
        .select('*, user:profiles!peak_posts_user_id_fkey(*)')
        .eq('id', id)
        .single();

      if (postError) throw postError;
      if (!post) {
        toast.error('Post not found');
        navigate('/');
        return;
      }

      setPost(post);
      setOrganizer(post.user);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('post_participants')
        .select('*, user:profiles(*)')
        .eq('post_id', id)
        .eq('status', 'confirmed');

      if (participantsError) throw participantsError;

      const formattedParticipants = participantsData.map(p => ({
        ...p.user,
        status: p.status
      }));

      setParticipants(formattedParticipants);

      // Check if current user is participating
      if (session?.user) {
        const isParticipating = participantsData.some(p => p.user_id === session.user.id);
        setUserParticipation(isParticipating);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Error loading post details');
    } finally {
      setLoading(false);
    }
  }

  const handleParticipate = async () => {
    if (!post || !session?.user) {
      navigate('/login');
      return;
    }

    try {
      if (userParticipation) {
        // Leave post
        const { error } = await supabase
          .from('post_participants')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);

        if (error) throw error;

        setParticipants(prev => prev.filter(p => p.id !== session.user.id));
        setUserParticipation(false);
        toast.success('Left the post successfully');
      } else {
        // Join post
        const { data, error } = await supabase
          .from('post_participants')
          .insert({
            post_id: post.id,
            user_id: session.user.id,
            status: 'confirmed'
          })
          .select('*, user:profiles(*)')
          .single();

        if (error) throw error;

        setParticipants(prev => [...prev, { ...data.user, status: 'confirmed' }]);
        setUserParticipation(true);
        toast.success('Joined the post successfully');
      }
    } catch (error) {
      console.error('Error updating participation:', error);
      toast.error('Error updating participation');
    }
  };

  const handleDelete = async () => {
    if (!post || !session?.user || isDeleting) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('peak_posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    } finally {
      setIsDeleting(false);
    }
  };

  const createWhatsAppGroup = () => {
    if (!post) return;
    
    // Format the group description
    const description = `${post.title}\n\n${post.description || ''}\n\nLocation: ${post.location}${post.date ? `\nDate: ${format(new Date(post.date), 'dd.MM.yyyy')}` : ''}`;
    
    // Create WhatsApp group link
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Join our climbing group!\n\n${description}\n\nCreate a WhatsApp group with this information and share the invite link back in the post.`
    )}`;
    
    window.open(url, '_blank');
  };

  const handleSaveWhatsAppLink = async () => {
    if (!post) return;

    if (!whatsappLink.startsWith('https://chat.whatsapp.com/')) {
      toast.error('Please enter a valid WhatsApp group invite link');
      return;
    }

    try {
      const { error } = await supabase
        .from('peak_posts')
        .update({ whatsapp_link: whatsappLink })
        .eq('id', post.id);

      if (error) throw error;

      setPost(prev => prev ? { ...prev, whatsapp_link: whatsappLink } : null);
      setIsAddingWhatsAppLink(false);
      toast.success('WhatsApp link added successfully');
    } catch (error) {
      console.error('Error saving WhatsApp link:', error);
      toast.error('Error saving WhatsApp link');
    }
  };

  if (loading || !post || !organizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onLogout={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) toast.error('Error logging out');
            navigate('/');
          }}
        />
        <div className="max-w-[1000px] mx-auto px-4 pt-20">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  const isOrganizer = session?.user?.id === post.user_id;
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
  const spotsAvailable = post.max_participants 
    ? post.max_participants - confirmedParticipants.length
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onLogout={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) toast.error('Error logging out');
          navigate('/');
        }}
      />

      <div className="max-w-[1000px] mx-auto px-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to posts
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{post.title}</h1>
              {isOrganizer && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 hover:bg-gray-100 rounded-full text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {post.date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{format(new Date(post.date), 'dd.MM.yyyy')}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{post.location}</span>
              </div>

              {post.max_participants && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {spotsAvailable} {spotsAvailable === 1 ? 'spot' : 'spots'} available
                    ({confirmedParticipants.length}/{post.max_participants})
                  </span>
                </div>
              )}

              {post.required_skill && (
                <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {post.required_skill} {post.required_level && `• ${post.required_level}`}
                </div>
              )}
            </div>

            {post.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{post.description}</p>
              </div>
            )}

            <div className="mb-8">
              {post.whatsapp_link ? (
                <a
                  href={post.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Join WhatsApp Group
                </a>
              ) : isOrganizer && (
                <div className="space-y-3">
                  <button
                    onClick={createWhatsAppGroup}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create WhatsApp Group
                  </button>

                  {isAddingWhatsAppLink ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                        placeholder="Paste WhatsApp group invite link"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={handleSaveWhatsAppLink}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsAddingWhatsAppLink(false)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingWhatsAppLink(true)}
                      className="block text-sm text-gray-500 hover:text-gray-700"
                    >
                      Add WhatsApp group link
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Participants</h2>
                {session ? (
                  <button
                    onClick={handleParticipate}
                    disabled={isOrganizer || (spotsAvailable !== null && spotsAvailable <= 0 && !userParticipation)}
                    className={`px-4 py-2 rounded-lg ${
                      userParticipation
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-black text-white hover:bg-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {userParticipation ? 'Leave Post' : 'Join Post'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                  >
                    Sign in to join
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {organizer.avatar_url ? (
                      <img
                        src={organizer.avatar_url}
                        alt={organizer.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    )}
                    <div>
                      <div className="font-medium">
                        {organizer.full_name || organizer.username}
                      </div>
                      <div className="text-sm text-gray-500">Organizer</div>
                    </div>
                  </div>
                </div>

                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {participant.avatar_url ? (
                        <img
                          src={participant.avatar_url}
                          alt={participant.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      )}
                      <div className="font-medium">
                        {participant.full_name || participant.username}
                      </div>
                    </div>
                  </div>
                ))}

                {participants.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No participants yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showShareModal && (
          <ShareModal onClose={() => setShowShareModal(false)} />
        )}
      </div>
    </div>
  );
}

export default PeakPostDetail;