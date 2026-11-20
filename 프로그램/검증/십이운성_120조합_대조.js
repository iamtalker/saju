// 화토동궁·양간 순행·음간 역행 한 방식의 120조합 비교.
// 출처: https://github.com/nanamix/korean-fortune-system/blob/master/docs/reference/03-saju-calculation-methodology.md
// 비교 대상: lunar-javascript 1.7.8. 문헌 독립 검증이 아니다.
const {LunarUtil}=require('lunar-javascript');
const stems='甲乙丙丁戊己庚辛壬癸';
const branches='子丑寅卯辰巳午未申酉戌亥';
const start='亥午寅酉寅酉巳子申卯';
let failures=0;
for(let i=0;i<10;i++){
 for(let b=0;b<12;b++){
  const origin=branches.indexOf(start[i]);
  const computed=((i%2===0?b-origin:origin-b)+12)%12;
  const fromLibrary=(LunarUtil.CHANG_SHENG_OFFSET[stems[i]]+(i%2===0?b:-b)+12)%12;
  if(computed!==fromLibrary){console.log(`${stems[i]} ${branches[b]}: ${computed} / ${fromLibrary}`);failures++;}
 }
}
console.log(`120개 조합, 불일치 ${failures}건`);
process.exitCode=failures?1:0;
