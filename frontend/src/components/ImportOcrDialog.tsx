import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { importFromOcr } from '@/services/api';
import { Loader2, Search, FileText, X, Upload } from 'lucide-react';
import type { RecipeFormData } from '@/types/recipe';

interface ImportOcrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (data: Partial<RecipeFormData>) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export function ImportOcrDialog({ open, onOpenChange, onImported }: ImportOcrDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (f: File) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Invalid file type. Please select an image (JPG, PNG, WebP, BMP) or PDF.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File is too large. Maximum file size is 10MB.');
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await importFromOcr(file);
      onOpenChange(false);
      onImported(data);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) { setFile(null); setError(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Recipe from Image/PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(',')} className="hidden"
            onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} />

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, BMP, PDF (max 10MB)</p>
          </div>

          {/* Selected file */}
          {file && (
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing file with OCR... This may take 5-10 seconds.
            </div>
          )}

          {error && <div className="text-sm text-destructive">⚠️ {error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleProcess} disabled={!file || loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Processing...' : 'Process & Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
