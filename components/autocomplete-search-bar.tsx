import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search, Loader2 } from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
}

interface AutocompleteSearchbarProps {
  data: SearchItem[];
  onSelect: (item: SearchItem) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function AutocompleteSearchbar({
  data,
  onSelect,
  onSearch,
  placeholder,
  isLoading = false,
}: AutocompleteSearchbarProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: ["name"], // Search in the 'name' field
        threshold: 0.1, // Adjust for fuzzy matching sensitivity
        includeScore: true,
        ignoreLocation: true,
      }),
    [data]
  );

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).slice(0, 10); // Limit to 10 results
  }, [fuse, query]);

  return (
    <div className="relative">
      {isLoading ? (
        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400 animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedIndex(-1);
        }}
        onFocus={() => setShowResults(true)}
        onInput={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : prev
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0) {
              const selected = results[selectedIndex];
              onSelect(selected.item);
              setQuery(selected.item.name);
              setShowResults(false);
              setSelectedIndex(-1);
            } else {
              onSearch?.(query);
            }
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-accent border border-border rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-accent text-accent-foreground placeholder-muted-foreground"
      />

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full bg-accent border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {results.map((result, index) => (
            <div
              key={result.item.id}
              onClick={() => {
                onSelect(result.item);
                setQuery(result.item.name);
                setShowResults(false);
              }}
              className={`p-2 cursor-pointer text-accent-foreground hover:bg-primary/20 ${
                index === selectedIndex ? "bg-primary/20" : ""
              }`}
            >
              {result.item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
