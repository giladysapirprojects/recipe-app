import { useParams, useOutletContext } from 'react-router';
import { useState, useEffect } from 'react';
import { RecipeDetail } from '@/components/RecipeDetail';
import { fetchRecipeById } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import type { Recipe } from '@/types/recipe';

interface RecipeDetailPageContext {
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => Promise<boolean>;
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { onEditRecipe, onDeleteRecipe } = useOutletContext<RecipeDetailPageContext>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchRecipeById(id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
        <p className="text-muted-foreground mb-4">The recipe you're looking for doesn't exist.</p>
        <Link to="/" className="text-primary hover:underline">← Back to recipes</Link>
      </div>
    );
  }

  return (
    <RecipeDetail
      recipe={recipe}
      onEdit={onEditRecipe}
      onDelete={onDeleteRecipe}
    />
  );
}
