// 심화 풀이(deep-reading.js) 검증: 명식별 출력 구조, 60갑자 표, 문장 형식, 미확정 기둥 미사용, 엔진 십성과의 대조.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');
const DR=require('../deep-reading');

const KEYS=['ilju','spouse','family','element','daeun','luck'];
const base={calendar:'solar',dayBoundary:'00',correction:0};
const run=(input)=>calculate({...base,...input});
const allText=(d)=>[...d.sections.flatMap(s=>[s.title,s.summary,...s.paragraphs,...s.evidence,...(s.table||[]).map(r=>r.label+' '+r.text)]),...d.notes].join('\n');
const html=(d)=>DR.toHtml(d);
const md=(d)=>DR.toMarkdown(d).join('\n');
function checkText(name,text){
  for(const bad of ['undefined','null','NaN','[object']) assert.ok(!text.includes(bad),`${name}: "${bad}" 포함`);
  // 조사가 괄호 앞 한글 글자에 붙은 경우만 오류로 본다. "천간 을(乙)"처럼 띄어 쓴 천간 이름은 허용한다.
  assert.equal(/[가-힣](은|는|이|가|을|를|와|과)\(/.test(text),false,`${name}: 조사가 괄호 앞 글자에 붙음`);
}

// 1. 60갑자 표
assert.equal(DR.ILJU_ORDER.length,60);
assert.equal(new Set(DR.ILJU_ORDER).size,60,'60갑자 키 중복');
for(const h of DR.ILJU_ORDER){
  const t=DR.ILJU[h];
  assert.ok(typeof t==='string'&&t.length>0,`${h} 일주 문장 없음`);
  const n=(t.match(/\./g)||[]).length;
  assert.ok(n>=3&&n<=4,`${h} 문장 수 ${n}`);
  checkText(`ILJU ${h}`,t);
}
assert.equal(new Set(DR.ILJU_ORDER.map(h=>DR.ILJU[h])).size,60,'일주 문장 중복');
assert.equal(Object.keys(DR.ILJU).length,60,'ILJU 키 개수');

// 2. 십성 계산: 엔진 십성과 대조(연·월·일·시 천간과 지장간 전체)
let compared=0;
for(let ms=Date.UTC(1900,0,1);ms<Date.UTC(2050,0,1);ms+=97*86400000){
  const dt=new Date(ms);
  let r;
  try{ r=run({year:dt.getUTCFullYear(),month:dt.getUTCMonth()+1,day:dt.getUTCDate(),time:'12:00',calendar:'solar',unknown:false,dayBoundary:'00'}); }catch(e){ continue; }
  const day=r.pillars[2]; if(!day) continue;
  r.pillars.forEach(p=>{ if(!p) return; assert.equal(DR.tenOf(day.stem,p.stem),p.stemTen,`${r.solar} ${p.hanja} 천간 십성`); compared++; p.hidden.forEach(h=>{ assert.equal(DR.tenOf(day.stem,h.hanja),h.ten,`${r.solar} ${h.hanja} 지장간 십성`); compared++; }); });
}
assert.ok(compared>1000,`십성 대조 표본 부족 ${compared}`);

// 3. 명식별 출력
const cases=[
  {name:'양력 1990-05-15 10:30 남성',input:{year:1990,month:5,day:15,time:'10:30',sex:'male'},full:true},
  {name:'양력 1962-03-01 09:20 여성',input:{year:1962,month:3,day:1,time:'09:20',sex:'female'},full:true},
  {name:'양력 1990-05-15 10:30 성별 미선택',input:{year:1990,month:5,day:15,time:'10:30'},full:true},
  {name:'음력 1970-01-07 15:40 남성(윤달 없음)',input:{year:1970,month:1,day:7,time:'15:40',calendar:'lunar',sex:'male'},full:true},
  {name:'시간 미상 2024-03-05 남성',input:{year:2024,month:3,day:5,unknown:true,sex:'male'},monthUnknown:true,hourUnknown:true},
  {name:'시간 미상 2025-02-03 여성(연주 미확정)',input:{year:2025,month:2,day:3,unknown:true,sex:'female'},yearUnknown:true,hourUnknown:true},
  {name:'시간 미상 1990-01-01 남성(일주 미확정)',input:{year:1990,month:1,day:1,unknown:true,correction:30,sex:'male'},dayUnknown:true}
];
const report=[];
for(const c of cases){
  const r=run({...c.input,calendar:c.input.calendar||'solar',time:c.input.time||'',unknown:Boolean(c.input.unknown),correction:c.input.correction??0,dayBoundary:c.input.dayBoundary||'00'});
  r.sex=c.input.sex||'';
  const d=DR.build(r);
  if(c.dayUnknown){
    assert.equal(d.available,false,`${c.name}: 일주 미확정인데 available`);
    assert.ok(d.reason.includes('일주'),`${c.name}: 사유`);
    assert.deepEqual(d.sections,[]);
    assert.ok(html(d).includes('일주가 확정되지 않아'));
    report.push(`PASS ${c.name}: 일주 미확정 → available false`);
    continue;
  }
  assert.equal(d.available,true,`${c.name}: available`);
  assert.deepEqual(d.sections.map(s=>s.key),KEYS,`${c.name}: 섹션 순서`);
  for(const s of d.sections){ assert.ok(s.title&&s.summary&&s.paragraphs.length>=1&&s.evidence.length>=1,`${c.name}: ${s.key} 구성`); }
  const ilju=d.sections[0];
  assert.equal(ilju.table.length,60,`${c.name}: 일주 표 60행`);
  assert.equal(ilju.table.filter(x=>x.mine).length,1,`${c.name}: 나의 일주 표시 1개`);
  assert.equal(ilju.table.find(x=>x.mine).hanja,r.pillars[2].hanja);
  const text=allText(d); checkText(c.name+' 텍스트',text); checkText(c.name+' HTML',html(d)); checkText(c.name+' MD',md(d));
  for(const k of KEYS) assert.ok(html(d).includes(`id="reading-deep-${k}"`),`${c.name}: id reading-deep-${k}`);
  // 미확정 기둥 처리
  const fam=d.sections[2].paragraphs.join(' ');
  if(c.monthUnknown){ assert.ok(fam.includes('월주가 확정되지 않아'),`${c.name}: 월주 보류`); assert.ok(d.sections[3].paragraphs.join(' ').includes('보류'),`${c.name}: 계절 보류`); assert.ok(!r.pillars[1]); }
  if(c.yearUnknown){ assert.ok(fam.includes('연주가 확정되지 않아'),`${c.name}: 연주 보류`); assert.ok(!r.pillars[0]); }
  if(c.hourUnknown){ assert.ok(fam.includes('시주가 확정되지 않아'),`${c.name}: 시주 보류`); assert.ok(!r.pillars[3]); assert.ok(!text.includes('시지 '),`${c.name}: 시지 위치 사용`); }
  // 대운 8개(계산 가능할 때)
  const dy=d.sections[4];
  if(r.daeun&&r.daeun.available){ assert.equal(dy.paragraphs.filter(p=>/^\d대운은 만/.test(p)).length,8,`${c.name}: 대운 8개`); assert.ok(dy.paragraphs.filter(p=>p.includes('지금 지나는 대운입니다')).length<=1,`${c.name}: 현재 대운 표시 1회 이하`); }
  else assert.ok(dy.paragraphs.join(' ').includes('보류')||dy.paragraphs.join(' ').includes('성별')||dy.paragraphs.join(' ').includes('출생시각'),`${c.name}: 대운 보류 사유`);
  // 배우자 별: 성별에 맞는 별만, 미선택이면 두 기준을 함께
  const spouseText=d.sections[1].paragraphs.join(' ');
  if(c.input.sex==='male') assert.ok(spouseText.includes('남성 명식이므로 재성')&&!spouseText.includes('관성 (편관·정관)'),`${c.name}: 남성 배우자 별`);
  else if(c.input.sex==='female') assert.ok(spouseText.includes('여성 명식이므로 관성')&&!spouseText.includes('재성 (편재·정재)'),`${c.name}: 여성 배우자 별`);
  else assert.ok(spouseText.includes('두 기준으로 함께')&&spouseText.includes('재성 (편재·정재)')&&spouseText.includes('관성 (편관·정관)'),`${c.name}: 성별 미선택 배우자 별`);
  // 대운: 보류 판정 문장은 반복하지 않는다(안내는 한 번)
  const daeunParas=d.sections[4].paragraphs;
  assert.ok(daeunParas.filter(p=>p.startsWith('용신이 정해지지')).length<=1,`${c.name}: 대운 안내 반복`);
  if(!r.analysis||!r.analysis.yong) assert.equal(daeunParas.filter(p=>p.includes('하나로 정하지 않은 상태')).length,0,`${c.name}: 보류 판정 문장 반복`);
  // 일주론: 표는 접힘 HTML에만, Markdown에는 표를 넣지 않는다
  assert.ok(!md(d).includes('| 일주 |'),`${c.name}: Markdown에 60행 표 포함`);
  assert.ok(html(d).includes('<details class="deep-ilju-all">'),`${c.name}: 접힘 일주 표 없음`);
  // 마크다운 헤더
  assert.ok(md(d).startsWith('## 심화 풀이'),`${c.name}: md 헤더`);
  report.push(`PASS ${c.name}: 섹션 6, 일주표 60행, 대운 ${r.daeun&&r.daeun.available?8:'보류'}`);
}

// 4. 판정 기반 문장이 analysis와 맞는지: 용신이 있으면 개운 문장에 용신 오행 포함
const sample=run({year:1990,month:5,day:15,time:'10:30',sex:'male'});
assert.equal(sample.analysis.yong,null);
assert.ok(DR.build(sample).sections[5].summary.includes('용신 보류'));
report.push('PASS 갈림 명식 1990-05-15: 용신 미정 시 개운을 단정하지 않음');

console.log(report.join('\n'));
console.log(`PASS 십성 대조 ${compared}건, 60갑자 ${DR.ILJU_ORDER.length}개 문장 검사`);
console.log('심화풀이 검증 통과');
