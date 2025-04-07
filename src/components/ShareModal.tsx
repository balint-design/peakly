import React from 'react';
import { X, Link2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

type ShareModalProps = {
  onClose: () => void;
};

export function ShareModal({ onClose }: ShareModalProps) {
  const currentUrl = window.location.href;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '📱',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(currentUrl)}`)
    },
    {
      name: 'Telegram',
      icon: '✈️',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}`)
    },
    {
      name: 'Link kopieren',
      icon: <Link2 className="w-4 h-4" />,
      action: async () => {
        await navigator.clipboard.writeText(currentUrl);
        toast.success('Link in die Zwischenablage kopiert');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Profil teilen</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="flex-shrink-0">
                {typeof option.icon === 'string' ? option.icon : option.icon}
              </span>
              <span className="font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}