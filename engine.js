const { Solar } = require('lunar-javascript');
const { toLunar, toSolar, LunarCalendar } = require('kor-lunar');

const stems = '甲乙丙丁戊己庚辛壬癸';
const branches = '子丑寅卯辰巳午未申酉戌亥';
const koreanStem = '갑을병정무기경신임계';
const koreanBranch = '자축인묘진사오미신유술해';
const elements = ['목','화','토','금','수'];
const branchElements = ['수','토','목','목','토','화','화','토','금','금','토','수'];
const hidden = ['壬癸','癸辛己','戊丙甲','甲乙','乙癸戊','戊庚丙','丙己丁','丁乙己','戊壬庚','庚辛','辛丁戊','戊甲壬'];
const ten = [['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' });
function parts(ms) { const p = Object.fromEntries(formatter.formatToParts(new Date(ms)).map(x => [x.type, x.value])); return [p.year,p.month,p.day,p.hour,p.minute].map(Number); }
function instant(y,m,d,h,min) {
  const wall = Date.UTC(y,m-1,d,h,min);
  const candidates = [540,600].map(offset => wall-offset*60000).filter(t => parts(t).join(',') === [y,m,d,h,min].join(','));
  if (candidates.length !== 1) throw new Error(candidates.length ? '서머타임 종료로 출생 시각이 두 번 존재합니다. 현재 버전에서는 해당 시각을 계산할 수 없습니다.' : '서머타임 전환으로 존재하지 않는 출생 시각입니다. 입력을 확인해 주세요.');
  return candidates[0];
}
function eight(ms, offset) { const d = new Date(ms + offset*60000); return Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0).getLunar().getEightChar(); }
function describe(p, dayStem) {
  const a=stems.indexOf(p[0]), b=branches.indexOf(p[1]), di=stems.indexOf(dayStem);
  const sipsin = n => ten[(Math.floor(n/2)-Math.floor(di/2)+5)%5][n%2===di%2?0:1];
  return { hanja:p, hangul:koreanStem[a]+koreanBranch[b], stem:p[0], branch:p[1], stemElement:elements[Math.floor(a/2)], branchElement:branchElements[b], stemYin:a%2?'음':'양', branchYin:b%2?'음':'양', stemTen:sipsin(a), hidden:[...hidden[b]].map(x=>({hanja:x, hangul:koreanStem[stems.indexOf(x)], ten:sipsin(stems.indexOf(x))})) };
}
function calculate(input) {
  let y=Number(input.year),m=Number(input.month),d=Number(input.day);
  if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)||y<1962||y>2050) throw new Error('지원하는 입력 연도는 1962~2050년입니다.');
  if(input.calendar==='lunar') {
    if(!LunarCalendar.isValid(y,m,d,Boolean(input.leap))) throw new Error('존재하지 않는 음력 날짜 또는 윤달입니다.');
    const s=toSolar(y,m,d,Boolean(input.leap)); y=s.year;m=s.month;d=s.day;
  } else if(input.calendar!=='solar') throw new Error('달력 종류를 확인해 주세요.');
  const dt=new Date(Date.UTC(y,m-1,d));
  if(dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==m||dt.getUTCDate()!==d) throw new Error('존재하지 않는 양력 날짜입니다.');
  if(y<1962||y>2050) throw new Error('변환된 양력 날짜가 지원 범위를 벗어났습니다.');
  const lunar=toLunar(y,m,d);
  const unknown=Boolean(input.unknown), hm=unknown?[12,0]:String(input.time||'').split(':').map(Number);
  if(hm.length!==2||!Number.isInteger(hm[0])||!Number.isInteger(hm[1])||hm[0]<0||hm[0]>23||hm[1]<0||hm[1]>59) throw new Error('출생시간을 입력해 주세요.');
  if(!['23','00'].includes(input.dayBoundary)) throw new Error('자시 기준을 확인해 주세요.');
  const correction=input.correction===undefined?0:Number(input.correction);
  if(!Number.isInteger(correction)||correction < -180||correction>180) throw new Error('시간 보정은 -180분부터 180분까지 입력해 주세요.');
  const t=instant(y,m,d,hm[0],hm[1]);
  // 연·월은 실제 순간을 중국 표준시로 환산해 라이브러리 절입과 비교한다.
  const ym=eight(t,480);
  // 절입 비교는 실제 순간으로 유지하고, 일·시주는 표준시에서 선택한 분을 뺀다.
  const standard=new Date(t+540*60000);
  const adjusted=new Date(t+(540-correction)*60000), hour=adjusted.getUTCHours();
  let dayMs=adjusted.getTime();
  if(input.dayBoundary==='23' && hour>=23) dayMs+=86400000;
  const day=eight(dayMs,0).getDay();
  const zi=Math.floor((hour+1)/2)%12;
  const hourStem=((stems.indexOf(day[0])%5)*2+zi)%10;
  const hourPillar=stems[hourStem]+branches[zi];
  let yearP=ym.getYear(),monthP=ym.getMonth(), warning=[];
  if(unknown) {
    const start=eight(instant(y,m,d,0,0),480),end=eight(instant(y,m,d,23,59),480);
    if(start.getYear()!==end.getYear()){yearP=null;warning.push('입춘이 출생일에 있어 출생시간 없이는 연주를 확정할 수 없습니다.');}
    if(start.getMonth()!==end.getMonth()){monthP=null;warning.push('절입이 출생일에 있어 출생시간 없이는 월주를 확정할 수 없습니다.');}
    warning.push('출생시간을 모르므로 시주는 표시하지 않습니다. 23시 일주 변경을 택하면 일주도 달라질 수 있습니다.');
  }
  const uncertainDay=unknown&&(input.dayBoundary==='23'||standard.getUTCHours()!==hm[0]||correction!==0);
  if(unknown&&uncertainDay&&input.dayBoundary==='00') warning.push('시간 보정으로 일주가 바뀔 가능성이 있어 확정하지 않습니다.');
  const pillars=[yearP,monthP,uncertainDay?null:day,unknown?null:hourPillar];
  const rules=[['천간합','甲己 乙庚 丙辛 丁壬 戊癸',0],['지지 육합','子丑 寅亥 卯戌 辰酉 巳申 午未',1],['지지 충','子午 丑未 寅申 卯酉 辰戌 巳亥',1]];
  const positions=['연주','월주','일주','시주'],relations=[];
  for(const [name,pairs,pos] of rules) for(let a=0;a<4;a++) for(let b=a+1;b<4;b++) if(pillars[a]&&pillars[b]&&pairs.split(' ').some(pair=>pair.includes(pillars[a][pos])&&pair.includes(pillars[b][pos])&&pillars[a][pos]!==pillars[b][pos])) relations.push({name,positions:[positions[a],positions[b]].join('·'),characters:pillars[a][pos]+pillars[b][pos]});
  const branchSets=[['지지 삼합','申子辰','수'],['지지 삼합','亥卯未','목'],['지지 삼합','寅午戌','화'],['지지 삼합','巳酉丑','금'],['지지 방합','亥子丑','수'],['지지 방합','寅卯辰','목'],['지지 방합','巳午未','화'],['지지 방합','申酉戌','금']];
  for(const [name,set,element] of branchSets){
    const found=[];for(let i=0;i<4;i++)if(pillars[i]&&set.includes(pillars[i][1]))found.push({i,branch:pillars[i][1]});
    const unique=[...new Set(found.map(x=>x.branch))];if(unique.length<2)continue;
    const present=[...set].filter(x=>unique.includes(x)),missing=[...set].filter(x=>!unique.includes(x));
    relations.push({name,positions:found.filter(x=>present.includes(x.branch)).map(x=>positions[x.i]).join('·'),characters:present.join(''),element,complete:missing.length===0,missing});
  }
  const fmt=x=>`${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,'0')}-${String(x.getUTCDate()).padStart(2,'0')} ${String(x.getUTCHours()).padStart(2,'0')}:${String(x.getUTCMinutes()).padStart(2,'0')}`;
  return { solar:`${y}년 ${m}월 ${d}일`, lunar:`${lunar.year}년 ${lunar.isLeapMonth?'윤':''}${lunar.month}월 ${lunar.day}일`, pillars:pillars.map(p=>p?describe(p,day[0]):null), relations, warning, standardTime:unknown?null:fmt(standard), adjustedTime:unknown?null:fmt(adjusted), correction, dst:!unknown && (standard.getUTCHours()!==hm[0] || standard.getUTCDate()!==d), boundary:input.dayBoundary };
}
module.exports={calculate};
