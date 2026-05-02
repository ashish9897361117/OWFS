import React, { useState, useEffect, useRef } from 'react';
import { weatherApi } from '../../api/weatherApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useTheme } from '../../context/ThemeContext';
import { Search, X, MapPin, Loader2, Target } from 'lucide-react';

export const SearchBar = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await weatherApi.autocomplete(debouncedQuery);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (suggestion) => {
    setQuery(suggestion.display);
    setIsOpen(false);
    onSelectLocation(suggestion.display);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3" style={{ color: isDark ? '#9ca3af' : '#999999' }}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
        
        <input
          type="text"
          placeholder="Search locations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(suggestions.length > 0)}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-basic)',
            color: 'var(--text-primary)'
          }}
          className="w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all placeholder:text-text-muted shadow-sm"
        />

        <div className="absolute right-1 flex items-center gap-1">
          {query && (
            <button 
              onClick={clearSearch}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onSelectLocation(query)}
            className="bg-accent-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            Search
          </button>
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 border rounded shadow-lg z-50 overflow-hidden"
             style={{
               backgroundColor: isDark ? '#262626' : '#ffffff',
               borderColor: isDark ? '#404040' : '#e5e7eb'
             }}>
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(s)}
                style={{
                  borderColor: isDark ? '#404040' : '#e5e7eb',
                  backgroundColor: isDark ? '#262626' : '#ffffff'
                }}
                className="w-full px-3 py-2 flex items-center gap-3 transition-colors border-b last:border-0 text-left hover:opacity-80"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#9ca3af' : '#999999' }} />
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: isDark ? '#f8fafc' : '#1a1a1a' }}>
                    {s.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: isDark ? '#9ca3af' : '#999999' }}>
                    {s.display.split(',').slice(1).join(',').trim() || 'Global Location'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
