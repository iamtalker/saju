// 출처: 한국천문연구원 2024년 달력자료(공식 발표 월력요항과 구분)
// https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2024
const {toLunar,toSolar,LunarCalendar}=require('kor-lunar');
const rows=[
 [2,10,1,29,'甲辰'],[3,10,2,30,'癸酉'],[4,9,3,29,'癸卯'],
 [5,8,4,29,'壬申'],[6,6,5,30,'辛丑'],[7,6,6,29,'辛未'],
 [8,4,7,30,'庚子'],[9,3,8,30,'庚午'],[10,3,9,29,'庚子'],
 [11,1,10,30,'己巳'],[12,1,11,30,'己亥'],[12,31,12,29,'己巳']
];
let errors=0;
for(const [m,d,lm,days,ganji] of rows){
 const l=toLunar(2024,m,d),s=toSolar(2024,lm,1,false);
 const ok=l.year===2024&&l.month===lm&&l.day===1&&!l.isLeapMonth&&l.iljinHanja===ganji&&s.year===2024&&s.month===m&&s.day===d&&LunarCalendar.of(2024,lm,1).daysInMonth===days;
 if(!ok){ console.log(`불일치 ${m}/${d}`); errors++; }
}
let count=0;
for(let t=Date.UTC(2023,0,1);t<Date.UTC(2026,0,1);t+=86400000){
 const d=new Date(t),y=d.getUTCFullYear(),m=d.getUTCMonth()+1,day=d.getUTCDate();
 const l=toLunar(y,m,day),s=toSolar(l.year,l.month,l.day,l.isLeapMonth);
 if(s.year!==y||s.month!==m||s.day!==day){console.log(`왕복 불일치 ${y}-${m}-${day}`);errors++;}
 count++;
}
console.log(`월초·월길이 ${rows.length}건, 2023–2025 왕복 ${count}일, 불일치 ${errors}건`);
process.exitCode=errors?1:0;
