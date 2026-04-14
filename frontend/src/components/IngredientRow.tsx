import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Ingredient } from '@/types/recipe';

interface IngredientRowProps {
  ingredient: Ingredient;
  onChange: (updated: Ingredient) => void;
  onRemove: () => void;
}

const UNIT_OPTIONS = [
  { group: 'Volume/Liquid', options: ['cups', 'tbsp', 'tsp', 'fl oz', 'ml'] },
  { group: 'Weight - Metric', options: ['g', 'kg'] },
  { group: 'Weight - Imperial', options: ['oz', 'lbs'] },
  { group: 'Count', options: ['unit'] },
];

export function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  return (
    <div className="flex gap-2 items-start">
      <Input
        className="w-20"
        placeholder="Qty"
        value={ingredient.quantity}
        onChange={(e) => onChange({ ...ingredient, quantity: e.target.value })}
      />
      <select
        className="flex h-9 w-24 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={ingredient.unit}
        onChange={(e) => onChange({ ...ingredient, unit: e.target.value })}
      >
        {UNIT_OPTIONS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <Input
        className="flex-1"
        placeholder="Ingredient name"
        value={ingredient.name}
        onChange={(e) => onChange({ ...ingredient, name: e.target.value })}
        required
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
