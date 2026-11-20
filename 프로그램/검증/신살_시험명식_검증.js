// 새 신살(괴강, 양인, 천을귀인, 문창귀인, 백호)과 12신살이 실제로 걸리는 명식으로 판정을 대조한다.
// 기대값은 각 명식을 전통 표로 손으로 대조해 정했다. 시주는 12:00, 보정 0분, 날짜 전환 자정 기준이다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');

function run(y,m,d){ return calculate({year:y,month:m,day:d,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00',sex:'male'}); }
const sinsalOf=(r,name)=>{ const s=r.analysis.natal.sinsal.find(x=>x.name===name); return s?s.positions:null; };

// 명식 A: 1962-03-01 임인 임인 무술 무오. 일주 무술은 괴강, 일간 戊 기준 양인은 午(시지).
const A=run(1962,3,1);
assert.deepEqual(A.pillars.map(p=>p.hanja),['壬寅','壬寅','戊戌','戊午']);
assert.equal(sinsalOf(A,'괴강살'),'일주');
assert.equal(sinsalOf(A,'양인살'),'시지');
// 12신살(년지 寅, 寅午戌 삼합 → 겁살은 亥): 寅 지살, 寅 지살, 戌 화개살, 午 장성살
assert.deepEqual(A.analysis.natal.twelve.map(t=>t.name),['지살','지살','화개살','장성살']);

// 명식 B: 1970-01-01 기유 병자 신사 갑오. 일간 辛 기준 천을귀인은 午(시지), 문창귀인은 子(월지).
const B=run(1970,1,1);
assert.deepEqual(B.pillars.map(p=>p.hanja),['己酉','丙子','辛巳','甲午']);
assert.equal(sinsalOf(B,'천을귀인'),'시지');
assert.equal(sinsalOf(B,'문창귀인'),'월지');

// 명식 C: 1970-01-07 기유 정축 정해 병오. 월주 丁丑은 백호살.
const C=run(1970,1,7);
assert.equal(sinsalOf(C,'백호살'),'월주');

// 명식 D: 1962-07-11 임인 정미 경술 임오. 일주 경술은 괴강, 일간 庚 기준 천을귀인은 丑·未(미는 월지).
const D=run(1962,7,11);
assert.equal(sinsalOf(D,'괴강살'),'일주');
assert.equal(sinsalOf(D,'천을귀인'),'월지');

// 공망은 일주 기준으로 계산되고 자리를 붙인다.
assert.ok(Array.isArray(A.analysis.natal.gongmang));

console.log('신살 시험 명식 검증 통과: 괴강(일주), 양인, 천을귀인, 문창귀인, 백호, 12신살(년지 기준)');
