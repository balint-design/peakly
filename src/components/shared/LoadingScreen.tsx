import React, { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  useEffect(() => {
    // Show slow loading message after 5 seconds
    const timer = setTimeout(() => {
      setShowSlowLoadingMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <img 
        src="https://iqqjvjzvzizrxbymrjoc.supabase.co/storage/v1/object/public/peakly/logo/Peakly%20Logo.png"
        alt="Peakly"
        className="w-32 h-auto mb-8"
      />
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full w-[40%] bg-black"
          style={{
            animation: 'loading 1.5s ease-in-out infinite',
          }}
        />
      </div>
      {showSlowLoadingMessage && (
        <p className="mt-8 text-sm text-gray-500">
          Das dauert länger als erwartet...
        </p>
      )}
    </div>
  );
}