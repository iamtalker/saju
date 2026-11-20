// docs/사주_계산규칙과_검증계획.md의 시험 사례 중 이 프로젝트에서 직접 실행할 수 있는 항목을 확인한다.
// 1911년 사례는 지원 범위(1962~2050년) 밖이고, 절입 T±1초 검사는 입력이 분 단위라 여기서 수행하지 않는다.
const assert=require('node:assert/strict');
const {calculate}=require('../engine');

// 사례 2: 1981-03-20 01:59, 남성, 경도 보정 -30분 → 신유 신묘 정유 신축
const case2=calculate({year:1981,month:3,day:20,calendar:'solar',time:'01:59',unknown:false,correction:-30,dayBoundary:'00',sex:'male'});
assert.deepEqual(case2.pillars.map(p=>p.hangul),['신유','신묘','정유','신축']);

// 사례 5: 2000-05-10(서머타임 없음) 자시 경계. 23시 이후 일주 변경 옵션과 자시 옵션을 함께 확인한다.
const expected={
  '22:59':{'23':['경진','신사','무진','계해'],'00':['경진','신사','무진','계해']},
  '23:00':{'23':['경진','신사','기사','갑자'],'00':['경진','신사','무진','임자']},
  '23:59':{'23':['경진','신사','기사','갑자'],'00':['경진','신사','무진','임자']},
  '00:00':{'23':['경진','신사','무진','임자'],'00':['경진','신사','무진','임자']},
  '00:59':{'23':['경진','신사','무진','임자'],'00':['경진','신사','무진','임자']},
  '01:00':{'23':['경진','신사','무진','계축'],'00':['경진','신사','무진','계축']},
};
for(const [time,byBoundary] of Object.entries(expected)) for(const [boundary,want] of Object.entries(byBoundary)) {
  const r=calculate({year:2000,month:5,day:10,calendar:'solar',time,unknown:false,correction:0,dayBoundary:boundary});
  assert.deepEqual(r.pillars.map(p=>p.hangul),want,`자시 경계 ${time} 옵션 ${boundary}`);
}

// 사례 6: 시간 미상이면 시주를 표시하지 않는다.
const unknown=calculate({year:2000,month:5,day:10,calendar:'solar',time:'12:00',unknown:true,correction:0,dayBoundary:'00'});
assert.equal(unknown.pillars[3],null);

console.log('계산규칙 시험 사례 통과: 1981년 경도 보정 사례, 2000년 자시 경계 12건, 시간 미상 처리');
