// 출처: https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2023
// 실행: node 검증/한국음력_후보_검증.js (kor-lunar 1.7.0)
const { toLunar, toSolar } = require('kor-lunar');
const cases = [
  [1,22,1,1,false,'庚辰'], [2,20,2,1,false,'己酉'], [3,22,2,1,true,'己卯'],
  [4,20,3,1,false,'戊申'], [5,20,4,1,false,'戊寅'], [6,18,5,1,false,'丁未'],
  [7,18,6,1,false,'丁丑'], [8,16,7,1,false,'丙午'], [9,15,8,1,false,'丙子'],
  [10,15,9,1,false,'丙午'], [11,13,10,1,false,'乙亥'], [12,13,11,1,false,'乙巳']
];
let failed = 0;
for (const [m,d,lm,ld,leap,ganji] of cases) {
  const l=toLunar(2023,m,d);
  const s=toSolar(2023,lm,ld,leap);
  const ok=l.year===2023 && l.month===lm && l.day===ld && l.isLeapMonth===leap &&
    l.iljinHanja===ganji && s.year===2023 && s.month===m && s.day===d;
  console.log(`2023-${m}-${d}: ${ok ? '일치' : '불일치'}`);
  if (!ok) failed++;
}
console.log(`${cases.length-failed}/${cases.length} 일치`);
process.exitCode=failed ? 1 : 0;
