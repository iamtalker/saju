// 대운 기산의 절입 경계(±1분)와 서머타임 경계 입력을 점검한다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');

// 2000년 입춘은 베이징 시각 20:40:24, 한국 표준시 21:40:24다. 분 단위 입력이므로 21:39(직전)와 21:41(직후)을 비교한다.
// 여성 기준은 입춘 전 연주(己卯, 음간)에서 순행, 입춘 후 연주(庚辰, 양간)에서 역행이 되므로 방향이 바뀐다.
const before=calculate({year:2000,month:2,day:4,calendar:'solar',time:'21:39',unknown:false,correction:0,dayBoundary:'00',sex:'female'});
const after=calculate({year:2000,month:2,day:4,calendar:'solar',time:'21:41',unknown:false,correction:0,dayBoundary:'00',sex:'female'});
assert.equal(before.pillars[0].hangul,'기묘');
assert.equal(after.pillars[0].hangul,'경진');
assert.equal(before.daeun.direction,'순행');
assert.equal(after.daeun.direction,'역행');
// 직전 절입과 직후 절입까지의 거리는 모두 1분 안쪽이므로 대운수는 최소값 1년이어야 한다.
assert.equal(before.daeun.startAge,'1년');
assert.equal(after.daeun.startAge,'1년');
assert.equal(before.daeun.comparison.rounded,'1년');
assert.equal(after.daeun.comparison.rounded,'1년');

// 같은 절입 전후에서도 대운 기준 비교 값의 개월 잔여가 0 이상인지 확인한다.
assert.ok(/^\d+년( \d+개월)?$/.test(before.daeun.comparison.monthCarry));

// 서머타임 전환으로 존재하지 않는 시각은 거부해야 한다(1987년 5월 10일 02:30, 1988년 5월 8일 02:30).
assert.throws(()=>calculate({year:1987,month:5,day:10,calendar:'solar',time:'02:30',unknown:false,correction:0,dayBoundary:'00',sex:'male'}),/존재하지 않는/);
assert.throws(()=>calculate({year:1988,month:5,day:8,calendar:'solar',time:'02:30',unknown:false,correction:0,dayBoundary:'00',sex:'male'}),/존재하지 않는/);

// 서머타임 기간 안의 정상 시각은 계산되고 서머타임 보정이 표시되어야 한다.
const dst=calculate({year:1987,month:5,day:10,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00',sex:'male'});
assert.equal(dst.dst,true);
assert.equal(dst.daeun.available,true);

console.log('대운 절입 ±1분 경계와 서머타임 입력 검증 통과: 방향 전환(순행→역행), 최소 1년, 존재하지 않는 시각 거부, 서머타임 구간 계산');
