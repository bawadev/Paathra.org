'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapSearchBarProps } from './types'

export function MapSearchBar({ onSearch, placeholder = "Search for a country, city, or address...", disabled = false }: MapSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return
    
    setIsSearching(true)
    try {
      await onSearch(searchQuery.trim())
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex space-x-2">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || isSearching}
        className="flex-1"
      />
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
  )
}