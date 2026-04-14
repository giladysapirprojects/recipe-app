import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
  return (
    <nav
      className="mb-6 flex flex-wrap gap-2"
      role="navigation"
      aria-label="Recipe categories"
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer
            ${
              category === active
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:scale-105'
            }`}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
