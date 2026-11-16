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
  function create(data){
    const pillars=data.pillars,day=pillars[2],known=pillars.filter(Boolean),counts=Object.fromEntries(Object.keys(elementText).map(x=>[x,0]));
    known.forEach(p=>{counts[p.stemElement]++;counts[p.branchElement]++;});
    const max=Math.max(...Object.values(counts)), prominent=Object.keys(counts).filter(k=>counts[k]===max&&max>0),missing=Object.keys(counts).filter(k=>counts[k]===0);
    const groups=new Map();pillars.forEach((p,i)=>{if(p&&i!==2&&day){if(!groups.has(p.stemTen))groups.set(p.stemTen,[]);groups.get(p.stemTen).push(['연간','월간','일간','시간'][i]);}});
    return {day:day?{name:day.hangul[0],hanja:day.stem,element:day.stemElement,metaphor:stems[day.stem][0],image:stems[day.stem][1],theme:stems[day.stem][2]}:null,counts,knownCount:known.length*2,prominent,missing,elementText,tenThemes:[...groups].map(([name,positions])=>({name,positions,title:ten[name][0],meaning:ten[name][1],suggestion:ten[name][2]})),relations:data.relations,partial:known.length<4};
  }
  return {create};
});
