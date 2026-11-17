// 현재 대운과 올해 세운 요약 검증.
// - 방향 판정은 기존 analysis.cycles·analysis.years의 천간·지지 판정만 쓴다(독립 재계산으로 대조).
// - 같은 방향, 엇갈림, 하나로 정할 수 없는 사례를 실제 명식에서 찾아 확인한다.
// - 화면(HTML)과 Markdown의 요약 문장이 같은지 대조한다.
const assert = require('assert');
const { calculate } = require('../engine');
const Fun = require('../fun-reading');

const curYear = Number(calculate({ year: 2000, month: 1, day: 1, calendar: 'solar', time: '12:00', sex: 'male', dayBoundary: '00', correction: 0 }).extras.year);

// 독립 재계산: 방향을 정하는 규칙을 요약 코드와 따로 적는다.
const tone = (s, b) => {
  const js = [s, b];
  if (js.some(j => !j || j === '갈림' || j === '보류')) return null;
  const good = js.some(j => j === '용신' || j === '희신'), bad = js.includes('기신');
  if (good && bad) return null;
  return good ? '도움' : bad ? '부담' : '중립';
};
const expectedLink = (ct, yt) => {
  if (ct === yt) return ct === '중립' ? '두 흐름 모두 뚜렷한 방향이 없어 방향이 엇갈리지 않습니다.' : `두 흐름이 같은 방향(${ct})이라 이 시기의 기운이 한 방향으로 모입니다.`;
  if ((ct === '도움' && yt === '부담') || (ct === '부담' && yt === '도움')) return '두 흐름이 엇갈려, 도움과 부담이 함께 나타나는 해로 볼 수 있습니다.';
  return '한쪽은 중립이라 두 흐름의 방향이 뚜렷하게 엇갈리지 않습니다.';
};

const make = (y, m, d, t, sex, extra = {}) => calculate({ year: y, month: m, day: d, calendar: 'solar', time: t, sex, dayBoundary: '00', correction: 0, ...extra });
const info = (r) => {
  const b = Fun.bridge(r);
  return { b, parts: [...(b.lines.length ? [b.lines.join(' ')] : []), ...(b.basis ? [b.basis] : []), ...(b.reason ? [`요약 보류 이유: ${b.reason}`] : [])] };
};

// 1) 명식 스캔: 같은 방향 / 엇갈림 사례를 찾고, 규칙을 독립 계산과 대조한다.
const found = { same: null, opposite: null, neutral: null };
let checked = 0;
for (let y = 1962; y <= 1999 && !(found.same && found.opposite); y++) {
  for (const m of [3, 9]) {
    const r = make(y, m, 12, '12:00', 'male');
    if (!r.analysis || r.analysis.status !== '정함' || !r.daeun || !r.daeun.available) continue;
    const nowAge = curYear - y;
    const cur = r.analysis.cycles.find(c => nowAge >= c.fromAge && nowAge <= c.toAge);
    const yNow = r.analysis.years.find(v => v.year === curYear);
    if (!cur || !yNow) continue;
    const ct = tone(cur.stem, cur.branch), yt = tone(yNow.stem, yNow.branch);
    if (!ct || !yt) continue;
    checked++;
    const { b, parts } = info(r);
    if (!b.lines.length) continue;
    // 요약 문장이 독립 재계산과 같은 방향을 말하는지 확인
    assert.ok(b.lines[2] === expectedLink(ct, yt), `${y}-${m}: 연결 문장이 규칙과 다르다: ${b.lines[2]}`);
    assert.ok(b.lines[0].includes(cur.pillar) && b.lines[1].includes(yNow.pillar), '현재 대운과 올해 세운 간지가 문장에 있어야 한다');
    const key = ct === yt ? (ct === '중립' ? 'neutral' : 'same') : (ct !== '중립' && yt !== '중립' ? 'opposite' : null);
    if (key && !found[key]) found[key] = { input: `${y}-${m}-12 12:00 남성`, cur: cur.pillar, year: yNow.pillar, ct, yt, parts, pillars: r.pillars.map(p => p && p.hangul) };
  }
}
assert.ok(checked > 0, '판정이 확정된 현재 대운·올해 세운 사례가 있어야 한다');
assert.ok(found.same && found.opposite, `같은 방향(${!!found.same})과 엇갈림(${!!found.opposite}) 사례를 찾아야 한다`);
console.log(`사례 확인(${checked}건 중): 같은 방향 ${found.same.input} / 엇갈림 ${found.opposite.input}`);

