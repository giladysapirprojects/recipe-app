import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { debounce } from '@/utils/formatters';

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [value, setValue] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((q: string) => onSearch(q), 300), [onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="searchInput"
        type="text"
        placeholder="Search recipes, ingredients, or tags..."
        value={value}
        onChange={handleChange}
        className="pl-10"
        aria-label="Search recipes"
      />
    </div>
  );
}
