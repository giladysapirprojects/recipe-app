import { useOutletContext } from 'react-router';
import { RecipeGrid } from '@/components/RecipeGrid';
import { CategoryFilter } from '@/components/CategoryFilter';
import { EmptyState } from '@/components/EmptyState';
import { Loader2 } from 'lucide-react';
import type { Recipe } from '@/types/recipe';

interface HomePageContext {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  categories: string[];
  currentCategory: string;
  filterByCategory: (category: string) => void;
  onAddRecipe: () => void;
}

export function HomePage() {
  const {
    recipes, loading, error,
    categories, currentCategory,
    filterByCategory, onAddRecipe,
  } = useOutletContext<HomePageContext>();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-2">⚠️ {error}</p>
        <p className="text-muted-foreground text-sm">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  return (
    <>
      <CategoryFilter
        categories={categories}
        active={currentCategory}
        onSelect={filterByCategory}
      />
      {recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} />
      ) : (
        <EmptyState onAddRecipe={onAddRecipe} />
      )}
    </>
  );
}
