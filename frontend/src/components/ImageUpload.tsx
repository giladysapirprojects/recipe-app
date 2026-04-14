import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageSelected: (file: File | null) => void;
  onExistingImageRemoved: () => void;
}

export function ImageUpload({ currentImageUrl, onImageSelected, onExistingImageRemoved }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum file size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target?.result as string);
    reader.readAsDataURL(file);
    onImageSelected(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected(null);
    onExistingImageRemoved();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="recipeImageInput"
      />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden">
          <img src={preview} alt="Recipe preview" className="w-full h-48 object-cover rounded-lg" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 gap-1"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" /> Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" />
          Upload Image (optional)
        </Button>
      )}
      <p className="text-xs text-muted-foreground mt-1">Max 5MB. JPEG, PNG, GIF, WebP.</p>
    </div>
  );
}
