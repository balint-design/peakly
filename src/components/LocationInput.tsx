import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';
import { searchCities, type City } from '../lib/cities';

type LocationInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function LocationInput({ value, onChange, className = '' }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    async function fetchSuggestions() {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchCities(value);
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
      } finally {
        setLoading(false);
      }
    }

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(fetchSuggestions, 300);

    // Cleanup
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          onChange={(e) => onChange(e.target.value)}
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
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={city.city_id}
              onClick={() => handleSuggestionClick(city.name)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
            >
              <span>{city.name}</span>
              <span className="text-sm text-gray-500">
                {city.country === 'DE' ? '🇩🇪' : 
                 city.country === 'AT' ? '🇦🇹' : '🇨🇭'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}