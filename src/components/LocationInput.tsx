import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { searchCities } from '../lib/cities';

type LocationInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function LocationInput({ value, onChange, className = '' }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<Array<{ name: string; state: string; country: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSuggestions(searchCities(newValue));
    setIsOpen(true);
  };

  const handleSuggestionClick = (cityName: string) => {
    onChange(cityName);
    setSuggestions([]);
    setIsOpen(false);
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && setSuggestions(searchCities(value))}
          placeholder="Stadt eingeben..."
          className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${className}`}
        />
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${index}`}
              onClick={() => handleSuggestionClick(city.name)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
            >
              <span>{city.name}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                {city.country} {city.state}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}