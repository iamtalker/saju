const assert = require('node:assert/strict');
const { calculate } = require('../engine');
const { calculateSajuSimple, solarToLunar } = require('@fullstackfamily/manseryeok');

// Compare only inputs where both projects use the same stated convention:
// Korean standard time, no correction, and daytime birth (no midnight boundary).
const cases = [
  [2023, 5, 20, 12, 0],
  [2025, 2, 3, 12, 0],
  [1992, 11, 28, 12, 0],
  [2025, 7, 25, 12, 0],
];
for (const [year, month, day, hour, minute] of cases) {
  const own = calculate({ calendar: 'solar', year, month, day, time: `${hour}:${String(minute).padStart(2, '0')}`, dayBoundary: '00', correction: 0 });
  const other = calculateSajuSimple(year, month, day, hour);
  assert.deepEqual(own.pillars.map(p => p?.hanja), [other.yearPillarHanja, other.monthPillarHanja, other.dayPillarHanja, other.hourPillarHanja], `${year}-${month}-${day} pillars`);
  const lunar = solarToLunar(year, month, day).lunar;
  assert.equal(own.lunar, `${lunar.year}년 ${lunar.isLeapMonth ? '윤' : ''}${lunar.month}월 ${lunar.day}일`, `${year}-${month}-${day} lunar date`);
}
console.log(`GitHub manseryeok 대조 ${cases.length}건 통과`);
