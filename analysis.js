(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SajuAnalysis=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 국내에서 통용되는 판정 방식으로 원국을 분석한다. 판정에 쓴 기준은 CRITERIA에 모아 화면 맨 아래에 공개한다.
  const EL=['목','화','토','금','수'];
  const STEM_EL={甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수'};
  const BR_EL={子:'수',丑:'토',寅:'목',卯:'목',辰:'토',巳:'화',午:'화',未:'토',申:'금',酉:'금',戌:'토',亥:'수'};
  const KO_BR={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const idx=e=>EL.indexOf(e);
  const producedBy=e=>EL[(idx(e)+4)%5];   // 인성: 나를 생하는 오행
  const produces=e=>EL[(idx(e)+1)%5];     // 식상: 내가 생하는 오행
  const controls=e=>EL[(idx(e)+2)%5];     // 재성: 내가 극하는 오행
  const controlledBy=e=>EL[(idx(e)+3)%5]; // 관성: 나를 극하는 오행
  const category=(e,dayEl)=>e===dayEl?'비겁':e===producedBy(dayEl)?'인성':e===produces(dayEl)?'식상':e===controls(dayEl)?'재성':e===controlledBy(dayEl)?'관성':'';
  const SUPPORT=['비겁','인성'];

  const PAIRS={
    충:['子午','丑未','寅申','卯酉','辰戌','巳亥'],
    파:['子酉','丑辰','寅亥','卯午','巳申','未戌'],
    해:['子未','丑午','寅巳','卯辰','申亥','酉戌'],
    원진:['子未','丑午','寅酉','卯申','辰亥','巳戌'],
    귀문:['子酉','丑午','寅未','卯申','辰亥','巳戌'],
    육합:['子丑','寅亥','卯戌','辰酉','巳申','午未'],
    형:['寅巳','巳申','申寅','丑戌','戌未','未丑','子卯','辰辰','午午','酉酉','亥亥']
  };
  function pairKind(a,b){
    if(a===b) return [];
    const key=a+b, rkey=b+a;
    const kinds=[];
    for(const [k,list] of Object.entries(PAIRS)) if(list.includes(key)||list.includes(rkey)) kinds.push(k);
    return kinds;
  }
  const SAMHAP_START={申:'巳',子:'巳',辰:'巳',亥:'申',卯:'申',未:'申',寅:'亥',午:'亥',戌:'亥',巳:'寅',酉:'寅',丑:'寅'};
  const SHINSAL12=['겁살','재살','천살','지살','년살','월살','망신살','장성살','반안살','역마살','육해살','화개살'];
  const CHEON_EUL={甲:['丑','未'],戊:['丑','未'],庚:['丑','未'],乙:['子','申'],己:['子','申'],丙:['亥','酉'],丁:['亥','酉'],辛:['寅','午'],壬:['卯','巳'],癸:['卯','巳']};
  const MUNCHANG={甲:'巳',乙:'午',丙:'申',戊:'申',丁:'酉',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
  const YANGIN={甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};
  const BAEKHO=['甲辰','乙未','丙戌','丁丑','戊辰','壬戌','癸丑'];
  const GOEGANG=['庚辰','庚戌','壬辰','戊戌'];
  const GONGMANG_MEANING={연지:'조상과 고향 쪽 기운이 비는 자리',월지:'부모와 사회 환경 쪽 기운이 비는 자리',일지:'배우자 자리의 기운이 비는 자리',시지:'자녀와 말년 쪽 기운이 비는 자리'};

  function analyze(r){
    const day=r.pillars[2];
    const dayStem=day.stem;
    const dayEl=STEM_EL[dayStem];
    const pos=['연','월','일','시'];
    // 천간 3개(일간 제외)와 지지 본기 4개의 오행 분류
    const stemCats=r.pillars.map((p,i)=>p&&i!==2?category(STEM_EL[p.stem],dayEl):null);
    const branchCats=r.pillars.map(p=>p?category(BR_EL[p.branch],dayEl):null);
    const count=(arr,name)=>arr.filter(x=>x===name).length;
    const supportCount=count(stemCats,'비겁')+count(stemCats,'인성')+count(branchCats,'비겁')+count(branchCats,'인성');
    const wealthCount=count(stemCats,'재성')+count(branchCats,'재성');
    const outputCount=count(stemCats,'식상')+count(branchCats,'식상');
    const officerCount=count(stemCats,'관성')+count(branchCats,'관성');
    // 득령·득지·득세
    const monthHidden=r.pillars[1]&&r.pillars[1].hidden;
    const monthBenCat=monthHidden&&monthHidden.length?category(STEM_EL[monthHidden[monthHidden.length-1].hanja],dayEl):null;
    const deryeong=SUPPORT.includes(monthBenCat);
    const dayHidden=r.pillars[2].hidden||[];
    const deuji=dayHidden.some(h=>SUPPORT.includes(category(STEM_EL[h.hanja],dayEl)));
    const deuse=supportCount>=3;
    const hits=[deryeong,deuji,deuse].filter(Boolean).length;
    const verdict=hits===3?'신강':hits===0?'신약':'갈림';
    const strength={deryeong,deuji,deuse,hits,verdict,supportCount,wealthCount,outputCount,officerCount};

    // 격국: 월지 본기의 십성으로 정하고, 같은 십성이 천간에 드러났는지(투출) 본다
    const monthTen=monthHidden&&monthHidden.length?monthHidden[monthHidden.length-1].ten:null;
    const exposed=monthTen?r.pillars.some((p,i)=>p&&i!==2&&p.stemTen===monthTen):false;
    const gyeokguk={name:monthTen?monthTen+'격':'미정',ten:monthTen,exposed};

    // 조후: 계절에 따른 필요 오행
    const mb=r.pillars[1].branch;
    const season=['亥','子','丑'].includes(mb)?'겨울':['巳','午','未'].includes(mb)?'여름':['寅','卯','辰'].includes(mb)?'봄':'가을';
    const johu=season==='겨울'?'화':season==='여름'?'수':null;

    // 종격 가능성: 신약인데 비겁·인성이 지장간에만 있는 경우
    const visibleSupport=stemCats.some(c=>SUPPORT.includes(c))||branchCats.some(c=>SUPPORT.includes(c));
    const hiddenSupport=dayHidden.some(h=>SUPPORT.includes(category(STEM_EL[h.hanja],dayEl)))||r.pillars.some(p=>p&&p.hidden&&p.hidden.some(h=>SUPPORT.includes(category(STEM_EL[h.hanja],dayEl))));
    const jong={possible:verdict==='신약'&&!visibleSupport&&hiddenSupport,wealth:verdict==='신약'&&wealthCount>=3};

    // 용신·희신·기신·한신 (억부 기준)
    const bu={용:null,희:null,기:[],한:null};
    if(verdict==='신약'){ bu.용=producedBy(dayEl); bu.희=dayEl; bu.기=[controls(dayEl),produces(dayEl)]; bu.한=controlledBy(dayEl); }
    else if(verdict==='신강'){ bu.용=produces(dayEl); bu.희=controls(dayEl); bu.기=[producedBy(dayEl),dayEl]; bu.한=controlledBy(dayEl); }
    // 조후와 억부가 어긋나면 갈림으로 본다
    let yong=null, status='정함', note='';
    if(verdict==='갈림'){ status='갈림'; note='신강·신약 판정이 갈려 용신을 하나로 정하지 않습니다.'; }
    else if(johu&&bu.용&&johu!==bu.용){ status='갈림'; note=`조후는 ${johu}, 억부는 ${bu.용}을 가리켜 어긋납니다.`; }
    else { yong=bu.용; if(johu&&johu===bu.용) note='조후와 억부가 같은 오행을 가리킵니다.'; }
    const wealthEl=controls(dayEl), outputEl=produces(dayEl), officerEl=controlledBy(dayEl), supportEl=producedBy(dayEl);
    if(jong.possible&&jong.wealth) note+=' 비겁·인성이 지장간에만 있고 재성이 많아, 종재격으로 보는 견해도 있습니다. 그 경우 용신은 재성·식상 쪽으로 바뀝니다.';
    else if(jong.possible) note+=' 비겁·인성이 지장간에만 있어, 종격으로 보는 견해도 있습니다. 그 경우 용신이 반대가 됩니다.';

    // 원국 내부 관계(형·파·해·원진·귀문)
    const natalBranches=r.pillars.filter(Boolean).map((p,i)=>({b:p.branch,pos:['연지','월지','일지','시지'][r.pillars.indexOf(p)]}));
    const relations=[];
    for(let i=0;i<natalBranches.length;i++) for(let j=i+1;j<natalBranches.length;j++){ const kinds=pairKind(natalBranches[i].b,natalBranches[j].b); if(kinds.length) relations.push({kinds,positions:natalBranches[i].pos+'·'+natalBranches[j].pos,characters:natalBranches[i].b+natalBranches[j].b}); }
    // 천간 합 (원국 내부)
    const STEM_HAP={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
    const stemRel=[];
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){ const a=r.pillars[i], b=r.pillars[j]; if(a&&b&&STEM_HAP[a.stem]===b.stem) stemRel.push({name:'천간합',positions:pos[i]+'·'+pos[j],characters:a.stem+b.stem}); }

    // 신살
    const branches=r.pillars.map(p=>p?p.branch:null);
    const sinsal=[];
    const cheon=CHEON_EUL[dayStem]||[];
    const cheonPos=r.pillars.map((p,i)=>p&&cheon.includes(p.branch)?['연지','월지','일지','시지'][i]:null).filter(Boolean);
    if(cheonPos.length) sinsal.push({name:'천을귀인',positions:cheonPos.join('·'),note:'일간 기준 귀인 지지'});
    const mc=MUNCHANG[dayStem]; const mcPos=mc?r.pillars.map((p,i)=>p&&p.branch===mc?['연지','월지','일지','시지'][i]:null).filter(Boolean):[];
    if(mcPos.length) sinsal.push({name:'문창귀인',positions:mcPos.join('·'),note:'일간 기준 지지'});
    const yi=YANGIN[dayStem]; const yiPos=yi?r.pillars.map((p,i)=>p&&p.branch===yi?['연지','월지','일지','시지'][i]:null).filter(Boolean):[];
    if(yiPos.length) sinsal.push({name:'양인살',positions:yiPos.join('·'),note:'양간 일간 기준 지지'});
    const bh=r.pillars.map((p,i)=>p&&BAEKHO.includes(p.hanja)?['연주','월주','일주','시주'][i]:null).filter(Boolean);
    if(bh.length) sinsal.push({name:'백호살',positions:bh.join('·'),note:'간지 기준'});
    const gg=r.pillars.map((p,i)=>p&&i===2&&GOEGANG.includes(p.hanja)?'일주':null).filter(Boolean);
    if(gg.length) sinsal.push({name:'괴강살',positions:gg.join('·'),note:'간지 기준'});
    // 12신살: 년지 삼합 기준
    const yb=r.pillars[0].branch;
    const start=SAMHAP_START[yb];
    const twelve=r.pillars.map((p,i)=>p?{pos:['연지','월지','일지','시지'][i],b:p.branch,name:SHINSAL12[(branchOrder(p.branch)-branchOrder(start)+12)%12]}:null).filter(Boolean);
    // 공망
    const ganjiIdx=Array.from({length:60},(_,i)=>i).find(i=>'甲乙丙丁戊己庚辛壬癸'[i%10]===dayStem&&'子丑寅卯辰巳午未申酉戌亥'[i%12]===day.branch);
    const xunStart=ganjiIdx-(ganjiIdx%10);
    const BR='子丑寅卯辰巳午未申酉戌亥';
    const gongmangBranches=[BR[(xunStart+10)%12],BR[(xunStart+11)%12]];
    const gongmang=r.pillars.map((p,i)=>p&&gongmangBranches.includes(p.branch)?{pos:['연지','월지','일지','시지'][i],b:p.branch,meaning:GONGMANG_MEANING[['연지','월지','일지','시지'][i]]}:null).filter(Boolean);

    // 오행 분포와 결핍
    const elCount={목:0,화:0,토:0,금:0,수:0};
    r.pillars.forEach(p=>{ if(!p) return; elCount[STEM_EL[p.stem]]++; elCount[BR_EL[p.branch]]++; });
    const lacking=EL.filter(e=>elCount[e]===0);
    const excess=EL.filter(e=>elCount[e]>=3);

    // 판정 함수: 오행이 용신·희신·기신·한신 중 무엇인지
    const judge=el=>{
      if(status==='갈림') return '갈림';
      if(el===yong) return '용신';
      if(el===bu.희) return '희신';
      if(bu.기.includes(el)) return '기신';
      if(el===bu.한) return '한신';
      return '중립';
    };
    const judgeStem=s=>judge(STEM_EL[s]);
    // 지지 판정: 달·세운·대운의 지지가 원국 지지와 방합·삼합을 완성하면 그 합의 오행으로 본다.
    // 조후 용신이 화인 명식에서는 丑·辰을 희신으로 치지 않는다.
    const natalBranchList=r.pillars.filter(Boolean).map(p=>p.branch);
    const COMBOS=[['亥','子','丑','수','방합'],['寅','卯','辰','목','방합'],['巳','午','未','화','방합'],['申','酉','戌','금','방합'],['申','子','辰','수','삼합'],['亥','卯','未','목','삼합'],['寅','午','戌','화','삼합'],['巳','酉','丑','금','삼합']];
    const judgeBranch=b=>{
      for(const [x,y,z,el] of COMBOS){ const set=[x,y,z]; if(!set.includes(b)) continue; const others=set.filter(s=>s!==b); if(others.every(o=>natalBranchList.includes(o))) return judge(el); }
      const own=judge(BR_EL[b]);
      if(johu==='화'&&(b==='丑'||b==='辰')&&own==='희신') return '중립';
      return own;
    };

    const STEMPOS=['연간','월간','일간','시간'], BRPOS=['연지','월지','일지','시지'];
    const SELF_X=['辰','午','酉','亥'];
    const GM=gongmangBranches;
    const relationsWith=(stemH,branchH)=>{
      const out=[];
      r.pillars.forEach((p,i)=>{ if(!p) return;
        if(stemH&&STEM_HAP[stemH]===p.stem) out.push({kind:'천간합',pos:STEMPOS[i]});
        if(branchH){ const ks=pairKind(branchH,p.branch); if(branchH===p.branch&&SELF_X.includes(branchH)) ks.push('자형'); ks.forEach(k=>out.push({kind:k,pos:BRPOS[i]})); }
      });
      if(branchH){ for(const [x,y,z,el,type] of COMBOS){ const set=[x,y,z]; if(!set.includes(branchH)) continue; const others=set.filter(s=>s!==branchH); if(others.every(o=>natalBranchList.includes(o))) out.push({kind:el+' '+type+' 완성',pos:''}); } }
      return out;
    };
    const gmOf=b=>GM.includes(b);
    // 세운: 해마다 천간·지지 판정과 원국 관계
    const years=(r.yearCycles||[]).map(y=>{
      const pairs=[];
      r.pillars.forEach((p,i)=>{ if(!p) return; const ks=pairKind(y.branch,p.branch); if(ks.length) pairs.push({kinds:ks,pos:['연지','월지','일지','시지'][i]}); });
      return {year:y.year,pillar:y.pillar,stem:judgeStem(y.pillar[0]),branch:judgeBranch(y.branch),pairs,rels:relationsWith(y.pillar[0],y.branch),gm:gmOf(y.branch),stemHap:y.relations?y.relations.stemHap:[],hap:y.relations?y.relations.hap:[],self:y.relations?y.relations.self:[],natalPositions:y.natalPositions};
    });
    // 대운
    const cycles=(r.daeun&&r.daeun.cycles)||[];
    const cyclesJudged=cycles.map(c=>({pillar:c.pillar,fromAge:Math.floor(c.fromAgeMonths/12),toAge:Math.floor(c.toAgeMonths/12)-1,stem:judgeStem(c.pillar[0]),branch:judgeBranch(c.branch),rels:relationsWith(c.pillar[0],c.branch),gm:gmOf(c.branch),natalClashes:c.natalClashes}));
    // 월운: 천간 가중치와 지지 가중치를 더한다. 용신 +2/+1, 희신 +1/+1, 기신 -2/-1
    const weight=(j,stemFlag)=>{ const s=stemFlag?{용신:2,희신:1,기신:-2,한신:0,중립:0,갈림:0}:{용신:1,희신:1,기신:-1,한신:0,중립:0,갈림:0}; return s[j]||0; };
    const KO_ST={갑:'甲',을:'乙',병:'丙',정:'丁',무:'戊',기:'己',경:'庚',신:'辛',임:'壬',계:'癸'};
    const months=(r.extras&&r.extras.monthlyFlow||[]).map(m=>{ const st=judgeStem(KO_ST[m.pillar[0]]); const hb=Object.keys(KO_BR).find(k=>KO_BR[k]===m.pillar[1]); const br=judgeBranch(hb); let score=weight(st,true)+weight(br,false); const stemCat=category(STEM_EL[KO_ST[m.pillar[0]]],dayEl); if(verdict==='신약'&&(stemCat==='재성'||stemCat==='관성')) score-=1; const hbr=hb; const rels=relationsWith(KO_ST[m.pillar[0]],hbr); const chung=rels.filter(x=>x.kind==='충').length; score-=2*chung; const level=score>=1?'좋은 달':score===0?'보통':'주의'; return {month:m.month,pillar:m.pillar,stem:st,branch:br,score,good:score>=1,level,rels,chung,gm:gmOf(hbr)}; });

    return {dayEl,strength,gyeokguk,season,johu,jong,bu,yong,status,note,natal:{relations,stemRel,twelve,gongmang,gongmangBranches:GM.map(b=>({b,judge:judgeBranch(b)})),elCount,lacking,excess,sinsal},years,cycles:cyclesJudged,months,
      criteria:{strength:'득령: 월지 본기가 비겁·인성. 득지: 일지 지장간에 비겁·인성이 있음. 득세: 천간 3개와 지지 본기 4개 중 비겁·인성이 3개 이상. 3개면 신강, 0개면 신약, 1~2개면 갈림.',johu:'亥·子·丑월은 火, 巳·午·未월은 水를 필요 오행으로 봅니다. 봄·가을은 따로 보지 않습니다.',yong:'신약이면 인성을 용신, 비겁을 희신으로 봅니다. 신강이면 식상을 용신, 재성을 희신으로 봅니다. 조후와 억부가 어긋나면 갈림입니다.',gi:'신약에서는 재성과 식상이 기신, 관성은 한신입니다. 신강에서는 인성과 비겁이 기신입니다.',month:'월운은 천간에 가중치 용신 +2, 희신 +1, 기신 -2, 지지에 용신 +1, 희신 +1, 기신 -1을 더합니다. 신약이면 천간이 재성·관성인 달은 추가로 -1, 원국 지지와 충이 있으면 충 하나마다 -2를 합니다. 합계 1점 이상이면 좋은 달, 0점이면 보통, 음수이면 주의입니다.',relations:'세운·대운·월운의 지지와 천간을 원국 네 기둥과 대조합니다. 천간합, 지지 충·육합·형·파·해·원진·귀문·자형을 식별하고, 방합·삼합은 원국 지지와 합쳐 완성되는 경우만 봅니다. 귀문은 子酉·丑午·寅未·卯申·辰亥·巳戌 여섯 쌍입니다.',shinsal:'천을귀인과 문창귀인, 양인살은 일간 기준, 백호살과 괴강살은 간지 기준, 12신살은 년지 삼합 기준입니다. 공망은 일주 기준입니다.',gongmang:'공망은 일주 기준으로 午·未 같은 두 지지를 구하고, 그 지지가 용신·희신·기신 중 무엇인지 적습니다. 세운·대운·월운의 지지가 공망 지지이면 공망으로 표시합니다.',gyeok:'격은 월지 본기의 십성으로 정하고, 같은 십성이 천간에 드러나면 투출로 봅니다.'}};
  }
  function branchOrder(b){ return '子丑寅卯辰巳午未申酉戌亥'.indexOf(b); }
  return {analyze, PAIRS, pairKind};
});
