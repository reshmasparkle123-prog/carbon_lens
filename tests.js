/**
 * CarbonLens – Test Suite
 * Run: node tests/tests.js
 */

const {
  calcTransport, calcFood, calcEnergy, calcShopping,
  calcTotal, getGrade, sanitizeNumber, sanitizeString, calcFootprint
} = require('../public/utils.js');

let passed = 0, failed = 0;

function test(desc, fn) {
  try { fn(); console.log(`  ✅ ${desc}`); passed++; }
  catch(e) { console.log(`  ❌ ${desc}\n     → ${e.message}`); failed++; }
}

function expect(actual) {
  return {
    toBe: (e) => { if (actual !== e) throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(actual)}`); },
    toBeCloseTo: (e, d=2) => { if (Math.abs(actual-e) > Math.pow(10,-d)/2) throw new Error(`Expected ~${e}, got ${actual}`); },
    toBeGreaterThan: (n) => { if (actual <= n) throw new Error(`Expected ${actual} > ${n}`); },
    toBeLessThan: (n) => { if (actual >= n) throw new Error(`Expected ${actual} < ${n}`); },
    toBeLessThanOrEqual: (n) => { if (actual > n) throw new Error(`Expected ${actual} <= ${n}`); },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`); },
  };
}

function expectThrow(fn, msg) {
  try { fn(); throw new Error('Expected to throw but did not'); }
  catch(e) {
    if (e.message === 'Expected to throw but did not') throw e;
    if (msg && !e.message.includes(msg)) throw new Error(`Expected "${msg}" in error, got: "${e.message}"`);
  }
}

// ── TRANSPORT ──
console.log('\n🚗 Transport');
test('Petrol car 10km = 2.1 kg', () => expect(calcTransport('petrol_car', 10)).toBeCloseTo(2.1));
test('Walking = 0 kg', () => expect(calcTransport('walk', 100)).toBe(0));
test('EV 20km = 1.0 kg', () => expect(calcTransport('ev', 20)).toBeCloseTo(1.0));
test('Train 100km = 4.1 kg', () => expect(calcTransport('train', 100)).toBeCloseTo(4.1));
test('Bus < petrol car per km', () => expect(calcTransport('bus',10) < calcTransport('petrol_car',10)).toBe(true));
test('Zero km = zero emissions', () => expect(calcTransport('petrol_car', 0)).toBe(0));
test('Negative km throws', () => expectThrow(() => calcTransport('petrol_car', -1), 'negative'));
test('Unknown vehicle throws', () => expectThrow(() => calcTransport('rocket', 10), 'Unknown vehicle'));

// ── FOOD ──
console.log('\n🍽️  Food');
test('Vegan 3 meals = 1.5 kg', () => expect(calcFood('vegan', 3)).toBeCloseTo(1.5));
test('Heavy meat 3 meals = 7.5 kg', () => expect(calcFood('heavy_meat', 3)).toBeCloseTo(7.5));
test('Vegan < heavy meat', () => expect(calcFood('vegan',3) < calcFood('heavy_meat',3)).toBe(true));
test('More meals = more emissions', () => expect(calcFood('vegetarian',6) > calcFood('vegetarian',3)).toBe(true));
test('0 meals throws', () => expectThrow(() => calcFood('vegan', 0), 'Meals must be'));
test('7 meals throws', () => expectThrow(() => calcFood('vegan', 7), 'Meals must be'));
test('Unknown diet throws', () => expectThrow(() => calcFood('paleo', 3), 'Unknown diet'));

// ── ENERGY ──
console.log('\n⚡ Energy');
test('5 kWh 0 AC = 4.1 kg', () => expect(calcEnergy(5, 0)).toBeCloseTo(4.1));
test('Zero usage = 0 kg', () => expect(calcEnergy(0, 0)).toBe(0));
test('2 AC hours = 1.0 kg', () => expect(calcEnergy(0, 2)).toBeCloseTo(1.0));
test('More kWh = more emissions', () => expect(calcEnergy(10,0) > calcEnergy(5,0)).toBe(true));
test('Negative kWh throws', () => expectThrow(() => calcEnergy(-1, 0), 'negative'));
test('AC > 24h throws', () => expectThrow(() => calcEnergy(0, 25), '0-24'));

