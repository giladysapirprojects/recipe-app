import { Link, useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UnitToggle } from '@/components/UnitToggle';
import { useUnitConversion } from '@/hooks/useUnitConversion';
import { formatTime } from '@/utils/formatters';
import { ArrowLeft, Clock, Users, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Recipe } from '@/types/recipe';

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function RecipeDetail({ recipe, onEdit, onDelete }: RecipeDetailProps) {
  const navigate = useNavigate();
  const { currentSystem, toggleSystem, convertIngredient } = useUnitConversion();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0) + (recipe.additionalTime || 0);

  const handleDelete = async () => {
    const success = await onDelete(recipe.id);
    if (success) navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to recipes
      </Link>

      {/* Hero image */}
      <div
        className="h-64 md:h-80 rounded-xl bg-cover bg-center bg-no-repeat flex items-center justify-center text-7xl bg-gradient-to-br from-primary/20 to-recipe-secondary/20 mb-8"
        style={recipe.imageUrl ? { backgroundImage: `url('${recipe.imageUrl}')` } : undefined}
      >
        {!recipe.imageUrl && '🍳'}
      </div>

      {/* Title & description */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{recipe.title}</h1>
      {recipe.description && (
        <p className="text-muted-foreground text-lg mb-6">{recipe.description}</p>
      )}

      {/* Meta grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {recipe.prepTime > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Prep Time</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatTime(recipe.prepTime)}
            </div>
          </div>
        )}
        {recipe.cookTime > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Cook Time</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatTime(recipe.cookTime)}
            </div>
          </div>
        )}
        {recipe.additionalTime > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Additional</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatTime(recipe.additionalTime)}
            </div>
          </div>
        )}
        {recipe.servings > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Servings</div>
            <div className="font-semibold flex items-center justify-center gap-1">
              <Users className="h-3.5 w-3.5" /> {recipe.servings}
            </div>
          </div>
        )}
      </div>

      {/* Source URL */}
      {recipe.sourceUrl && (
        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4">
          <ExternalLink className="h-3.5 w-3.5" /> View Original Source
        </a>
      )}

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      <Separator className="my-6" />

      {/* Ingredients */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Ingredients</h2>
        <UnitToggle currentSystem={currentSystem} onToggle={toggleSystem} />
      </div>
      <ul className="space-y-2 mb-8">
        {recipe.ingredients.map((ing, i) => {
          const converted = convertIngredient(ing);
          const quantity = converted ? converted.quantity : ing.quantity;
          const unit = converted ? converted.unit : ing.unit;
          return (
            <li key={i} className="flex items-start gap-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>
                <strong>{quantity}{unit ? ` ${unit}` : ''}</strong> {ing.name}
              </span>
            </li>
          );
        })}
      </ul>

      <Separator className="my-6" />

      {/* Instructions */}
      <h2 className="text-xl font-bold mb-4">Instructions</h2>
      <ol className="space-y-4 mb-8">
        {recipe.instructions.map((instruction, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {i + 1}
            </span>
            <p className="pt-0.5">{instruction}</p>
          </li>
        ))}
      </ol>

      <Separator className="my-6" />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => onEdit(recipe)} className="gap-1.5">
          <Pencil className="h-4 w-4" /> Edit Recipe
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-1.5">
              <Trash2 className="h-4 w-4" /> Delete Recipe
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{recipe.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the recipe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
