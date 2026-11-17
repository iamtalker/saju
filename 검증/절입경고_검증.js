// 절입 경고 시간대 회귀 검증: 출생 순간을 한국 표준시로 정확히 환산해 절입 전후 하루를 판정하는지 확인한다.
// 기준 절입: 2024년 입춘 = 2024-02-04 16:27 (한국 표준시). 경고 대상은 절입 당일 또는 전후 하루(±1일)이다.
const assert = require('assert');
const { calculate } = require('../engine');

const base = { year: 2024, month: 2, calendar: 'solar', sex: 'male', dayBoundary: '23', correction: 0 };
const run = (day, time) => calculate({ ...base, day, time });
const warnsJie = r => (r.boundaryInfo && r.boundaryInfo.near || []).some(s => s.includes('절입'));

// 수정 전에는 2024-02-03 08:00이 빠지고 2024-02-06 08:00이 잘못 경고되었다.
assert.strictEqual(warnsJie(run(3, '08:00')), true, '2024-02-03 08:00: 입춘 하루 전이므로 경고해야 한다');
assert.strictEqual(warnsJie(run(2, '08:00')), false, '2024-02-02 08:00: 입춘 이틀 전이므로 경고하지 않는다');
assert.strictEqual(warnsJie(run(6, '08:00')), false, '2024-02-06 08:00: 입춘 이틀 후이므로 경고하지 않는다');
assert.strictEqual(warnsJie(run(4, '17:00')), true, '2024-02-04 17:00: 입춘 당일 오후이므로 경고해야 한다');
assert.strictEqual(warnsJie(run(5, '10:00')), true, '2024-02-05 10:00: 입춘 다음 날이므로 경고해야 한다');

// 경고 여부와 무관하게 연주·월주는 같아야 한다(경고 계산은 기둥을 바꾸지 않는다).
const a = run(3, '08:00'), b = run(6, '08:00');
assert.strictEqual(a.pillars[0].hangul, '계묘', '2024-02-03 08:00 연주는 입춘 전이라 계묘');
assert.strictEqual(b.pillars[0].hangul, '갑진', '2024-02-06 08:00 연주는 입춘 후라 갑진');

console.log('절입 경고 검증 통과: 2024-02-03 08:00 경고, 2024-02-06 08:00 비경고, 연주 전환 확인');
