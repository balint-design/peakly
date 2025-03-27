import React from 'react';
import type { Profile } from '../types/database';
import { languagesList } from '../lib/languages';

type AboutSectionProps = {
  profile: Profile;
  isPublic?: boolean;
  onUpdate?: (profile: Profile) => void;
};

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <div className="space-y-4">
      {(profile.bio || profile.languages.length > 0) && (
        <section className="bg-white dark:bg-black pb-6">
          <h2 className="text-lg font-medium text-black  pt-6 dark:text-gray-400 mb-2">
            Über mich
          </h2>
          {profile.bio && (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxe max-w-[800px]">
              {profile.bio}
            </p>
          )}
          {profile.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {profile.languages.map((code) => {
                const lang = languagesList.find(l => l.code === code);
                if (!lang) return null;
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg text-sm font-medium"
                  >
                    {lang.flag} {lang.native}
                  </span>
                );
              })}
            </div>
          )}
        </section>
      )}

      {profile.intent_tags.length > 0 && (
        <section className="bg-white dark:bg-black rounded-xl pb-6 ">
          <h2 className="text-lg font-medium text-black dark:text-gray-400 mb-4">
            Status Tags
          </h2>
          <div className="flex flex-wrap gap-2 pb-6">
            {profile.intent_tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}