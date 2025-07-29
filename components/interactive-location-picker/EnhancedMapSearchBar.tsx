'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, Clock, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LocationService, AutocompleteResult } from '@/lib/location-services'
import { mapsConfig } from '@/lib/env'

interface EnhancedMapSearchBarProps {
  onSearch: (query: string) => void
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void
  placeholder?: string
  disabled?: boolean
  showRecentSearches?: boolean
}

export function EnhancedMapSearchBar({ 
  onSearch, 
  onLocationSelect,
  placeholder = "Search for a country, city, or address...", 
  disabled = false,
  showRecentSearches = true
}: EnhancedMapSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      try {
        const stored = localStorage.getItem('dhaana_recent_searches')
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 5))
        }
      } catch {
        // Ignore errors
      }
    }
  }, [showRecentSearches])

  // Handle autocomplete suggestions
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce autocomplete requests
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true)
        
        // Use Radar autocomplete if available, otherwise skip autocomplete
        if (mapsConfig.enableRadar) {
          const results = await LocationService.debouncedAutocomplete(searchQuery)
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.warn('Autocomplete failed:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex])
          } else {
            handleSearch()
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSuggestions, suggestions, selectedIndex])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return
    
    setIsSearching(true)
    try {
      await onSearch(searchQuery.trim())
      addToRecentSearches(searchQuery.trim())
      setShowSuggestions(false)
      setSelectedIndex(-1)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuggestionSelect = (suggestion: AutocompleteResult) => {
    setSearchQuery(suggestion.address)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    if (suggestion.location && onLocationSelect) {
      onLocationSelect({
        latitude: suggestion.location.latitude,
        longitude: suggestion.location.longitude,
        address: suggestion.location.address || suggestion.address
      })
    } else {
      onSearch(suggestion.address)
    }
    
    addToRecentSearches(suggestion.address)
  }

  const handleRecentSearchSelect = (search: string) => {
    setSearchQuery(search)
    onSearch(search)
    setShowSuggestions(false)
  }

  const addToRecentSearches = (search: string) => {
    if (!showRecentSearches) return
    
    try {
      const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('dhaana_recent_searches', JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem('dhaana_recent_searches')
    } catch {
      // Ignore errors
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.length === 0 && recentSearches.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1)
    
    if (value.length === 0 && recentSearches.length > 0) {
      setShowSuggestions(true)
      setSuggestions([])
    }
  }

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled || isSearching}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setSearchQuery('')
                setSuggestions([])
                setShowSuggestions(false)
                inputRef.current?.focus()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={disabled || !searchQuery.trim() || isSearching}
          size="icon"
          variant="secondary"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Recent Searches */}
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent Searches
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs"
                  onClick={clearRecentSearches}
                >
                  Clear
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded flex items-center"
                  onClick={() => handleRecentSearchSelect(search)}
                >
                  <Clock className="w-3 h-3 mr-2 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-start space-x-2 ${
                    selectedIndex === index ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{suggestion.address}</div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.source === 'radar' ? 'Radar' : suggestion.source}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery.length >= 3 && suggestions.length === 0 && !isSearching && (
            <div className="p-4 text-center text-sm text-gray-500">
              No suggestions found. Press Enter to search.
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="p-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              <div className="text-sm text-gray-500">Searching...</div>
            </div>
          )}
        </div>
      )}

      {/* Service Status */}
      {mapsConfig.enableRadar && (
        <div className="mt-1 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">
            Enhanced by Radar
          </Badge>
        </div>
      )}
    </div>
  )
}