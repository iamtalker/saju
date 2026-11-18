const SajuAnalysis=require('./analysis');
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
const jieNames={'立春':'입춘','惊蛰':'경칩','清明':'청명','立夏':'입하','芒种':'망종','小暑':'소서','立秋':'입추','白露':'백로','寒露':'한로','立冬':'입동','大雪':'대설','小寒':'소한'};
function parts(ms) { const p = Object.fromEntries(formatter.formatToParts(new Date(ms)).map(x => [x.type, x.value])); return [p.year,p.month,p.day,p.hour,p.minute].map(Number); }
function formatKst(ms) { const [y,m,d,h,min]=parts(ms); return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`; }
function instant(y,m,d,h,min) {
  const wall = Date.UTC(y,m-1,d,h,min);
  // 역사적으로 한국 표준시는 UTC+08:30, +09:00 및 서머타임 시각을 사용했다.
  // 서울의 IANA 시간대 자료를 기준으로 가능한 오프셋을 역탐색해 DST 공백/중복도 판별한다.
  const candidates = Array.from({length:241},(_,i)=>420+i).map(offset => wall-offset*60000).filter(t => parts(t).join(',') === [y,m,d,h,min].join(','));
  if (candidates.length !== 1) throw new Error(candidates.length ? '서머타임 종료로 출생 시각이 두 번 존재합니다. 현재 버전에서는 해당 시각을 계산할 수 없습니다.' : '서머타임 전환으로 존재하지 않는 출생 시각입니다. 입력을 확인해 주세요.');
  return candidates[0];
}
function eight(ms, offset) { const d = new Date(ms + offset*60000); return Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), 0).getLunar().getEightChar(); }
function describe(p, dayStem) {
  const a=stems.indexOf(p[0]), b=branches.indexOf(p[1]), di=stems.indexOf(dayStem);
  // 일간이 없으면(일주 미확정) 십성은 계산하지 않는다.
  const sipsin = n => di<0?null:ten[(Math.floor(n/2)-Math.floor(di/2)+5)%5][n%2===di%2?0:1];
  return { hanja:p, hangul:koreanStem[a]+koreanBranch[b], stem:p[0], branch:p[1], stemElement:elements[Math.floor(a/2)], branchElement:branchElements[b], stemYin:a%2?'음':'양', branchYin:b%2?'음':'양', stemTen:sipsin(a), hidden:[...hidden[b]].map(x=>({hanja:x, hangul:koreanStem[stems.indexOf(x)], ten:sipsin(stems.indexOf(x))})) };
}
const animals=['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
function toKo(gz){ return koreanStem[stems.indexOf(gz[0])]+koreanBranch[branches.indexOf(gz[1])]; }
// 공망: 일주가 속한 순(旬)에서 빠지는 두 지지. 60갑자 인덱스 기준.
function gongmangOf(dayGz){ const n=Array.from({length:60},(_,i)=>i).find(i=>stems[i%10]===dayGz[0]&&branches[i%12]===dayGz[1]); const start=n-(n%10); return [(start+10)%12,(start+11)%12].map(i=>koreanBranch[i]).join(''); }
function calculateCore(input) {
  let y=Number(input.year),m=Number(input.month),d=Number(input.day);
  if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)||y<1890||y>2050) throw new Error('지원하는 입력 연도는 1890~2050년입니다.');
  if(input.calendar==='lunar') {
    if(!LunarCalendar.isValid(y,m,d,Boolean(input.leap))) throw new Error('존재하지 않는 음력 날짜 또는 윤달입니다.');
    const s=toSolar(y,m,d,Boolean(input.leap)); y=s.year;m=s.month;d=s.day;
  } else if(input.calendar!=='solar') throw new Error('달력 종류를 확인해 주세요.');
  const dt=new Date(Date.UTC(y,m-1,d));
  if(dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==m||dt.getUTCDate()!==d) throw new Error('존재하지 않는 양력 날짜입니다.');
  if(y<1890||y>2050) throw new Error('변환된 양력 날짜가 지원 범위를 벗어났습니다.');
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
  // 일주가 미확정이면 임시 일간(정오 기준 값)으로 십성·신강약·공망을 만들지 않는다.
  const dayStemOpt=uncertainDay?null:day[0];
  // 세운·대운 지지와 천간이 원국과 맺는 관계를 식별한다. 합·형·충은 관계의 존재만 표시한다.
  const stemHapPairs={'甲':'己','己':'甲','乙':'庚','庚':'乙','丙':'辛','辛':'丙','丁':'壬','壬':'丁','戊':'癸','癸':'戊'};
  const branchHapPairs={'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'};
  const branchXingPairs={'寅':'巳','巳':'申','申':'寅','丑':'戌','戌':'未','未':'丑','子':'卯','卯':'子'};
  const posStem=['연간','월간','일간','시간'], posBranch=['연지','월지','일지','시지'];
  const selfXing=['辰','午','酉','亥'];
  const cycleRelations=(stem,branch)=>{ const out={stemHap:[],hap:[],xing:[],self:[]}; pillars.forEach((p,i)=>{ if(!p) return; if(stemHapPairs[stem]===p[0]) out.stemHap.push(posStem[i]); if(branchHapPairs[branch]===p[1]) out.hap.push(posBranch[i]); if(branchXingPairs[branch]===p[1]) out.xing.push(posBranch[i]); if(branch===p[1]&&selfXing.includes(branch)) out.self.push(posBranch[i]); }); return out; };
  const yearCycles=[];
  const clashes={子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'};
  const currentYear=new Date().getFullYear();
  for(let cycleYear=Math.max(currentYear,y);cycleYear<Math.max(currentYear,y)+12;cycleYear++){
    const yearPillar=Solar.fromYmdHms(cycleYear,3,1,12,0,0).getLunar().getYearInGanZhi();
    const branch=yearPillar[1];
    const natalPositions=pillars.map((p,i)=>p&&p[1]===clashes[branch]?['연지','월지','일지','시지'][i]:null).filter(Boolean);
    yearCycles.push({year:cycleYear,pillar:yearPillar,branch,ageBeforeBirthday:Math.max(0,cycleYear-y-1),ageAfterBirthday:Math.max(0,cycleYear-y),natalPositions,relations:cycleRelations(yearPillar[0],branch)});
  }
  let daeun={available:false,reason:'순·역행 기준 성별을 선택하면 대운을 계산합니다.'};
  if(input.sex==='male'||input.sex==='female'){
    if(unknown) daeun={available:false,reason:'대운 시작 시점은 출생시각에 따라 달라져, 출생시간을 모르면 계산하지 않습니다.'};
    else if(!yearP||!monthP) daeun={available:false,reason:'입춘 또는 절입 경계에서 연주·월주를 확정할 수 없어 대운을 계산하지 않습니다.'};
    else {
      const yearYang=stems.indexOf(yearP[0])%2===0, forward=yearYang===(input.sex==='male'), direction=forward?1:-1;
      const birthChina=new Date(t+480*60000);
      const birthLunar=Solar.fromYmdHms(birthChina.getUTCFullYear(),birthChina.getUTCMonth()+1,birthChina.getUTCDate(),birthChina.getUTCHours(),birthChina.getUTCMinutes(),0).getLunar();
      const jie=forward?birthLunar.getNextJie():birthLunar.getPrevJie();
      const jieSolar=jie?.getSolar();
      if(!jieSolar) daeun={available:false,reason:'출생 시각과 인접 절입 시각을 비교할 수 없습니다.'};
      else {
        const jieInstant=Date.UTC(jieSolar.getYear(),jieSolar.getMonth()-1,jieSolar.getDay(),jieSolar.getHour(),jieSolar.getMinute(),jieSolar.getSecond())-480*60000;
        // 대운수 = 인접 절까지 일수 ÷ 3을 반올림한 년수, 최소 1년(다수 구현 공통 규칙).
        const distanceMs=Math.abs(jieInstant-t),yearMs=365.2425*86400000,startYears=Math.max(1,Math.round(distanceMs/86400000/3)),startAgeMonths=startYears*12,carryMonths=Math.max(0,Math.round(distanceMs/86400000*4));
        const startOffsetMs=startYears*yearMs,sixty=Array.from({length:60},(_,i)=>stems[i%10]+branches[i%12]),monthIndex=sixty.indexOf(monthP);
        if(monthIndex<0) daeun={available:false,reason:'월주 간지를 대운 순서로 변환할 수 없습니다.'};
        else {
          const startInstant=t+startOffsetMs;
          const cycles=Array.from({length:8},(_,i)=>{
            const fromMonths=startAgeMonths+i*120,toMonths=fromMonths+120;
            const pillar=sixty[(monthIndex+direction*(i+1)+600)%60],branch=pillar[1];
            const natalClashes=pillars.map((p,n)=>p&&p[1]===clashes[branch]?['연지','월지','일지','시지'][n]:null).filter(Boolean);
            return {pillar,branch,natalClashes,fromAgeMonths:fromMonths,toAgeMonths:toMonths,startDate:formatKst(startInstant+i*10*yearMs),endDate:formatKst(startInstant+(i+1)*10*yearMs)};
          });
          daeun={available:true,direction:forward?'순행':'역행',sex:input.sex,yearStem:yearP[0],jie:jieNames[jie.getName()]||jie.getName(),startAgeMonths,distanceDays:Math.round(distanceMs/86400000*10)/10,startYears,comparison:{rounded:`${startYears}년`,monthCarry:`${Math.floor(carryMonths/12)}년${carryMonths%12?` ${carryMonths%12}개월`:''}`},startAge:`${Math.floor(startAgeMonths/12)}년${startAgeMonths%12?` ${startAgeMonths%12}개월`:''}`,startDate:formatKst(startInstant),cycles};
        }
      }
    }
  }
  if(!input.sex&&!unknown&&yearP&&monthP){ const asMale=calculateCore({...input,sex:'male'}).daeun, asFemale=calculateCore({...input,sex:'female'}).daeun; if(asMale.available&&asFemale.available) daeun={available:false,reason:'성별을 고르면 방향이 하나로 정해집니다. 아래는 두 기준을 모두 보여 줍니다.',alternatives:{male:asMale,female:asFemale}}; }
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
  // 띠, 공망, 십신 개수, 올해 월별 간지, 오늘의 일진. 계산 항목이며 해석을 포함하지 않는다.
  const nowKst=parts(Date.now());
  const dayGzDay=day;
  const sipCounts={};
  const addTen=n=>{ if(n) sipCounts[n]=(sipCounts[n]||0)+1; };
  if(!uncertainDay) pillars.forEach((p,i)=>{ if(!p) return; if(i!==2) addTen(describe(p,dayStemOpt).stemTen); const h=describe(p,dayStemOpt).hidden; addTen(h[h.length-1].ten); });
  const sipsinCount=uncertainDay?null:Object.entries(sipCounts).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  const prevYearGz=toKo(Solar.fromYmdHms(nowKst[0]-1,6,1,12,0,0).getLunar().getYearInGanZhi());
  const monthlyFlow=Array.from({length:12},(_,i)=>{ const m=i+1; const gz=Solar.fromYmdHms(nowKst[0],m,15,12,0,0).getLunar().getMonthInGanZhiExact(); return {month:m,pillar:toKo(gz),note:m===1?`입춘 전이라 전년(${prevYearGz}년)에 속함`:''}; });
  const todayGz=Solar.fromYmdHms(nowKst[0],nowKst[1],nowKst[2],12,0,0).getLunar().getDayInGanZhi();
  // 띠는 연주 기준이다. 연주가 미확정이면 일지로 대신하지 않는다.
  const extras={animal:yearP?animals[branches.indexOf(yearP[1])]||null:null, gongmang:uncertainDay?null:gongmangOf(day), sipsinCount, monthlyFlow, year:nowKst[0], today:{date:`${nowKst[0]}-${String(nowKst[1]).padStart(2,'0')}-${String(nowKst[2]).padStart(2,'0')}`, pillar:toKo(todayGz)}};
  let trueSolar=null;
  if(input.longitude!==undefined&&input.longitude!==''&&!unknown){
    const lon=Number(input.longitude);
    if(!Number.isFinite(lon)||lon<100||lon>150) throw new Error('경도는 100~150 사이의 숫자로 입력해 주세요.');
    // 균시차: 근사식(오차 약 0.5분). 진태양시 = 표준시 + 4분×(경도−135°) + 균시차.
    const N=Math.round((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/86400000)+1, B=2*Math.PI*(N-81)/365;
    const eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
    const diff=4*(lon-135)+eot;
    const tot=standard.getUTCHours()*60+standard.getUTCMinutes()+diff, norm=((Math.round(tot)%1440)+1440)%1440;
    trueSolar={time:String(Math.floor(norm/60)).padStart(2,'0')+':'+String(norm%60).padStart(2,'0'),longitude:lon,diffMinutes:Math.round(diff*10)/10,equationMinutes:Math.round(eot*10)/10};
  }
  extras.trueSolar=trueSolar;
  // 신강·신약은 analysis.js가 판정하며, calculate()에서 연결한다.
  const strength=null;
  return { strength, extras, solar:`${y}년 ${m}월 ${d}일`, lunar:`${lunar.year}년 ${lunar.isLeapMonth?'윤':''}${lunar.month}월 ${lunar.day}일`, pillars:pillars.map(p=>p?describe(p,dayStemOpt):null), relations, yearCycles, daeun, warning, standardTime:unknown?null:fmt(standard), adjustedTime:unknown?null:fmt(adjusted), correction, dst:!unknown && (standard.getUTCHours()!==hm[0] || standard.getUTCDate()!==d), boundary:input.dayBoundary };
}
// 경계 근처 출생(자시 전후 60분, 절입 전후 60분)에는 다른 기준으로 계산한 명식을 함께 보여 준다.
function nearBoundary(input, standardText, instantMs){
  const reasons=[];
  const [hh,mm]=standardText.split(' ')[1].split(':').map(Number);
  const clock=hh*60+mm;
  const near=(c,target)=>{ const diff=Math.abs(c-target); return Math.min(diff,1440-diff)<=60; };
  if(near(clock,1380)||near(clock,0)) reasons.push('자시 경계 근처입니다. 일주 변경 기준(밤 11시 또는 자정)과 보정 분에 따라 시주와 일주가 달라질 수 있습니다.');
  const china=new Date(instantMs+480*60000);
  const lunar=Solar.fromYmdHms(china.getUTCFullYear(),china.getUTCMonth()+1,china.getUTCDate(),china.getUTCHours(),china.getUTCMinutes(),0).getLunar();
  for(const jie of [lunar.getPrevJie(), lunar.getNextJie()]){
    const s=jie&&jie.getSolar(); if(!s) continue;
    const jt=Date.UTC(s.getYear(),s.getMonth()-1,s.getDay(),s.getHour(),s.getMinute(),s.getSecond())-480*60000;
    const kst=(ms)=>{ const k=new Date(ms+540*60000); return Math.floor(Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate())/86400000); };
    if(Math.abs(kst(jt)-kst(instantMs))<=1){ reasons.push('절입 당일 또는 전후 하루에 태어났습니다. 절입 시각을 계산에 쓰므로 만세력과 차이가 날 수 있습니다.'); break; }
  }
  return reasons;
}
const pillarKey=r=>r.pillars.map(p=>p?p.hangul:'-').join(' ');
function calculate(input){
  const r=calculateCore(input);
  const out=input.unknown?r:withBoundary(input, r);
  // 일간이 확정되지 않으면 판정 결과(격국·용신·풀이 문단 등)를 만들지 않는다.
  out.analysis=null;
  if(out.pillars[2]){ try{ out.analysis=SajuAnalysis.analyze(out); }catch(error){ out.analysis=null; } }
  out.strength=out.analysis?out.analysis.strength:null;
  return out;
}
function withBoundary(input, r){
  if(!r.standardTime) return r;
  // standardTime은 이미 한국 표준시 벽시계 문자열이므로, +09:00으로 파싱하면 실제 출생 순간이 된다.
  const reasons=nearBoundary(input, r.standardTime, Date.parse(r.standardTime.replace(' ','T')+':00+09:00'));
  if(!reasons.length) return r;
  const alternatives=[];
  const other=input.dayBoundary==='23'?'00':'23';
  const otherLabel=other==='00'?'자정으로':'밤 11시로';
  const options=[
    {label:'날짜 전환을 '+otherLabel+' 했을 때',opts:{dayBoundary:other}},
    {label:'보정 0분일 때',opts:{correction:0}},
    {label:'보정 0분이고 날짜 전환을 '+otherLabel+' 했을 때',opts:{correction:0,dayBoundary:other}}
  ];
  const seen=new Set([pillarKey(r)]);
  for(const o of options){ const alt=calculateCore({...input,...o.opts}); const key=pillarKey(alt); if(seen.has(key)) continue; seen.add(key); alternatives.push({label:o.label,pillars:alt.pillars.map(p=>p?p.hangul:null)}); }
  r.warning=[...r.warning,...reasons];
  r.boundaryInfo={near:reasons,alternatives};
  return r;
}
module.exports={calculate};
