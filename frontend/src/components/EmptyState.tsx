import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';

interface EmptyStateProps {
  onAddRecipe: () => void;
}

export function EmptyState({ onAddRecipe }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <ChefHat className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">No Recipes Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Start building your recipe collection by adding your first recipe!
      </p>
      <Button size="lg" onClick={onAddRecipe} className="gap-2">
        <span>➕</span> Add Your First Recipe
      </Button>
    </div>
  );
}
