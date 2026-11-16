// 풀이 확장 기능의 관계 후보, 십이운성, 지장간 표시를 점검한다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');
const {create}=require('../reading');

const sample=calculate({year:2000,month:2,day:10,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00'});
const full=sample.relations.find(r=>r.name==='지지 삼합'&&r.complete);
const partial=sample.relations.find(r=>r.name==='지지 방합'&&!r.complete);
assert.equal(full.characters,'寅午戌');
assert.equal(full.element,'화');
assert.deepEqual(partial.missing,['卯']);

const reading=create(sample);
assert.equal(reading.twelve.length,4);
assert.equal(reading.hiddenThemes.reduce((n,g)=>n+g.positions.reduce((m,p)=>m+p.characters.length,0),0),sample.pillars.reduce((n,p)=>n+p.hidden.length,0));
assert.equal(reading.season.branch,sample.pillars[1].hangul[1]);
assert.equal(reading.pillarGuides.length,4);

const unknown=calculate({year:2000,month:2,day:10,calendar:'solar',time:'12:00',unknown:true,correction:0,dayBoundary:'23'});
const partialReading=create(unknown);
assert.equal(partialReading.twelve,null);
assert.equal(partialReading.partial,true);
assert.equal(partialReading.tenThemes.length,0);

console.log('풀이 확장, 관계 완성·부분 조합, 지장간 및 시간 미상 처리 통과');
