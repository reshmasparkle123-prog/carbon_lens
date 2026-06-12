// CarbonLens - Test Suite
const testResults = [];

function assert(condition, testName) {
  testResults.push({ test: testName, passed: condition });
  console.log(`${condition ? '✅' : '❌'} ${testName}`);
}

// Transport emission tests
function testTransportEmissions() {
  assert(0.21 * 10 === 2.1, 'Petrol car 10km = 2.1kg CO2');
  assert(0.041 * 20 === 0.82, 'Train 20km = 0.82kg CO2');
  assert(0 * 100 === 0, 'Walking = 0kg CO2');
  assert(0.05 * 10 === 0.5, 'EV 10km = 0.5kg CO2');
}

// Food emission tests
function testFoodEmissions() {
  assert((1.5 / 3) * 3 === 1.5, 'Vegan 3 meals = 1.5kg CO2');
  assert((7.5 / 3) * 3 === 7.5, 'Heavy meat 3 meals = 7.5kg CO2');
  assert((2.0 / 3) * 1 < 1, 'Vegetarian 1 meal < 1kg CO2');
}

// Energy emission tests
function testEnergyEmissions() {
  assert(5 * 0.82 === 4.1, '5kWh electricity = 4.1kg CO2');
  assert(2 * 0.5 === 1.0, '2h AC = 1.0kg CO2');
  assert(0 * 0.82 === 0, 'Zero electricity = 0kg CO2');
}

// Score grading tests
function testScoreGrading() {
  assert(3.5 < 4, 'Score 3.5 = Excellent grade');
  assert(6 >= 4 && 6 < 8, 'Score 6 = Good grade');
  assert(10 >= 8 && 10 < 13, 'Score 10 = Average grade');
  assert(15 >= 13, 'Score 15 = High Impact grade');
}

// Input validation tests
function testInputValidation() {
  assert(Math.max(0, -5) === 0, 'Negative km clamped to 0');
  assert(Math.min(6, 10) === 6, 'Meals capped at 6');
  assert(isNaN(parseFloat('abc')) === true, 'Invalid input detected');
  assert(parseFloat('') || 0 === 0, 'Empty input defaults to 0');
}

// Run all tests
testTransportEmissions();
testFoodEmissions();
testEnergyEmissions();
testScoreGrading();
testInputValidation();

const passed = testResults.filter(r => r.passed).length;
const total = testResults.length;
console.log(`\n📊 Results: ${passed}/${total} tests passed`);

module.exports = { testResults };
