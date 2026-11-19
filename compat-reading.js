(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CompatReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 궁합 풀이: 두 명식(엔진 결과)의 일간, 일지, 연지, 오행 분포, 용신, 월지 본기를 비교한다.
  // 전통 상징과 관례를 설명하는 참고 풀이다. 좋고 나쁨을 판정하거나 관계의 결과를 예측하지 않는다.
  // 확정되지 않은 기둥은 쓰지 않고 보류로 표시한다. 화면과 Markdown이 같은 결과를 쓴다.
  const STEMS='甲乙丙丁戊己庚辛壬癸';
  const KOS={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const KOB={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const EL=['목','화','토','금','수'];
  const EL_IDX={甲:0,乙:0,丙:1,丁:1,戊:2,己:2,庚:3,辛:3,壬:4,癸:4};
  const HIDDEN={子:'壬癸',丑:'癸辛己',寅:'戊丙甲',卯:'甲乙',辰:'乙癸戊',巳:'戊庚丙',午:'丙己丁',未:'丁乙己',申:'戊壬庚',酉:'庚辛',戌:'辛丁戊',亥:'戊甲壬'};
  const HAP_STEM={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  const TEN_PAIR=[['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
  const GROUP_OF={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
  // 지지 관계표. analysis.js의 PAIRS와 같은 정의다. 자형은 辰·午·酉·亥가 같은 지지끼리 만날 때만 본다.
  const BR_PAIRS={
    육합:['子丑','寅亥','卯戌','辰酉','巳申','午未'],
    충:['子午','丑未','寅申','卯酉','辰戌','巳亥'],
    형:['寅巳','巳申','申寅','丑戌','戌未','未丑','子卯'],
    파:['子酉','丑辰','寅亥','卯午','巳申','未戌'],
    해:['子未','丑午','寅巳','卯辰','申亥','酉戌'],
    원진:['子未','丑午','寅酉','卯申','辰亥','巳戌'],
    귀문:['子酉','丑午','寅未','卯申','辰亥','巳戌']
  };
  const SELF_HYUNG=['辰','午','酉','亥'];
  const SAMHAP=[['申','子','辰','수'],['亥','卯','未','목'],['寅','午','戌','화'],['巳','酉','丑','금']];
  const josa=(w,b,p)=>{ const c=String(w).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?b:p; };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nm=s=>`${KOS[s]}(${s})`;
  const bnm=b=>`${KOB[b]}(${b})`;

  // 일간 A가 본 B의 십성 (엔진과 같은 규칙)
  function tenOf(d,s){ const a=EL_IDX[d], b=EL_IDX[s]; const same=STEMS.indexOf(d)%2===STEMS.indexOf(s)%2; return TEN_PAIR[(b-a+5)%5][same?0:1]; }
  const gen=e=>EL[(EL.indexOf(e)+1)%5], ctl=e=>EL[(EL.indexOf(e)+2)%5];

  // 두 지지 사이의 관계 종류
  function branchRels(x,y){
    if(x===y) return SELF_HYUNG.includes(x)?['자형']:[];
    const out=[];
    for(const [k,list] of Object.entries(BR_PAIRS)) if(list.includes(x+y)||list.includes(y+x)) out.push(k);
    return out;
  }
  // 두 지지가 같은 삼합 안에 두 글자 있을 때(반합)
  function samhapPart(x,y){
    if(x===y) return null;
    for(const [a,b,c,el] of SAMHAP){ const set=[a,b,c]; if(set.includes(x)&&set.includes(y)){ const miss=set.find(s=>s!==x&&s!==y); return {element:el,missing:miss}; } }
    return null;
  }

  const DAY_VIEW={
    비견:'대등한 동료처럼 편하게 어울리는 사이로 보입니다. 서로의 영역을 존중하면 편안하고, 같은 고집이 부딪히기도 합니다.',
    겁재:'서로 자극을 주고받으며 힘겨루기처럼 느껴지기 쉬운 사이로 보입니다. 경계를 말로 정하면 오히려 가까워지기 쉽습니다.',
    식신:'상대의 편안함을 챙기고 표현을 받아 주는 사이로 보입니다. 함께 먹고 쉬는 일상에서 정이 쌓이기 쉽습니다.',
    상관:'솔직하게 지적하고 새로운 생각을 던지는 사이로 보입니다. 말의 온도를 맞추면 자극이 도움이 됩니다.',
    편재:'활동 범위를 넓혀 주고 기회를 함께 보는 사이로 보입니다. 상대의 사교 범위를 존중하는 것이 중요합니다.',
    정재:'안정감을 주고 생활 계획을 함께 세우는 성실한 사이로 보입니다. 약속과 계획이 편안함의 바탕이 됩니다.',
    편관:'긴장감과 추진력을 주고받는 사이로 보입니다. 주도권을 나누면 서로를 밀어 주는 힘이 됩니다.',
    정관:'규칙과 책임을 함께 지키는 사이로 보입니다. 기준을 미리 맞추면 신뢰가 쌓이기 쉽습니다.',
    편인:'독특한 관점과 관심사를 나누는 사이로 보입니다. 각자의 시간을 인정하면 거리감이 줄어듭니다.',
    정인:'보살피고 배움을 주고받는 사이로 보입니다. 도움을 받는 쪽과 주는 쪽의 균형이 관계의 결을 정합니다.'
  };
  const BR_TXT={
    육합:'가까워지면 마음을 쉽게 여는 편으로 읽습니다. 함께 쉬고 나누는 시간이 자연스럽게 이어지기 쉽습니다.',
    충:'생활 리듬과 가치관이 자주 부딪히는 편으로 읽습니다. 충은 전통 관계 표식이며, 부딪힘의 크기는 두 사람의 생활 방식에 달려 있습니다.',
    형:'작은 말과 습관에서 서운함이 쌓이기 쉬운 편으로 읽습니다. 불편을 짧게 그때그때 말하는 것이 도움이 됩니다.',
    파:'관계의 리듬이 어긋나기 쉬운 편으로 읽습니다. 서로 맞춰 가는 대화가 필요합니다.',
    해:'속마음을 말하지 않아 오해가 생기기 쉬운 편으로 읽습니다. 생각을 소리 내어 확인하는 습관이 도움이 됩니다.',
    원진:'서로 예민하게 느끼는 부분이 있어 감정의 결이 엇갈리기 쉬운 편으로 읽습니다.',
    귀문:'생각이 많아 걱정을 상대에게 충분히 전하지 못하기 쉬운 편으로 읽습니다.',
    자형:'같은 지지가 겹쳐 같은 주제에서 같은 고민을 반복하기 쉬운 편으로 읽습니다.'
  };
  const LIGHT_TXT={
    육합:'띠가 잘 어울린다고 보는 전통 관례가 있습니다. 가볍게 참고하세요.',
    충:'띠가 맞부딪힌다고 보는 전통 관례가 있습니다. 사소한 차이를 가볍게 넘기면 좋다는 정도로 참고하세요.',
    형:'띠 사이에 형의 표식이 있어 사소한 어긋남을 가볍게 짚어 볼 만하다고 봅니다.',
    파:'띠 사이에 파의 표식이 있어 생활 리듬을 조금 맞춰 볼 만하다고 봅니다.',
    해:'띠 사이에 해의 표식이 있어 말을 아끼는 부분을 조금 살펴볼 만하다고 봅니다.',
    원진:'띠 사이에 원진의 표식이 있어 예민한 부분을 가볍게 짚어 볼 만하다고 봅니다.',
    귀문:'띠 사이에 귀문의 표식이 있어 생각을 조금 나누어 볼 만하다고 봅니다.',
    자형:'띠가 같아 비슷한 고민을 함께 나누기 쉽다고 봅니다.'
  };
  const COMM={
    비견:{think:'자기 근거를 스스로 검토한 뒤 결론을 받아들이는 편입니다.',express:'자기 입장을 그대로 드러내는 방식으로 말합니다.',tip:'결정 전에 각자의 근거를 한 줄씩 적어 보세요.'},
    겁재:{think:'여러 의견을 부딪히게 하며 생각을 시험해 보는 편입니다.',express:'의견을 힘 있게 말하며 겨루듯 드러내는 방식입니다.',tip:'의견이 갈릴 때 바로 맞서기보다 하루 쉬고 다시 이야기하세요.'},
    식신:{think:'생각을 차곡차곡 쌓아 결과물로 옮기는 편입니다.',express:'차분하게 만들어 보여 주는 방식으로 표현합니다.',tip:'함께 만들거나 준비하는 시간을 정기적으로 두면 좋습니다.'},
    상관:{think:'기존 방식의 빈틈을 찾아 질문하면서 생각을 다듬는 편입니다.',express:'날카롭게 질문하고 개선을 말하는 방식으로 표현합니다.',tip:'지적하기 전에 장점을 먼저 말하면 전달이 부드러워집니다.'},
    편재:{think:'여러 사람과 대화하며 생각을 넓게 펼쳐 보는 편입니다.',express:'기회 중심으로 넓게 말하는 방식으로 표현합니다.',tip:'함께 쓰는 비용과 일정을 미리 한 장에 모아 보세요.'},
    정재:{think:'계획과 숫자를 근거로 차분히 정리하는 편입니다.',express:'구체적인 수치와 일정으로 말하는 방식으로 표현합니다.',tip:'주간 계획을 함께 보며 역할을 나누세요.'},
    편관:{think:'압박 속에서 우선순위를 가려 결론을 밀어붙이는 편입니다.',express:'짧고 단호하게 목표를 밝히는 방식으로 표현합니다.',tip:'결정의 마감과 책임 범위를 함께 정해 두세요.'},
    정관:{think:'원칙과 기준을 먼저 떠올려 생각을 정리하는 편입니다.',express:'규칙과 약속을 근거로 차분하게 말합니다.',tip:'지키기로 한 약속은 목록으로 만들어 공유하세요.'},
    편인:{think:'남들이 보지 않는 자료를 파고들어 혼자 관점을 세우는 편입니다.',express:'자료와 근거를 깊이 다뤄 독특한 관점으로 표현합니다.',tip:'각자 깊이 파고드는 시간을 인정하고, 결과만 나눠 보세요.'},
    정인:{think:'배움과 공식 기준을 빌려 와 생각을 정리하는 편입니다.',express:'배운 지식을 근거로 차분히 설명하는 방식입니다.',tip:'상대에게 배운 것을 짧게 되돌려 나누면 서로 배우는 흐름이 생깁니다.'}
  };

  // 명식 한쪽의 확정된 글자 오행 개수
  function countEl(P){ const c={목:0,화:0,토:0,금:0,수:0}; P.forEach(p=>{ if(!p) return; c[p.stemElement]++; c[p.branchElement]++; }); return c; }
  const fmtCount=c=>EL.map(e=>`${e} ${c[e]}`).join(' · ');
  const unknownLabel=(P)=>['연주','월주','일주','시주'].filter((_,i)=>!P[i]);

  function build(A,B,opts={}){
    const LA=opts.labelA||'첫 번째 사람', LB=opts.labelB||'두 번째 사람';
    if(!A||!A.pillars||!A.pillars[2]) return {available:false,reason:`${LA}의 일주가 확정되지 않아 궁합 풀이를 제공하지 않습니다.`,sections:[],notes:[]};
    if(!B||!B.pillars||!B.pillars[2]) return {available:false,reason:`${LB}의 일주가 확정되지 않아 궁합 풀이를 제공하지 않습니다.`,sections:[],notes:[]};
    const PA=A.pillars, PB=B.pillars, dA=PA[2], dB=PB[2], sA=dA.stem, sB=dB.stem;
    const eA=dA.stemElement, eB=dB.stemElement;
    const notes=[];
    const missA=unknownLabel(PA), missB=unknownLabel(PB);
    if(missA.length) notes.push(`${LA}${josa(LA,'은','는')} ${missA.join('·')}${josa(missA[missA.length-1],'이','가')} 확정되지 않아 그 기둥을 쓰는 풀이를 보류했습니다.`);
    if(missB.length) notes.push(`${LB}${josa(LB,'은','는')} ${missB.join('·')}${josa(missB[missB.length-1],'이','가')} 확정되지 않아 그 기둥을 쓰는 풀이를 보류했습니다.`);
    const goods=[], adjusts=[];
    const sections=[];

    // 1. 일간 관계
    const dayP=[];
    let dayRelWord='';
    if(eA===eB){ dayRelWord='비화'; dayP.push(`두 사람의 일간은 모두 ${eA} 기운이라 기질의 결이 가까운 편입니다.`); goods.push('일간의 기운이 같은 결이라 기질이 가까운 편입니다'); }
    else if(gen(eA)===eB){ dayRelWord='상생'; dayP.push(`${LA}의 ${eA} 기운이 ${eB} 기운을 키워 주는 상생 관계입니다.`); goods.push(`${LA}의 ${eA} 기운이 ${LB}의 ${eB} 기운을 키워 주는 상생입니다`); }
    else if(gen(eB)===eA){ dayRelWord='상생'; dayP.push(`${LB}의 ${eB} 기운이 ${eA} 기운을 키워 주는 상생 관계입니다.`); goods.push(`${LB}의 ${eB} 기운이 ${LA}의 ${eA} 기운을 키워 주는 상생입니다`); }
    else if(ctl(eA)===eB){ dayRelWord='상극'; dayP.push(`${LA}의 ${eA} 기운이 ${eB} 기운을 누르는 상극 관계입니다. 힘의 방향이 한쪽으로 기울면 조율이 필요합니다.`); adjusts.push(`${LA}의 ${eA} 기운이 ${LB}의 ${eB} 기운을 누르는 상극이라 힘의 방향을 나누어 볼 필요가 있습니다`); }
    else { dayRelWord='상극'; dayP.push(`${LB}의 ${eB} 기운이 ${eA} 기운을 누르는 상극 관계입니다. 힘의 방향이 한쪽으로 기울면 조율이 필요합니다.`); adjusts.push(`${LB}의 ${eB} 기운이 ${LA}의 ${eA} 기운을 누르는 상극이라 힘의 방향을 나누어 볼 필요가 있습니다`); }
    if(HAP_STEM[sA]===sB){ dayP.push(`일간 ${nm(sA)}${josa(KOS[sA],'과','와')} ${nm(sB)}${josa(KOS[sB],'은','는')} 천간합으로 묶입니다. 서로 끌리는 기운이 있는 편으로 읽으며, 유불리는 붙이지 않습니다.`); goods.push('일간이 천간합으로 묶여 서로 끌리는 기운이 있습니다'); }
    dayP.push(`${LA}에게 ${LB}${josa(LB,'은','는')} ${tenOf(sA,sB)} 기운으로 다가옵니다. ${DAY_VIEW[tenOf(sA,sB)]}`);
    dayP.push(`${LB}에게 ${LA}${josa(LA,'은','는')} ${tenOf(sB,sA)} 기운으로 다가옵니다. ${tenOf(sB,sA)===tenOf(sA,sB)?`${LB} 쪽에서도 같은 결의 기운이 느껴져 두 사람이 비슷하게 받아들이는 편입니다.`:DAY_VIEW[tenOf(sB,sA)]}`);
    sections.push({key:'day',title:'1. 일간 관계',summary:`일간 ${eA}·${eB}의 ${dayRelWord} 관계와 서로를 보는 십성`,paragraphs:dayP,
      evidence:[`${LA} 일간 ${dA.hanja}(${dA.hangul})`,`${LB} 일간 ${dB.hanja}(${dB.hangul})`,`오행 ${eA}·${eB} ${dayRelWord}`,`${LA}에게 ${tenOf(sA,sB)}, ${LB}에게 ${tenOf(sB,sA)}`]});

    // 2. 일지 관계 (배우자궁)
    const bA=dA.branch, bB=dB.branch;
    const spKinds=branchRels(bA,bB), spSam=samhapPart(bA,bB);
    const spP=[`${LA}의 일지는 ${bnm(bA)}, ${LB}의 일지는 ${bnm(bB)}입니다. 일지는 배우자 자리로 보는 관례에 따릅니다.`];
    if(bA===bB && !spKinds.length) spP.push(`두 일지가 같아 배우자 자리의 기운이 같은 결로 겹칩니다.`);
    spKinds.forEach(k=>{ spP.push(`두 일지 사이에 ${k} 표식이 있습니다. ${BR_TXT[k]}`); if(k==='육합') goods.push('두 일지가 육합으로 묶여 가까워지면 마음을 쉽게 여는 편입니다'); else adjusts.push(`두 일지 사이의 ${k} 표식은 생활 방식의 차이를 함께 조율할 지점으로 읽습니다`); });
    if(spSam) spP.push(`두 일지는 ${spSam.element} 기운의 삼합에서 두 글자로, 나머지 ${bnm(spSam.missing)}이 빠져 있습니다. 같은 목표를 향해 움직이기 쉬운 편으로 읽으며, 합이 완성되지는 않습니다.`);
    if(!spKinds.length && !spSam && bA!==bB) spP.push('두 일지 사이에 육합·충·형·파·해·원진·귀문 표식이 없어, 배우자 자리의 기운이 특별히 부딪히지 않는 편으로 읽습니다.');
    sections.push({key:'spouse',title:'2. 일지 관계 · 배우자궁',summary:spKinds.length?`두 일지 사이의 ${spKinds.join('·')} 표식`:'두 일지 사이의 관계 표식',paragraphs:spP,
      evidence:[`일지 ${bA}·${bB}`,spKinds.length?`관계 ${spKinds.join('·')}`:'관계 없음',spSam?`반합 ${spSam.element}`:'반합 없음']});

    // 3. 띠(연지) 관계: 연주가 확정된 경우만
    const zodP=[];
    if(!PA[0]||!PB[0]){ zodP.push(`${!PA[0]?LA:LB}의 연주가 확정되지 않아 띠 관계는 보류합니다.`); }
    else{
      const yA=PA[0].branch, yB=PB[0].branch;
      const zk=branchRels(yA,yB), zs=samhapPart(yA,yB);
      zodP.push(`두 사람의 띠는 ${KOB[yA]}(${yA})띠와 ${KOB[yB]}(${yB})띠입니다. 연지는 가볍게 참고하는 자리입니다.`);
      if(!zk.length&&!zs) zodP.push('띠 사이에 육합·충·형·파·해·원진·귀문 표식이 없습니다.');
      zk.forEach(k=>zodP.push(LIGHT_TXT[k]));
      if(zs) zodP.push(`띠가 ${zs.element} 기운의 삼합 중 두 글자입니다. 가볍게 같은 방향을 보는 관례로 참고하세요.`);
    }
    sections.push({key:'zodiac',title:'3. 띠 관계 · 연지',summary:'연지로 본 띠 관계를 가볍게 참고합니다',paragraphs:zodP,
      evidence:[PA[0]&&PB[0]?`연지 ${PA[0].branch}·${PB[0].branch}`:'연지 미확정(보류)']});

    // 4. 오행 보완
    const cA=countEl(PA), cB=countEl(PB);
    const fillA=EL.filter(e=>cA[e]>0&&cB[e]===0), fillB=EL.filter(e=>cB[e]>0&&cA[e]===0), bothLack=EL.filter(e=>cA[e]===0&&cB[e]===0);
    const elP=[`${LA}의 확정된 오행은 ${fmtCount(cA)}이고, ${LB}는 ${fmtCount(cB)}입니다.`];
    if(fillA.length){ elP.push(`${LA}의 ${fillA.join('·')} 기운이 ${LB}에게는 없는 빈 자리를 채우는 편으로 읽습니다.`); goods.push(`${LA}의 ${fillA.join('·')} 기운이 ${LB}의 빈 자리를 채웁니다`); }
    if(fillB.length){ elP.push(`${LB}의 ${fillB.join('·')} 기운이 ${LA}에게는 없는 빈 자리를 채우는 편으로 읽습니다.`); goods.push(`${LB}의 ${fillB.join('·')} 기운이 ${LA}의 빈 자리를 채웁니다`); }
    if(!fillA.length&&!fillB.length) elP.push('서로의 빈 오행을 채우는 관계가 뚜렷하지 않습니다.');
    if(bothLack.length) { elP.push(`두 사람 모두에게 없는 ${bothLack.join('·')} 기운은 함께 채워 가야 할 생활 주제로 읽습니다.`); adjusts.push(`두 사람 모두에게 없는 ${bothLack.join('·')} 기운은 함께 보완할 생활 주제입니다`); }
    sections.push({key:'element',title:'4. 오행 보완',summary:'한쪽의 넘치는 기운이 다른 쪽의 빈 기운을 채우는지 봅니다',paragraphs:elP,
      evidence:[`${LA} ${fmtCount(cA)}`,`${LB} ${fmtCount(cB)}`,`채움 ${[...fillA.map(e=>`${LA}→${e}`),...fillB.map(e=>`${LB}→${e}`)].join(' · ')||'없음'}`]});

    // 5. 용신 보완
    const yA=A.analysis&&A.analysis.yong?A.analysis.yong:null, yB=B.analysis&&B.analysis.yong?B.analysis.yong:null;
    const yP=[];
    const yongLine=(X,LX,Y,LY,yX,cY)=>{
      if(!yX){ const st=(X.analysis&&X.analysis.status)==='갈림'?'갈림':'보류'; return `${LX}의 용신은 ${st} 상태라 하나로 정하지 않아, ${LY}의 명식이 ${LX}의 용신을 얼마나 채우는지는 보류합니다.`; }
      const n=cY[yX];
      const hee=X.analysis&&X.analysis.bu&&X.analysis.bu.희?X.analysis.bu.희:null;
      return `${LX}의 용신은 ${yX} 기운입니다. ${LY}의 명식에는 ${yX} 기운이 ${n}개 있어 ${n?`${LX}에게 도움이 되는 기운을 ${LY}에게서 얻는 편으로 읽습니다.`:`${LY}에게서 얻는 도움은 적은 편으로 읽습니다.`}${hee?` ${LX}의 희신 ${hee} 기운은 ${LY}의 명식에 ${cY[hee]}개 있습니다.`:''}`;
    };
    yP.push(yongLine(A,LA,B,LB,yA,cB));
    yP.push(yongLine(B,LB,A,LA,yB,cA));
    if(yA&&cB[yA]) goods.push(`${LB}의 명식에 ${LA}의 용신 ${yA} 기운이 있습니다`);
    if(yB&&cA[yB]) goods.push(`${LA}의 명식에 ${LB}의 용신 ${yB} 기운이 있습니다`);
    if(!yA||!yB) yP.push('용신이 하나로 정해진 쪽만 용신 기준으로 봅니다. 나머지는 보류로 둡니다.');
    sections.push({key:'yong',title:'5. 용신 보완',summary:yA||yB?'각자의 용신을 상대의 명식이 얼마나 채우는지 봅니다':'용신이 정해지지 않아 보류',paragraphs:yP,
      evidence:[`${LA} 용신 ${yA||'보류'}`,`${LB} 용신 ${yB||'보류'}`]});

    // 6. 소통·생활 방식 차이 (월지 본기 십성)
    const monthTen=(P,d)=>{ if(!P[1]) return null; const h=P[1].hidden; return h&&h.length?h[h.length-1].ten:null; };
    const tA=monthTen(PA,dA), tB=monthTen(PB,dB);
    const cmP=[];
    if(tA) cmP.push(`${LA}는 월지 ${bnm(PA[1].branch)}의 본기 ${tA} 결로 ${COMM[tA].think} ${COMM[tA].express}`); else cmP.push(`${LA}는 월주가 확정되지 않아 월지 본기 기준의 소통 방식은 보류합니다.`);
    if(tB) cmP.push(`${LB}는 월지 ${bnm(PB[1].branch)}의 본기 ${tB} 결로 ${COMM[tB].think} ${COMM[tB].express}`); else cmP.push(`${LB}는 월주가 확정되지 않아 월지 본기 기준의 소통 방식은 보류합니다.`);
    if(tA&&tB){
      if(GROUP_OF[tA]===GROUP_OF[tB]) cmP.push(`두 사람의 바탕이 같은 ${GROUP_OF[tA]} 계열이라 표현 방식이 비슷하지만, 같은 방식이 서로의 약점이 되기도 합니다.`);
      else { cmP.push(`${GROUP_OF[tA]} 계열과 ${GROUP_OF[tB]} 계열로 결이 달라, 생각을 전하는 순서와 속도가 다를 수 있습니다.`); adjusts.push(`소통 방식이 ${GROUP_OF[tA]} 계열과 ${GROUP_OF[tB]} 계열로 달라 전하는 순서를 맞출 필요가 있습니다`); }
      cmP.push(`생활 팁: ${COMM[tA].tip} ${COMM[tB].tip}`);
    }
    sections.push({key:'comm',title:'6. 소통·생활 방식 차이',summary:'월지 본기 십성으로 본 생각과 표현의 결',paragraphs:cmP,
      evidence:[tA?`${LA} 월지 본기 ${tA}`:`${LA} 월지 미확정`,tB?`${LB} 월지 본기 ${tB}`:`${LB} 월지 미확정`]});

    // 7. 종합
    const sumP=[];
    sumP.push(goods.length?`잘 맞는 점은 다음과 같습니다. ${goods.map(g=>g+'.').join(' ')}`:'뚜렷하게 드러난 잘 맞는 표식은 적은 편입니다.');
    sumP.push(adjusts.length?`서로 조율할 점은 다음과 같습니다. ${adjusts.map(g=>g+'.').join(' ')}`:'뚜렷하게 조율이 필요한 표식은 적은 편입니다.');
    sumP.push(`이 궁합은 좋고 나쁨을 가르는 판정이 아니라, 맞닿는 지점과 조율할 지점을 나누어 보는 참고 풀이입니다. 일간은 ${dayRelWord} 관계, 일지는 ${spKinds.length?spKinds.join('·')+' 표식':'표식 없음'}으로 읽었습니다.`);
    sumP.push('궁합은 전통 상징과 관례를 바탕으로 한 참고 풀이입니다. 실제 관계의 결과를 예측하지 않으며, 대화와 생활 방식에 따라 달라질 수 있습니다.');
    sections.push({key:'summary',title:'7. 종합',summary:'맞닿는 점과 조율할 점을 함께 보는 종합 풀이',paragraphs:sumP,
      evidence:['일간·일지·오행·용신·소통 항목 종합']});

    return {available:true,reason:'',sections,notes};
  }
  function toHtml(c){
    if(!c.available) return `<div id="compat-result" class="theme"><b>궁합 풀이</b><p>${esc(c.reason)}</p></div>`;
    const blocks=c.sections.map(s=>`<div id="compat-${s.key}" class="theme deep-section"><b>${esc(s.title)} · ${esc(s.summary)}</b>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<small>근거: ${s.evidence.map(esc).join(' · ')}</small></div>`).join('');
    const notes=c.notes.map(n=>`<p class="reading-note">${esc(n)}</p>`).join('');
    return `<div id="compat-result" class="profile-block">${blocks}${notes}</div>`;
  }
  function toMarkdown(c){
    if(!c.available) return ['## 궁합 풀이','',c.reason];
    const lines=['## 궁합 풀이',''];
    for(const s of c.sections){ lines.push(`### ${s.title}`,'',`**${s.summary}**`,''); s.paragraphs.forEach(p=>lines.push(p,'')); lines.push(`근거: ${s.evidence.join(' · ')}`,''); }
    c.notes.forEach(n=>lines.push(n,''));
    return lines;
  }
  return {build,toHtml,toMarkdown,tenOf,BR_PAIRS,branchRels};
});
