import { Search } from 'lucide-preact';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onSearch, placeholder = 'Search tools...' }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onInput={(e) => onSearch((e.target as HTMLInputElement).value)}
        className="pl-10"
      />
    </div>
  );
}
