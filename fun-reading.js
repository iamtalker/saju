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
  const TEN_TOPIC={
    비견:'자기 주도와 독립',겁재:'경쟁과 자원 나눔',식신:'표현과 꾸준한 생산',상관:'새로운 관점과 말하기',
    편재:'기회와 넓은 활동',정재:'계획과 안정적인 관리',편관:'도전과 압박 속 추진',정관:'질서와 책임',
    편인:'독특한 탐구와 관점',정인:'배움과 지지'
  };
  const JOB={
    식신:'기획, 창작, 교육, 콘텐츠 제작',상관:'기획, 홍보, 설계, 말과 글을 다루는 일',
    편재:'영업, 무역, 투자 관련 업무, 사업',정재:'회계, 재무, 행정, 관리 업무',
    편관:'위기관리, 법률, 무관, 현장 책임이 큰 일',정관:'공공 행정, 조직의 관리직, 규칙을 다루는 일',
    편인:'연구, 분석, 기술, 독자적 전문직',정인:'교육, 연구, 상담, 지원 업무',
    비견:'독립 사업, 전문직, 자기 브랜드를 세우는 일',겁재:'경쟁이 있는 영업과 승부가 있는 일'
  };
  const LOVE_BY_JIJI={
    '자':'감정 표현이 조용하지만 깊은 편입니다.','축':'천천히 신뢰를 쌓는 편입니다.',
    '인':'호기심이 많고 먼저 움직이는 편입니다.','묘':'다정하게 챙기는 편입니다.',
    '진':'변화가 많은 관계를 겪기 쉽습니다.','사':'생각이 많고 신중한 편입니다.',
    '오':'열정적이고 표현이 분명한 편입니다.','미':'편안하고 안정적인 관계를 좋아합니다.',
    '신':'재치 있는 대화를 즐기는 편입니다.','유':'기준이 분명하고 깔끔한 편입니다.',
    '술':'의리를 중요하게 여기는 편입니다.','해':'마음을 열면 깊이 빠지는 편입니다.'
  };
  const SPOUSE_TEN={
    비견:'배우자 자리에 비겁이 있어 대등한 관계를 원하는 편입니다.',
    겁재:'배우자 자리에 겁재가 있어 경쟁과 협력이 함께 있는 관계입니다.',
    식신:'배우자 자리에 식신이 있어 편안하게 즐기는 관계를 찾는 편입니다.',
    상관:'배우자 자리에 상관이 있어 말이 잘 통하는 관계를 중시합니다.',
    편재:'배우자 자리에 편재가 있어 활동적인 상대와 맞는 편입니다.',
    정재:'배우자 자리에 정재가 있어 현실적이고 성실한 상대와 맞습니다.',
    편관:'배우자 자리에 편관이 있어 강하게 이끄는 상대에게 끌리는 편입니다.',
    정관:'배우자 자리에 정관이 있어 책임감 있는 상대와 맞는 편입니다.',
    편인:'배우자 자리에 편인이 있어 독특한 관점을 가진 상대와 맞는 편입니다.',
    정인:'배우자 자리에 정인이 있어 돌봄과 지지를 주고받는 관계가 맞는 편입니다.'
  };
  const KOS={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const KOB={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const josa=(word,b,p)=>{ const c=String(word).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?b:p; };
  const stemLabel=h=>`${KOS[h]}(${h})`;
  const branchLabel=h=>`${KOB[h]}(${h})`;
  const SECTION=(title,body)=>`<div class="theme"><b>${title}</b><p>${body}</p></div>`;
  const EL_NAME={목:'목',화:'화',토:'토',금:'금',수:'수'};

  function sipsinCount(data){
    const c={};
    const add=n=>{ if(n) c[n]=(c[n]||0)+1; };
    data.pillars.forEach((p,i)=>{ if(!p) return; if(i!==2) add(p.stemTen); const h=p.hidden; if(h&&h.length) add(h[h.length-1].ten); });
    return c;
  }
  function judgeText(j){ return j==='용신'?'용신':j==='희신'?'희신':j==='기신'?'기신':j==='한신'?'한신':j==='갈림'?'갈림':'중립'; }

  function build(data){
    const a=data.analysis;
    const day=data.pillars[2];
    if(!day||!a) return '';
    const dayChar=day.stem, dayEl=ELEM_OF[dayChar];
    const cnt=sipsinCount(data);
    const top=Object.entries(cnt).sort((x,y)=>y[1]-x[1]);
    const strongTen=top.filter(([,n])=>n>=2).map(([k])=>k);
    const missingTen=['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'].filter(k=>!cnt[k]);
    const wealth=(cnt['편재']||0)+(cnt['정재']||0);
    const officer=(cnt['편관']||0)+(cnt['정관']||0);
    const output=(cnt['식신']||0)+(cnt['상관']||0);
    const verdict=a.strength.verdict;
    const yongText=a.status==='갈림'?'용신을 하나로 정하지 않습니다':`용신은 ${a.yong}이고, 희신은 ${a.bu.희}, 기신은 ${a.bu.기.join('·')}입니다`;
    const gg=a.gyeokguk;
    const seasonText=`${a.season}에 태어났습니다`;
    const excess=a.natal.excess, lacking=a.natal.lacking;
    const excessText=excess.length?`${excess.join('·')}${josa(excess.join('·'),'이','가')} 많고`:'';
    const lackText=lacking.length?`${lacking.join('·')}${josa(lacking.join('·'),'이','가')} 없습니다`:'';
    // 종합 총평
    const summary=[
      `일간은 ${dayChar}(${dayEl})이고, ${seasonText}. ${DAY_TRAIT[dayChar]}`,
      `일간의 강약은 ${verdict}입니다. 득령·득지·득세 가운데 ${a.strength.hits}개가 충족됩니다.`,
      `격국은 ${gg.name}이며, ${gg.exposed?'월지의 십성이 천간에 드러나 있습니다':'천간에는 드러나 있지 않습니다'}.`,
      `${yongText}.`,
      lackText||excessText?`${excessText?excessText+' ':''}${lackText?lackText+'.':''}`.trim():'오행은 고르게 분포합니다.',
      a.jong.wealth?'재성이 많은데 일간이 약해 재성을 감당하는 것이 이 명식의 핵심 과제입니다.':a.jong.possible?'비겁과 인성이 지장간에만 있어 종격으로 보는 견해가 있습니다. 그 경우 용신이 반대가 됩니다.':'',
      a.note?a.note:''
    ].filter(Boolean).join(' ');
    // 성격
    const personality=`${DAY_TRAIT[dayChar]} 월지 십성은 ${gg.ten?TEN_TOPIC[gg.ten]:'미정'}${josa(gg.ten?TEN_TOPIC[gg.ten]:'미정','과','와')} 관련된 기운입니다.${strongTen.length?` 원국에 ${strongTen.map(k=>TEN_TOPIC[k]).join('·')} 기운이 두드러집니다.`:''}${missingTen.length>=6?' 드러난 십성이 적어 한 방향으로 쏠리기 쉽습니다.':''}`;
    // 재물
    const wealthText=(wealth===0?'재성이 없어 재물은 직접 다루기보다 다른 경로로 얻는 편입니다.':`재성이 ${wealth}개 있습니다.`)+(a.strength.verdict==='신약'&&wealth>=3?' 일간이 약해 재성이 많으면 재물을 감당하기 어렵습니다. 재물을 얻으려면 인성과 비겁의 도움을 받아야 합니다.':verdict==='신강'&&wealth>=1?' 일간이 강해 재물을 다룰 힘이 있습니다.':'');
    // 직업
    const careerKeys=[gg.ten,...strongTen].filter(Boolean);
    const careerText=`${[...new Set(careerKeys)].slice(0,3).map(k=>JOB[k]).filter(Boolean).join(', ')} 쪽이 적합합니다.${officer===0?' 관성이 없어 조직보다 독립적으로 움직이는 일이 맞습니다.':''}${output>=2?' 식상이 두드러져 표현과 기획에 강점이 있습니다.':''}`;
    // 연애
    const jiji=day.hangul[1];
    const dayBranchTen=day.hidden&&day.hidden.length?day.hidden[day.hidden.length-1].ten:null;
    const loveText=`${LOVE_BY_JIJI[jiji]||''}${dayBranchTen?` ${SPOUSE_TEN[dayBranchTen]||''}`:''}${(data.shinsal||[]).some(s=>s.name==='도화살')?' 원국에 도화 표식이 있어 이성의 관심을 받기 쉽습니다.':''}`;
    // 건강
    const healthText=(excess.length||lacking.length)?`${excess.length?`${excess.join('·')} 기운이 많아 ${excess.map(e=>ORGAN[e]).join('·')}을 살필 필요가 있습니다.`:''}${lacking.length?` ${lacking.join('·')} 기운이 없어 ${lacking.map(e=>ORGAN[e]).join('·')}의 기능이 약하기 쉽습니다.`:''}`.trim():'오행이 고르게 있어 특별히 치우친 부분이 드러나지 않습니다.';
    // 대운
    const cycleLines=a.cycles.map(c=>{
      const r=c.natalClashes&&c.natalClashes.length?` 원국 ${c.natalClashes.join('·')}와 충이 있습니다.`:'';
      return `${c.pillar} (만 ${c.fromAge}~${c.toAge}세): 천간 ${stemLabel(c.pillar[0])}${josa(KOS[c.pillar[0]],'은','는')} ${judgeText(c.stem)}, 지지 ${branchLabel(c.pillar[1])}${josa(KOB[c.pillar[1]],'은','는')} ${judgeText(c.branch)}입니다.${r}`;
    });
    const nowAge=Number(data.extras.year)-parseInt(String(data.solar).split('년')[0],10);
    const cur=a.cycles.find(c=>nowAge>=c.fromAge&&nowAge<=c.toAge);
    const curText=cur?`현재 대운은 ${cur.pillar}(만 ${cur.fromAge}~${cur.toAge}세)입니다. 천간 ${stemLabel(cur.pillar[0])}${josa(KOS[cur.pillar[0]],'은','는')} ${judgeText(cur.stem)}, 지지 ${branchLabel(cur.pillar[1])}${josa(KOB[cur.pillar[1]],'은','는')} ${judgeText(cur.branch)}입니다.`:'현재 나이에 해당하는 대운이 없습니다.';
    // 세운
    const yearLine=(y)=>{ const rel=[]; if(y.pairs.length) rel.push(...y.pairs.map(p=>`${p.pos}와 ${p.kinds.join('·')}`)); if(y.self&&y.self.length) rel.push(...y.self.map(p=>`${p}와 자형`)); if(y.stemHap&&y.stemHap.length) rel.push(...y.stemHap.map(p=>`${p}${josa(p,'과','와')} 천간합`)); return `${y.year}년 ${y.pillar}: 천간 ${stemLabel(y.pillar[0])}${josa(KOS[y.pillar[0]],'은','는')} ${judgeText(y.stem)}, 지지 ${branchLabel(y.pillar[1])}${josa(KOB[y.pillar[1]],'은','는')} ${judgeText(y.branch)}입니다. ${rel.length?'원국 '+rel.join(', ')+' 관계가 있습니다.':'원국과 충·합·형 관계가 없습니다.'}`; };
    const yearText=a.years.map(yearLine).join('<br>');
    // 월운
    const monthLines=a.months.map(m=>`${m.month}월 ${m.pillar}: 천간 ${KOS[m.pillar[0]]||m.pillar[0]} ${judgeText(m.stem)}, 지지 ${m.pillar[1]} ${judgeText(m.branch)} (점수 ${m.score>0?'+':''}${m.score}). ${m.good?'좋은 달':'보통 또는 주의하는 달'}.`);
    const goodMonths=a.months.filter(m=>m.good).map(m=>`${m.month}월`).join(' · ');
    const section=(t,b)=>SECTION(t,b);
    const natalLines=[];
    if(a.natal.relations.length) natalLines.push(...a.natal.relations.map(x=>`${x.positions} ${x.characters} ${x.kinds.join('·')}`));
    if(a.natal.stemRel.length) natalLines.push(...a.natal.stemRel.map(x=>`${x.positions} ${x.characters} 천간합`));
    const sinsalLine=(a.natal.sinsal||[]).map(s=>`${s.name} ${s.positions}`).join(' · ')||'특수 신살은 없습니다';
    const twelveLine=(a.natal.twelve||[]).map(t=>`${t.pos} ${t.b} ${t.name}`).join(' · ');
    const gongLine=(a.natal.gongmang||[]).map(g=>`${g.pos} ${g.b}: ${g.meaning}`).join(' · ')||'원국에 공망이 없습니다.';
    return `<article id="reading-fun-all" class="reading-card"><span>풀이</span><h3>종합 총평</h3>`
      + section('종합 총평', summary)
      + section('성격', personality)
      + section('재물', wealthText)
      + section('직업·적성', careerText)
      + section('연애·배우자', loveText)
      + section('건강', healthText)
      + section('원국 관계', natalLines.length?natalLines.join(' · '):'형·파·해·원진·귀문·합·충 관계가 원국에 없습니다.')
      + section('신살', sinsalLine+'. 12신살(년지 기준): '+twelveLine)
      + section('공망', gongLine)
      + section('대운', cycleLines.join('<br>')+'<br>'+curText)
      + section('세운', yearText||'세운 정보가 없습니다.')
      + section('월운 (2026년 기준 12달)'.replace('2026년 기준',`${data.extras.year}년 기준`), monthLines.join('<br>')+`<br>좋은 달: ${goodMonths||'없음'}`)
      + `</article>`;
  }
  return {build};
});
