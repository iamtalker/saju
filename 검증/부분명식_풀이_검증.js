// 부분 명식과 성격·직업·재물 풀이 검증.
// 1) 일주 미확정: 임시 일간 값이 확정값처럼 나오지 않는지
// 2) 일주 확정·월주 미확정: 월주가 필요한 판정을 보류하고 확정된 기둥의 풀이는 남기는지
// 3) 같은 일간이라도 월지·십성 배치가 다르면 풀이가 달라지는지
// 4) 세 항목에서 같은 문장을 반복하지 않는지, 시간 미상 시 시주 값을 쓰지 않는지
const assert = require('assert');
const { calculate } = require('../engine');
const Profile = require('../profile');
const Fun = require('../fun-reading');

const build = input => {
  const data = calculate(input);
  const profile = Profile.build(data);
  const html = Profile.toHtml(profile);
  const full = Fun.build(data, html);
  return { data, profile, html, full };
};
const allText = (profile) => profile.sections.flatMap(s => [s.summary, ...s.paragraphs]).join('\n');

// 1) 일주 미확정 (시간 미상 + 23시 기준: 날짜 경계에 걸림)
{
  const { data, profile, full } = build({ year: 1990, month: 5, day: 10, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '23', correction: 0 });
  assert.strictEqual(data.pillars[2], null, '일주가 확정되지 않아야 한다');
  assert.strictEqual(data.analysis, null, '판정 결과를 만들지 않아야 한다');
  assert.strictEqual(data.strength, null, '신강·신약을 확정값으로 내지 않아야 한다');
  assert.strictEqual(data.extras.gongmang, null, '공망을 임시 일간으로 계산하지 않아야 한다');
  assert.strictEqual(data.extras.sipsinCount, null, '십신 개수를 임시 일간으로 계산하지 않아야 한다');
  assert.strictEqual(profile.available, false, '성격·직업·재물 풀이는 제공하지 않아야 한다');
  assert.strictEqual(full, '', '일주가 없으면 종합 풀이를 만들지 않는다');
  console.log('일주 미확정: 공망·십신·신강약·풀이 판정 미표시 확인');
}

// 2) 일주 확정·월주 미확정 (입춘이 아닌 경칩 당일 시간 미상, 기준 00시)
{
  const input = { year: 2024, month: 3, day: 5, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '00', correction: 0 };
  const { data, profile, full } = build(input);
  assert.ok(data.pillars[2], '일주는 확정되어야 한다');
  assert.strictEqual(data.pillars[1], null, '월주는 미확정이어야 한다');
  assert.ok(data.analysis, '확정된 일간으로 분석은 남겨야 한다');
  assert.strictEqual(data.analysis.status, '보류', '용신은 보류여야 한다');
  assert.strictEqual(data.analysis.yong, null);
  assert.deepStrictEqual(data.analysis.months, [], '월운은 계산하지 않아야 한다');
  assert.strictEqual(data.analysis.gyeokguk.name, '미정', '격국은 보류여야 한다');
  const st = data.strength;
  assert.strictEqual(st.verdict, '보류', '득령을 알 수 없어 신강·신약은 보류여야 한다');
  assert.deepStrictEqual(st.hitsRange, [1, 3], '득지 충족과 득세 가능 범위로 충족 개수 범위를 계산한다');
  assert.strictEqual(st.deryeong, null);
  assert.strictEqual(profile.available, true, '확정된 일주로 성격·직업·재물 기초 풀이는 제공한다');
  assert.ok(profile.notes.some(n => n.includes('월주가 확정되지 않아')), '보류 사유를 노트로 남긴다');
  assert.ok(!/null|undefined/.test(allText(profile)), '보류 문단에 null·undefined가 없어야 한다');
  assert.ok(full.includes('보류'), '종합 총평에 보류 사유가 표시되어야 한다');
  assert.ok(!full.includes('격국은 '), '격국 판정 문장이 나오면 안 된다');
  console.log('일주 확정·월주 미확정: 신강·신약 보류(충족 범위 1~3), 용신·월운 보류, 기초 풀이 유지 확인');
}

// 3) 같은 일간(甲)이라도 월지·십성 배치가 다른 두 명식
const A = build({ year: 1981, month: 6, day: 15, calendar: 'solar', time: '12:00', sex: 'male', dayBoundary: '23', correction: 0 });
const B = build({ year: 1992, month: 9, day: 15, calendar: 'solar', time: '12:00', sex: 'male', dayBoundary: '23', correction: 0 });
assert.strictEqual(A.data.pillars[2].stem, '甲');
assert.strictEqual(B.data.pillars[2].stem, '甲');
assert.strictEqual(A.data.pillars[1].branch, '午');
assert.strictEqual(B.data.pillars[1].branch, '酉');
assert.strictEqual(A.data.analysis.gyeokguk.ten, '상관');
assert.strictEqual(B.data.analysis.gyeokguk.ten, '정관');
const persA = A.profile.sections[0].paragraphs.join(' '), persB = B.profile.sections[0].paragraphs.join(' ');
assert.notStrictEqual(persA, persB, '같은 일간이라도 월지·십성이 다르면 성격 풀이가 달라야 한다');
assert.ok(persA.includes('오(午)') && persB.includes('유(酉)'), '월지가 풀이의 근거로 쓰여야 한다');
assert.notStrictEqual(A.profile.sections[2].summary, B.profile.sections[2].summary, '재물 요약도 달라야 한다');
assert.notStrictEqual(A.profile.sections[1].paragraphs.join(' '), B.profile.sections[1].paragraphs.join(' '), '직업 풀이도 달라야 한다');
console.log('같은 일간 甲: 월지 午(상관) vs 酉(정관) 풀이가 세 항목 모두 다름 확인');

// 4) 세 항목 간 문장 반복 금지, 시간 미상 시 시주 미사용, 득세 기준(3개 이상) 일치
const partial = build({ year: 2024, month: 3, day: 5, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '00', correction: 0 });
for (const r of [A, B, partial]) {
  const seen = new Map();
  r.profile.sections.forEach(s => s.paragraphs.forEach(p => {
    assert.ok(!seen.has(p), `문장이 여러 항목에서 반복됨: ${p}`);
    seen.set(p, s.key);
  }));
  const summaries = r.profile.sections.map(s => s.summary);
  assert.strictEqual(new Set(summaries).size, summaries.length, '항목 요약이 서로 달라야 한다');
}
for (const s of partial.profile.sections) s.evidence.forEach(e => assert.ok(!/시간|시지/.test(e), '시간 미상의 시주를 근거로 쓰면 안 된다: ' + e));
// 득세 기준: 월주가 확정된 명식에서 득세는 비겁·인성 3개 이상일 때만 참
for (const r of [A, B]) {
  const st = r.data.analysis.strength;
  assert.strictEqual(st.deuse, st.supportCount >= 3, '득세는 비겁·인성 3개 이상으로 판정해야 한다');
}
console.log('문장 반복 없음, 시간 미상 시주 미사용, 득세 3개 이상 기준 일치');

console.log('부분 명식·성격 직업 재물 검증 통과');
