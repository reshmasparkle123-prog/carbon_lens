/**
 * CarbonLens – Carbon Calculation Utilities
 * Pure functions — no DOM dependencies, fully testable.
 */

const TRANSPORT_FACTORS = {
  petrol_car: 0.21,
  diesel_car: 0.17,
  ev: 0.05,
  bike: 0.11,
  auto: 0.13,
  bus: 0.089,
  train: 0.041,
  walk: 0
};

const FOOD_FACTORS = {
  vegan: 1.5,
  vegetarian: 2.0,
  mixed: 4.5,
  heavy_meat: 7.5
};

const WASTE_FACTORS = {
  low: 0.3,
  medium: 0.6,
  high: 1.2
};

const VALID_VEHICLE_TYPES = Object.keys(TRANSPORT_FACTORS);
const VALID_DIET_TYPES = Object.keys(FOOD_FACTORS);
const VALID_WASTE_TYPES = Object.keys(WASTE_FACTORS);

function calcTransport(vehicleType, km) {
  if (!TRANSPORT_FACTORS.hasOwnProperty(vehicleType)) throw new Error(`Unknown vehicle type: ${vehicleType}`);
  if (typeof km !== 'number' || km < 0) throw new Error('Distance cannot be negative');
  return TRANSPORT_FACTORS[vehicleType] * km;
}

function calcFood(dietType, meals) {
  if (!FOOD_FACTORS.hasOwnProperty(dietType)) throw new Error(`Unknown diet type: ${dietType}`);
  if (meals < 1 || meals > 6) throw new Error('Meals must be between 1 and 6');
  return (FOOD_FACTORS[dietType] / 3) * meals;
}

function calcEnergy(electricityKwh, acHours) {
  if (electricityKwh < 0) throw new Error('Electricity cannot be negative');
  if (acHours < 0 || acHours > 24) throw new Error('AC hours must be 0-24');
  return electricityKwh * 0.82 + acHours * 0.5;
}

function calcShopping(orders, wasteLevel) {
  if (!WASTE_FACTORS.hasOwnProperty(wasteLevel)) throw new Error(`Unknown waste level: ${wasteLevel}`);
  if (orders < 0) throw new Error('Orders cannot be negative');
  return orders * 0.5 + WASTE_FACTORS[wasteLevel];
}

function calcTotal(transport, food, energy, shopping) {
  return transport + food + energy + shopping;
}

function getGrade(total) {
  if (total < 4) return 'Excellent';
  if (total < 8) return 'Good';
  if (total < 13) return 'Average';
  return 'High Impact';
}

function sanitizeNumber(val, min, max, fallback) {
  const n = parseFloat(val);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function sanitizeString(val, allowed) {
  return allowed.includes(val) ? val : allowed[0];
}

function calcFootprint({ vehicleType, km, dietType, meals, electricity, acHours, orders, waste }) {
  const vt = sanitizeString(vehicleType, VALID_VEHICLE_TYPES);
  const safeKm = sanitizeNumber(km, 0, 2000, 0);
  const dt = sanitizeString(dietType, VALID_DIET_TYPES);
  const safeMeals = sanitizeNumber(meals, 1, 6, 3);
  const safeElec = sanitizeNumber(electricity, 0, 500, 0);
  const safeAc = sanitizeNumber(acHours, 0, 24, 0);
  const safeOrders = sanitizeNumber(orders, 0, 50, 0);
  const wt = sanitizeString(waste, VALID_WASTE_TYPES);

  const tCO2 = calcTransport(vt, safeKm);
  const fCO2 = calcFood(dt, safeMeals);
  const eCO2 = calcEnergy(safeElec, safeAc);
  const sCO2 = calcShopping(safeOrders, wt);
  const total = calcTotal(tCO2, fCO2, eCO2, sCO2);

  return { tCO2, fCO2, eCO2, sCO2, total, grade: getGrade(total) };
}

if (typeof module !== 'undefined') {
  module.exports = {
    calcTransport, calcFood, calcEnergy, calcShopping,
    calcTotal, getGrade, sanitizeNumber, sanitizeString,
    calcFootprint, TRANSPORT_FACTORS, FOOD_FACTORS, WASTE_FACTORS,
    VALID_VEHICLE_TYPES, VALID_DIET_TYPES, VALID_WASTE_TYPES
  };
}
