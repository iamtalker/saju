// 추가 풀이(extra-reading.js) 검증: 한눈에 보기, 오늘의 운세, 신년운세(12달), 직업군 예시, 용어 풀이.
// 완전 명식, 시간 미상, 월주·연주 미확정, 일주 미확정을 함께 본다. 미확정 기둥은 쓰지 않고 '보류'로 적어야 한다.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {calculate}=require('../engine');
const {create}=require('../reading');
const X=require('../extra-reading');
const DR=require('../deep-reading');
const CR=require('../compat-reading');

// 같은 읽을거리 안에서 15자 이상인 문장이 두 번 이상 나오는지 찾는다(줄바꿈과 <br>도 문장 경계로 본다).
function repeatedSentences(text){
  const m=new Map();
  text.split(/(?<=[.])\s+|\n+|<br>/).map(s=>s.replace(/^[-*#\s]+|\*\*/g,'').trim()).filter(s=>s.length>=15).forEach(s=>m.set(s,(m.get(s)||0)+1));
  return [...m].filter(([,n])=>n>1).map(([s])=>s);
}
// 한 문단의 문장 수(마침표 기준). 오늘의 운세는 4~6문장이어야 한다.
const sentenceCount=paragraphs=>paragraphs.join(' ').split(/(?<=[.])\s+/).filter(Boolean).length;

const base={calendar:'solar',dayBoundary:'00',correction:0};
const run=input=>calculate({...base,...input});
const cases=[
  {name:'양력 1990-05-15 10:30 남성(완전 명식)',input:{year:1990,month:5,day:15,time:'10:30',sex:'male',correction:30},kind:'full'},
  {name:'양력 1982-01-05 23:00 여성(완전 명식)',input:{year:1982,month:1,day:5,time:'23:00',sex:'female'},kind:'full'},
  {name:'시간 미상 1990-05-15 여성',input:{year:1990,month:5,day:15,unknown:true,sex:'female'},kind:'hourUnknown'},
  {name:'시간 미상 2024-03-05 남성(월주 미확정)',input:{year:2024,month:3,day:5,unknown:true,sex:'male'},kind:'monthUnknown'},
  {name:'시간 미상 2025-02-03 여성(연주 미확정)',input:{year:2025,month:2,day:3,unknown:true,sex:'female'},kind:'yearUnknown'},
  {name:'시간 미상 1990-01-01 남성(일주 미확정)',input:{year:1990,month:1,day:1,unknown:true,correction:30,sex:'male',dayBoundary:'23'},kind:'dayUnknown'}
];

const FORBIDDEN_EVENT=['사고','질병','이혼','합격','사망','수술','파산','실직','부상','골절','이별','당선','해고'];
const NEW_SECTION_IDS=['reading-extra-summary','reading-extra-today','reading-extra-newyear','reading-extra-jobs','reading-extra-glossary'];
const REQUIRED_TERMS=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인','용신','희신','기신','한신','신강·신약','격국','조후','대운','세운','월운','지장간','십이운성','합·충·형·파·해','공망','일주','일간','일지'];

// 화면에 나가는 문장을 모두 모은다(HTML 태그 제외).
function textOf(extra){
  const s=extra.summary, t=extra.today, n=extra.newYear, j=extra.jobs;
  return [
    s.title, ...s.chips.flatMap(c=>[c.label,c.value]), s.paragraph,
    ...(t.paragraphs||[]), t.tip||'', t.reason||'',
    ...(n.paragraphs||[]), n.remaining||'', n.note||'', n.reason||'',
    ...(n.months||[]).map(m=>m.text), ...(n.goodMonths||[]),
    j.reason||'', j.basis||'', ...(j.items||[]).flatMap(i=>[i.job,i.reason]),
    ...extra.glossary.flatMap(g=>[g.term,g.desc])
  ].join('\n');
}
function htmlOf(extra){
  return [X.summaryBlock(extra), X.bodyBlock(extra)].join('\n');
}
function mdOf(extra){
  return [...X.summaryMarkdown(extra), ...X.bodyMarkdown(extra)].join('\n');
}
function checkText(name,text){
  for(const bad of ['undefined','null','NaN','[object']) assert.ok(!text.includes(bad),`${name}: "${bad}" 포함`);
  assert.equal(/[가-힣](은|는|이|가|을|를|와|과)\(/.test(text),false,`${name}: 조사가 괄호 앞 글자에 붙음`);
  assert.equal(/[가-힣](은\/는|이\/가|을\/를|와\/과)/.test(text),false,`${name}: 조사 슬래시 표기 남음`);
  for(const w of FORBIDDEN_EVENT) assert.equal(text.includes(w),false,`${name}: 사건 예측어 "${w}"`);
  assert.equal(/반드시|틀림없|확실히/.test(text),false,`${name}: 단정 표현`);
  // 점수 개념은 "점수가 아니다"라는 설명으로만 쓰고, 숫자로 된 점수는 어디에도 두지 않는다.
  assert.equal(/\d+\s*점(?!\S*(?:입니다|이다))|점수\s*[-+]?\d/.test(text),false,`${name}: 숫자 점수`);
  assert.equal(/(^|\s)[+-]\d/.test(text),false,`${name}: 부호가 붙은 수치 점수`);
}

const report=[];
for(const c of cases){
  const d=run({...c.input,calendar:'solar',time:c.input.time||'',unknown:Boolean(c.input.unknown)});
  const reading=create(d);
  const extra=X.build(d,reading);
  const text=textOf(extra), html=htmlOf(extra), md=mdOf(extra);
  checkText(c.name,text);
  checkText(c.name+' MD',md);

  // 1. 섹션 존재: 모든 섹션 id가 HTML에 있다(미확정이어도 보류 문장으로 남긴다)
  for(const id of NEW_SECTION_IDS) assert.ok(html.includes(`id="${id}"`),`${c.name}: ${id} 없음`);
  assert.ok(html.includes('class="chip-row"'),`${c.name}: 칩 없음`);
  assert.ok(!html.includes('undefined')&&!html.includes('NaN'),`${c.name}: HTML에 undefined/NaN`);

  // 2. 한눈에 보기: 칩 3~5개, 요약 3문장
  assert.ok(extra.summary.chips.length>=3&&extra.summary.chips.length<=5,`${c.name}: 칩 개수 ${extra.summary.chips.length}`);
  assert.equal(extra.summary.paragraph.split('. ').length,3,`${c.name}: 요약 3문장`);

  // 3. 미확정 기둥 처리
  const hourUnknown=!d.pillars[3], monthUnknown=!d.pillars[1], yearUnknown=!d.pillars[0], dayUnknown=!d.pillars[2];
  if(hourUnknown) assert.ok(!/시지|시주|시간 기둥/.test(text),`${c.name}: 미확정 시주를 쓰면 안 된다`);
  if(yearUnknown) assert.ok(!/연지|연주/.test(text.replace(/연주가|연주는/g,'')),`${c.name}: 미확정 연주 사용 의심`);

  if(dayUnknown){
    assert.equal(extra.summary.chips[0].value,'보류',`${c.name}: 일간 칩은 보류`);
    assert.equal(extra.newYear.available,false,`${c.name}: 신년운세 보류`);
    assert.equal(extra.newYear.months.length,0,`${c.name}: 일주 미확정이면 월별 해석 없음`);
    assert.equal(extra.today.available,false,`${c.name}: 오늘의 운세 보류`);
    assert.equal(extra.jobs.available,false,`${c.name}: 직업군 보류`);
    assert.ok(html.includes('보류'),`${c.name}: 보류 문장 없음`);
    report.push(`PASS ${c.name}: 일주 미확정 → 신년운세·오늘의 운세·직업군 보류`);
    continue;
  }

  // 4. 오늘의 운세
  assert.equal(extra.today.available,true,`${c.name}: 오늘의 운세`);
  assert.equal(extra.today.paragraphs.length,4,`${c.name}: 오늘의 운세 문단 4개`);
  assert.ok(extra.today.tip.length>0,`${c.name}: 생활 팁`);
  assert.ok(extra.today.paragraphs[0].includes(d.extras.today.pillar),`${c.name}: 일진 간지 문장`);

  // 5. 신년운세: 다음 해, 12달, 월별 문단 12개
  const ny=extra.newYear;
  assert.equal(ny.available,true,`${c.name}: 신년운세`);
  assert.equal(ny.year,d.extras.year+1,`${c.name}: 다음 해`);
  if(d.extras.year===2026) assert.equal(ny.year,2027,`${c.name}: 2027년`);
  assert.equal(ny.months.length,12,`${c.name}: 12달`);
  assert.equal((html.match(/class="extra-month"/g)||[]).length,12,`${c.name}: HTML 월별 문단 12개`);
  assert.equal(d.extras.nextYear.monthlyFlow.length,12,`${c.name}: 엔진 다음 해 월 간지 12개`);
  if(ny.year===2027) assert.equal(ny.pillar,'정미','2027년 간지는 정미');
  assert.ok(ny.paragraphs.length>=3,`${c.name}: 신년운세 문단`);
  assert.ok(ny.remaining.length>0,`${c.name}: 남은 기간 문장`);
  if(monthUnknown){
    assert.ok(ny.months.every(m=>m.level==='보류'),`${c.name}: 월주 미확정이면 월운은 보류`);
  }else{
    assert.ok(ny.months.every(m=>['좋은 달','보통','주의'].includes(m.level)),`${c.name}: 월운 등급`);
  }
  for(const m of ny.months) assert.ok(m.text.split('. ').length>=3,`${c.name}: ${m.month}월 문장 수`);

  // 6. 직업군 예시: 6~10개, 근거 한 줄
  assert.equal(extra.jobs.available,true,`${c.name}: 직업군`);
  assert.ok(extra.jobs.items.length>=6&&extra.jobs.items.length<=10,`${c.name}: 직업 예시 ${extra.jobs.items.length}개`);
  for(const it of extra.jobs.items) assert.ok(it.reason.startsWith('['),`${c.name}: 근거 표시 ${it.job}`);
  if(monthUnknown) assert.ok(extra.jobs.basis.includes('보류'),`${c.name}: 월지 보류 근거`);

  // 7. 용어 풀이
  assert.ok(extra.glossary.length>=REQUIRED_TERMS.length,`${c.name}: 용어 개수`);

  // 8. 같은 읽을거리 안의 중복 문장: 추가 풀이, 심화 풀이를 함께 본다
  const dupText=[X.summaryMarkdown(extra).join('\n'),X.bodyMarkdown(extra).join('\n'),DR.toMarkdown(DR.build(d)).join('\n')].join('\n');
  assert.deepEqual(repeatedSentences(dupText),[],`${c.name}: 같은 문장 반복`);

  // 9. 신년운세 월별 문단은 서로 같은 문장을 쓰지 않고, 좋은 달 문장은 비지 않는다
  const monthSet=new Set();
  for(const m of ny.months){
    assert.equal(/뚜렷한 방향 없이/.test(m.text),false,`${c.name}: 용신 갈림 문장이 월마다 반복`);
    for(const s of m.text.split(/(?<=[.])\s+/)) assert.equal(monthSet.has(s)&&s.length>=15,false,`${c.name}: 월별 같은 문장 "${s}"`), monthSet.add(s);
  }
  assert.ok(ny.goodLine&&ny.goodLine.length>0,`${c.name}: 좋은 달 문장`);
  assert.equal(ny.goodLine.includes('없음'),false,`${c.name}: 좋은 달 빈 표현`);
  if(!ny.goodMonths.length&&ny.monthsAvailable) assert.ok(ny.goodLine.includes('편안한'),`${c.name}: 좋은 달이 없을 때 대체 문장`);

  // 10. 오늘의 운세는 4~6문장, 생활 팁은 십성마다 다르다
  assert.ok(sentenceCount(extra.today.paragraphs)>=4&&sentenceCount(extra.today.paragraphs)<=6,`${c.name}: 오늘의 운세 ${sentenceCount(extra.today.paragraphs)}문장`);

  // 8b. Markdown: 용어 풀이와 인쇄 버튼은 제외, 나머지는 포함
  assert.ok(md.includes('## 한눈에 보는 나의 사주'),`${c.name}: MD 요약`);
  assert.ok(md.includes('## 오늘의 운세'),`${c.name}: MD 오늘의 운세`);
  assert.ok(md.includes('## 신년운세'),`${c.name}: MD 신년운세`);
  assert.ok(md.includes('## 어울리는 직업군 예시'),`${c.name}: MD 직업군`);
  assert.equal(md.includes('용어 풀이')||md.includes('인쇄'),false,`${c.name}: MD에 용어 풀이·인쇄 버튼 포함`);
  report.push(`PASS ${c.name}: 칩 ${extra.summary.chips.length}개, 12달, 직업 예시 ${extra.jobs.items.length}개`);
}

// 용어 목록: 십성 10개와 필수 용어 전부
const glossaryTerms=X.GLOSSARY.map(g=>g.term);
for(const t of REQUIRED_TERMS) assert.ok(glossaryTerms.includes(t),`용어 풀이에 ${t} 없음`);
for(const g of X.GLOSSARY) assert.ok(g.desc.length>0&&!/undefined|null/.test(g.desc),`${g.term} 설명`);

// 툴팁: 첫 등장 용어를 abbr로 감싸고, 설명은 이스케이프한다
const tip=X.term('나의 중심 · 일간','일간');
assert.equal(tip.startsWith('나의 중심 · <abbr title="'),true,'abbr 감싸기');
assert.equal(X.term('<b>신강·신약</b>','신강·신약').includes('&lt;b&gt;'),true,'텍스트 이스케이프');
assert.equal(X.term('아무 말','일간'),'아무 말','용어가 없으면 그대로');

// 연결: 목차, 본문 위치, 인쇄, 서버 화이트리스트, 스크립트 로드 순서
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
for(const id of NEW_SECTION_IDS) assert.ok(app.includes(`'${id}'`)||app.includes(`"${id}"`),`목차 항목 ${id}`);
assert.ok(app.indexOf("['reading-extra-summary'")<app.indexOf("['reading-fun-all'"),'요약이 목차 첫 항목');
assert.ok(app.indexOf('ExtraReading.summaryBlock(extra)')>app.indexOf('class="reading-intro"'),'요약 카드는 풀이 소개 다음에 놓는다');
assert.ok(app.includes('window.print()')&&app.includes('인쇄·PDF로 저장'),'인쇄 버튼');
assert.ok(css.includes('@media print'),'인쇄 CSS');
assert.ok(server.includes("'/extra-reading.js'"),'서버 화이트리스트');
assert.ok(index.indexOf('/extra-reading.js')>0&&index.indexOf('/extra-reading.js')<index.indexOf('/app.js'),'스크립트 로드 순서');

// 엔진·분석 확장: 다음 해 월운은 올해 월운과 같은 규칙으로 계산한다
const sample=run({year:1990,month:5,day:15,time:'10:30',sex:'male',correction:30});
assert.equal(sample.analysis.months.length,12,'올해 월운 12개');
assert.equal(sample.analysis.nextMonths.length,12,'다음 해 월운 12개');
assert.deepEqual(sample.analysis.nextMonths.map(m=>m.month),[1,2,3,4,5,6,7,8,9,10,11,12]);

// 궁합 풀이도 같은 중복 문장 기준을 따른다
const pairA=run({year:1990,month:5,day:15,time:'10:30',sex:'male',correction:30,calendar:'solar'});
const pairB=run({year:1992,month:8,day:3,time:'14:20',sex:'female',correction:30,calendar:'solar'});
const compatMd=CR.toMarkdown(CR.build(pairA,pairB,{labelA:'가',labelB:'나'})).join('\n');
assert.deepEqual(repeatedSentences(compatMd),[],'궁합 풀이 문장 반복');
report.push('PASS 궁합 풀이 중복 문장 없음');

report.push(`PASS 용어 풀이 ${X.GLOSSARY.length}개, 툴팁·연결·인쇄 검사`);
console.log(report.join('\n'));
console.log('추가 풀이 검증 통과');
