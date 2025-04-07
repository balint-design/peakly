import React from 'react';
import { X } from 'lucide-react';
import { INTENT_TAGS } from '../types/database';

type IntentTagSelectProps = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
};

export function IntentTagSelect({ selectedTags, onChange, className = '' }: IntentTagSelectProps) {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 2) {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <button
            key={tag}
            type="button" // Prevent form submission
            onClick={() => handleTagClick(tag)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-full text-sm hover:bg-gray-900 transition-colors"
          >
            {tag}
            <X className="w-4 h-4" />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {INTENT_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag);
          const isDisabled = selectedTags.length >= 2 && !isSelected;
          
          return (
            <button
              key={tag}
              type="button" // Prevent form submission
              onClick={() => handleTagClick(tag)}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-black text-white hover:bg-gray-900'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}