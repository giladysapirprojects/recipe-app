// Unit conversion hook — manages metric/imperial toggle with localStorage persistence

import { useState, useCallback } from 'react';
import { convertIngredient } from '@/utils/conversion';
import type { Ingredient } from '@/types/recipe';

type UnitSystem = 'metric' | 'imperial';

export function useUnitConversion() {
  const [currentSystem, setCurrentSystem] = useState<UnitSystem>(
    () => (localStorage.getItem('preferredUnitSystem') as UnitSystem) || 'metric'
  );

  const toggleSystem = useCallback((system: UnitSystem) => {
    setCurrentSystem(system);
    localStorage.setItem('preferredUnitSystem', system);
  }, []);

  const convert = useCallback(
    (ingredient: Ingredient) => convertIngredient(ingredient, currentSystem),
    [currentSystem]
  );

  return { currentSystem, toggleSystem, convertIngredient: convert };
}
