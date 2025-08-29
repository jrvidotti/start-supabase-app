import * as React from "react";
import { searchTags } from "~/utils/tags";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Database } from "~/utils/supabase-types.gen";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  disabled = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const [suggestions, setSuggestions] = React.useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  const debouncedSearchTags = React.useMemo(
    () =>
      debounce(async (term: string) => {
        try {
          const results = await searchTags({ data: term });
          setSuggestions(results.filter((tag) => !value.includes(tag.name)));
        } catch (error) {
          console.error("Error searching tags:", error);
          setSuggestions([]);
        }
      }, 300),
    [value]
  );

  React.useEffect(() => {
    debouncedSearchTags(inputValue);
    setSelectedIndex(-1);
  }, [inputValue, debouncedSearchTags]);

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          addTag(suggestions[selectedIndex].name);
        } else if (inputValue.trim()) {
          addTag(inputValue.trim());
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      case "Backspace":
        if (!inputValue && value.length > 0) {
          removeTag(value[value.length - 1]);
        }
        break;

      case "Tab":
        if (showSuggestions && selectedIndex >= 0) {
          e.preventDefault();
          addTag(suggestions[selectedIndex].name);
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      setInputValue(e.target.value);
    }
  };

  const handleSuggestionClick = (tag: Tag) => {
    addTag(tag.name);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    // If input is empty, load all available tags
    if (!inputValue.trim()) {
      debouncedSearchTags("");
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }, 150);
    }
  };

  return (
    <div className="relative">
      <div className="w-full min-h-[2.5rem] p-2 border border-input rounded-md bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-2 py-1 text-xs gap-1"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {showSuggestions &&
        (suggestions.length > 0 || inputValue.trim() === "") && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                  {inputValue.trim() ? "Matching tags:" : "Available tags:"}
                </div>
                {suggestions.map((tag, index) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSuggestionClick(tag)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      index === selectedIndex &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {inputValue.trim()
                  ? "No matching tags found. Press Enter to create a new tag."
                  : "No tags available yet."}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
