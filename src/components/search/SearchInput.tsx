"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, LoadingIcon } from "@/components/icons/icons";

interface SearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  normalizeText?: boolean; // Option to enable/disable text normalization
  isSearching?: boolean; // New prop to indicate loading state
  useFuzzySearch?: boolean; // Option to use Fuse.js for normalization
  value?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

// Function to normalize text for searching (handle special characters)
const normalizeSearchText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
};

export function Search({
  onSearch,
  placeholder = "Buscar por nombre o sigla...",
  className = "",
  initialValue = "",
  normalizeText = true, // Default to true for better search experience
  isSearching = false, // Default to false
  useFuzzySearch = false, // Default to false to maintain backward compatibility
  value,
  onKeyDown,
}: SearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const isControlled = value !== undefined;
  const displayValue = isControlled ? (value as string) : searchTerm;

  const handleSearch = (value: string) => {
    if (!isControlled) setSearchTerm(value);

    // If using fuzzy search, pass the original value (Fuse.js handles normalization)
    // Otherwise, use the existing normalization logic
    if (useFuzzySearch) {
      onSearch(value);
    } else {
      const searchValue = normalizeText ? normalizeSearchText(value) : value;
      onSearch(searchValue);
    }
  };

  const clearSearch = () => {
    if (!isControlled) setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform">
          {isSearching ? (
            <LoadingIcon className="fill-border h-4 w-4 animate-spin" />
          ) : (
            <SearchIcon className="fill-border h-4 w-4" />
          )}
        </div>
        <Input
          autoComplete="off"
          type="search"
          name="search"
          enterKeyHint="search"
          inputMode="search"
          autoCorrect="off"
          autoCapitalize="none"

          data-lpignore="true"
          data-1p-ignore="true"
          data-bw-ignore="true"
          data-dashlane-ignore="true"

          spellCheck={false}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={onKeyDown}
          className="pl-10"
        />
        {displayValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="hover:bg-muted absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

// Export the normalize function for external use when needed
export { normalizeSearchText };
