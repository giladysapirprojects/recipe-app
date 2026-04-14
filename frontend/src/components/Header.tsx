import { Link } from 'react-router';
import { SearchInput } from '@/components/SearchInput';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LinkIcon, ImageIcon, Plus } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onAddRecipe: () => void;
  onImportUrl: () => void;
  onImportOcr: () => void;
}

export function Header({ onSearch, onAddRecipe, onImportUrl, onImportOcr }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🍳</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-recipe-secondary bg-clip-text text-transparent">
              RecipeBox
            </h1>
          </Link>

          {/* Search */}
          <SearchInput onSearch={onSearch} />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onImportUrl} className="gap-1.5">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Import URL</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onImportOcr} className="gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Import Image</span>
            </Button>
            <Button size="sm" onClick={onAddRecipe} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Add Recipe</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
