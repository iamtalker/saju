// 한국천문연구원 2025년 달력자료(공식 발표 월력요항과 구분)
// https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2025
const {toLunar,toSolar,LunarCalendar}=require('kor-lunar');
const rows=[
 [2025,1,29,1,false,'戊戌'],[2025,2,28,2,false,'戊辰'],[2025,3,29,3,false,'丁酉'],
 [2025,4,28,4,false,'丁卯'],[2025,5,27,5,false,'丙申'],[2025,6,25,6,false,'乙丑'],
 [2025,7,25,6,true,'乙未'],[2025,8,23,7,false,'甲子'],[2025,9,22,8,false,'甲午'],
 [2025,10,21,9,false,'癸亥'],[2025,11,20,10,false,'癸巳'],[2025,12,20,11,false,'癸亥'],
 [2026,1,19,12,false,'癸巳']
];
let fail=0;
for(const [y,m,d,lm,leap,ganji] of rows){
 const l=toLunar(y,m,d), s=toSolar(2025,lm,1,leap);
 const ok=l.year===2025&&l.month===lm&&l.day===1&&l.isLeapMonth===leap&&l.iljinHanja===ganji&&s.year===y&&s.month===m&&s.day===d;
 console.log(`${y}-${m}-${d}: ${ok?'일치':'불일치'}`); if(!ok)fail++;
}
const invalid=[!LunarCalendar.isValid(2025,1,1,true),!LunarCalendar.isValid(2025,6,30,true)];
console.log(`없는 윤1월과 윤6월 30일: ${invalid.every(Boolean)?'거부':'확인 필요'}`);
if(!invalid.every(Boolean))fail++;
console.log(`${rows.length}개 월초 및 2개 유효성 사례, 오류 ${fail}`);
process.exitCode=fail?1:0;
