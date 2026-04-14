import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IngredientRow } from '@/components/IngredientRow';
import { InstructionRow } from '@/components/InstructionRow';
import { ImageUpload } from '@/components/ImageUpload';
import { validateRecipe } from '@/utils/formatters';
import { uploadImage } from '@/services/api';
import { Plus, Save } from 'lucide-react';
import type { Recipe, Ingredient, RecipeFormData } from '@/types/recipe';

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecipe?: Recipe | null;
  importedData?: Partial<RecipeFormData> | null;
  onSave: (data: RecipeFormData) => Promise<void>;
}

const PREDEFINED_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Beverage'];

const emptyIngredient = (): Ingredient => ({ quantity: '', unit: 'unit', name: '' });

export function RecipeForm({ open, onOpenChange, editingRecipe, importedData, onSave }: RecipeFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [additionalTime, setAdditionalTime] = useState('');
  const [servings, setServings] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingRecipe;

  // Populate form when editing or importing
  useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title);
      setDescription(editingRecipe.description || '');
      setCategory(editingRecipe.category);
      setTags(editingRecipe.tags?.join(', ') || '');
      setPrepTime(editingRecipe.prepTime?.toString() || '');
      setCookTime(editingRecipe.cookTime?.toString() || '');
      setAdditionalTime(editingRecipe.additionalTime?.toString() || '');
      setServings(editingRecipe.servings?.toString() || '');
      setSourceUrl(editingRecipe.sourceUrl || '');
      setIngredients(editingRecipe.ingredients.length > 0 ? editingRecipe.ingredients : [emptyIngredient()]);
      setInstructions(editingRecipe.instructions.length > 0 ? editingRecipe.instructions : ['']);
      setExistingImageUrl(editingRecipe.imageUrl || '');
      setImageFile(null);
    } else if (importedData) {
      setTitle(importedData.title || '');
      setDescription(importedData.description || '');
      setCategory(importedData.category || 'Other');
      setTags(importedData.tags?.join(', ') || '');
      setPrepTime(importedData.prepTime?.toString() || '');
      setCookTime(importedData.cookTime?.toString() || '');
      setAdditionalTime(importedData.additionalTime?.toString() || '');
      setServings(importedData.servings?.toString() || '');
      setSourceUrl(importedData.sourceUrl || '');
      setIngredients(importedData.ingredients?.length ? importedData.ingredients : [emptyIngredient()]);
      setInstructions(importedData.instructions?.length ? importedData.instructions : ['']);
      setExistingImageUrl(importedData.imageUrl || '');
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [editingRecipe, importedData, open]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory(''); setTags('');
    setPrepTime(''); setCookTime(''); setAdditionalTime(''); setServings('');
    setSourceUrl(''); setIngredients([emptyIngredient()]); setInstructions(['']);
    setImageFile(null); setExistingImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: RecipeFormData = {
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      additionalTime: parseInt(additionalTime) || 0,
      servings: parseInt(servings) || 0,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
      instructions: instructions.filter((inst) => inst.trim()),
      imageUrl: '',
      sourceUrl: sourceUrl.trim(),
      notes: '',
    };

    const validation = validateRecipe(formData);
    if (!validation.valid) {
      alert('Please fix:\n\n' + validation.errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      // Handle image upload
      if (imageFile) {
        formData.imageUrl = await uploadImage(imageFile);
      } else {
        formData.imageUrl = existingImageUrl;
      }

      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      alert('Error saving recipe: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="recipeTitle">Recipe Title *</Label>
            <Input id="recipeTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chocolate Chip Cookies" required />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="recipeDesc">Description</Label>
            <Textarea id="recipeDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
          </div>

          {/* Category + Tags row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipeCategory">Category *</Label>
              <Input id="recipeCategory" value={category} onChange={(e) => setCategory(e.target.value)} list="categoryList" placeholder="Select or type..." required />
              <datalist id="categoryList">
                {PREDEFINED_CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <Label htmlFor="recipeTags">Tags</Label>
              <Input id="recipeTags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vegetarian, quick, healthy" />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>
          </div>

          {/* Time row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prepTime">Prep (min)</Label>
              <Input id="prepTime" type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15" />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook (min)</Label>
              <Input id="cookTime" type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" />
            </div>
            <div>
              <Label htmlFor="addTime">Additional (min)</Label>
              <Input id="addTime" type="number" min="0" value={additionalTime} onChange={(e) => setAdditionalTime(e.target.value)} placeholder="10" />
            </div>
          </div>

          {/* Servings + Source URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" />
            </div>
            <div>
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input id="sourceUrl" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Image */}
          <div>
            <Label>Recipe Image</Label>
            <ImageUpload
              currentImageUrl={existingImageUrl}
              onImageSelected={setImageFile}
              onExistingImageRemoved={() => setExistingImageUrl('')}
            />
          </div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients *</Label>
            <div className="space-y-2 mt-2">
              {ingredients.map((ing, i) => (
                <IngredientRow
                  key={i}
                  ingredient={ing}
                  onChange={(updated) => {
                    const next = [...ingredients];
                    next[i] = updated;
                    setIngredients(next);
                  }}
                  onRemove={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                />
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => setIngredients([...ingredients, emptyIngredient()])}>
              <Plus className="h-3.5 w-3.5" /> Add Ingredient
            </Button>
          </div>

          {/* Instructions */}
          <div>
            <Label>Instructions *</Label>
            <div className="space-y-2 mt-2">
              {instructions.map((inst, i) => (
                <InstructionRow
                  key={i}
                  instruction={inst}
                  index={i}
                  onChange={(value) => {
                    const next = [...instructions];
                    next[i] = value;
                    setInstructions(next);
                  }}
                  onRemove={() => setInstructions(instructions.filter((_, j) => j !== i))}
                />
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={() => setInstructions([...instructions, ''])}>
              <Plus className="h-3.5 w-3.5" /> Add Step
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Recipe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
