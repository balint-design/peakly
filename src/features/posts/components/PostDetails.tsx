import React, { useState } from 'react';
import { MapPin, Calendar, Users, MessageSquare, Plus, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import type { PeakPost } from '../../types/database';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type PostDetailsProps = {
  post: PeakPost;
  confirmedParticipants: number;
  isOrganizer: boolean;
};

export function PostDetails({ post, confirmedParticipants, isOrganizer }: PostDetailsProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const spotsAvailable = post.max_participants 
    ? post.max_participants - confirmedParticipants
    : null;

  const createWhatsAppGroup = () => {
    // Format the group description
    const description = `${post.title}\n\n${post.description || ''}\n\nLocation: ${post.location}${post.date ? `\nDate: ${format(new Date(post.date), 'dd.MM.yyyy')}` : ''}`;
    
    // Create WhatsApp group link
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Join our climbing group!\n\n${description}\n\nCreate a WhatsApp group with this information and share the invite link back in the post.`
    )}`;
    
    window.open(url, '_blank');
  };

  const handleSaveLink = async () => {
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

      // Refresh the page to show the updated link
      window.location.reload();
    } catch (error) {
      console.error('Error saving WhatsApp link:', error);
      toast.error('Error saving WhatsApp link');
    }
  };

  return (
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
            ({confirmedParticipants}/{post.max_participants})
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
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

            {isAddingLink ? (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="Paste WhatsApp group invite link"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleSaveLink}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsAddingLink(false)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingLink(true)}
                className="block text-sm text-gray-500 hover:text-gray-700"
              >
                Add WhatsApp group link
              </button>
            )}
          </div>
        )}
      </div>

      {post.required_skill && (
        <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
          {post.required_skill} {post.required_level && `• ${post.required_level}`}
        </div>
      )}
    </div>
  );
}