(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FunReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 재미로만 보는 풀이. 근거가 없는 점술이며, 전통 해석이나 예측이 아니다.
  const STEMS='甲乙丙丁戊己庚辛壬癸';
  const KO_STEMS='갑을병정무기경신임계';
  const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
  const KO_BRANCHES='자축인묘진사오미신유술해';
  const TEN=[['비견','겁재'],['식신','상관'],['편재','정재'],['편관','정관'],['편인','정인']];
  const DAY_TRAIT={
    '甲':'곧은 나무처럼 한 방향을 정하면 끝까지 밀고 가는 편이라는 농담이 어울립니다.',
    '乙':'덩굴처럼 주변 분위기에 맞춰 부드럽게 움직이는 편이라는 농담이 어울립니다.',
    '丙':'햇살처럼 자리의 분위기를 밝히는 편이라는 농담이 어울립니다.',
    '丁':'등불처럼 좋아하는 것에 오래 마음을 쏟는 편이라는 농담이 어울립니다.',
    '戊':'산처럼 묵직하게 자리를 지키는 편이라는 농담이 어울립니다.',
    '己':'밭처럼 챙기고 가꾸는 일을 잘하는 편이라는 농담이 어울립니다.',
    '庚':'쇠처럼 결단이 빠른 편이라는 농담이 어울립니다.',
    '辛':'보석처럼 세부를 다듬는 데 공을 들이는 편이라는 농담이 어울립니다.',
    '壬':'큰 물처럼 생각이 넓고 흐름을 잘 타는 편이라는 농담이 어울립니다.',
    '癸':'이슬처럼 조용히 관찰하고 깊이 생각하는 편이라는 농담이 어울립니다.'
  };
  const LOVE_BY_BRANCH={
    '자':'일지가 자(子)라서 감정 표현이 조용하지만 깊다는 농담이 있습니다.',
    '축':'일지가 축(丑)이라서 천천히 다가가는 편이라는 농담이 있습니다.',
    '인':'일지가 인(寅)이라서 호기심이 많고 먼저 움직이는 편이라는 농담이 있습니다.',
    '묘':'일지가 묘(卯)라서 다정하게 챙기는 편이라는 농담이 있습니다.',
    '진':'일지가 진(辰)이라서 변화가 많은 연애를 할 수도 있다는 농담이 있습니다.',
    '사':'일지가 사(巳)라서 생각이 많고 신중하다는 농담이 있습니다.',
    '오':'일지가 오(午)라서 열정적인 편이라는 농담이 있습니다.',
    '미':'일지가 미(未)라서 편안한 관계를 좋아한다는 농담이 있습니다.',
    '신':'일지가 신(申)이라서 재치 있는 대화를 즐긴다는 농담이 있습니다.',
    '유':'일지가 유(酉)라서 기준이 분명한 편이라는 농담이 있습니다.',
    '술':'일지가 술(戌)이라서 의리를 중요하게 여긴다는 농담이 있습니다.',
    '해':'일지가 해(亥)라서 마음을 열면 깊이 빠진다는 농담이 있습니다.'
  };
  const CHEON_EUL={'甲':['丑','未'],'戊':['丑','未'],'庚':['丑','未'],'乙':['子','申'],'己':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'辛':['寅','午'],'壬':['卯','巳'],'癸':['卯','巳']};
  const CAREER_NOTE=['관성이 드러나지 않아 자유로운 일이 맞다는 농담이 있습니다.','관성이 하나 보여 책임 있는 일을 맡기 쉽다는 농담이 있습니다.','관성이 여럿 보여 조직에서 역할을 잘 맡는다는 농담이 있습니다.'];

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
    const wealthNote=wealth===0?'재성이 거의 보이지 않으니, 재물 얘기는 재미로만 넘기세요.':wealth<3?'재성이 적당히 있어서 돈 얘기가 가끔 나온다는 농담이 있습니다.':'재성이 많아서 돈과 기회를 잘 본다는 농담이 있습니다.';
    const salary=Math.min(100,40+wealth*10+career*8+output*5);
    const dohwa=(data.shinsal||[]).some(s=>s.name==='도화살');
    const loveBranch=day.hangul[1];
    const loveLine=(LOVE_BY_BRANCH[loveBranch]||'')+(dohwa?' 도화살 표식도 보인다는 농담이 있습니다.':'');
    const guiin=[];
    const cheonEul=CHEON_EUL[dayHanja]||[];
    p.forEach((x,i)=>{ if(!x) return; const b=x.branch; if(cheonEul.includes(b)) guiin.push(['연주','월주','일주','시주'][i]); });
    const monthly=(data.extras&&data.extras.monthlyFlow)||[];
    const goodMonths=monthly.filter(m=>{ const s=koToHanja(m.pillar); const t=s?sipsinOf(dayHanja,s):null; return t==='편재'||t==='정재'||t==='정관'; }).map(m=>m.month+'월');
    const careerNote=CAREER_NOTE[Math.min(2,career)];
    const selfCount=(ten['비견']||0)+(ten['겁재']||0)+(ten['편인']||0)+(ten['정인']||0);
    const otherCount=output+wealth+career;
    const monthBranchTen=p[1]&&p[1].hidden&&p[1].hidden.length?p[1].hidden[p[1].hidden.length-1].ten:null;
    const GYEOK={'편관':'도전의 틀','정관':'질서의 틀','편재':'기회의 틀','정재':'관리의 틀','식신':'표현의 틀','상관':'변화의 틀','편인':'탐구의 틀','정인':'배움의 틀','비견':'독립의 틀','겁재':'경쟁의 틀'};
    const gyeokgukText=monthBranchTen&&GYEOK[monthBranchTen]?`월지 본기가 ${monthBranchTen}이라 '${GYEOK[monthBranchTen]}'이라는 농담입니다. 재미로 붙인 이름입니다.`:'월지 정보가 없어 격국 농담을 붙이지 않습니다.';
    const yongshinText=selfCount>otherCount?'힘을 빼 줄 식상·재성·관성 쪽이 도움이 된다는 농담입니다.':'힘을 더해 줄 인성·비겁 쪽이 도움이 된다는 농담입니다.';
    const traitLine=DAY_TRAIT[dayHanja]||'';
    const section=(title,body)=>`<div class="theme"><b>${title}</b><p>${body}</p></div>`;
    return `<article id="reading-fun-all" class="reading-card"><span>재미 풀이 모음 · 근거 없음</span><h3>재미로만 보는 사주 풀이</h3>`
      + section('성격 분석', traitLine)
      + section('재물운', wealthNote)
      + section('연애운', loveLine||'일지 정보가 없어요.')
      + section('직업 성향', careerNote)
      + section('재미 연봉 지수', `${salary}점 (100점 만점). 계산은 재성·관성·식상 개수에만 기대고 있어서 실제 연봉과는 아무 관계가 없습니다.`)
      + section('신강·신약 (재미)', selfCount>otherCount?'비겁과 인성이 많아 자기 힘이 센 편이라는 농담입니다.':selfCount<otherCount?'식상·재성·관성이 많아 밖으로 쓰는 힘이 큰 편이라는 농담입니다.':'두 쪽이 비슷하다는 농담입니다.')
      + ' <small>비겁·인성과 식상·재성·관성의 개수만 센 재미 구분이며, 실제 신강·신약 판정이 아닙니다.</small>'
      + section('격국 (재미)', gyeokgukText)
      + section('용신 (재미)', yongshinText)
      + section('올해 좋은 달 (재미)', goodMonths.length?goodMonths.join(' · ')+'. 재성·정관이 보이는 달이라는 농담입니다.':'재성이나 정관이 보이는 달이 없다는 농담입니다.')
      + section('귀인 (관례)', guiin.length?`천을귀인이 ${guiin.join('·')}에 보인다는 관례 표식입니다. 관례 표식일 뿐 실제 도움을 보장하지 않습니다.`:'천을귀인 표식이 보이지 않습니다.')
      + `<p class="reading-note">이 항목은 재미로만 봐 주세요. 근거가 없는 점술이며, 실제 성격·재물·연애·연봉·사건을 예측하지 않습니다.</p></article>`;
  }
  return {build, sipsinOf, koToHanja};
});
