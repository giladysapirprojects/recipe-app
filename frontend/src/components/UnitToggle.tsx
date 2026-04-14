import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface UnitToggleProps {
  currentSystem: 'metric' | 'imperial';
  onToggle: (system: 'metric' | 'imperial') => void;
}

export function UnitToggle({ currentSystem, onToggle }: UnitToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={currentSystem}
      onValueChange={(value) => {
        if (value) onToggle(value as 'metric' | 'imperial');
      }}
      className="bg-secondary rounded-lg p-0.5"
      aria-label="Unit system selector"
    >
      <ToggleGroupItem
        value="metric"
        className="rounded-md px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Metric
      </ToggleGroupItem>
      <ToggleGroupItem
        value="imperial"
        className="rounded-md px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Imperial
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
