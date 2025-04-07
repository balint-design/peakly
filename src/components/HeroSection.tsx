import React from 'react';
import type { Session } from '@supabase/supabase-js';

type HeroSectionProps = {
  session: Session | null;
  onSignUpClick: () => void;
};

export function HeroSection({ session, onSignUpClick }: HeroSectionProps) {
  return (
    <div className="max-w-[700px] mx-auto px-2 pt-24">
      <div className="text-center py-8">
        <h1 className="text-xl font-bold mb-4 md:text-3xl">
          Finde Tourenpartner:innen mit ähnlichen Fähigkeiten in deiner Nähe. {' '}
          <span className="text-gray-400">
            Erstelle jetzt dein Peakly-Profil und teile deine ersten Tourenpläne!
          </span>
        </h1>

        {!session && (
          <button
            onClick={onSignUpClick}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors font-safiro"
          >
            Profil erstellen
          </button>
        )}
      </div>
    </div>
  );
}