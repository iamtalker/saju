// 대운 순역행, 60갑자 순환, 기산 시점 범위를 여러 출생 조합으로 회귀 검증한다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');

const stems='甲乙丙丁戊己庚辛壬癸';
const branches='子丑寅卯辰巳午未申酉戌亥';
const sixty=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]);

// 양년 남성·음년 여성은 순행, 음년 남성·양년 여성은 역행이어야 한다.
const cases=[];
for(let year=1962;year<=2050;year+=7) for(const month of [1,4,7,10]) for(const sex of ['male','female']) {
  cases.push({year,month,day:15,calendar:'solar',time:'10:30',unknown:false,correction:0,dayBoundary:'00',sex});
}

let checked=0, forwardCount=0, backwardCount=0;
for(const input of cases) {
  const r=calculate(input);
  const d=r.daeun;
  if(!d.available) {
    // 입춘·절입 경계 등으로 계산하지 않는 경우는 사유가 있어야 한다.
    assert.ok(d.reason, `사유 없음: ${JSON.stringify(input)}`);
    continue;
  }
  checked++;
  const yearYang=sixty.findIndex(x=>x[0]===d.yearStem)%2===0;
  const expectForward=yearYang===(input.sex==='male');
  assert.equal(d.direction, expectForward?'순행':'역행', `방향 불일치: ${input.year}-${input.month} ${input.sex}`);
  expectForward?forwardCount++:backwardCount++;

  // 8개 대운은 월주에서 연속된 60갑자여야 한다.
  assert.equal(d.cycles.length,8);
  const monthPillar=r.pillars[1].hanja;
  const monthIndex=sixty.indexOf(monthPillar);
  const step=expectForward?1:-1;
  d.cycles.forEach((c,i)=>{
    assert.equal(c.pillar, sixty[(monthIndex+step*(i+1)+600)%60], `대운 순환 불일치 ${input.year} 항목 ${i}`);
    assert.equal(c.fromAgeMonths, d.startAgeMonths+i*120);
    assert.equal(c.toAgeMonths, c.fromAgeMonths+120);
  });

  // 시작 시점은 출생 시각과 다음(또는 이전) 절입 사이 3일=1년 환산 값이어야 한다. 시작 개월은 0 이상의 정수다.
  assert.ok(Number.isInteger(d.startAgeMonths) && d.startAgeMonths>=0);
  assert.match(d.startDate, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  // 기산 기준 절 이름은 화면에 한국어로 표시해야 한다.
  assert.match(d.jie, /^(입춘|경칩|청명|입하|망종|소서|입추|백로|한로|입동|대설|소한)$/, `절 이름: ${d.jie}`);
  // 대운수는 정수 년(12개월 단위)이고 최소 1년이어야 한다. 시작일은 그 나이와 일치해야 한다(분 단위 오차 허용).
  assert.equal(d.startAgeMonths%12, 0, `대운수가 정수 년이 아님: ${input.year}-${input.month}-${input.day}`);
  assert.ok(d.startAgeMonths>=12, `대운수 최소 1년 위반: ${input.year}-${input.month}-${input.day}`);
  const birthMs=Date.UTC(input.year,input.month-1,input.day,10,30)-9*3600000; // 입력 10:30 한국 표준시
  const startMs=Date.parse(d.startDate.replace(' ','T')+':00+09:00');
  const yearMs=365.2425*86400000;
  assert.ok(Math.abs((startMs-birthMs)/yearMs*12-d.startAgeMonths)<=0.05, `시작일과 시작 나이 불일치: ${input.year}-${input.month}-${input.day}`);
}
assert.ok(checked>100, `검증 표본 부족: ${checked}`);
assert.ok(forwardCount>0 && backwardCount>0, '순행과 역행이 모두 검증되어야 합니다.');

// 시간 미상이거나 성별이 없으면 대운을 계산하지 않는다.
const unknown=calculate({year:2000,month:2,day:10,calendar:'solar',time:'12:00',unknown:true,correction:0,dayBoundary:'23',sex:'male'});
assert.equal(unknown.daeun.available,false);
const noSex=calculate({year:2000,month:2,day:10,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00'});
assert.equal(noSex.daeun.available,false);

// 잘못된 성별 값은 계산하지 않고 안내한다.
const badSex=calculate({year:2000,month:2,day:10,calendar:'solar',time:'12:00',unknown:false,correction:0,dayBoundary:'00',sex:'other'});
assert.equal(badSex.daeun.available,false);

console.log(`대운 회귀 검증 통과: ${checked}건 (순행 ${forwardCount}, 역행 ${backwardCount}), 60갑자 순환·방향·미상 처리 확인`);
