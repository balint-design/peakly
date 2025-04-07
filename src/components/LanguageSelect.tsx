import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { languagesList, type Language } from '../lib/languages';

type LanguageSelectProps = {
  selected: string[];
  onChange: (languages: string[]) => void;
};

export function LanguageSelect({ selected, onChange }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredLanguages = languagesList.filter(lang =>
    lang.native.toLowerCase().includes(search.toLowerCase()) ||
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLanguage = (code: string) => {
    const newSelected = selected.includes(code)
      ? selected.filter(s => s !== code)
      : [...selected, code];
    onChange(newSelected);
  };

  const handleKeyDown = (e: React.KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleLanguage(code);
    }
  };

  const clearAll = () => {
    onChange([]);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(code => {
          const lang = languagesList.find(l => l.code === code);
          if (!lang) return null;
          return (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"
            >
              {lang.flag} {lang.native}
              <button
                onClick={() => toggleLanguage(code)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded-lg flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <span className="text-gray-700">
          {selected.length
            ? `${selected.length} Sprache${selected.length > 1 ? 'n' : ''} ausgewählt`
            : 'Sprachen auswählen'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sprache suchen..."
                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
              />
            </div>
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="mt-2 text-sm text-red-600 hover:text-red-700"
              >
                Alle entfernen
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.map(({ code, name, native, flag }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleLanguage(code)}
                onKeyDown={(e) => handleKeyDown(e, code)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                tabIndex={0}
                role="option"
                aria-selected={selected.includes(code)}
              >
                <span className="flex items-center gap-2">
                  <span>{flag}</span>
                  <span>{native}</span>
                  <span className="text-gray-400 text-sm">
                    {name !== native && `(${name})`}
                  </span>
                </span>
                {selected.includes(code) && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-center">
                Keine Sprachen gefunden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}