// 2) 하나로 정할 수 없는 사례: 성별 미선택(남·여 두 기준), 출생시간 미상
const noSex = make(1962, 3, 12, '12:00', undefined);   // 용신 판정 '정함' + 성별 미선택(남·여 두 기준)
if (noSex.daeun && noSex.daeun.alternatives) {
  const { b } = info(noSex);
  assert.ok(b.reason && b.reason.includes('두 기준'), '성별 미선택 이유를 보여야 한다');
  assert.ok(!b.lines.some(l => l.includes('현재 대운')), '성별 미선택이면 현재 대운 문장을 만들지 않는다');
}
const unknownTime = calculate({ year: 1962, month: 3, day: 12, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '00', correction: 0 });   // 용신 판정 '정함' + 출생시간 미상
{
  const { b } = info(unknownTime);
  assert.ok(b.reason && b.reason.includes('출생시간'), `출생시간 미상 이유: ${b.reason}`);
  assert.ok(!b.lines.some(l => l.includes('현재 대운')), '출생시간 미상이면 현재 대운 문장을 만들지 않는다');
}
// 3) 갈림·보류 명식: 월주 미확정 부분 명식은 방향을 비교하지 않는다
const partial = calculate({ year: 2024, month: 3, day: 5, calendar: 'solar', unknown: true, sex: 'male', dayBoundary: '00', correction: 0 });
{
  const { b } = info(partial);
  assert.deepStrictEqual(b.lines, [], '보류 명식은 방향 문장을 쓰지 않는다');
  assert.ok(b.reason, '보류 이유를 보여야 한다');
}
console.log(`하나로 정할 수 없는 사례: 성별 미선택(${noSex.daeun && noSex.daeun.alternatives ? '확인' : '해당 없음'}), 출생시간 미상 확인, 부분 명식 보류 확인`);

// 4) 화면(HTML)과 Markdown의 요약 문장 대조, 사건 단정 금지
for (const sample of [found.same, found.opposite]) {
  const [y, m] = sample.input.split('-').map(Number);
  const r = make(y, m, 12, '12:00', 'male');
  const html = Fun.build(r, '');
  const md = Fun.bridgeMarkdown(r).join('\n');
  for (const p of info(r).parts) {
    assert.ok(html.includes(p), 'HTML 누락: ' + p);
    assert.ok(md.includes(p), 'Markdown 누락: ' + p);
  }
  assert.ok(!/사건이 (발생|생깁니다|일어납니다)/.test(md) || md.includes('단정하지 않습니다'), '사건 발생 단정 금지');
}
// 기존 판정 값은 바뀌지 않아야 한다: 요약 추가 후에도 analysis 판정은 입력과 같다
const sameInput = make(1962, 3, 12, '12:00', 'male');
assert.ok(sameInput.analysis && sameInput.analysis.strength, '기존 분석 결과는 그대로 있어야 한다');

console.log('같은 방향·엇갈림 사례의 규칙 대조, 미정 사례 이유 표시, HTML·Markdown 문장 일치 확인');
// 5) 혼합 판정(008): 천간과 지지가 각각 도움·부담이면 방향을 정하지 않고 두 판정을 순서대로 알려 준다.
// 재현 명식 辛酉 庚子 戊子 癸亥, 현재 대운 丙申(천간 용신, 지지 기신)
{
  const mixed = calculate({ year: 1982, month: 1, day: 5, calendar: 'solar', time: '22:30', sex: 'male', dayBoundary: '23', correction: 0 });
  assert.strictEqual(mixed.pillars.map(p => p.hanja).join(' '), '辛酉 庚子 戊子 癸亥');
  const b = Fun.bridge(mixed);
  assert.strictEqual(b.lines[0], '현재 대운은 丙申입니다. 천간은 용신, 지지는 기신이라 도움과 부담이 함께 나타나는 흐름으로 풀이합니다.');
  assert.strictEqual(b.reason, null, '혼합 판정은 갈림·보류 이유로 표시하지 않는다');
  assert.ok(b.lines[1] && b.lines[1].includes('2026년 丙午 세운'), '올해 세운 문장은 유지');
  const md = Fun.bridgeMarkdown(mixed).join('\n');
  for (const line of b.lines) assert.ok(md.includes(line), 'Markdown 누락: ' + line);
  const html = Fun.build(mixed, '');
  for (const line of b.lines) assert.ok(html.includes(line), 'HTML 누락: ' + line);
}
// 반대 순서: 천간 기신, 지지 희신 (실제 순서대로 표시)
{
  const r = calculate({ year: 1982, month: 1, day: 5, calendar: 'solar', time: '22:30', sex: 'male', dayBoundary: '23', correction: 0 });
  const fake = JSON.parse(JSON.stringify(r));
  fake.analysis.cycles = [{ pillar: '癸巳', stem: '기신', branch: '희신', fromAge: 0, toAge: 99 }];
  fake.daeun = { ...fake.daeun, available: true };
  const b = Fun.bridge(fake);
  assert.strictEqual(b.lines[0], '현재 대운은 癸巳입니다. 천간은 기신, 지지는 희신이라 도움과 부담이 함께 나타나는 흐름으로 풀이합니다.');
  assert.strictEqual(b.reason, null);
}
console.log('혼합 판정 사례: 재현 명식(천간 용신·지지 기신)과 반대 순서(천간 기신·지지 희신), 화면과 Markdown 일치');
console.log('현재 대운과 올해 세운 검증 통과');
