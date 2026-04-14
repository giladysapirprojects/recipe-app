import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InstructionRowProps {
  instruction: string;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function InstructionRow({ instruction, index, onChange, onRemove }: InstructionRowProps) {
  return (
    <div className="flex gap-2 items-start">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-1">
        {index + 1}
      </span>
      <Textarea
        className="flex-1 min-h-[60px]"
        placeholder={`Step ${index + 1}`}
        value={instruction}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        required
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
