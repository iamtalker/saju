// 십성 계산식과 lunar-javascript 1.7.8의 대응표 비교.
// 이 검사는 구현 간 일치 확인이며 독립적인 고전 원문 검증은 아니다.
const {LunarUtil}=require('lunar-javascript');
const stems='甲乙丙丁戊己庚辛壬癸';
const names=[['比肩','劫财'],['食神','伤官'],['偏财','正财'],['七杀','正官'],['偏印','正印']];
let failures=0;
for(let day=0;day<10;day++){
 for(let other=0;other<10;other++){
  const relation=(Math.floor(other/2)-Math.floor(day/2)+5)%5;
  const polarity=day%2===other%2?0:1;
  const computed=names[relation][polarity];
  const reference=LunarUtil.SHI_SHEN[stems[day]+stems[other]];
  if(computed!==reference){ console.log(`${stems[day]} ${stems[other]}: ${computed} / ${reference}`); failures++; }
 }
}
console.log(`100개 조합, 불일치 ${failures}건`);
process.exitCode=failures?1:0;
