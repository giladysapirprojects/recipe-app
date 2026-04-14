// Unit conversion system — ported from utils.js with TypeScript types

import type { Ingredient } from '@/types/recipe';

type UnitType = 'volume' | 'weight' | 'neutral';
type UnitSystem = 'metric' | 'imperial' | 'neutral';

/** Volume conversion factors to milliliters (ml) */
const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1, l: 1000,
  cups: 250, cup: 250,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  'fl oz': 29.5735, 'fluid ounce': 29.5735, 'fluid ounces': 29.5735,
  pint: 473.176, pints: 473.176,
  quart: 946.353, quarts: 946.353,
  gallon: 3785.41, gallons: 3785.41,
};

/** Weight conversion factors to grams (g) */
const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilogram: 1000, kilograms: 1000,
  mg: 0.001, milligram: 0.001, milligrams: 0.001,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
};

const METRIC_UNITS = ['ml', 'l', 'g', 'kg', 'mg', 'gram', 'grams', 'kilogram', 'kilograms', 'milligram', 'milligrams'];
const IMPERIAL_UNITS = [
  'cups', 'cup', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
  'fl oz', 'fluid ounce', 'fluid ounces', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds',
  'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons',
];

function getUnitType(unit: string): UnitType {
  if (!unit) return 'neutral';
  const n = unit.toLowerCase().trim();
  if (VOLUME_CONVERSIONS[n]) return 'volume';
  if (WEIGHT_CONVERSIONS[n]) return 'weight';
  return 'neutral';
}

export function getUnitSystem(unit: string): UnitSystem {
  if (!unit) return 'neutral';
  const n = unit.toLowerCase().trim();
  if (METRIC_UNITS.includes(n)) return 'metric';
  if (IMPERIAL_UNITS.includes(n)) return 'imperial';
  return 'neutral';
}

/** Parse quantity string including fractions like "1/2" or "1 1/2" */
function parseQuantity(quantity: string | number): number | null {
  if (typeof quantity === 'number') return quantity;
  if (!quantity || typeof quantity !== 'string') return null;

  const str = quantity.trim();
  if (str === '' || str.toLowerCase() === 'to taste' || str.toLowerCase() === 'a pinch') return null;

  if (/^\d+\.?\d*$/.test(str)) return parseFloat(str);
  if (/^\d+\/\d+$/.test(str)) {
    const [num, den] = str.split('/').map(Number);
    return num / den;
  }
  if (/^\d+\s+\d+\/\d+$/.test(str)) {
    const parts = str.split(/\s+/);
    const whole = parseInt(parts[0]);
    const [num, den] = parts[1].split('/').map(Number);
    return whole + num / den;
  }
  return null;
}

function convertToMetricBase(quantity: string | number, unit: string): { value: number; baseUnit: 'ml' | 'g' } | null {
  const parsedQty = parseQuantity(quantity);
  if (parsedQty === null) return null;

  const n = unit?.toLowerCase().trim() || '';
  const unitType = getUnitType(n);

  if (unitType === 'volume') {
    return { value: parsedQty * VOLUME_CONVERSIONS[n], baseUnit: 'ml' };
  }
  if (unitType === 'weight') {
    return { value: parsedQty * WEIGHT_CONVERSIONS[n], baseUnit: 'g' };
  }
  return null;
}

function findBestMetricUnit(value: number, baseUnit: 'ml' | 'g'): { quantity: number; unit: string } {
  if (baseUnit === 'ml') {
    return value >= 1000 ? { quantity: value / 1000, unit: 'l' } : { quantity: value, unit: 'ml' };
  }
  return value >= 1000 ? { quantity: value / 1000, unit: 'kg' } : { quantity: value, unit: 'g' };
}

function findBestImperialUnit(value: number, baseUnit: 'ml' | 'g'): { quantity: number; unit: string } {
  if (baseUnit === 'ml') {
    if (value >= VOLUME_CONVERSIONS.cups) return { quantity: value / VOLUME_CONVERSIONS.cups, unit: 'cups' };
    if (value >= VOLUME_CONVERSIONS.tbsp) return { quantity: value / VOLUME_CONVERSIONS.tbsp, unit: 'tbsp' };
    if (value >= VOLUME_CONVERSIONS.tsp) return { quantity: value / VOLUME_CONVERSIONS.tsp, unit: 'tsp' };
    return { quantity: value / VOLUME_CONVERSIONS['fl oz'], unit: 'fl oz' };
  }
  if (value >= WEIGHT_CONVERSIONS.lb) return { quantity: value / WEIGHT_CONVERSIONS.lb, unit: 'lbs' };
  return { quantity: value / WEIGHT_CONVERSIONS.oz, unit: 'oz' };
}

function roundToPrecision(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  if (rounded < 1 && rounded > 0) return Math.round(value * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 0.01) return Math.round(rounded);
  return rounded;
}

/**
 * Convert an ingredient to the target unit system
 * Returns null if conversion is not possible or not needed
 */
export function convertIngredient(
  ingredient: Ingredient,
  targetSystem: 'metric' | 'imperial'
): { quantity: string; unit: string } | null {
  if (!ingredient?.unit) return null;

  const currentSystem = getUnitSystem(ingredient.unit);
  if (currentSystem === targetSystem || currentSystem === 'neutral') return null;

  const metricBase = convertToMetricBase(ingredient.quantity, ingredient.unit);
  if (!metricBase) return null;

  const result = targetSystem === 'metric'
    ? findBestMetricUnit(metricBase.value, metricBase.baseUnit)
    : findBestImperialUnit(metricBase.value, metricBase.baseUnit);

  return {
    quantity: roundToPrecision(result.quantity).toString(),
    unit: result.unit,
  };
}
