import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0) + (recipe.additionalTime || 0);

  return (
    <Link to={`/recipes/${recipe.id}`} className="block group" role="listitem">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border/50 bg-card">
        {/* Image */}
        <div
          className="h-48 bg-cover bg-center bg-no-repeat flex items-center justify-center text-5xl bg-gradient-to-br from-primary/20 to-recipe-secondary/20"
          style={recipe.imageUrl ? { backgroundImage: `url('${recipe.imageUrl}')` } : undefined}
        >
          {!recipe.imageUrl && '🍳'}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          {/* Description */}
          {recipe.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(totalTime)}</span>
              </div>
            )}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
