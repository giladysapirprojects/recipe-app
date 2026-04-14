import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importFromUrl } from '@/services/api';
import { Loader2, Search } from 'lucide-react';
import type { RecipeFormData } from '@/types/recipe';

interface ImportUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (data: Partial<RecipeFormData>) => void;
}

export function ImportUrlDialog({ open, onOpenChange, onImported }: ImportUrlDialogProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) { setError('Please enter a recipe URL'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await importFromUrl(url);
      onOpenChange(false);
      onImported(data);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Recipe from URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipeUrl">Recipe URL</Label>
            <Input
              id="recipeUrl"
              type="url"
              placeholder="https://example.com/recipe"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            />
            <p className="text-xs text-muted-foreground mt-1">Paste a link to a recipe from any website</p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Importing recipe... This may take a few seconds.
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive">⚠️ {error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Importing...' : 'Import Recipe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
