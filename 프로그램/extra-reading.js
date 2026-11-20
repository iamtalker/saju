(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ExtraReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 추가 풀이: 한눈에 보는 요약, 오늘의 운세, 신년운세, 직업군 예시, 용어 풀이.
  // 계산 결과(data.extras, data.analysis)를 읽기만 하고 판정을 새로 만들지 않는다.
  // 확정되지 않은 기둥(data.pillars[i] === null)은 쓰지 않으며, 판단이 정해지지 않으면 '보류'로 적는다.
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const josa=(w,b,p)=>{ const c=String(w).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?b:p; };
  const KOS={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const KOB={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const STEM_EL={甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수'};
  const BR_EL={子:'수',丑:'토',寅:'목',卯:'목',辰:'토',巳:'화',午:'화',未:'토',申:'금',酉:'금',戌:'토',亥:'수'};
  const STEM_META={甲:'큰 나무',乙:'풀과 덩굴',丙:'태양',丁:'등불',戊:'큰 산',己:'밭과 흙',庚:'단단한 쇠',辛:'세공된 금속',壬:'큰 물',癸:'비와 이슬'};
  const GROUP_OF={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
  // 십성 주제(명사구). 문장 안에서 "~의 주제는 ~입니다"로 쓴다.
  const TEN_THEME={
    비견:'자기 기준과 독립성', 겁재:'경쟁과 자원 나눔', 식신:'꾸준한 표현과 생산', 상관:'기존 방식에 대한 질문과 변화',
    편재:'넓은 기회와 활동', 정재:'계획적인 관리와 축적', 편관:'긴장된 과제와 추진력', 정관:'규칙과 사회적 책임',
    편인:'독특한 관점과 탐구', 정인:'배움과 기반 다지기'
  };
  // 용신·희신·기신 판정을 문장으로 옮긴 말. 기존 analysis.js의 판정 이름을 그대로 쓴다.
  const JUDGE_WORD={용신:'도움이 되는 흐름(용신)',희신:'받쳐 주는 흐름(희신)',기신:'부담이 되기 쉬운 흐름(기신)',한신:'방향이 뚜렷하지 않은 보조 흐름(한신)',중립:'두드러진 방향이 없는 흐름',갈림:'하나로 정하지 않은 흐름',보류:'보류'};
  const ROLE_WORD={용신:'용신 오행',희신:'희신 오행',기신:'기신 오행',한신:'한신 오행',중립:'중립 오행'};
  const BR_REL_WORD={
    육합:'가까운 관계가 자연스럽게 이어지기 쉬운 날로 읽습니다.',
    충:'생활의 리듬이 흔들리기 쉬운 날로 읽습니다(충은 전통적 관계 표식입니다).',
    형:'마찰과 조정이 따를 수 있는 날로 읽습니다.',
    자형:'마찰과 조정이 따를 수 있는 날로 읽습니다.',
    파:'계획이 어긋나기 쉬운 날로 읽습니다.',
    해:'작은 불편과 거리감이 생기기 쉬운 날로 읽습니다.',
    원진:'예민해지기 쉬운 날로 읽습니다.',
    귀문:'예민해지고 한 가지에 몰두하기 쉬운 날로 읽습니다.'
  };
  // 오늘 일진 십성별 맞는 일과 생활 팁. 같은 십성이라도 날마다 다른 문장을 쓰도록 한 가지씩만 둔다.
  const SUIT_BY_TEN={비견:'혼자 판단하고 끝까지 책임지는 일',겁재:'동료와 역할을 나눠 맡는 일',식신:'결과물을 차분히 만들어 쌓는 일',상관:'기존 절차의 빈틈을 찾아 제안하는 일',편재:'새 사람을 만나 기회를 살피는 일',정재:'예산과 일정을 꼼꼼히 정리하는 일',편관:'마감이 걸린 과제를 밀어붙이는 일',정관:'약속과 규칙을 다시 확인하는 일',편인:'자료를 깊이 조사하고 관점을 세우는 일',정인:'배우거나 조언을 구하는 일'};
  const TIP_BY_TEN={비견:'결정 하나를 내리기 전에 근거를 세 가지 적어 보세요.',겁재:'공동 비용이나 역할은 시작 전에 나누어 적어 두세요.',식신:'오늘 만든 것을 한 줄 메모로 남겨 두면 다음에 이어가기 쉽습니다.',상관:'새 아이디어는 바로 말하기보다 상대가 받아들일 순서를 먼저 생각해 보세요.',편재:'약속이나 지출이 많은 날이니 쓸 돈의 한도를 먼저 정해 두세요.',정재:'예산 항목 하나를 정해진 방식으로 점검해 보세요.',편관:'긴급도 순으로 할 일 세 가지만 고르고 나머지는 다음으로 넘겨 보세요.',정관:'미뤄 둔 약속이나 규칙 하나를 확인하고 바로 답해 보세요.',편인:'관심 주제의 자료를 두 곳 이상 비교하며 읽어 보세요.',정인:'믿을 만한 사람에게 짧은 조언을 한 번 구해 보세요.'};
  const POS_MEAN={연지:'주변 환경과 사회적 배경',월지:'일과 생활 환경',일지:'가까운 관계와 일상',시지:'개인 계획과 장기 목표'};
  const BR_POS=['연지','월지','일지','시지'];
  // 직업군 예시. 월지 본기 십성 묶음, 원국에서 가장 많이 보이는 묶음, 용신 오행에서 고른다. 직업을 정하는 근거가 아니다.
  const JOB_BY_GROUP={
    비겁:[{job:'1인 전문 서비스나 자영업',why:'자기 기준으로 결정하고 책임지는 독립성과 맞닿습니다.'},{job:'스포츠 코치·트레이너',why:'자기 기량으로 겨루고 협력하는 기운과 맞닿습니다.'},{job:'동업 파트너십 운영',why:'나눔과 경쟁의 경계를 정하는 역할과 맞닿습니다.'}],
    식상:[{job:'콘텐츠 기획·글쓰기',why:'생각을 결과물로 만들어 내는 기운과 맞닿습니다.'},{job:'강연·교육 콘텐츠 제작',why:'배운 것을 표현하고 나누는 흐름과 맞닿습니다.'},{job:'요리·공예 같은 제작 일',why:'손으로 결과물을 쌓아 가는 방식과 맞닿습니다.'}],
    재성:[{job:'영업·거래처 관리',why:'사람과 기회를 넓히고 자원을 다루는 기운과 맞닿습니다.'},{job:'재무·회계 계획',why:'숫자와 계획으로 자원을 관리하는 흐름과 맞닿습니다.'},{job:'부동산·자산 관리 보조',why:'가치 있는 자원을 운용하고 지키는 역할과 맞닿습니다.'}],
    관성:[{job:'행정·공공 기관 관리',why:'규칙과 절차 안에서 책임을 맡는 기운과 맞닿습니다.'},{job:'법무·규정 검토',why:'기준을 세우고 지키는 역할과 맞닿습니다.'},{job:'조직의 품질·안전 관리',why:'역할과 책임을 분명히 하는 흐름과 맞닿습니다.'}],
    인성:[{job:'교육·강의',why:'배움을 이어 주고 기준을 전하는 기운과 맞닿습니다.'},{job:'연구·데이터 분석',why:'관점을 깊이 파고드는 탐구의 흐름과 맞닿습니다.'},{job:'상담·코칭',why:'도움과 지지를 주고받는 기운과 맞닿습니다.'}]
  };
  const JOB_BY_EL={
    목:[{job:'출판·편집',why:'뻗고 자라는 목의 기운을 글과 기획으로 펼치는 일과 맞닿습니다.'},{job:'환경·식물 관련 연구',why:'성장과 순환을 살피는 목의 상징과 맞닿습니다.'},{job:'교육 콘텐츠 기획',why:'사람을 키우고 방향을 넓히는 목의 상징과 맞닿습니다.'}],
    화:[{job:'방송·영상 제작',why:'밝게 드러내고 널리 비추는 화의 상징과 맞닿습니다.'},{job:'무대·공연 기획',why:'사람들 앞에서 활기를 나누는 화의 상징과 맞닿습니다.'},{job:'디자인·조명 설계',why:'빛과 색으로 분위기를 만드는 화의 상징과 맞닿습니다.'}],
    토:[{job:'건축·부동산 개발 보조',why:'땅을 다지고 기반을 세우는 토의 상징과 맞닿습니다.'},{job:'농업·식품 유통',why:'기르고 거두는 토의 상징과 맞닿습니다.'},{job:'지역 행정·복지',why:'중심을 잡고 살피는 토의 상징과 맞닿습니다.'}],
    금:[{job:'기계·정밀 가공 엔지니어',why:'다듬고 기준을 세우는 금의 상징과 맞닿습니다.'},{job:'법률·감사 업무',why:'구분하고 정리하는 금의 상징과 맞닿습니다.'},{job:'의료기기·정밀 검사',why:'세부를 살피고 완성도를 높이는 금의 상징과 맞닿습니다.'}],
    수:[{job:'데이터·정보 기술',why:'흐름을 읽고 연결하는 수의 상징과 맞닿습니다.'},{job:'물류·여행 기획',why:'넓게 움직이고 이동하는 수의 상징과 맞닿습니다.'},{job:'해양·수산 관련 연구',why:'깊고 넓은 흐름을 탐구하는 수의 상징과 맞닿습니다.'}]
  };
  // 용어 풀이. 같은 항목을 화면의 용어 풀이, 툴팁(abbr), 요약 칩에 함께 쓴다.
  const GLOSSARY=[
    {term:'비견',desc:'일간과 같은 오행이고 음양도 같은 글자입니다. 자기 기준과 독립성을 상징합니다.'},
    {term:'겁재',desc:'일간과 같은 오행이지만 음양이 다른 글자입니다. 경쟁과 자원을 나누는 기운을 상징합니다.'},
    {term:'식신',desc:'일간이 생하는 오행이고 음양도 같은 글자입니다. 꾸준한 표현과 생산을 상징합니다.'},
    {term:'상관',desc:'일간이 생하는 오행이고 음양이 다른 글자입니다. 기존 방식에 질문하고 표현하는 기운을 상징합니다.'},
    {term:'편재',desc:'일간이 극하는 오행이고 음양도 같은 글자입니다. 넓은 활동과 기회를 상징합니다.'},
    {term:'정재',desc:'일간이 극하는 오행이고 음양이 다른 글자입니다. 계획적인 관리와 축적을 상징합니다.'},
    {term:'편관',desc:'일간을 극하는 오행이고 음양도 같은 글자입니다. 긴장된 과제와 도전, 압박을 상징합니다.'},
    {term:'정관',desc:'일간을 극하는 오행이고 음양이 다른 글자입니다. 규칙과 질서, 사회적 책임을 상징합니다.'},
    {term:'편인',desc:'일간을 생하는 오행이고 음양도 같은 글자입니다. 독특한 관점과 탐구를 상징합니다.'},
    {term:'정인',desc:'일간을 생하는 오행이고 음양이 다른 글자입니다. 배움과 도움, 기반을 상징합니다.'},
    {term:'용신',desc:'사주의 균형을 잡는 데 도움이 된다고 보는 오행입니다. 억부와 조후를 단순하게 적용해 정하며, 학파마다 다를 수 있습니다.'},
    {term:'희신',desc:'용신을 도와 힘을 보태는 오행입니다.'},
    {term:'기신',desc:'용신의 힘을 방해한다고 보는 오행입니다. 전통 해석에서 부담이 되는 기운으로 봅니다.'},
    {term:'한신',desc:'용신·희신·기신과 달리 방향이 뚜렷하지 않은 보조 오행입니다.'},
    {term:'신강·신약',desc:'일간의 힘이 강한지 약한지를 가리는 구분입니다. 점수가 아니라 득령·득지·득세 충족 개수로 정합니다.'},
    {term:'격국',desc:'월지 본기의 십성으로 정하는 사주의 틀입니다. 같은 십성이 천간에 드러나면 투출로 봅니다.'},
    {term:'조후',desc:'태어난 계절의 온기와 습기를 조절하는 오행을 가리키는 판정입니다.'},
    {term:'대운',desc:'10년 단위로 바뀌는 큰 흐름의 간지입니다. 시작 시점은 절입 간격으로 구한 근사값입니다.'},
    {term:'세운',desc:'해마다 바뀌는 연간지입니다. 연도의 흐름을 원국과 견주어 봅니다.'},
    {term:'월운',desc:'매달 바뀌는 월간지입니다. 여기서는 용신·희신·기신 가중치로 좋은 달, 보통, 주의를 나눕니다.'},
    {term:'지장간',desc:'지지 안에 숨어 있는 천간입니다. 가장 뒤의 글자가 본기이고, 여기서는 지장간의 십성도 함께 봅니다.'},
    {term:'십이운성',desc:'일간이 각 지지에서 맞는 장생·목욕·건록처럼 열두 단계의 이름입니다.'},
    {term:'합·충·형·파·해',desc:'합은 서로 끌어당기는 관계, 충은 맞부딪히는 관계, 형·파·해는 어긋나거나 마찰하는 관계를 가리키는 전통 용어입니다.'},
    {term:'공망',desc:'60갑자 순마다 빠지는 두 지지입니다. 전통에서는 그 자리의 기운이 비어 있다고 봅니다.'},
    {term:'일주',desc:'태어난 날의 간지 두 글자입니다. 일간과 일지를 함께 가리킵니다.'},
    {term:'일간',desc:'일주의 천간입니다. 나를 나타내는 기준으로 쓰입니다.'},
    {term:'일지',desc:'일주의 지지입니다. 전통에서는 배우자 자리로 봅니다.'}
  ];
  const DESC=Object.fromEntries(GLOSSARY.map(g=>[g.term,g.desc]));

  // 용어를 첫 번째로 만날 때 툴팁(abbr)으로 감싼다. 텍스트는 모두 이스케이프한다.
  function term(text,key){
    const s=String(text), desc=DESC[key], i=s.indexOf(key);
    if(!desc||i<0) return esc(s);
    return `${esc(s.slice(0,i))}<abbr title="${esc(desc)}">${esc(key)}</abbr>${esc(s.slice(i+key.length))}`;
  }

  // 원국 글자의 오행별 개수(확정된 기둥만)와 두드러진 오행, 빠진 오행
  function elementTally(data){
    const c={목:0,화:0,토:0,금:0,수:0};
    data.pillars.forEach(p=>{ if(!p) return; c[STEM_EL[p.stem]]++; c[BR_EL[p.branch]]++; });
    const max=Math.max(...Object.values(c));
    return {prominent:max>0?Object.keys(c).filter(k=>c[k]===max):[], missing:Object.keys(c).filter(k=>c[k]===0)};
  }
  // 십성 묶음별 개수. 천간(일간 제외)과 지지 본기를 센다.
  function groupCounts(data){
    const g={비겁:0,식상:0,재성:0,관성:0,인성:0};
    data.pillars.forEach((p,i)=>{ if(!p) return; if(i!==2&&p.stemTen&&GROUP_OF[p.stemTen]) g[GROUP_OF[p.stemTen]]++; const h=p.hidden; if(h&&h.length&&GROUP_OF[h[h.length-1].ten]) g[GROUP_OF[h[h.length-1].ten]]++; });
    return g;
  }

  // ── 한눈에 보는 나의 사주 ──
  function buildSummary(data){
    const a=data.analysis, day=data.pillars[2], el=elementTally(data);
    const prom=el.prominent.length?el.prominent.join('·'):'없음';
    const known=!!(day&&a);
    const verdict=known?a.strength.verdict:'보류';
    const gName=known&&data.pillars[1]&&a.gyeokguk.ten?a.gyeokguk.name:'보류';
    const yong=known?(a.yong||(a.status==='갈림'?'갈림':'보류')):'보류';
    const chips=[
      {label:'일간', value:day?`${day.stem}(${day.hangul[0]}) · ${STEM_META[day.stem]}`:'보류'},
      {label:'신강·신약', value:verdict},
      {label:'격국', value:gName},
      {label:'용신', value:yong},
      {label:'두드러진 오행', value:prom}
    ];
    let sentences, title;
    if(!known){
      title='일주가 확정되지 않은 요약';
      sentences=['일주가 확정되지 않아 일간 상징과 강약·격국·용신 판정은 보류합니다.','확정된 기둥만으로 판정을 만들지 않았습니다.',`확정된 글자에서 두드러진 오행은 ${prom}입니다.`];
    }else{
      title=`${KOS[day.stem]}(${day.stem}) 일간의 한눈 요약`;
      const seasonPart=a.season?`${a.season}에 태어난 `:'월주가 확정되지 않아 계절은 보류하고, ';
      const s1=`${seasonPart}${KOS[day.stem]}(${day.stem}) 일간은 ${STEM_META[day.stem]}의 상징으로 읽습니다.`;
      const s2=`일간의 강약은 ${verdict}이고, 격국은 ${gName}입니다.`;
      const yongPart=a.yong?`용신은 ${a.yong}이고`:`용신은 ${yong==='갈림'?'갈림이라 하나로 정하지 않고':'보류이고'}`;
      const s3=`${yongPart}, 표면에서 두드러진 오행은 ${prom}입니다.`;
      sentences=[s1,s2,s3];
    }
    return {available:known,title,chips,paragraph:sentences.join(' ')};
  }

  // ── 오늘의 운세 ──
  // 일진의 천간·지지 십성, 일간과의 천간합, 원국 각 자리와의 합·충 관계로 읽는다. 용신 대조는 판정이 정해진 경우에만 한다.
  function buildToday(data){
    const a=data.analysis, day=data.pillars[2], ti=(data.extras||{}).today;
    if(!ti) return {available:false,date:'',pillar:'',reason:'오늘의 일진 계산 항목이 없어 해석을 보여 줄 수 없습니다.',paragraphs:[],tip:''};
    if(!day||!a) return {available:false,date:ti.date,pillar:ti.pillar,reason:'일주가 확정되지 않아 오늘 일진을 일간과 원국에 견주지 않습니다. 일진 간지는 계산 항목에 그대로 표시합니다.',paragraphs:[],tip:''};
    const rel=ti.dayRel||{stemHap:false,branchKinds:[]};
    const natal=(ti.natalRel||[]).filter(n=>n.pos!=='일지');
    const s1=`오늘(${ti.date})은 ${ti.pillar}일이며, 천간 ${KOS[ti.stem]}(${ti.stem})은 나에게 ${ti.stemTen}, 지지 ${KOB[ti.branch]}(${ti.branch})의 본기는 ${ti.branchTen}에 해당합니다.`;
    const s3=`이런 날에는 ${SUIT_BY_TEN[ti.stemTen]}이 잘 맞고, ${SUIT_BY_TEN[ti.branchTen]}도 함께 살펴볼 만합니다.`;
    const relParts=[];
    if(rel.stemHap) relParts.push('오늘 천간은 일간과 천간합이라 그 기운에 끌리기 쉽습니다.');
    (rel.branchKinds||[]).forEach(k=>{ if(BR_REL_WORD[k]) relParts.push(`일지와 ${k} 관계이니 ${BR_REL_WORD[k]}`); });
    if(natal.length) relParts.push(`다른 자리로는 ${natal.map(n=>`${n.pos}${josa(n.pos,'과','와')} ${n.branchKinds.join('·')}(${POS_MEAN[n.pos]})`).join(', ')} 관계가 있습니다.`);
    const s4=relParts.length?relParts.join(' '):'원국의 지지와 합·충 관계가 없어 평소 흐름을 따를 수 있는 날로 읽습니다.';
    const yongRole=el=>{ if(a.status!=='정함') return null; if(el===a.yong) return '용신'; if(el===a.bu.희) return '희신'; if(a.bu.기.includes(el)) return '기신'; if(el===a.bu.한) return '한신'; return '중립'; };
    const e1=STEM_EL[ti.stem], e2=BR_EL[ti.branch];
    const s5=a.status==='정함'
      ?`오행으로 보면 천간 ${e1}은 ${ROLE_WORD[yongRole(e1)]}, 지지 ${e2}는 ${ROLE_WORD[yongRole(e2)]}입니다.`
      :`용신 판정이 ${a.status}이므로 오늘의 오행은 용신과 맞춰 보지 않고, 위의 십성과 관계로만 읽습니다.`;
    return {available:true,date:ti.date,pillar:ti.pillar,paragraphs:[s1,s3,s4,s5],tip:TIP_BY_TEN[ti.stemTen]};
  }

  // ── 신년운세 (다음 해 세운과 월별 간지) ──
  // 용신 판정 상태는 머리 문단에서 한 번만 말하고, 달마다는 십성·원국 자리의 관계·생활 팁으로 차이를 둔다.
  function buildNewYear(data){
    const a=data.analysis, ex=data.extras||{}, ny=ex.nextYear, day=data.pillars[2];
    if(!ny) return {available:false,year:null,pillar:'',reason:'다음 해 계산 항목이 없어 신년운세를 보여 줄 수 없습니다.',paragraphs:[],months:[],remaining:'',note:''};
    const Y=ny.year, thisYear=ex.year, curMonth=Number(String((ex.today&&ex.today.date)||'').split('-')[1])||null;
    if(!day||!a) return {available:false,year:Y,pillar:ny.pillar,reason:`일주가 확정되지 않아 ${Y}년 세운의 판정과 월별 십성은 보류합니다.`,paragraphs:[],months:[],remaining:'',note:''};
    const yEntry=(a.years||[]).find(y=>y.year===Y)||null;
    const stemJ=yEntry?yEntry.stem:'보류', brJ=yEntry?yEntry.branch:'보류';
    const side=j=>(j==='갈림'||j==='보류')?null:JUDGE_WORD[j];
    const sideS=side(stemJ), sideB=side(brJ);
    const p1=`${Y}년은 ${ny.pillar}년입니다. 천간 ${ny.pillar[0]}${josa(ny.pillar[0],'은','는')} 나에게 ${ny.stemTen}에 해당하고, 지지 ${ny.pillar[1]}의 본기는 ${ny.branchTen}에 해당합니다.`;
    const judgeLine=(!sideS&&!sideB)
      ?`${Y}년의 방향은 ${a.status==='보류'?'판정이 보류되어':'용신을 하나로 정하지 않아'} 단정하지 않습니다.`
      :`세운 판정은 천간이 ${sideS||'방향을 단정하지 않는 흐름'}이고, 지지는 ${sideB||'방향을 단정하지 않는 흐름'}입니다.`;
    const themeLine=`천간의 주제는 ${TEN_THEME[ny.stemTen]}이고, 지지 본기의 주제는 ${TEN_THEME[ny.branchTen]}입니다.`;
    const determined=[stemJ,brJ].filter(j=>j!=='갈림'&&j!=='보류');
    const good=determined.some(j=>j==='용신'||j==='희신'), bad=determined.includes('기신');
    let tone=null;
    if(determined.length){
      tone=good&&bad?'도움과 부담이 함께 들어오는 해로 읽습니다. 도움이 되는 쪽을 살리고 부담이 되는 쪽은 미리 나누어 보는 편이 좋습니다.'
        :bad?'부담이 되기 쉬운 기운이 들어오는 해로 읽습니다. 일정과 책임의 무게를 미리 나누어 보는 편이 좋습니다.'
        :good?'도움이 되는 기운이 들어오는 해로 읽습니다.'
        :'뚜렷한 방향이 두드러지지 않는 해로 읽습니다.';
    }
    const relItems=[...new Set(((yEntry&&yEntry.rels)||[]).map(r=>r.pos?`${r.pos} ${r.kind}`:r.kind))];
    const p4=relItems.length?`원국과는 ${relItems.join(', ')} 관계가 있습니다.`:'원국과 충·합·형 관계가 없습니다.';
    const monthsAvailable=(a.nextMonths||[]).length===12;
    const rest=(a.months||[]).filter(m=>!curMonth||m.month>=curMonth);
    const remaining=!(a.months||[]).length?`${thisYear}년 남은 기간의 월운은 판정이 보류라 나누지 않습니다.`:(rest.length?`${thisYear}년 남은 기간(${curMonth}월 이후)은 ${rest.map(m=>`${m.month}월 ${m.pillar}(${m.level})`).join(', ')}로 봅니다.`:`${thisYear}년은 이미 지나 남은 기간이 없습니다.`);
    const usedTips=new Set();
    const months=ny.monthlyFlow.map((m,i)=>{
      const nm=monthsAvailable?a.nextMonths[i]:null;
      const lv=nm?nm.level:'보류';
      const st=m.pillar[0], br=m.pillar[1];
      const s1=`${m.month}월은 ${m.pillar}월입니다. 천간 ${st}${josa(st,'은','는')} ${m.stemTen}, 지지 ${br}의 본기는 ${m.branchTen}에 해당합니다.`;
      const s2=m.note?`${m.note.replace('속함','속하는 달입니다')}.`:'';
      // 달의 지지가 원국 자리와 맺는 합·충·형. 월운 판정에 쓰인 관계를 그대로 옮기고 천간합은 뺀다.
      const rels=nm?nm.rels.filter(r=>r.pos===''||BR_POS.includes(r.pos)):[];
      const relSent=[];
      if(!nm) relSent.push(`${br} 지지와 원국의 관계는 판정이 보류라 나누지 않습니다.`);
      else if(!rels.length) relSent.push(`${br} 지지는 원국 지지와 합·충이 없어 흐름이 비교적 조용한 달입니다.`);
      else{
        const byPos=new Map();
        rels.filter(r=>r.pos).forEach(r=>{ if(!byPos.has(r.pos)) byPos.set(r.pos,[]); byPos.get(r.pos).push(r.kind); });
        [...byPos].slice(0,2).forEach(([pos,kinds])=>relSent.push(`${pos}${josa(pos,'과','와')} ${[...new Set(kinds)].join('·')} 관계가 있어 ${POS_MEAN[pos]}에 닿는 달입니다.`));
        rels.filter(r=>!r.pos).forEach(r=>relSent.push(`원국 ${r.others.map(x=>KOB[x]).join('·')} 지지와 함께 ${r.el} ${r.type}을 이루어 ${r.el} 기운이 모이는 달입니다.`));
      }
      // 같은 해 안에서 같은 팁이 두 번 나오지 않도록 후보를 차례로 쓴다.
      const tipCands=[TIP_BY_TEN[m.stemTen],`${SUIT_BY_TEN[m.branchTen]}을 곁들이면 좋습니다.`,TIP_BY_TEN[m.branchTen],`${SUIT_BY_TEN[m.stemTen]}을 한 가지만 골라 집중해 보세요.`];
      const tipText=tipCands.find(t=>!usedTips.has(t))||tipCands[0];
      usedTips.add(tipText);
      const tip=`이 달의 생활 팁: ${tipText}`;
      return {month:m.month,pillar:m.pillar,level:lv,text:[s1,s2,...relSent,tip].filter(Boolean).join(' ')};
    });
    const goodList=monthsAvailable?a.nextMonths.filter(m=>m.good).map(m=>`${m.month}월`):[];
    const calmList=monthsAvailable?a.nextMonths.filter(m=>m.chung===0).map(m=>`${m.month}월`):[];
    let goodLine;
    if(!monthsAvailable) goodLine=`월운 판정이 보류라 좋은 달을 나누지 않습니다. ${a.note||''}`.trim();
    else if(goodList.length) goodLine=`좋은 달은 ${goodList.join(', ')}입니다.`;
    else goodLine=`좋은 달로 나온 달은 없습니다. 원국과 충이 없어 비교적 편안한 달은 ${calmList.length?calmList.join(', '):'없습니다'}입니다.`;
    // 용신 상태는 머리 문단에서 한 번만 말한다.
    const statusLine=!monthsAvailable?'용신 판정이 보류라 월운의 좋고 나쁨은 나누지 않고, 달마다 십성과 원국 자리의 관계만 읽습니다.':(a.status!=='정함'?'용신을 하나로 정하지 않아 월운 등급은 원국과의 충 관계로만 정해집니다. 아래 월별 해석은 달마다 십성과 원국 자리의 관계를 중심으로 읽습니다.':null);
    const note=`${Y}년 판정은 전통 상징을 정해진 규칙으로 나눈 것입니다. 실제 사건이나 결과를 정하지 않으며, 충은 관계를 보여 주는 표식일 뿐입니다.`;
    const paragraphs=[p1,`${judgeLine} ${themeLine}`,tone,p4,statusLine].filter(Boolean);
    return {available:true,year:Y,thisYear,pillar:ny.pillar,paragraphs,months,goodMonths:goodList,goodLine,remaining,note,monthsAvailable};
  }

  // ── 어울리는 직업군 예시 ──
  function buildJobs(data){
    const a=data.analysis, day=data.pillars[2];
    if(!day||!a) return {available:false,reason:'일주가 확정되지 않아 직업군 예시를 보류합니다.',items:[],basis:''};
    const monthTen=data.pillars[1]?a.gyeokguk.ten:null;
    const monthGroup=monthTen?GROUP_OF[monthTen]:null;
    const counts=groupCounts(data);
    const ordered=Object.keys(counts).filter(g=>counts[g]>0).sort((x,y)=>counts[y]-counts[x]);
    const dominant=ordered.find(g=>g!==monthGroup)||null;
    const yong=a.status==='정함'?a.yong:null;
    const items=[];
    const add=(list,prefix,n)=>{ for(const it of list.slice(0,n)){ if(items.some(x=>x.job===it.job)) continue; items.push({job:it.job,reason:`${prefix} ${it.why}`}); } };
    if(monthGroup) add(JOB_BY_GROUP[monthGroup],`[월지 본기 ${monthTen}, ${monthGroup}]`,3);
    if(dominant) add(JOB_BY_GROUP[dominant],`[원국 우세 십성, ${dominant} ${counts[dominant]}개]`,3);
    if(yong) add(JOB_BY_EL[yong],`[용신 ${yong}]`,3);
    // 항목이 6개보다 적으면 나머지 십성 묶음에서 채운다
    for(const g of ordered.concat(Object.keys(JOB_BY_GROUP))){ if(items.length>=6) break; add(JOB_BY_GROUP[g],`[원국 ${g}]`,3); }
    const basisParts=[monthGroup?`월지 본기 ${monthTen}(${monthGroup})`:'월주 미확정으로 월지 본기는 보류',dominant?`원국에서 가장 많이 보이는 ${dominant}`:null,yong?`용신 ${yong}`:`용신 ${a.status}`].filter(Boolean);
    return {available:true,items:items.slice(0,10),basis:basisParts.join(', ')};
  }

  function build(data,reading){
    return {summary:buildSummary(data,reading),today:buildToday(data),newYear:buildNewYear(data),jobs:buildJobs(data),glossary:GLOSSARY};
  }

  // ── HTML ──
  function chipsHtml(chips){ return `<div class="chip-row">${chips.map(c=>`<div class="chip"><small>${term(c.label,c.label)}</small><b>${esc(c.value)}</b></div>`).join('')}</div>`; }
  function summaryHtml(extra){
    const s=extra.summary;
    return `<article id="reading-extra-summary" class="reading-card extra-summary"><span>한눈에 보기</span><h3>${esc(s.title)}</h3>${chipsHtml(s.chips)}<p>${esc(s.paragraph)}</p><p class="reading-note">아래 풀이의 판정 가운데 핵심만 모은 것입니다. 각 항목의 근거는 해당 풀이에 있습니다.</p></article>`;
  }
  function todayHtml(extra){
    const t=extra.today;
    if(!t.available) return `<article id="reading-extra-today" class="reading-card"><span>오늘의 운세</span><h3>${esc(t.date?`${t.date} 일진`:'오늘의 일진')}</h3><p>${esc(t.reason)}</p></article>`;
    return `<article id="reading-extra-today" class="reading-card"><span>오늘의 운세 · ${esc(t.date)}</span><h3>${esc(t.pillar)}일의 흐름 읽기</h3>${t.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="extra-tip"><b>생활 팁</b> ${esc(t.tip)}</p><p class="reading-note">일진은 날짜에서 계산한 간지이며, 이 해석은 전통 상징을 설명하는 참고 풀이입니다.</p></article>`;
  }
  function newYearHtml(extra){
    const n=extra.newYear, Y=n.year;
    if(!n.available) return `<article id="reading-extra-newyear" class="reading-card"><span>신년운세${Y?` · ${Y}년`:''}</span><h3>${esc(Y?`${Y}년 신년운세`:'신년운세')}</h3><p>${esc(n.reason)}</p></article>`;
    const monthsHtml=n.months.map(m=>`<p class="extra-month"><b>${esc(m.month)}월 ${esc(m.pillar)} · ${esc(m.level)}</b> ${esc(m.text)}</p>`).join('');
    const goodLine=`<p>${esc(n.goodLine)}</p>`;
    return `<article id="reading-extra-newyear" class="reading-card"><span>신년운세 · ${esc(Y)}년</span><h3>${esc(Y)}년 ${esc(n.pillar)}년의 흐름</h3>${n.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="theme"><b>${esc(n.thisYear)}년 남은 기간</b><p>${esc(n.remaining)}</p></div><div class="theme"><b>월별 흐름 (12달)</b></div>${monthsHtml}${goodLine}<p class="reading-note">${esc(n.note)}</p></article>`;
  }
  function jobsHtml(extra){
    const j=extra.jobs;
    if(!j.available) return `<article id="reading-extra-jobs" class="reading-card"><span>어울리는 직업군 예시</span><h3>예시 보류</h3><p>${esc(j.reason)}</p></article>`;
    return `<article id="reading-extra-jobs" class="reading-card"><span>어울리는 직업군 예시</span><h3>예시로 보는 직업군</h3><p>근거: ${esc(j.basis)}. 아래는 전통 상징에 맞닿는 직업의 예시이며, 직업을 정하는 근거가 아닙니다.</p>${j.items.map(it=>`<div class="theme"><b>${esc(it.job)}</b><p>${esc(it.reason)}</p></div>`).join('')}</article>`;
  }
  function glossaryHtml(extra){
    return `<article id="reading-extra-glossary" class="reading-card glossary"><span>용어 풀이</span><h3>처음 보는 용어</h3><p>풀이에 나오는 용어를 짧게 설명합니다. 같은 뜻을 화면의 제목과 칩에서 마우스를 올리면 다시 볼 수 있습니다.</p><div class="glossary-list">${extra.glossary.map(g=>`<div class="glossary-item"><b>${esc(g.term)}</b><p>${esc(g.desc)}</p></div>`).join('')}</div></article>`;
  }
  // 화면: 요약은 풀이 맨 위, 나머지는 계산 항목 뒤에 둔다.
  function summaryBlock(extra){ return summaryHtml(extra); }
  function bodyBlock(extra){ return todayHtml(extra)+newYearHtml(extra)+jobsHtml(extra)+glossaryHtml(extra); }

  // ── Markdown (용어 풀이와 인쇄 버튼은 제외) ──
  function summaryMarkdown(extra){
    const s=extra.summary;
    return ['## 한눈에 보는 나의 사주','',...s.chips.map(c=>`- **${c.label}**: ${c.value}`),'',s.paragraph,''];
  }
  function bodyMarkdown(extra){
    const lines=[];
    const t=extra.today;
    lines.push('## 오늘의 운세',''); if(t.available){ t.paragraphs.forEach(p=>lines.push(p,'')); lines.push(`생활 팁: ${t.tip}`,''); } else lines.push(t.reason,'');
    const n=extra.newYear;
    lines.push(`## 신년운세 (${n.year||''}년)`,'');
    if(n.available){ n.paragraphs.forEach(p=>lines.push(p,'')); lines.push(n.remaining,''); n.months.forEach(m=>lines.push(`- ${m.month}월 ${m.pillar} (${m.level}): ${m.text}`)); lines.push('',`${n.goodLine}`,'',n.note,''); }
    else lines.push(n.reason,'');
    const j=extra.jobs;
    lines.push('## 어울리는 직업군 예시','');
    if(j.available){ lines.push(`근거: ${j.basis}. 직업을 정하는 근거가 아닌 예시입니다.`,''); j.items.forEach(it=>lines.push(`- **${it.job}**: ${it.reason}`)); lines.push(''); }
    else lines.push(j.reason,'');
    return lines;
  }
  // 칩·표제에 쓰는 용어 툴팁 함수는 밖에서도 쓸 수 있게 노출한다.
  return {build,term,summaryBlock,bodyBlock,summaryMarkdown,bodyMarkdown,GLOSSARY,TEN_THEME,GROUP_OF};
});
