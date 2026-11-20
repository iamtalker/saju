// 2023년 KASI 달력자료와 lunar-javascript 1.7.8 비교.
// 실행: node 검증/2023년_역법_대조.js
// https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2023
// 절기 라이브러리 출력은 중국 표준시(UTC+8)로 해석해 한국표준시로 환산한다.
// 이 가정은 일반 연도의 전체 범위나 역사적 시간대를 검증한 것은 아니다.
const { Solar } = require('lunar-javascript');

const lunarCases = [
  [1,22,1,1,'庚辰'], [2,20,2,1,'己酉'], [3,22,-2,1,'己卯'],
  [4,20,3,1,'戊申'], [5,20,4,1,'戊寅'], [6,18,5,1,'丁未'],
  [7,18,6,1,'丁丑'], [8,16,7,1,'丙午'], [9,15,8,1,'丙子'],
  [10,15,9,1,'丙午'], [11,13,10,1,'乙亥'], [12,13,11,1,'乙巳'],
];
const terms = [
  ['小寒',1,6,0,5], ['立春',2,4,11,43], ['惊蛰',3,6,5,36],
  ['清明',4,5,10,13], ['立夏',5,6,3,19], ['芒种',6,6,7,18],
  ['小暑',7,7,17,31], ['立秋',8,8,3,23], ['白露',9,8,6,27],
  ['寒露',10,8,22,16], ['立冬',11,8,1,36], ['大雪',12,7,18,33],
];
// 알려진 차이: 중국력 계열 라이브러리가 2023년 5월 20일을 음력 4/2로 내고, KASI 표는 4/1이다.
// 이 항목만 예외 목록으로 허용한다. 다른 불일치는 실패로 센다.
const knownDifferences = [{ month: 5, day: 20, library: '4/2', reason: '2023-05-20 음력 날짜 차이, 알려진 차이' }];

let failures = 0;
let knownCount = 0;
for (const [month, day, lm, ld, dayGanZhi] of lunarCases) {
  const l = Solar.fromYmd(2023, month, day).getLunar();
  const ok = l.getYear() === 2023 && l.getMonth() === lm && l.getDay() === ld && l.getDayInGanZhi() === dayGanZhi;
  const known = knownDifferences.find(k => k.month === month && k.day === day);
  if (!ok && known && (l.getMonth() + '/' + l.getDay()) === known.library) {
    console.log('음력 ' + month + '/' + day + ': 알려진 차이 (' + l.getMonth() + '/' + l.getDay() + ' ' + l.getDayInGanZhi() + ', ' + known.reason + ')');
    knownCount++;
    continue;
  }
  console.log('음력 ' + month + '/' + day + ': ' + (ok ? '일치' : '불일치') + ' (' + l.getMonth() + '/' + l.getDay() + ' ' + l.getDayInGanZhi() + ')');
  if (!ok) failures++;
}
for (const [name, month, day, hour, minute] of terms) {
  const x = Solar.fromYmd(2023, month, day).getLunar().getJieQiTable()[name];
  if (!x) { console.log(`${name}: 자료 없음`); failures++; continue; }
  const observed = Date.UTC(x.getYear(), x.getMonth()-1, x.getDay(), x.getHour()+1, x.getMinute(), x.getSecond());
  const expected = Date.UTC(2023, month-1, day, hour, minute);
  const delta = (observed - expected) / 1000;
  // KASI 표는 분 단위 표시다. 표시 분과 계산값의 차이를 보여 줄 뿐,
  // 반올림 방식이나 실제 초 단위 경계를 확정하지 않는다.
  const ok = Math.abs(delta) < 60;
  console.log(`절입 ${name}: ${ok ? '60초 이내' : '차이 확인 필요'} (${delta}초)`);
  if (!ok) failures++;
}
console.log(`
새 차이: ${failures}건, 알려진 차이(예외 목록): ${knownCount}건`);
process.exitCode = failures ? 1 : 0;
