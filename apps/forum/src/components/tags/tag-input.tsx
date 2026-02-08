'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn, Badge, Input } from '@createconomy/ui';
import { useTagSearch } from '@/hooks/use-tags';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

/**
 * TagInput — Autocomplete tag input with suggestions.
 *
 * Users type a tag name and see suggestions from existing tags.
 * Press Enter or click a suggestion to add. Max 5 tags by default.
 */
export function TagInput({
  value,
  onChange,
  maxTags = 5,
  placeholder = 'Add tag...',
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions } = useTagSearch(input);

  // Filter out already-selected tags from suggestions
  const filteredSuggestions = suggestions.filter(
    (s) => !value.includes(s.name)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const normalized = tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    if (normalized && !value.includes(normalized) && value.length < maxTags) {
      onChange([...value, normalized]);
      setInput('');
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && filteredSuggestions[highlightIndex]) {
        addTag(filteredSuggestions[highlightIndex].name);
      } else if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]!);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        Math.min(prev + 1, filteredSuggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 text-xs"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-sm hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {value.length < maxTags && (
          <div className="relative flex-1 min-w-[120px]">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(e.target.value.length >= 1);
                setHighlightIndex(-1);
              }}
              onFocus={() => {
                if (input.length >= 1) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : 'Add more...'}
              className="border-0 p-0 h-auto shadow-none focus-visible:ring-0"
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion._id}
                    type="button"
                    onClick={() => addTag(suggestion.name)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between',
                      index === highlightIndex && 'bg-accent'
                    )}
                  >
                    <span className="font-medium">#{suggestion.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.usageCount} post{suggestion.usageCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags · Press Enter to add
      </p>
    </div>
  );
}
