(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FunReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 판정 결과(data.analysis)를 입력으로 받아 풀이 문단을 만든다. 면책은 화면 맨 아래 한 번만 둔다.
  const DAY_TRAIT={
    '甲':'곧은 나무처럼 방향을 정하면 끝까지 밀고 가는 성향입니다.',
    '乙':'덩굴처럼 환경에 맞춰 유연하게 움직이고 관계를 살피는 성향입니다.',
    '丙':'햇살처럼 자리의 분위기를 밝히고 드러내는 성향입니다.',
    '丁':'등불처럼 좋아하는 일에 오래 마음을 쏟고 세심하게 돌보는 성향입니다.',
    '戊':'산처럼 묵직하게 자리를 지키고 책임을 감당하는 성향입니다.',
    '己':'밭처럼 실제 필요를 살피고 차근차근 가꾸는 성향입니다.',
    '庚':'쇠처럼 기준을 세우고 결단이 빠른 성향입니다.',
    '辛':'보석처럼 세부를 다듬고 완성도를 높이려는 성향입니다.',
    '壬':'큰 물처럼 생각이 넓고 흐름을 읽어 가능성을 넓히는 성향입니다.',
    '癸':'이슬처럼 조용히 관찰하고 내면을 가꾸는 성향입니다.'
  };
  const ELEM_OF={甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수'};
  const ORGAN={목:'간과 담',화:'심장과 혈관',토:'위장과 비장',금:'폐와 대장',수:'신장과 방광'};
  const KOS={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const HIDDEN={子:'壬癸',丑:'癸辛己',寅:'戊丙甲',卯:'甲乙',辰:'乙癸戊',巳:'戊庚丙',午:'丙己丁',未:'丁乙己',申:'戊壬庚',酉:'庚辛',戌:'辛丁戊',亥:'戊甲壬'};
  const KOB={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const LOVE_BY_JIJI={
    '자':'감정 표현이 조용하지만 깊은 편입니다.','축':'천천히 신뢰를 쌓는 편입니다.',
    '인':'호기심이 많고 먼저 움직이는 편입니다.','묘':'다정하게 챙기는 편입니다.',
    '진':'변화가 많은 관계를 겪기 쉽습니다.','사':'생각이 많고 신중한 편입니다.',
    '오':'열정적이고 표현이 분명한 편입니다.','미':'편안하고 안정적인 관계를 좋아합니다.',
    '신':'재치 있는 대화를 즐기는 편입니다.','유':'기준이 분명하고 깔끔한 편입니다.',
    '술':'의리를 중요하게 여기는 편입니다.','해':'마음을 열면 깊이 빠지는 편입니다.'
  };
  // 십성 묶음별 강약 문장. 같은 십성이라도 신강·신약·갈림에 따라 뜻이 달라진다.
  const GROUP_BY_STRENGTH={
    비겁:{
      신강:'자기 힘이 강해 독립심과 주도권이 큽니다. 경쟁을 피하지 않고 스스로 판단합니다.',
      신약:'자기편을 세우는 힘이 약해 혼자 버티는 시간이 깁니다.',
      갈림:'주도권을 쥘 때와 양보할 때가 상황에 따라 갈립니다.'
    },
    식상:{
      신강:'표현하고 만들어 내는 힘이 강해 일을 만들고 말과 글로 드러내는 힘이 큽니다.',
      신약:'시작과 아이디어는 많지만 마무리를 혼자 감당하기 어려운 편입니다.',
      갈림:'표현과 생산이 강점이 될 수도, 기운을 소모하는 일이 될 수도 있습니다.'
    },
    재성:{
      신강:'재물과 일을 다루고 운용하는 힘이 있어 실제로 쌓아 가는 편입니다.',
      신약:'일과 현실 문제는 많은데 감당이 과제입니다. 재물은 들어와도 쌓이기 어렵습니다.',
      갈림:'재물과 일을 다루는 힘이 있으나 감당할 힘과 맞춰 봐야 합니다.'
    },
    관성:{
      신강:'책임과 규율을 감당하는 힘이 있어 조직과 지위에서 자리를 잡습니다.',
      신약:'압박과 책임이 무겁게 느껴지기 쉽습니다. 감당할 힘을 먼저 키워야 합니다.',
      갈림:'책임을 맡을 수도, 피할 수도 있는 구간입니다.'
    },
    인성:{
      신강:'배움과 생각이 깊어 스스로 공부하는 힘이 큽니다.',
      신약:'배움과 도움이 힘이 되는 구조입니다. 인성이 받쳐 줄 때 버티는 힘이 생깁니다.',
      갈림:'배움이 힘이 될 수도, 생각에만 머물 수도 있습니다.'
    }
  };
  // 없는 십성 문장
  const MISSING={
    인성:'인성이 없어 후원, 스승, 학력의 덕이 약하고 독학으로 익히는 편입니다.',
    관성:'관성이 없어 조직, 지위, 윗사람과의 인연이 약하고 독립적으로 움직이는 편입니다.',
    비겁:'비겁이 없어 자기편을 세우기 어렵고 협력자가 적은 편입니다.',
    식상:'식상이 없어 표현과 생산의 통로가 약해 속으로 쌓아 두기 쉽습니다.',
    재성:'재성이 없어 재물을 직접 다루는 힘이 약하고, 다른 경로로 얻는 편입니다.'
  };
  const GROUP_OF={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
  const JOB_BY_STRENGTH={
    식상:'표현하고 만들어 내는 일, 기획과 콘텐츠, 연구 보조처럼 자기 결과물이 드러나는 일',
    재성:'재물과 일을 직접 운용하는 일',
    관성:'규칙과 책임이 분명한 조직 업무',
    인성:'배우고 익힌 것을 가르치거나 분석하는 일',
    비겁:'자기 영역을 세워 독자적으로 하는 일'
  };
  const SECTION=(title,body)=>`<div class="theme"><b>${title}</b><p>${body}</p></div>`;
  const josa=(word,b,p)=>{ const c=String(word).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?b:p; };
  const KOS2={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const stemLabel=h=>`${KOS2[h]}(${h})`;
  const branchLabel=h=>`${KOB[h]}(${h})`;
  const judgeText=j=>j==='용신'?'용신':j==='희신'?'희신':j==='기신'?'기신':j==='한신'?'한신':j==='갈림'?'갈림':'중립';

  function groupCounts(data){
    const g={비겁:0,식상:0,재성:0,관성:0,인성:0};
    const ten={};
    const add=n=>{ if(n){ ten[n]=(ten[n]||0)+1; g[GROUP_OF[n]]++; } };
    data.pillars.forEach((p,i)=>{ if(!p) return; if(i!==2) add(p.stemTen); const h=p.hidden; if(h&&h.length) add(h[h.length-1].ten); });
    return {g,ten};
  }
  // 관계 문장: 같은 자리의 관계를 묶는다
  function relText(rels){
    const m=new Map();
    rels.forEach(x=>{ const key=x.pos||'__'; if(!m.has(key)) m.set(key,[]); if(!m.get(key).includes(x.kind)) m.get(key).push(x.kind); });
    return [...m.entries()].map(([pos,ks])=>pos==='__'?ks.join(', '):`${pos}${josa(pos,'과','와')} ${ks.join('·')}`).join(', ');
  }

  function build(data){
    const a=data.analysis;
    const day=data.pillars[2];
    if(!day||!a) return '';
    const dayChar=day.stem, dayEl=ELEM_OF[dayChar];
    const {g,ten}=groupCounts(data);
    const verdict=a.strength.verdict;
    const V=verdict==='신강'||verdict==='신약'?verdict:'갈림';
    const gg=a.gyeokguk;
    const excess=a.natal.excess, lacking=a.natal.lacking;
    const yongEl=a.yong;
    const yongInNatal=data.pillars.some(p=>p&&(ELEM_OF[p.stem]===yongEl||(p.branchElement===yongEl)));
    // 종합 총평: 구조를 한 문장으로 먼저 요약한다
    const surround=excess.filter(e=>e!==dayEl).slice(0,2).join('·');
    const seasonWord=a.season==='겨울'?'한겨울':a.season;
    const structure=`${seasonWord}에 태어나 ${surround?surround+' 기운에 둘러싸인 ':''}${verdict==='신약'?'약한 ':verdict==='신강'?'강한 ':''}${dayEl}(${dayChar})이고, ${g.식상>=2&&V==='신약'?'표현하고 만들어 내는 힘은 큰데 그것을 받아 쥘 힘이 약하며':V==='신강'?'스스로 힘을 쓸 수 있으며':'힘의 균형이 맞지 않으며'}${a.yong&&!yongInNatal?`, 필요한 ${yongEl}가 원국에 없습니다.`:'.'}`;
    const summaryParts=[
      structure,
      `일간의 강약은 ${verdict}입니다. 득령·득지·득세 가운데 ${a.strength.hits}개가 충족됩니다.`,
      `격국은 ${gg.name}이며, ${gg.exposed?'월지의 십성이 천간에 드러나 있습니다':'천간에는 드러나 있지 않습니다'}.`,
      a.status==='갈림'?'용신은 하나로 정하지 않습니다.':`용신은 ${yongEl}이고, 희신은 ${a.bu.희}, 기신은 ${a.bu.기.join('·')}입니다.`,
      a.note||'',
      a.jong.wealth?`이 풀이의 대운·세운·월운은 정격(용신 ${yongEl||'없음'}) 기준이며, 종재격은 참고 견해입니다.`:''
    ].filter(Boolean);
    if(a.jong.wealth) summaryParts.push('재성이 많은데 일간이 약해 재성을 감당하는 것이 이 명식의 핵심 과제입니다.');
    const summary=summaryParts.join(' ');
    // 성격: 일간, 강한 식상의 결, 없는 관성·인성으로 읽는다
    const outputPolar=(ten['상관']||0)>=(ten['식신']||0)&&(ten['상관']||0)>0?'기존 방식을 따져 보고 스스로 다시 만드는 힘':'꾸준히 만들고 가꾸는 힘';
    const personalityParts=[DAY_TRAIT[dayChar]];
    if(g.식상>=2) personalityParts.push(`식상이 두드러져 ${outputPolar}이 강합니다.`);
    if(g.관성===0&&g.인성===0) personalityParts.push('관성과 인성이 모두 없어 기존 체계에 기대기보다 독학으로 익히고 스스로 길을 만드는 독학형에 가깝습니다.');
    personalityParts.push(g.식상>=2&&V==='신약'?'말과 행동이 먼저 나가는 편이라 주변에 의욕을 전하는 힘이 있습니다.':GROUP_BY_STRENGTH[g.식상>=2?'식상':'비겁'][V]);
    const personality=personalityParts.join(' ');
    // 강한 십성과 없는 십성 문단
    const strengthParts=[];
    for(const k of ['식상','재성','관성','인성','비겁']){
      if(g[k]>=2) strengthParts.push(`${k} ${g[k]}개: ${GROUP_BY_STRENGTH[k][V]}`);
      else if(g[k]===1) strengthParts.push(`${k} 1개: ${GROUP_BY_STRENGTH[k][V]}`);
    }
    const missingParts=['인성','관성','비겁','식상','재성'].filter(k=>g[k]===0).map(k=>MISSING[k]);
    const tenParts=[...strengthParts,...missingParts];
    // 재물
    const wealthText=(()=>{
      if(g.재성===0) return MISSING.재성;
      if(V==='신약'&&g.재성>=3) return '벌 길은 있으나 쌓이지 않고 지나갑니다. 재성이 많은데 일간이 약해 재물을 붙잡아 두기 어렵습니다. 재물을 얻으려면 인성과 비겁의 도움을 받아야 합니다.';
      if(V==='신강') return '재물을 다루는 힘이 있어 쌓아 가는 편입니다.';
      return '재성이 있으나 많지 않아 상황에 따라 달라집니다.';
    })();
    // 직업: 강한 십성, 없는 십성, 강약을 함께 본다. 십성 사전에서 직종을 꺼내지 않는다.
    const jobPieces=[];
    if(g.식상>=2) jobPieces.push(`${JOB_BY_STRENGTH.식상}이 맞는 편입니다`);
    if(V==='신약') jobPieces.push('책임이 무거운 자리보다 자기 몫을 스스로 정하는 일이 맞습니다');
    if(g.관성===0) jobPieces.push('조직의 직위보다 자기 영역에서 성과를 내는 구조입니다');
    if(g.인성===0) jobPieces.push('도움을 받는 경로가 적어 혼자 익히고 버티는 힘이 필요합니다');
    const careerText=jobPieces.length?jobPieces.join('. ')+'.':'강약과 십성 구성이 특정 방향으로 치우치지 않아 여러 방향이 열려 있습니다.';
    // 연애: 배우자 자리의 십성과 강약을 함께 본다
    const jiji=day.hangul[1];
    const dayBranchTen=day.hidden&&day.hidden.length?day.hidden[day.hidden.length-1].ten:null;
    const spouseGroup=dayBranchTen?GROUP_OF[dayBranchTen]:null;
    const spouseText={
      재성:(V==='신약'&&g.재성>=3)?' 배우자 자리에 재성이 있어 인연은 있으나, 재성이 많은 신약한 명식이라 관계를 감당하는 데 힘이 듭니다.':' 배우자 자리에 재성이 있어 현실적인 관계를 찾는 편입니다.',
      관성:' 배우자 자리에 관성이 있어 책임과 질서를 갖춘 관계가 맞는 편입니다.',
      인성:' 배우자 자리에 인성이 있어 돌봄과 지지를 주고받는 관계가 맞는 편입니다.',
      식상:' 배우자 자리에 식상이 있어 말이 통하고 함께 만드는 관계가 맞는 편입니다.',
      비겁:' 배우자 자리에 비겁이 있어 대등한 관계를 원하는 편입니다.'
    }[spouseGroup]||'';
    const loveText=`${LOVE_BY_JIJI[jiji]||''}${spouseText}${(data.shinsal||[]).some(s=>s.name==='도화살')?' 원국에 도화 표식도 보입니다.':''}`;
    // 건강
    const healthText=(excess.length||lacking.length)?`${excess.length?`${excess.join('·')} 기운이 많아 ${excess.map(e=>ORGAN[e]).join('·')}을 살필 필요가 있습니다.`:''}${lacking.length?` ${lacking.join('·')} 기운이 없어 ${lacking.map(e=>ORGAN[e]).join('·')}의 기능이 약하기 쉽습니다.`:''}`.trim():'오행이 고르게 있어 특별히 치우친 부분이 드러나지 않습니다.';
    // 대운: 줄마다 2~3문장
    // 합화 오행: 천간합과 육합은 합하여 생기는 오행이 용신·희신이면 도움, 기신이면 묶임으로 본다.
    const STEM_HAP_EL={甲:'토',己:'토',乙:'금',庚:'금',丙:'수',辛:'수',丁:'목',壬:'목',戊:'화',癸:'화'};
    const BR_HAP_EL={子:'토',丑:'토',寅:'목',亥:'목',卯:'화',戌:'화',辰:'금',酉:'금',巳:'수',申:'수',午:'화',未:'화'};
    const POSIDX={연간:0,월간:1,일간:2,시간:3,연지:0,월지:1,일지:2,시지:3};
    const elJudge=el=>el===a.yong?'용':(el===a.bu.희?'희':(a.bu.기.includes(el)?'기':'중'));
    const hapVerdict=el=>{ const j=elJudge(el); return j==='용'||j==='희'?'도움이 더해집니다':j==='기'?'묶여 힘이 줄어듭니다':'영향이 중립입니다'; };
    const POS_MEAN={연지:'주변 환경과 사회적 배경',월지:'일과 생활 환경',일지:'가까운 관계와 일상',시지:'개인 계획과 장기 목표'};
    const BR_POS_DESC={충:'흔들립니다.',형:'마찰과 조정이 따릅니다.',자형:'마찰과 조정이 따릅니다.',파:'어긋납니다.',해:'불편과 거리가 생깁니다.',원진:'불편과 거리가 생깁니다.',귀문:'예민해지고 몰두하게 됩니다.'};
    // 관계 한 줄씩: 천간합은 합화 오행으로, 육합은 합화 오행과 유불리로, 나머지는 관계 종류별 문장으로
    const relNotes=(rels,stemH,branchH)=>{
      const notes=[];
      rels.filter(x=>x.others).forEach(x=>{ const j=elJudge(x.el); notes.push(`원국의 ${x.others.join('·')}와 ${x.el} ${x.type}을 이룹니다. ${x.el}${josa(x.el,'이','가')} ${j==='용'||j==='희'?'용신·희신이라 유리합니다':j==='기'?'기신이라 불리합니다':'중립입니다'}.`); });
      rels.filter(x=>x.kind==='천간합').forEach(x=>{ const p=data.pillars[POSIDX[x.pos]]; const el=STEM_HAP_EL[stemH]; if(p&&el) notes.push(`원국 ${x.pos}의 ${KOS2[p.stem]}(${p.stem})${josa(KOS2[p.stem],'과','와')} 합하여 ${el}${josa(el,'으로','로')} 변하니 합의 작용은 ${hapVerdict(el)}.`); });
      const byKind=new Map();
      rels.filter(x=>x.kind!=='천간합'&&!x.others&&!(x.kind==='육합'&&rels.some(y=>y.others))).forEach(x=>{ if(!byKind.has(x.kind)) byKind.set(x.kind,[]); byKind.get(x.kind).push(x.pos); });
      const hapPoss=byKind.get('육합');
      if(hapPoss){
        const poss=[...new Set(hapPoss)]; const meanings=[...new Set(poss.map(p=>POS_MEAN[p]||p))].join(', ');
        const el=BR_HAP_EL[branchH]; const j=elJudge(el);
        notes.push(`${meanings}${josa(meanings.slice(-1),'이','가')} 육합으로 묶입니다. 합화 ${el}${josa(el,'이','가')} ${j==='용'||j==='희'?'용·희신이라 유리하게 작용합니다':j==='기'?'기신이라 힘이 줄어듭니다':'중립입니다'}.`);
        byKind.delete('육합');
      }
      // 같은 자리 조합의 관계 종류는 한 문장으로 묶는다
      const bySet=new Map();
      for(const [kind,poss] of byKind){ const uniq=[...new Set(poss)]; const key=uniq.join('·'); if(!bySet.has(key)) bySet.set(key,{poss:uniq,kinds:[]}); bySet.get(key).kinds.push(kind); }
      for(const {poss,kinds} of bySet.values()){
        const meanings=[...new Set(poss.map(p=>POS_MEAN[p]||p))].join(', ');
        const pos=poss.join('·')+josa(poss[poss.length-1],'과','와');
        const effects=[...new Set(kinds.map(k=>BR_POS_DESC[k]||'관계가 있습니다.'))].join(' ');
        notes.push(`${pos} ${kinds.join('·')}: ${meanings}${josa(meanings.slice(-1),'이','가')} ${effects}`);
      }
      return notes;
    };
    const BR_EL_MAP={子:'수',丑:'토',寅:'목',卯:'목',辰:'토',巳:'화',午:'화',未:'토',申:'금',酉:'금',戌:'토',亥:'수'};
    const conclFor=c=>{
      const stemUseful=c.stem==='용신'||c.stem==='희신', branchUseful=c.branch==='용신'||c.branch==='희신';
      const clashBranch=c.rels.some(x=>x.kind==='충');
      const hapToKi=c.rels.some(x=>x.kind==='육합'&&elJudge(BR_HAP_EL[c.pillar[1]])==='기');
      if(c.stem==='기신'&&(c.branch==='중립'||hapToKi)){ const why=[c.branch==='중립'?'지지가 중립이고':null,hapToKi?'합화가 기신 쪽이라':null].filter(Boolean).join(' '); return `천간이 기신이고 ${why} 주의하는 시기입니다.`; }
      if(c.branch==='용신'&&clashBranch) return '용신이 강하게 들어오지만 충으로 크게 흔들리는 시기입니다.';
      if(branchUseful&&stemUseful) return '천간과 지지가 모두 받쳐 주는 가장 좋은 시기입니다.';
      if(branchUseful) return '천간의 도움은 약해도 지지라는 바탕이 받쳐 주는 시기입니다.';
      if(stemUseful) return '드러나는 도움은 있으나 지지의 바탕이 약한 시기입니다.';
      if(c.stem==='기신'&&c.branch==='기신') return '천간과 지지가 모두 기신이라 주의하는 시기입니다.';
      return '큰 힘이 두드러지지 않는 시기입니다.';
    };
    const cycleText=c=>{
      const s1=`${c.pillar}(만 ${c.fromAge}~${c.toAge}세) 대운은 천간 ${stemLabel(c.pillar[0])}${josa(KOS2[c.pillar[0]],'은','는')} ${judgeText(c.stem)}, 지지 ${branchLabel(c.pillar[1])}${josa(KOB[c.pillar[1]],'은','는')} ${judgeText(c.branch)}입니다.`;
      const notes=relNotes(c.rels,c.pillar[0],c.pillar[1]);
      const stemUseful=c.stem==='용신'||c.stem==='희신', branchUseful=c.branch==='용신'||c.branch==='희신';
      const branchEl=BR_EL_MAP[c.pillar[1]];
      const rootNote=branchEl===dayEl?`지지 ${branchLabel(c.pillar[1])}${josa(KOB[c.pillar[1]],'은','는')} 일간과 같은 ${dayEl}${josa(dayEl,'이라','라')} 일간에 뿌리가 생깁니다.`:'';
      const clashBranch=c.rels.some(x=>x.kind==='충');
      const hapToKi=c.rels.some(x=>x.kind==='육합'&&elJudge(BR_HAP_EL[c.pillar[1]])==='기');
      const concl=conclFor(c);
      const hid=(HIDDEN[c.pillar[1]]||'').split('').map(h=>({h,el:ELEM_OF[h]}));
      const yongEl=a.yong;
      const storeText=((c.stem==='희신'||c.stem==='용신'||c.branch==='희신'||c.branch==='용신')&&hid.some(h=>h.el===yongEl)&&!data.pillars.some(p=>p&&(p.stemElement===yongEl||p.branchElement===yongEl)))?`지지 ${branchLabel(c.pillar[1])} 속의 ${hid.find(h=>h.el===yongEl).h}(${yongEl})${josa(yongEl,'이','가')} 원국에 없던 기운을 들여옵니다.`:'';
      return [s1,...notes,rootNote,storeText,concl+(c.gm?' 지지가 공망이라 기운이 비는 자리입니다.':'')].filter(Boolean).join(' ');
    };
    const cycleLines=a.cycles.map(cycleText);
    const dy=data.daeun||{};
    const daeunTitle=dy.available?`대운 · ${dy.sex==='male'?'남성':'여성'} · ${dy.direction} · ${dy.direction==='역행'?'직전':'다음'} 절입까지 ${dy.distanceDays}일 ÷ 3 = ${(dy.distanceDays/3).toFixed(1)} → 만 ${dy.startYears}세 시작`:'대운';
    const nowAge=Number(data.extras.year)-parseInt(String(data.solar).split('년')[0],10);
    const cur=a.cycles.find(c=>nowAge>=c.fromAge&&nowAge<=c.toAge);
    const curText=cur?`현재 대운: ${cycleText(cur)}`:(a.cycles.length?'현재 나이에 해당하는 대운이 없습니다.':'성별을 선택하면 대운을 계산합니다.');
    // 세운: 올해와 내년은 문단, 나머지는 한두 문장
    const yearLine=(y)=>{ const rel=relNotes(y.rels,y.pillar[0],y.pillar[1]).join(' '); return `${y.year}년 ${y.pillar}: 천간 ${stemLabel(y.pillar[0])}${josa(KOS2[y.pillar[0]],'은','는')} ${judgeText(y.stem)}, 지지 ${branchLabel(y.pillar[1])}${josa(KOB[y.pillar[1]],'은','는')} ${judgeText(y.branch)}입니다.${rel?' '+rel:' 원국과 충·합·형 관계가 없습니다.'}${y.gm?' 지지가 공망입니다.':''} ${conclFor(y)}`; };
    const nowYear=Number(data.extras.year);
    const yNow=a.years.find(y=>y.year===nowYear), yNext=a.years.find(y=>y.year===nowYear+1);
    const yearDetail=[yNow,yNext].filter(Boolean).map(y=>{
      const parts=[yearLine(y)];
      if(y.branch==='기신'||y.stem==='기신') parts.push('기신이 들어와 부담이 커지는 해입니다.');
      return parts.join(' ');
    }).join('<br>');
    const yearRest=a.years.filter(y=>y!==yNow&&y!==yNext).map(y=>{ const rel=relNotes(y.rels,y.pillar[0],y.pillar[1]).join(' '); return `${y.year}년 ${y.pillar}: 천간 ${KOS2[y.pillar[0]]}(${y.pillar[0]})${josa(KOS2[y.pillar[0]],'은','는')} ${judgeText(y.stem)}, 지지 ${KOB[y.pillar[1]]}(${y.pillar[1]})${josa(KOB[y.pillar[1]],'은','는')} ${judgeText(y.branch)}입니다.${rel?' '+rel:' 원국과 충·합·형 관계가 없습니다.'}${y.gm?' 지지가 공망입니다.':''} ${conclFor(y)}`; }).join('<br>');
    const yearText=yearDetail+(yearRest?'<br>'+yearRest:'');
    // 월운
    const KOHS_R={갑:'甲',을:'乙',병:'丙',정:'丁',무:'戊',기:'己',경:'庚',신:'辛',임:'壬',계:'癸'};
    const KOBR_R={자:'子',축:'丑',인:'寅',묘:'卯',진:'辰',사:'巳',오:'午',미:'未',신:'申',유:'酉',술:'戌',해:'亥'};
    const monthLines=a.months.map(m=>`${m.month}월 ${m.pillar}: 천간 ${KOS2[m.pillar[0]]||m.pillar[0]} ${judgeText(m.stem)}, 지지 ${m.pillar[1]} ${judgeText(m.branch)}.${m.note?' '+m.note+'.':''}${m.rels.length?' '+relNotes(m.rels,KOHS_R[m.pillar[0]],KOBR_R[m.pillar[1]]).join(' '):''}${m.gm?' 공망입니다.':''} (점수 ${m.score>0?'+':''}${m.score}). ${m.level}.`);
    const goodMonths=a.months.filter(m=>m.good).map(m=>`${m.month}월`).join(' · ');
    // 원국 관계와 신살, 공망
    const natalLines=[];
    if(a.natal.relations.length) natalLines.push(...a.natal.relations.map(x=>`${x.positions} ${x.characters} ${x.kinds.join('·')}`));
    if(a.natal.stemRel.length) natalLines.push(...a.natal.stemRel.map(x=>`${x.positions} ${x.characters} 천간합`));
    const sinsalLine=(a.natal.sinsal||[]).map(s=>`${s.name} ${s.positions}`).join(' · ')||'특수 신살은 없습니다';
    const twelveLine=(a.natal.twelve||[]).map(t=>`${t.pos} ${t.b} ${t.name}`).join(' · ');
    const gmNote=a.natal.gongmangBranches.map(x=>`${KOB[x.b]}(${x.b})${josa(KOB[x.b],'은','는')} ${x.judge}`).join(', ');
    const gongLine=(a.natal.gongmang||[]).length?`공망 지지: ${gmNote}. 원국에 공망이 있습니다: ${(a.natal.gongmang||[]).map(x=>`${x.pos} ${x.b}, ${x.meaning}`).join(' · ')}.`:`공망 지지: ${gmNote}. 원국에는 공망 지지가 없습니다. 세운·대운·월운의 지지가 이 자리에 오면 공망으로 표시합니다.`;
    return `<article id="reading-fun-all" class="reading-card"><span>풀이</span><h3>종합 총평</h3>`
      + SECTION('종합 총평', summary)
      + SECTION('성격', personality)
      + SECTION('십성 해석 (강약 기준)', tenParts.join(' '))
      + SECTION('재물', wealthText)
      + SECTION('직업·적성', careerText)
      + SECTION('연애·배우자', loveText)
      + SECTION('건강', healthText)
      + SECTION('원국 관계', natalLines.length?natalLines.join(' · '):'형·파·해·원진·귀문·합·충 관계가 원국에 없습니다.')
      + SECTION('신살', sinsalLine+'. 12신살(년지 기준): '+twelveLine)
      + SECTION('공망', gongLine)
      + SECTION(daeunTitle, cycleLines.map((l,i)=>`${i+1}. ${l}`).join('<br>')+'<br>'+curText)
      + SECTION('세운', yearText||'세운 정보가 없습니다.')
      + SECTION(`월운 (${data.extras.year}년 기준 12달)`, monthLines.join('<br>')+`<br>좋은 달: ${goodMonths||'없음'}`)
      + `</article>`;
  }
  return {build};
});
