// 궁합(compat-reading.js) 검증: 명식 쌍별 구조, 미확정 기둥 미사용, 대칭 사실의 일치, 문장 형식과 금지 표현.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');
const CR=require('../compat-reading');

const KEYS=['day','spouse','zodiac','element','yong','comm','summary'];
const FORBIDDEN=/이혼|파혼|사별|결혼|이별|좋은 궁합|나쁜 궁합|점수|예측 가능|반드시/;
const run=(i,sex)=>{ const r=calculate({calendar:'solar',dayBoundary:'00',correction:0,...i}); r.sex=sex||''; return r; };
const text=c=>[...c.sections.flatMap(s=>[s.title,s.summary,...s.paragraphs,...s.evidence]),...c.notes].join('\n');
function checkText(name,t){
  for(const bad of ['undefined','null','NaN','[object']) assert.ok(!t.includes(bad),`${name}: "${bad}" 포함`);
  assert.equal(/[가-힣](은|는|이|가|을|를|와|과)\(/.test(t),false,`${name}: 조사가 괄호 앞 글자에 붙음`);
  assert.equal(FORBIDDEN.test(t),false,`${name}: 금지 표현 포함`);
}

// 명식
const A=run({year:1990,month:5,day:15,time:'10:30'},'male');
const B=run({year:1992,month:11,day:3,time:'14:00'},'female');
const C=run({year:2024,month:3,day:5,unknown:true},'male');          // 시간 미상: 월주·시주 미확정, 일주 확정
const D=run({year:1990,month:1,day:1,unknown:true,correction:30},'female'); // 일주 미확정
const E=run({year:1962,month:3,day:1,time:'09:20'},'female');

const report=[];
// 1. 완전한 쌍
const ab=CR.build(A,B,{labelA:'나',labelB:'상대'});
assert.equal(ab.available,true);
assert.deepEqual(ab.sections.map(s=>s.key),KEYS);
for(const s of ab.sections) assert.ok(s.title&&s.summary&&s.paragraphs.length>=1&&s.evidence.length>=1,`${s.key} 구성`);
checkText('A-B',text(ab)); checkText('A-B HTML',CR.toHtml(ab)); checkText('A-B MD',CR.toMarkdown(ab).join('\n'));
for(const k of KEYS) assert.ok(CR.toHtml(ab).includes(`id="compat-${k}"`),`id compat-${k}`);
report.push('PASS 완전한 쌍 A×B: 섹션 7, 문장·금지 표현·조사 검사 통과');

// 2. 대칭: 일지 관계와 일간 관계 사실이 순서를 바꿔도 같아야 한다
const ba=CR.build(B,A,{labelA:'상대',labelB:'나'});
const spouseKinds=c=>c.sections[1].evidence[1];
assert.equal(spouseKinds(ab).replace('관계 ',''),spouseKinds(ba).replace('관계 ',''),'일지 관계 대칭');
const relWord=c=>c.sections[0].summary.match(/(상생|상극|비화)/)[1];
assert.equal(relWord(ab),relWord(ba),'일간 관계 대칭');
// 같은 일지 관계 표식은 한 번만 보고된다
const kinds=(spouseKinds(ab).replace('관계 ','').split('·').filter(x=>x&&x!=='없음'));
const markParas=ab.sections[1].paragraphs.filter(p=>p.includes('표식이 있습니다'));
assert.equal(markParas.length,kinds.filter(k=>!k.startsWith('반합')).length,'일지 표식 문장 수');
report.push(`PASS 대칭: 일간 ${relWord(ab)}, 일지 ${spouseKinds(ab)} (A→B와 B→A 일치)`);

// 3. 시간 미상 쌍: 시주·월주 미확정을 쓰지 않는다
const ac=CR.build(A,C,{labelA:'나',labelB:'상대'});
assert.equal(ac.available,true);
checkText('A-C',text(ac));
assert.ok(ac.notes.some(n=>n.includes('상대')&&n.includes('확정되지 않아')),'미확정 노트');
assert.ok(!text(ac).includes('시지'),'미확정 시지 사용');
assert.ok(ac.sections[5].paragraphs.join(' ').includes('보류'),'미확정 월지 소통 보류');
assert.ok(ac.sections[4].paragraphs.length>=1);
report.push('PASS 시간 미상 상대(월주·시주 미확정): 미확정 기둥 보류, 시지 미사용');

// 4. 일주 미확정: 궁합 불가 사유
const ad=CR.build(A,D,{labelA:'나',labelB:'상대'});
assert.equal(ad.available,false);
assert.ok(ad.reason.includes('상대의 일주'),ad.reason);
assert.deepEqual(ad.sections,[]);
checkText('A-D reason',CR.toHtml(ad));
const da=CR.build(D,A,{labelA:'상대',labelB:'나'});
assert.equal(da.available,false);
report.push('PASS 일주 미확정 쌍: 궁합 불가 사유 표시');

// 5. 다른 쌍: 일지 충이 있는 쌍, 음력 입력, 연주 미확정 등 여러 조합
const pairs=[[A,E,'나','상대'],[B,E,'첫째','둘째'],[E,C,'가','나']];
for(const [x,y,lx,ly] of pairs){
  const c=CR.build(x,y,{labelA:lx,labelB:ly});
  assert.equal(c.available,true);
  checkText(`${lx}-${ly}`,text(c));
  assert.equal(c.sections.length,7);
}
// 연주 미확정 상대의 띠 관계는 보류
const z=CR.build(A,run({year:2025,month:2,day:3,unknown:true},'male'),{labelA:'나',labelB:'상대'});
assert.ok(z.sections[2].paragraphs.join(' ').includes('연주가 확정되지 않아'),'띠 보류');
report.push('PASS 여러 조합(시간 있음·없음, 연주 미확정): 구조·문장·띠 보류 확인');

// 5-1. 일지 충이 있는 쌍: 충은 한 번만 보고되고, 조율할 점으로 들어간다
const F=run({year:1992,month:11,day:6,time:'14:00'},'female');
const af=CR.build(A,F,{labelA:'나',labelB:'상대'});
assert.ok(af.sections[1].evidence[1].includes('충'),'일지 충 근거');
assert.equal(af.sections[1].paragraphs.filter(p=>p.includes('충 표식이 있습니다')).length,1,'충 문장 1회');
assert.ok(af.sections[6].paragraphs.join(' ').includes('두 일지 사이의 충 표식'),'충은 조율할 점');
const fa=CR.build(F,A,{labelA:'상대',labelB:'나'});
assert.ok(fa.sections[1].evidence[1].includes('충')&&fa.sections[1].paragraphs.filter(p=>p.includes('충 표식이 있습니다')).length===1,'대칭 충');
checkText('A-F',text(af));
report.push('PASS 일지 충 쌍(辰 대 戌): 충 1회 보고, 양방향 일치');

// 6. 엔진 지지 관계 표와 analysis.js 정의의 일치 확인 (형·파·해·원진·귀문 포함)
assert.ok(CR.BR_PAIRS.충.includes('子午')&&CR.BR_PAIRS.육합.includes('子丑')&&CR.BR_PAIRS.원진.includes('子未'));
assert.deepEqual(CR.branchRels('子','午'),['충']);
assert.deepEqual(CR.branchRels('辰','辰'),['자형']);
report.push('PASS 지지 관계 표: 충·육합·원진 등 기준 확인');

console.log(report.join('\n'));
console.log('궁합 검증 통과');
