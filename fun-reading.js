(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FunReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 일간·십성·지지를 고정 문장에 맞춰 요약한다. 전통 상징을 설명하는 문장이며 판정이나 예측이 아니다.
  const STEMS='甲乙丙丁戊己庚辛壬癸';
  const KO_STEMS='갑을병정무기경신임계';
  const TEN=[['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
  const DAY_TRAIT={
    '甲':'곧은 나무처럼 한 방향을 정하면 끝까지 밀고 가는 편이라고 볼 수 있습니다.',
    '乙':'덩굴처럼 주변 분위기에 맞춰 부드럽게 움직이는 편이라고 볼 수 있습니다.',
    '丙':'햇살처럼 자리의 분위기를 밝히는 편이라고 볼 수 있습니다.',
    '丁':'등불처럼 좋아하는 것에 오래 마음을 쏟는 편이라고 볼 수 있습니다.',
    '戊':'산처럼 묵직하게 자리를 지키는 편이라고 볼 수 있습니다.',
    '己':'밭처럼 챙기고 가꾸는 일을 잘하는 편이라고 볼 수 있습니다.',
    '庚':'쇠처럼 결단이 빠른 편이라고 볼 수 있습니다.',
    '辛':'보석처럼 세부를 다듬는 데 공을 들이는 편이라고 볼 수 있습니다.',
    '壬':'큰 물처럼 생각이 넓고 흐름을 잘 타는 편이라고 볼 수 있습니다.',
    '癸':'이슬처럼 조용히 관찰하고 깊이 생각하는 편이라고 볼 수 있습니다.'
  };
  const LOVE_BY_BRANCH={
    '자':'일지가 자(子)이므로 감정 표현이 조용하지만 깊은 편이라고 볼 수 있습니다.',
    '축':'일지가 축(丑)이므로 천천히 다가가는 편이라고 볼 수 있습니다.',
    '인':'일지가 인(寅)이므로 호기심이 많고 먼저 움직이는 편이라고 볼 수 있습니다.',
    '묘':'일지가 묘(卯)이므로 다정하게 챙기는 편이라고 볼 수 있습니다.',
    '진':'일지가 진(辰)이므로 변화가 많은 관계를 가질 수 있다고 볼 수 있습니다.',
    '사':'일지가 사(巳)이므로 생각이 많고 신중한 편이라고 볼 수 있습니다.',
    '오':'일지가 오(午)이므로 열정적인 편이라고 볼 수 있습니다.',
    '미':'일지가 미(未)이므로 편안한 관계를 좋아하는 편이라고 볼 수 있습니다.',
    '신':'일지가 신(申)이므로 재치 있는 대화를 즐기는 편이라고 볼 수 있습니다.',
    '유':'일지가 유(酉)이므로 기준이 분명한 편이라고 볼 수 있습니다.',
    '술':'일지가 술(戌)이므로 의리를 중요하게 여기는 편이라고 볼 수 있습니다.',
    '해':'일지가 해(亥)이므로 마음을 열면 깊이 빠지는 편이라고 볼 수 있습니다.'
  };
  const CHEON_EUL={'甲':['丑','未'],'戊':['丑','未'],'庚':['丑','未'],'乙':['子','申'],'己':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'辛':['寅','午'],'壬':['卯','巳'],'癸':['卯','巳']};
  const CAREER_NOTE=['천간에 관성이 보이지 않아 자유로운 일이 맞는 편이라고 볼 수 있습니다.','관성이 하나 보여 책임 있는 일을 맡기 쉬운 편이라고 볼 수 있습니다.','관성이 여럿 보여 조직에서 역할을 맡는 경우가 많다고 볼 수 있습니다.'];

  function sipsinOf(dayHanja, otherHanja){
    const di=STEMS.indexOf(dayHanja), n=STEMS.indexOf(otherHanja);
    if(di<0||n<0) return null;
    const row=TEN[(Math.floor(n/2)-Math.floor(di/2)+5)%5];
    return row[n%2===di%2?0:1];
  }
  function koToHanja(ko){ const i=KO_STEMS.indexOf(ko[0]); return i<0?null:STEMS[i]; }

  function build(data){
    const p=data.pillars;
    const day=p[2];
    if(!day) return '';
    const dayHanja=day.stem;
    // 천간 3개(일간 제외)와 지지 본기 4개의 십신을 센다.
    const ten={};
    const add=n=>{ if(n) ten[n]=(ten[n]||0)+1; };
    p.forEach((x,i)=>{ if(!x) return; if(i!==2) add(sipsinOf(dayHanja,x.stem)); const h=x.hidden; if(h&&h.length) add(h[h.length-1].ten); });
    const wealth=(ten['편재']||0)+(ten['정재']||0);
    const career=(ten['편관']||0)+(ten['정관']||0);
    const output=(ten['식신']||0)+(ten['상관']||0);
    const wealthNote=wealth===0?'재성이 거의 보이지 않습니다.':wealth<3?'재성이 적당히 있어 돈과 기회에 관심이 가는 편이라고 볼 수 있습니다.':'재성이 많아 돈과 기회를 다루는 일이 많은 편이라고 볼 수 있습니다.';
    const salary=Math.min(100,40+wealth*10+career*8+output*5);
    const dohwa=(data.shinsal||[]).some(s=>s.name==='도화살');
    const loveBranch=day.hangul[1];
    const loveLine=(LOVE_BY_BRANCH[loveBranch]||'')+(dohwa?' 원국에 도화 표식도 보입니다.':'');
    const guiin=[];
    const cheonEul=CHEON_EUL[dayHanja]||[];
    p.forEach((x,i)=>{ if(!x) return; if(cheonEul.includes(x.branch)) guiin.push(['연주','월주','일주','시주'][i]); });
    const monthly=(data.extras&&data.extras.monthlyFlow)||[];
    const sv=data.strength&&data.strength.verdict;
    const wantSet=sv==='신약'?['비견','겁재','편인','정인']:sv==='신강'?['편재','정재','편관','정관']:null;
    const goodMonths=wantSet?monthly.filter(m=>{ const s=koToHanja(m.pillar); const t=s?sipsinOf(dayHanja,s):null; return wantSet.includes(t); }).map(m=>m.month+'월'):[];
    const monthNote=sv==='신약'?'일간이 약한 편이라 인성·비겁이 오는 달을 살펴볼 만하다고 볼 수 있습니다.':sv==='신강'?'일간이 강한 편이라 재성·관성이 오는 달을 살펴볼 만하다고 볼 수 있습니다.':'신강·신약 판정이 갈려 달을 구분하지 않습니다.';
    const ELEM={甲:'목',乙:'목',丙:'화',丁:'화',戊:'토',己:'토',庚:'금',辛:'금',壬:'수',癸:'수'};
    const dy=data.daeun;
    const birthYear=parseInt(String(data.solar||'').split('년')[0],10);
    const nowYear=Number((data.extras&&data.extras.year)||new Date().getFullYear());
    const ageNow=nowYear-birthYear;
    const curCycle=dy&&dy.available&&Number.isFinite(ageNow)?dy.cycles.find(c=>ageNow*12>=c.fromAgeMonths&&ageNow*12<c.toAgeMonths):null;
    const daeunLine=curCycle?(()=>{ const el=ELEM[curCycle.pillar[0]]; const count=p.reduce((n,x)=>n+(x?(x.stemElement===el?1:0)+(x.branchElement===el?1:0):0),0); const from=Math.floor(curCycle.fromAgeMonths/12), to=Math.floor(curCycle.toAgeMonths/12); return `지금 대운 ${curCycle.pillar}(만 ${from}~${to}세)의 천간은 ${el} 기운입니다. ${count?`원국에 ${el} 기운이 ${count}개 있습니다.`:`원국에는 ${el} 기운이 없어, 이 대운에서 새로 들어오는 기운이라고 볼 수 있습니다.`}`; })():(dy&&dy.alternatives?'성별을 고르면 현재 대운을 하나로 정할 수 있습니다.':'대운 정보가 없습니다.');
    const careerNote=CAREER_NOTE[Math.min(2,career)];
    const traitLine=DAY_TRAIT[dayHanja]||'';
    const wealthVerdict=(wealth>=1&&sv==='신약')?' 재성은 있으나 일간이 약해 재성을 감당하는 것이 과제라고 볼 수 있습니다.':(wealth>=1&&sv==='신강')?' 일간이 강해 재성을 다룰 힘이 있는 편이라고 볼 수 있습니다.':'';
    const wealthFull=wealthNote+wealthVerdict;
    const summary=traitLine+' '+wealthFull;
    const section=(title,body)=>`<div class="theme"><b>${title}</b><p>${body}</p></div>`;
    return `<article id="reading-fun-all" class="reading-card"><span>성격·재물·연애 요약</span><h3>원국에서 보이는 성향</h3>`
      + section('결론 한 줄', summary)
      + section('성격', traitLine)
      + section('재물', wealthFull)
      + section('연애', loveLine||'일지 정보가 없습니다.')
      + section('직업 성향', careerNote)
      + section('올해 좋은 달', (goodMonths.length?goodMonths.join(' · ')+'. ':'해당하는 달이 없습니다. ')+monthNote)
      + section('대운', daeunLine)
      + section('귀인 (관례)', guiin.length?`천을귀인이 ${guiin.join('·')}에 보입니다. 관례상의 표식입니다.`:'천을귀인 표식이 보이지 않습니다.')
      + `</article>`;
  }
  return {build, sipsinOf, koToHanja};
});
