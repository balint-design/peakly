import React from 'react';
import type { Session } from '@supabase/supabase-js';

type HeroSectionProps = {
  session: Session | null;
  onSignUpClick: () => void;
};

export function HeroSection({ session, onSignUpClick }: HeroSectionProps) {
  return (
    <div className="max-w-[800px] mx-auto px-4 pt-32 pb-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Finde leicht die passenden Tourenpartner:innen.{' '}
          <span className="text-gray-400">
            Vernetze dich und plane dein nächstes Abenteuer gemeinsam.
          </span>
        </h1>

        {!session && (
          <button
            onClick={onSignUpClick}
            className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-900 transition-colors font-safiro"
          >
            Profil erstellen
          </button>
        )}
      </div>
    </div>
  );
}