import { useState, useCallback } from 'react';
import { Outlet } from 'react-router';
import { Header } from '@/components/Header';
import { RecipeForm } from '@/components/RecipeForm';
import { ImportUrlDialog } from '@/components/ImportUrlDialog';
import { ImportOcrDialog } from '@/components/ImportOcrDialog';
import { useRecipes } from '@/hooks/useRecipes';
import type { Recipe, RecipeFormData } from '@/types/recipe';

export function Layout() {
  const {
    filteredRecipes, loading, error,
    currentCategory, categories,
    searchRecipes, filterByCategory,
    addRecipe, editRecipe, removeRecipe,
  } = useRecipes();

  const [formOpen, setFormOpen] = useState(false);
  const [importUrlOpen, setImportUrlOpen] = useState(false);
  const [importOcrOpen, setImportOcrOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [importedData, setImportedData] = useState<Partial<RecipeFormData> | null>(null);

  const handleAddRecipe = useCallback(() => {
    setEditingRecipe(null);
    setImportedData(null);
    setFormOpen(true);
  }, []);

  const handleEditRecipe = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe);
    setImportedData(null);
    setFormOpen(true);
  }, []);

  const handleImportedData = useCallback((data: Partial<RecipeFormData>) => {
    setEditingRecipe(null);
    setImportedData(data);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(async (formData: RecipeFormData) => {
    if (editingRecipe) {
      await editRecipe(editingRecipe.id, formData);
    } else {
      await addRecipe(formData);
    }
  }, [editingRecipe, editRecipe, addRecipe]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={searchRecipes}
        onAddRecipe={handleAddRecipe}
        onImportUrl={() => setImportUrlOpen(true)}
        onImportOcr={() => setImportOcrOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <Outlet context={{
          recipes: filteredRecipes,
          loading,
          error,
          categories,
          currentCategory,
          filterByCategory,
          onAddRecipe: handleAddRecipe,
          onEditRecipe: handleEditRecipe,
          onDeleteRecipe: removeRecipe,
        }} />
      </main>

      {/* Global dialogs */}
      <RecipeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingRecipe={editingRecipe}
        importedData={importedData}
        onSave={handleSave}
      />
      <ImportUrlDialog
        open={importUrlOpen}
        onOpenChange={setImportUrlOpen}
        onImported={handleImportedData}
      />
      <ImportOcrDialog
        open={importOcrOpen}
        onOpenChange={setImportOcrOpen}
        onImported={handleImportedData}
      />
    </div>
  );
}
