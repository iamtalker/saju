(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SajuReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const stems={
    '甲':['큰 나무','곧게 뻗고 자라는 모습','자신의 방향을 세우고 성장할 여지를 찾는 태도'],
    '乙':['풀과 덩굴','환경에 맞추어 유연하게 자라는 모습','관계를 살피며 상황에 맞게 조정하는 태도'],
    '丙':['태양','밝게 드러나고 널리 비추는 모습','생각을 드러내고 주변에 활기를 나누는 태도'],
    '丁':['등불','가까운 곳을 꾸준히 밝히는 모습','관심 있는 일에 마음을 쏟고 세심하게 돌보는 태도'],
    '戊':['큰 산','중심을 잡고 버티는 모습','안정된 기반을 만들고 책임을 감당하는 태도'],
    '己':['밭과 흙','기르고 가꾸는 모습','실제 필요를 살피고 차근차근 쌓는 태도'],
    '庚':['단단한 쇠','다듬고 결단하는 모습','기준을 세우고 필요한 변화를 추진하는 태도'],
    '辛':['세공된 금속','정교하게 다듬어진 모습','세부를 살피고 완성도를 높이려는 태도'],
    '壬':['큰 물','넓게 흐르고 움직이는 모습','큰 흐름을 살피고 가능성을 넓히는 태도'],
    '癸':['비와 이슬','스며들고 적시는 모습','미묘한 변화를 관찰하고 내면을 가꾸는 태도']
  };
  const ten={
    '비견':['자기 주도','스스로 판단하고 같은 입장의 사람과 나란히 움직이는 주제','독립성을 지키면서도 협력의 여지를 살펴보세요.'],
    '겁재':['경쟁과 협력','동료와 자원을 나누거나 경쟁하는 주제','속도를 내기 전에 역할과 경계를 분명히 해 보세요.'],
    '식신':['표현과 생산','배운 것을 꾸준히 만들고 표현하는 주제','작은 결과물을 반복해 쌓는 방식이 어울리는지 돌아보세요.'],
    '상관':['표현과 변화','기존 방식에 질문하고 생각을 드러내는 주제','아이디어를 전달할 때 상대가 받아들일 방식도 함께 살펴보세요.'],
    '편재':['기회와 자원','넓은 활동 속에서 기회와 자원을 다루는 주제','새로운 기회를 살피되 쓸 수 있는 시간과 자원을 확인해 보세요.'],
    '정재':['관리와 축적','현실적인 계획과 자원을 꾸준히 관리하는 주제','계획을 세울 때 유지 가능한 속도와 비용을 살펴보세요.'],
    '편관':['도전과 책임','긴장과 압박 속에서 목표를 추진하는 주제','책임을 떠맡기 전에 범위와 휴식의 균형을 점검해 보세요.'],
    '정관':['질서와 책임','규칙, 역할, 약속과 사회적 책임에 관한 주제','주어진 기준과 자신의 우선순위가 잘 맞는지 살펴보세요.'],
    '편인':['탐구와 관점','독특한 관점으로 배우고 관심사를 깊이 탐색하는 주제','혼자 생각한 내용을 다른 사람과 나누어 점검해 보세요.'],
    '정인':['배움과 지원','배움과 도움, 보호와 지지를 주고받는 주제','도움을 받아들이는 일과 배운 것을 활용하는 일을 함께 살펴보세요.']
  };
  const elementText={목:'성장과 확장',화:'표현과 발산',토:'안정과 조정',금:'구분과 정리',수:'흐름과 탐색'};
  const tenText={
    비견:['독립성과 동료 의식','자기 기준을 세우고 비슷한 입장의 사람과 나란히 움직이는 주제'],겁재:['경쟁과 자원 나눔','협력과 경쟁 사이에서 역할과 경계를 조율하는 주제'],
    식신:['꾸준한 표현과 생산','배운 것을 익혀 결과물로 만들고 나누는 주제'],상관:['새로운 관점과 표현','기존 방식에 질문하고 생각을 설득력 있게 전하는 주제'],
    편재:['기회와 폭넓은 활동','여러 관계와 활동에서 자원과 기회를 다루는 주제'],정재:['계획과 안정적인 관리','현실적인 계획을 세우고 자원을 꾸준히 관리하는 주제'],
    편관:['도전과 책임','긴장되는 과제를 맡고 추진하는 주제'],정관:['규칙과 사회적 역할','약속과 기준을 세우고 책임을 다하는 주제'],
    편인:['탐구와 독특한 관점','관심 분야를 깊게 파고들며 다른 관점을 찾는 주제'],정인:['배움과 지원','지식과 도움을 주고받으며 기반을 다지는 주제']
  };
  const twelveNames=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
  const twelveStarts='亥午寅酉寅酉巳子申卯';
  const branches='子丑寅卯辰巳午未申酉戌亥';
  const pillarGuides=['태어난 해의 배경을 보는 자리','태어난 달과 계절 환경을 보는 자리','나를 나타내는 일간과 중심 관계를 보는 자리','태어난 시간과 이후의 관심사를 보는 자리'];
  const shinsalGroups=[
    {name:'도화살',targets:['酉','卯','午','子'],meaning:'전통적으로 표현력과 사람들의 시선을 끄는 상징으로 풀이합니다.'},
    {name:'역마살',targets:['寅','申','亥','巳'],meaning:'전통적으로 이동과 변화, 활동 반경의 상징으로 풀이합니다.'},
    {name:'화개살',targets:['辰','戌','丑','未'],meaning:'전통적으로 몰입과 사색, 배움의 상징으로 풀이합니다.'}
  ];
  const groupFor={申子辰:0,寅午戌:1,巳酉丑:2,亥卯未:3};
  function findShinsal(pillars){
    const found=[];
    for(const rule of shinsalGroups){
      const matches=[];
      for(const baseIndex of [0,2]){
        const base=pillars[baseIndex];if(!base)continue;
        const group=Object.entries(groupFor).find(([set])=>set.includes(base.branch))?.[1];if(group===undefined)continue;
        const target=rule.targets[group];
        const positions=pillars.map((p,i)=>p?.branch===target?['연지','월지','일지','시지'][i]:null).filter(Boolean);
        if(positions.length)matches.push({기준:baseIndex===0?'년지':'일지',대상지지:target,위치:positions});
      }
      if(matches.length)found.push({...rule,matches});
    }
    const month=pillars[1];
    if(month){
      const i=branches.indexOf(month.branch),target=branches[(i+11)%12];
      const positions=pillars.map((p,n)=>n!==1&&p?.branch===target?['연지','월지','일지','시지'][n]:null).filter(Boolean);
      if(positions.length)found.push({name:'천의성',meaning:'월지에서 한 칸 앞선 지지를 찾는 현대식 표의 결과입니다. 고전의 천의 기준과 다를 수 있으며 건강·직업을 판단하는 근거가 아닙니다.',matches:[{기준:`월지 ${month.branch}`,대상지지:target,위치:positions}]});
    }
    return found;
  }
  function create(data){
    const pillars=data.pillars,day=pillars[2],known=pillars.filter(Boolean),counts=Object.fromEntries(Object.keys(elementText).map(x=>[x,0]));
    known.forEach(p=>{counts[p.stemElement]++;counts[p.branchElement]++;});
    const max=Math.max(...Object.values(counts)), prominent=Object.keys(counts).filter(k=>counts[k]===max&&max>0),missing=Object.keys(counts).filter(k=>counts[k]===0);
    const groups=new Map();pillars.forEach((p,i)=>{if(p&&i!==2&&day){if(!groups.has(p.stemTen))groups.set(p.stemTen,[]);groups.get(p.stemTen).push(['연간','월간','일간','시간'][i]);}});
    const hiddenGroups=new Map();
    pillars.forEach((p,i)=>{if(!p||!day)return;p.hidden.forEach(h=>{if(!hiddenGroups.has(h.ten))hiddenGroups.set(h.ten,[]);const group=hiddenGroups.get(h.ten);let item=group.find(x=>x.position===['연주','월주','일주','시주'][i]);if(!item){item={position:['연주','월주','일주','시주'][i],characters:[]};group.push(item);}item.characters.push(`${h.hanja}(${h.hangul})`);});});
    const month=pillars[1];
    const dayIndex=day?'甲乙丙丁戊己庚辛壬癸'.indexOf(day.stem):-1;
    const twelve=dayIndex<0?null:pillars.map(p=>{if(!p)return null;const start=branches.indexOf(twelveStarts[dayIndex]);const branch=branches.indexOf(p.branch);const step=dayIndex%2===0?branch-start:start-branch;return twelveNames[(step+12)%12];});
    return {day:day?{name:day.hangul[0],hanja:day.stem,element:day.stemElement,polarity:day.stemYin,metaphor:stems[day.stem][0],image:stems[day.stem][1],theme:stems[day.stem][2]}:null,season:month?{branch:month.hangul[1],element:month.branchElement,ten:day?month.hidden.map(x=>x.ten):null}:null,pillarGuides,twelve,shinsal:findShinsal(pillars),counts,knownCount:known.length*2,prominent,missing,elementText,tenThemes:[...groups].map(([name,positions])=>({name,positions,title:ten[name][0],meaning:ten[name][1],suggestion:ten[name][2]})),hiddenThemes:[...hiddenGroups].map(([name,positions])=>({name,title:tenText[name][0],meaning:ten[name][1],positions})),relations:data.relations,partial:known.length<4};
  }
  return {create};
});
