// 풀이 판정 회귀: 관계 식별(귀문·육합·대운 관계), 공망 표시, 월운 충 감점을 1982-01-05 23:00 남성 명식으로 확인한다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');
const A=require('../analysis');
const r=calculate({year:1982,month:1,day:5,calendar:'solar',time:'23:00',unknown:false,correction:30,dayBoundary:'23',sex:'male'});
const a=r.analysis;
const kindsOf=rels=>rels.map(x=>x.pos+':'+x.kind);

// 귀문 표: 戌亥는 귀문이 아니다.
assert.deepEqual(A.pairKind('戌','亥'),[]);
assert.ok(A.pairKind('辰','亥').includes('귀문'));

// 세운 관계 (육합이 살아 있는지, 방합 완성이 보이는지)
const y2033=a.years.find(y=>y.year===2033), y2034=a.years.find(y=>y.year===2034), y2036=a.years.find(y=>y.year===2036);
assert.ok(kindsOf(y2033.rels).includes('월지:육합'));
assert.ok(y2033.rels.some(x=>x.kind==='수 방합 완성'));
assert.ok(kindsOf(y2034.rels).includes('시지:육합') && kindsOf(y2034.rels).includes('시지:파') && kindsOf(y2034.rels).includes('연지:원진'));
assert.ok(kindsOf(y2036.rels).includes('연지:육합') && kindsOf(y2036.rels).includes('시지:원진') && kindsOf(y2036.rels).includes('시지:귀문'));

// 대운 관계 (세운과 같은 기준)
const cy=pillar=>a.cycles.find(c=>c.pillar===pillar);
assert.ok(kindsOf(cy('己亥').rels).includes('시지:자형'));
assert.ok(kindsOf(cy('壬辰').rels).includes('연지:육합'));
assert.ok(kindsOf(cy('癸巳').rels).includes('시지:충'));

// 공망: 午·未, 용신·희신 표시, 해당 줄 표시
assert.deepEqual(a.natal.gongmangBranches.map(g=>g.b+g.judge),['午용신','未희신']);
assert.equal(y2033.gm,false);
assert.equal(a.years.find(y=>y.year===2026).gm,true);
assert.equal(a.years.find(y=>y.year===2027).gm,true);
assert.equal(cy('乙未').gm,true);
assert.equal(cy('甲午').gm,true);
assert.equal(a.months.find(m=>m.month===6).gm,true);
assert.equal(a.months.find(m=>m.month===7).gm,true);

// 월운 충: 3월 卯(연지 충), 5월 巳(시지 충), 6월 午(월지·일지 충)
assert.equal(a.months.find(m=>m.month===3).chung,1);
assert.equal(a.months.find(m=>m.month===5).chung,1);
assert.equal(a.months.find(m=>m.month===6).chung,2);
assert.ok(a.months.find(m=>m.month===3).score<0);

// 월운 등급과 좋은 달
assert.deepEqual(a.months.filter(m=>m.good).map(m=>m.month),[8,9,10]);
assert.equal(a.months.find(m=>m.month===7).level,'보통');

// 신약 명식의 관성은 한신이다(용신인 인성을 낳으므로 기신으로 두지 않는다). 1975-01-28 12:00 남성 갑인 정축 갑술 경오: 일간 甲, 관성 금.
const O=calculate({year:1975,month:1,day:28,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00',sex:'male'});
assert.equal(O.analysis.strength.verdict,'신약');
assert.equal(O.analysis.bu.한,'금');

console.log('풀이 판정 회귀 통과: 귀문 표, 세운·대운 관계(육합·방합·자형·원진·귀문), 공망 표시, 월운 충 감점, 좋은 달 8·9·10');
