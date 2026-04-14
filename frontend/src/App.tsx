import { Routes, Route } from 'react-router';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
