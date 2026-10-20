// Custom Test Runner for Node.js / ES Modules
import { calculateBookingBreakdown, formatINR, generateBookingRef, maskPhoneNumber } from '../src/lib/utils.js';
import { INDIAN_CITIES, INDIAN_STATES } from '../src/lib/geoData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log('\n--- RUNNING COMPANION MARKETPLACE AUTOMATED SUITE ---\n');

// 1. Platform Pricing & 10% Commission Calculations
console.log('Test Group 1: 10% Platform Commission Calculations');
const breakdown = calculateBookingBreakdown(5000, 2, 10, 0);
assert(breakdown.baseAmount === 10000, 'Base amount is 5000 * 2 = 10,000');
assert(breakdown.platformCommissionAmount === 1000, 'Platform commission is exactly 10% (1,000)');
assert(breakdown.netCompanionAmount === 9000, 'Companion net earnings is 90% (9,000)');
assert(breakdown.finalPaidByCustomer === 10000, 'Final payable is 10,000 without credit');

// 2. Replacement Credit Application
console.log('\nTest Group 2: Replacement Booking Credits Application');
const creditBreakdown = calculateBookingBreakdown(3000, 2, 10, 2000);
assert(creditBreakdown.baseAmount === 6000, 'Base amount is 6,000');
assert(creditBreakdown.creditApplied === 2000, 'Credit applied is 2,000');
assert(creditBreakdown.finalPaidByCustomer === 4000, 'Final payable reduced to 4,000');

// 3. Indian Currency Formatting
console.log('\nTest Group 3: INR Formatting');
const formatted = formatINR(100000);
assert(formatted.includes('1,00,000') || formatted.includes('100,000'), 'Proper INR comma grouping');

// 4. Booking Reference Format
console.log('\nTest Group 4: Booking Reference Generation');
const ref = generateBookingRef();
assert(/^BK-\d{8}-[A-Z0-9]{4}$/.test(ref), `Generated reference ${ref} matches pattern`);

// 5. Phone Masking for Privacy
console.log('\nTest Group 5: Data Privacy & Phone Masking');
const masked = maskPhoneNumber('+919876543210');
assert(masked === '+91 ••••• ••210', `Masked phone format: ${masked}`);

// 6. Indian Cities & Tiers
console.log('\nTest Group 6: Indian Geographic Discovery');
const mumbai = INDIAN_CITIES.find(c => c.slug === 'mumbai');
assert(mumbai !== undefined && mumbai.tier === 1, 'Mumbai exists as Tier 1 city');
assert(mumbai.popularAreas.length > 3, 'Mumbai has verified neighborhood areas');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
