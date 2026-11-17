// 003 후속 검증: 시주·연주 미확정 때 득세 판정 보류, 확정된 글자만으로 3개 이상이면 유지,
// 풀이 문구의 확인 범위 표시, 화면(HTML)과 Markdown의 문장 대조.
const assert = require('assert');
const { calculate } = require('../engine');
const Profile = require('../profile');
const Fun = require('../fun-reading');

const unknownCase = (y, m, d) => calculate({ year: y, month: m, day: d, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '00', correction: 0 });
const fullCase = (y, m, d, time) => calculate({ year: y, month: m, day: d, calendar: 'solar', time, sex: 'male', dayBoundary: '23', correction: 0 });

// A. 시주 미확정 + 확정 글자로 득세가 정해지지 않는 경우: 1980-01-01 (기미 병자 계유 -)
// 확정 비겁·인성 2개, 시주 미확정이 2개를 더할 수 있으므로 득세는 알 수 없음(null)이고 판정은 보류여야 한다.
{
  const r = unknownCase(1980, 1, 1);
  assert.strictEqual(r.pillars[3], null, '시주 미확정');
  assert.strictEqual(r.analysis.strength.supportCount, 2);
  assert.strictEqual(r.analysis.strength.deuse, null, '시주가 득세를 바꿀 수 있으므로 거짓으로 고정하지 않는다');
  assert.deepStrictEqual(r.analysis.strength.hitsRange, [2, 3]);
  assert.strictEqual(r.analysis.strength.verdict, '보류');
  assert.strictEqual(r.strength.verdict, '보류', '화면과 같은 판정 원천');
  assert.strictEqual(r.analysis.status, '보류');
  assert.deepStrictEqual(r.analysis.months, [], '판정이 보류면 월운을 계산하지 않는다');
}

// B. 시주 미확정 + 확정 글자 기준 충족 불가: 1980-01-04 (기미 병자 병자 -)
// 확정 비겁·인성 1개, 득령·득지 모두 거짓이므로 최대 1개 → 신약 또는 갈림, 판정 보류.
{
  const r = unknownCase(1980, 1, 4);
  assert.strictEqual(r.analysis.strength.supportCount, 1);
  assert.strictEqual(r.analysis.strength.deuse, null);
  assert.deepStrictEqual(r.analysis.strength.hitsRange, [0, 1]);
  assert.strictEqual(r.analysis.strength.verdict, '보류');
}

// C. 시주 미확정이어도 가능한 충족 개수가 하나의 판정으로 정해지는 경우: 1980-02-04 (기미 정축 정미 -)
// 가능한 개수 1~2는 모두 갈림이므로 판정을 확정한다.
{
  const r = unknownCase(1980, 2, 4);
  assert.strictEqual(r.analysis.strength.deuse, null);
  assert.deepStrictEqual(r.analysis.strength.hitsRange, [1, 2]);
  assert.strictEqual(r.analysis.strength.verdict, '갈림');
  assert.strictEqual(r.analysis.status, '갈림');
}

// D. 확정된 글자만으로 비겁·인성이 이미 3개 이상: 1980-01-07 (기미 정축 기묘 -)
// 시주 미확정과 관계없이 득세는 참이어야 하며 기존 판정(갈림, 충족 2개)은 유지된다.
{
  const r = unknownCase(1980, 1, 7);
  assert.strictEqual(r.analysis.strength.supportCount, 4);
  assert.strictEqual(r.analysis.strength.deuse, true, '확정 글자만으로 3개 이상이면 참으로 고정한다');
  assert.deepStrictEqual(r.analysis.strength.hitsRange, [2, 2]);
  assert.strictEqual(r.analysis.strength.verdict, '갈림');
}

// E. 월주·시주가 모두 확정된 명식: 기존 판정 규칙 유지(득세 = 비겁·인성 3개 이상)
for (const [y, m, d, t] of [[1981, 6, 15, '12:00'], [1992, 9, 15, '12:00'], [1985, 3, 3, '10:00']]) {
  const r = fullCase(y, m, d, t);
  assert.strictEqual(r.analysis.strength.deuse, r.analysis.strength.supportCount >= 3, `${y}-${m}-${d} 득세 기준`);
  assert.notStrictEqual(r.analysis.strength.deuse, null);
  assert.ok(r.analysis.strength.verdict !== '보류', '모든 기둥이 확정되면 보류하지 않는다');
}

// F. 문구의 확인 범위: 미확정 기둥이 있으면 요약·문단·근거가 같은 범위를 밝힌다
const scoped = Profile.build(unknownCase(1980, 1, 1));
for (const s of scoped.sections) {
  assert.ok(s.summary.endsWith('확인된 기둥 기준'), `${s.key} 요약에 범위 표시: ${s.summary}`);
  assert.ok(s.paragraphs.some(p => p.includes('확정되지 않은 시주')), `${s.key} 문단에 미확정 기둥 범위 표시`);
  assert.ok(s.evidence.some(e => e.startsWith('확인 범위:') && e.includes('미확정: 시주')), `${s.key} 근거에 확인 범위 표시`);
  const text = [s.summary, ...s.paragraphs].join(' ');
  assert.ok(!/원국에 (식상|인성|관성|재성|비겁)이 드러나지 않/.test(text), `${s.key}: 전체 원국 부재 결론이 남아 있다`);
  assert.ok(!text.includes('원국에 재성이 드러나지'), `${s.key}: 재물 요약의 전체 원국 결론`);
}
// 모든 기둥이 확정되면 범위 표시를 붙이지 않는다
const full = Profile.build(fullCase(1981, 6, 15, '12:00'));
for (const s of full.sections) {
  assert.ok(!s.summary.includes('확인된 기둥 기준'));
  assert.ok(s.evidence.some(e => e === '확인 범위: 연주·월주·일주·시주'));
}
console.log('확인 범위 표시: 미확정 기둥이 있으면 요약·문단·근거에 같은 범위, 모든 기둥이 확정되면 표시 없음');

// G. 화면(HTML)과 Markdown이 같은 문장을 쓰는지 대조
const cases = [unknownCase(1980, 1, 1), unknownCase(2024, 3, 5), fullCase(1981, 6, 15, '12:00')];
for (const data of cases) {
  const pr = Profile.build(data);
  const html = Profile.toHtml(pr), md = Profile.toMarkdown(pr).join('\n');
  for (const s of pr.sections) {
    for (const t of [s.summary, ...s.paragraphs, ...s.evidence]) {
      assert.ok(html.includes(t), 'HTML 누락: ' + t);
      assert.ok(md.includes(t), 'Markdown 누락: ' + t);
    }
  }
  for (const n of pr.notes) { assert.ok(html.includes(n) && md.includes(n), 'notes 누락: ' + n); }
  // 화면 전체 풀이(부분 명식 경로)에도 같은 프로필 HTML이 들어간다
  const page = Fun.build(data, html);
  assert.ok(page.includes(html), '풀이 화면에 프로필 블록 포함');
}
console.log('화면(HTML)과 Markdown의 요약·문단·근거·노트 문장 일치');

console.log('003 후속 검증 통과');