// ── SHOPPING ──
console.log('\n🛍️  Shopping');
test('0 orders + low = 0.3 kg', () => expect(calcShopping(0, 'low')).toBeCloseTo(0.3));
test('1 order + medium = 1.1 kg', () => expect(calcShopping(1, 'medium')).toBeCloseTo(1.1));
test('High > medium waste', () => expect(calcShopping(0,'high') > calcShopping(0,'medium')).toBe(true));
test('More orders = more emissions', () => expect(calcShopping(5,'low') > calcShopping(1,'low')).toBe(true));
test('Negative orders throws', () => expectThrow(() => calcShopping(-1, 'low'), 'negative'));
test('Unknown waste throws', () => expectThrow(() => calcShopping(0, 'extreme'), 'Unknown waste'));

// ── TOTAL ──
console.log('\n📊 Total');
test('Components sum correctly', () => {
  const t=calcTransport('petrol_car',10), f=calcFood('vegetarian',3), e=calcEnergy(5,0), s=calcShopping(0,'medium');
  expect(calcTotal(t,f,e,s)).toBeCloseTo(t+f+e+s);
});
test('Result is always positive', () => expect(calcTotal(0,calcFood('vegan',3),0,calcShopping(0,'low'))).toBeGreaterThan(0));

// ── GRADES ──
console.log('\n🏅 Grades');
test('0 kg = Excellent', () => expect(getGrade(0)).toBe('Excellent'));
test('3.9 kg = Excellent', () => expect(getGrade(3.9)).toBe('Excellent'));
test('4.0 kg = Good', () => expect(getGrade(4.0)).toBe('Good'));
test('7.9 kg = Good', () => expect(getGrade(7.9)).toBe('Good'));
test('8.0 kg = Average', () => expect(getGrade(8.0)).toBe('Average'));
test('12.9 kg = Average', () => expect(getGrade(12.9)).toBe('Average'));
test('13.0 kg = High Impact', () => expect(getGrade(13.0)).toBe('High Impact'));
test('100 kg = High Impact', () => expect(getGrade(100)).toBe('High Impact'));

// ── SANITIZATION ──
console.log('\n🔒 Sanitization');
test('Clamps to max', () => expect(sanitizeNumber(9999, 0, 2000, 0)).toBe(2000));
test('Clamps to min', () => expect(sanitizeNumber(-5, 0, 100, 0)).toBe(0));
test('NaN returns fallback', () => expect(sanitizeNumber('abc', 0, 100, 42)).toBe(42));
test('Valid string passes through', () => expect(sanitizeString('ev', ['petrol_car','ev','walk'])).toBe('ev'));
test('Invalid string returns first', () => expect(sanitizeString('spaceship', ['petrol_car','ev'])).toBe('petrol_car'));

// ── FULL CALCULATION ──
console.log('\n🌍 Full Footprint');
test('Eco user = Excellent', () => {
  const r = calcFootprint({ vehicleType:'walk', km:0, dietType:'vegan', meals:3, electricity:2, acHours:0, orders:0, waste:'low' });
  expect(r.grade).toBe('Excellent');
});
test('High impact user = High Impact', () => {
  const r = calcFootprint({ vehicleType:'petrol_car', km:50, dietType:'heavy_meat', meals:3, electricity:20, acHours:8, orders:3, waste:'high' });
  expect(r.grade).toBe('High Impact');
});
test('Typical commuter has positive total', () => {
  const r = calcFootprint({ vehicleType:'petrol_car', km:20, dietType:'vegetarian', meals:3, electricity:5, acHours:0, orders:0, waste:'medium' });
  expect(r.total).toBeGreaterThan(0);
});
test('Out-of-range inputs are clamped not crashed', () => {
  const r = calcFootprint({ vehicleType:'invalid', km:99999, dietType:'invalid', meals:99, electricity:99999, acHours:99, orders:99, waste:'invalid' });
  expect(r.total).toBeGreaterThan(0);
});

// ── RESULTS ──
console.log('\n' + '═'.repeat(50));
console.log(`  ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));
if (failed > 0) { console.log('  ⚠️ Some tests failed!'); process.exit(1); }
else { console.log('  🎉 All tests passed!'); }
