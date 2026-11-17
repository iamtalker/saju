(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ProfileReading=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  // 성격·직업·재물 풀이. 명식의 실제 자리(월지 본기, 천간에 드러난 십성, 지장간 위치)에서 문장을 고르고,
  // 근거 목록을 함께 만든다. 화면과 Markdown이 같은 결과를 쓴다. 시간 미상으로 확정되지 않은 기둥은 쓰지 않는다.
  const KOB={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
  const KOS={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계'};
  const GROUP_OF={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
  const POS_BR=['연지','월지','일지','시지'];
  const POS_STEM=['연간',null,'월간',null];
  const POS_STEM_AT={0:'연간',1:'월간',3:'시간'};
  const josa=(w,b,p)=>{ const c=String(w).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?b:p; };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const DAY_SHORT={甲:'방향을 세우는 곧은 생각',乙:'상황에 맞춰 조율하는 유연한 생각',丙:'밝게 드러내며 나누는 생각',丁:'한곳을 깊이 파고드는 세심한 생각',戊:'중심을 잡고 버티는 묵직한 생각',己:'필요를 살피며 가꾸는 실용적인 생각',庚:'기준을 세우고 결단하는 날카로운 생각',辛:'세부를 다듬어 완성도를 높이는 생각',壬:'흐름을 넓게 읽어 가능성을 찾는 생각',癸:'속으로 관찰하고 곱씹는 섬세한 생각'};
  const DAY_THINK={
    甲:'일간 갑(甲)은 방향을 먼저 세운 뒤 그 기준에 맞춰 생각을 정리합니다.',
    乙:'일간 을(乙)은 여러 사정을 살피며 상황에 맞게 생각을 조율합니다.',
    丙:'일간 병(丙)은 떠오른 생각을 밝게 드러내고 말하면서 정리합니다.',
    丁:'일간 정(丁)은 한 주제를 깊이 파고들며 세심하게 생각을 다듬습니다.',
    戊:'일간 무(戊)는 큰 그림을 잡고 중심을 세워 차분히 정리합니다.',
    己:'일간 기(己)는 실제 상황과 필요를 하나씩 확인하며 정리합니다.',
    庚:'일간 경(庚)은 판단 기준을 분명히 세우고 결론을 빨리 내립니다.',
    辛:'일간 신(辛)은 작은 차이를 따져 완성도 기준으로 생각을 다듬습니다.',
    壬:'일간 임(壬)은 여러 가능성을 넓게 펼쳐 놓고 흐름을 보며 정리합니다.',
    癸:'일간 계(癸)는 조용히 관찰하고 속으로 곱씹으며 정리합니다.'
  };
  const DAY_WORK={
    甲:'목표를 세우고 끝까지 밀고 가는 추진형으로 일하는 편입니다.',
    乙:'사람과 일의 관계를 조율하며 맞춰 가는 방식으로 일하는 편입니다.',
    丙:'사람들 앞에서 드러내고 활기를 나누는 방식으로 일하는 편입니다.',
    丁:'한 가지 일에 오래 붙어 세심하게 마무리하는 방식으로 일하는 편입니다.',
    戊:'책임을 떠맡고 흔들리지 않게 버티는 방식으로 일하는 편입니다.',
    己:'현장의 필요를 챙기며 차근차근 쌓아 가는 방식으로 일하는 편입니다.',
    庚:'결단을 내리고 변화를 밀어붙이는 방식으로 일하는 편입니다.',
    辛:'완성도를 따지며 정교하게 다듬는 방식으로 일하는 편입니다.',
    壬:'큰 흐름을 읽고 가능성을 넓히는 방식으로 일하는 편입니다.',
    癸:'조용히 관찰하다 필요한 순간에 정확히 짚는 방식으로 일하는 편입니다.'
  };
  const SEASON={
    寅:'봄의 문턱, 기운이 막 움트는 달에',卯:'봄 한가운데 싹이 트는 달에',辰:'늦봄, 흙과 물기가 섞이는 환절기에',
    巳:'초여름, 기운이 밖으로 뻗기 시작하는 달에',午:'한여름, 기운이 가장 드러나는 달에',未:'늦여름, 습하고 무거운 환절기에',
    申:'초가을, 거두고 나누기 시작하는 달에',酉:'가을 한가운데, 정리와 결실의 달에',戌:'늦가을, 건조하고 단단해지는 환절기에',
    亥:'초겨울, 안으로 모아 두기 시작하는 달에',子:'겨울 한가운데, 맑고 차갑게 가라앉는 달에',丑:'늦겨울, 얼어 있던 흙이 풀리기 전의 달에'
  };
  // 십성별 문장. 필드마다 다른 관점(생각, 표현, 정리, 업무, 재물, 일상 예)을 쓴다.
  const TEN={
    비견:{think:'자기 근거를 스스로 검토한 뒤에야 결론을 받아들이는 편입니다.',express:'남의 말에 기대기보다 자기 입장을 그대로 드러내는 방식으로 표현합니다.',work:'자기 영역을 세워 독자적으로 끝까지 해내는 전문가형 업무가 잘 맞습니다.',money:'자기 힘으로 벌고 자기 몫을 지키는 방식으로 재물을 다룹니다.',daily_think:'남의 의견보다 내 판단을 먼저 적어 보고 결정하는 일',daily_work:'혼자 맡은 파트를 처음부터 끝까지 책임지는 일',daily_money:'내 수입과 지출을 따로 기록해 자기 몫을 확인하는 일'},
    겁재:{think:'여러 사람의 의견을 부딪히게 하며 생각을 시험해 보는 편입니다.',express:'의견을 힘 있게 말하며 같은 입장의 사람과 겨루듯 드러내는 방식으로 표현합니다.',work:'목표를 나눠 가진 팀 안에서 경쟁과 협력이 함께 있는 승부형 업무가 잘 맞습니다.',money:'함께 번 것을 나누거나 빼앗기기 쉬워, 경계를 정하며 재물을 다룹니다.',daily_think:'친구와 의견이 갈릴 때 바로 맞서기보다 한 템포 쉬고 생각하는 일',daily_work:'같은 목표를 가진 동료와 역할을 나눠 성과를 겨루는 일',daily_money:'공동 비용을 나눌 때 비율을 미리 정해 두는 일'},
    식신:{think:'생각을 차곡차곡 쌓아 결과물로 옮기며 정리하는 편입니다.',express:'차분하게 만들어 보여 주는 방식으로 표현합니다.',work:'결과물을 꾸준히 만들어 쌓는 제작·기획형 업무가 잘 맞습니다.',money:'꾸준한 생산과 반복되는 수익으로 재물을 쌓는 방식입니다.',daily_think:'생각한 내용을 짧은 메모로 남겨 두었다가 정리하는 일',daily_work:'보고서나 발표 자료의 초안을 매주 한 편씩 만드는 일',daily_money:'만든 결과물이 반복 수입으로 이어지는지 월별로 확인하는 일'},
    상관:{think:'기존 방식의 빈틈을 찾아 질문하면서 생각을 다듬는 편입니다.',express:'기존 틀에 질문을 던지며 날카롭게 말하는 방식으로 표현합니다.',work:'기존 방식을 바꾸는 개선·기획·표현형 업무가 잘 맞습니다.',money:'새 아이디어로 기회를 여는 방식입니다. 충동적인 지출을 살펴볼 필요가 있습니다.',daily_think:'회의에서 기존 절차의 빈틈을 먼저 짚어 보는 일',daily_work:'업무 절차의 불편함을 찾아 개선안을 제안하는 일',daily_money:'새 아이디어에 쓰는 비용을 한 달 예산 안에 미리 넣어 두는 일'},
    편재:{think:'여러 사람과 대화하며 생각을 넓게 펼쳐 보고 방향을 잡는 편입니다.',express:'여러 관계를 넘나들며 기회 중심으로 말하는 방식으로 표현합니다.',work:'여러 사람과 거래하고 기회를 찾는 영업·사업 관리형 업무가 잘 맞습니다.',money:'기회가 보이면 넓게 움직여 잡는 방식입니다. 한꺼번에 벌고 쓰기 쉬워 현금 흐름 관리가 중요합니다.',daily_think:'여러 사람을 만나 이야기를 듣고 생각의 범위를 넓히는 일',daily_work:'거래처 미팅을 잡아 새 기회를 넓히는 일',daily_money:'여러 입금 일정을 한 장에 모아 현금 흐름을 살피는 일'},
    정재:{think:'계획과 숫자를 근거로 생각을 차분히 정리하는 편입니다.',express:'구체적인 수치와 일정으로 말하는 방식으로 표현합니다.',work:'숫자와 계획을 꼼꼼히 관리하는 재무·운영형 업무가 잘 맞습니다.',money:'정해진 계획으로 조금씩 모아 두는 방식입니다.',daily_think:'할 일을 체크리스트로 나눠 하나씩 지워 가며 정리하는 일',daily_work:'월간 예산과 재고 수치를 맞춰 보고하는 일',daily_money:'적금과 생활비 계좌를 나눠 매달 같은 날 이체해 두는 일'},
    편관:{think:'압박 속에서 우선순위를 가려 결론을 밀어붙이며 정리하는 편입니다.',express:'짧고 단호하게 목표를 밝히는 방식으로 표현합니다.',work:'압박이 있는 과제를 맡아 추진하는 프로젝트·위기 대응형 업무가 잘 맞습니다.',money:'압박 속에서 목표를 세워 자원을 한곳에 모으는 방식입니다.',daily_think:'해야 할 일을 긴급도 순서로 나열하고 결정하는 일',daily_work:'마감이 겹친 프로젝트의 일정을 조율하고 책임지는 일',daily_money:'마감 전 비상 자금을 따로 떼어 두는 일'},
    정관:{think:'원칙과 기준을 먼저 떠올리고 그에 맞춰 생각을 정리하는 편입니다.',express:'규칙과 약속을 근거로 차분하게 말하는 방식으로 표현합니다.',work:'규칙과 절차가 분명한 조직 안의 관리·행정형 업무가 잘 맞습니다.',money:'규칙과 한도를 정해 지키며 관리하는 방식입니다.',daily_think:'약속과 원칙을 떠올리며 결정을 내리는 일',daily_work:'팀의 규칙 문서와 역할 배정을 정리하는 일',daily_money:'카드 한도와 고정 지출을 정해진 기준으로 점검하는 일'},
    편인:{think:'남들이 보지 않는 자료를 파고들어 혼자 관점을 세우는 편입니다.',express:'자료와 근거를 깊이 다뤄 독특한 관점으로 표현합니다.',organize:'남들이 쓰지 않는 자료로 혼자 관점을 세우며 생각을 정리하는 편입니다.',work:'남들이 놓친 부분을 파고드는 분석·연구형 업무가 잘 맞습니다.',money:'남다른 정보와 분석으로 기회를 고르는 방식입니다. 확신이 서기 전까지는 움직임이 늦습니다.',daily_think:'관심 주제를 혼자 깊이 조사하고 나만의 결론을 세우는 일',daily_work:'데이터를 분석해 문제의 원인을 찾는 일',daily_money:'투자나 구매 전에 자료를 두 곳 이상 비교해 보는 일'},
    정인:{think:'배움과 기준을 빌려 와 생각을 정리하는 편입니다.',express:'배운 지식과 기준을 근거로 차분히 설명하는 방식으로 표현합니다.',organize:'가르침이나 공식 기준을 바탕으로 생각을 정리하는 편입니다.',work:'배우고 가르치거나 기준을 전하는 교육·자문형 업무가 잘 맞습니다.',money:'배움과 도움으로 기반을 만든 뒤 재물을 쌓는 방식입니다.',daily_think:'선배나 책에서 기준을 빌려 와 결정하는 일',daily_work:'신입에게 업무 방법을 차근차근 가르치는 일',daily_money:'배우는 데 드는 교육비를 재정 계획에 미리 넣어 두는 일'}
  };
  const OPP={편재:'여러 기회를 넓게 잡으려는 기운입니다.',정재:'정해진 몫을 꾸준히 쌓으려는 기운입니다.'};
  const HIDDEN_NOTE={
    식상:'표현은 속에서 충분히 익힌 뒤에 드러나는 편입니다.',
    인성:'배움과 참고 자료를 필요할 때 나중에 찾는 편입니다.',
    관성:'규칙을 스스로 세운 뒤에 따르는 편입니다.',
    재성:'기회를 나중에 찾아 활용하는 편입니다.',
    비겁:'자기 힘을 속에 두었다가 천천히 쓰는 편입니다.'
  };
  // 부재 문장은 확인된 기둥에서만 말한다. 미확정 기둥에 같은 십성이 있을 수 있으므로 범위를 함께 밝힌다.
  const ABSENT_BODY={
    식상:'생각은 많아도 말과 결과물로 옮기는 데 시간이 걸리는 편입니다.',
    인성:'정리 기준을 스스로 세우는 편입니다.',
    관성:'외부 규칙보다 자기 기준으로 일하는 편입니다.',
    재성:'재물은 직접 다루는 기회보다 식상이나 인성 같은 다른 경로에서 얻는 흐름이 중심입니다.',
    비겁:'자원을 나누거나 겨루는 상대가 적은 편입니다.'
  };
  const absent=(c,g)=>`${c.prefix}에 ${g}이 드러나지 않아, ${ABSENT_BODY[g]}`;
  const VERDICT={
    personality:{신강:'주관이 강해 결론을 스스로 내리는 편입니다.',신약:'주변 의견을 많이 살피느라 정리가 조금 늦어질 수 있습니다.',갈림:'주관과 주변 의견을 번갈아 살피는 편입니다.',보류:'확정되지 않은 기둥이 정해지면 주관의 강약을 함께 볼 수 있습니다.'},
    career:{신강:'혼자 기획하고 책임지는 자리가 맞습니다.',신약:'역할이 분명하고 도움을 받을 수 있는 자리가 맞습니다.',갈림:'혼자 맡는 일과 함께하는 일을 섞을 수 있는 자리가 맞습니다.',보류:'확정되지 않은 기둥이 정해지면 감당할 업무의 무게를 함께 볼 수 있습니다.'},
    wealth:{신강:'쥔 자원을 직접 운용할 힘이 있는 편입니다.',신약:'재물을 감당할 힘이 약한 편이라 고정 지출을 먼저 점검하는 방식이 맞습니다.',갈림:'자원을 운용할 힘과 감당할 힘을 맞춰 보는 방식이 맞습니다.',보류:'확정되지 않은 기둥이 정해지면 재물을 감당할 힘을 함께 판단할 수 있습니다.'}
  };

  function ctxOf(data){
    const P=data.pillars, a=data.analysis||{}, day=P[2];
    const monthKnown=!!P[1];
    const stems=[];
    [0,1,3].forEach(i=>{ if(P[i]) stems.push({pos:POS_STEM_AT[i],ten:P[i].stemTen,g:GROUP_OF[P[i].stemTen]}); });
    const hid=[];
    P.forEach((p,i)=>{ if(!p||!p.hidden) return; p.hidden.forEach((h,k)=>hid.push({pos:POS_BR[i],hanja:h.hanja,ten:h.ten,g:GROUP_OF[h.ten],main:k===p.hidden.length-1})); });
    return {
      S:day.stem, monthKnown, M:monthKnown?P[1].branch:null,
      benTen:monthKnown&&a.gyeokguk?a.gyeokguk.ten:null,
      verdict:a.strength?a.strength.verdict:'보류',
      stems, hid
    };
  }
  // 월지 본기는 월지 문단에서 한 번만 다룬다. 같은 글자를 다른 문단에서 또 말하지 않도록 지장간 조회에서 뺀다.
  const where=(c,g)=>({vis:c.stems.filter(x=>x.g===g), hid:c.hid.filter(x=>x.g===g && !(x.main && x.pos==='월지')), monthMain:c.hid.some(x=>x.g===g && x.main && x.pos==='월지')});
  const monthOnly=g=>`${g}은 월지 본기로만 있어, 앞의 월지 풀이에 함께 담겨 있습니다.`;
  // 대표 십성: 월지 본기 → 드러난 천간 → 지장간 본기 순서
  function domTen(c){
    if(c.benTen) return c.benTen;
    if(c.stems.length) return c.stems[0].ten;
    const m=c.hid.find(h=>h.main); return m?m.ten:'비견';
  }

  // 확인 범위는 요약·문단·근거에 같이 쓴다. 미확정 기둥이 있으면 세 곳 모두 범위를 밝힌다.
  const SCOPE_LINE={
    personality:'확정되지 않은 {M}에 식상이나 인성이 있으면 위의 표현과 정리 방식 풀이가 달라질 수 있습니다.',
    career:'확정되지 않은 {M}에 관성이나 식상이 있으면 위의 업무 풀이가 달라질 수 있습니다.',
    wealth:'확정되지 않은 {M}에 재성이나 비겁이 있으면 위의 재물 풀이가 달라질 수 있습니다.'
  };
  function finish(c,sec){
    sec.evidence.push(`확인 범위: ${c.known.join('·')}${c.missing.length?` (미확정: ${c.missing.join('·')})`:''}`);
    if(c.missing.length){ sec.paragraphs.push(SCOPE_LINE[sec.key].replace('{M}',c.missing.join('·'))); sec.summary+=' · 확인된 기둥 기준'; }
    return sec;
  }
  function personality(c){
    const ev=[`일간 ${KOS[c.S]}(${c.S})`], paras=[];
    if(c.monthKnown){
      ev.push(`월지 ${KOB[c.M]}(${c.M}) 본기 ${c.benTen}`);
      paras.push(`${DAY_THINK[c.S]} ${SEASON[c.M]} 태어나 월지 ${KOB[c.M]}(${c.M})의 본기 ${c.benTen}${josa(c.benTen,'이','가')} 생각의 결을 더합니다. ${TEN[c.benTen].think}`);
    }else{
      paras.push(`${DAY_THINK[c.S]} 월주가 확정되지 않아 월지가 더하는 생각의 결은 보류합니다.`);
      ev.push('월지 미확정');
    }
    const sik=where(c,'식상');
    if(sik.vis.length){ const x=sik.vis[0]; ev.push(`${x.pos} ${x.ten}(천간에 드러남)`); paras.push(`${x.pos}에 드러난 ${x.ten}${josa(x.ten,'은','는')} ${TEN[x.ten].express}`); }
    else if(sik.hid.length){ const x=sik.hid[0]; ev.push(`${x.pos} 지장간 ${x.hanja} ${x.ten}`); paras.push(`식상(${x.ten})은 겉으로 드러나지 않고 ${x.pos} 지장간 속에 있어, ${HIDDEN_NOTE.식상}`); }
    else if(sik.monthMain) paras.push(monthOnly('식상'));
    else paras.push(absent(c,'식상'));
    const ins=where(c,'인성');
    if(ins.vis.length){ const x=ins.vis[0]; ev.push(`${x.pos} ${x.ten}(천간에 드러남)`); paras.push(`${x.pos}에 드러난 ${x.ten}${josa(x.ten,'은','는')} ${TEN[x.ten].organize}`); }
    else if(ins.hid.length){ const x=ins.hid[0]; ev.push(`${x.pos} 지장간 ${x.hanja} ${x.ten}`); paras.push(`인성(${x.ten})은 겉으로 드러나지 않고 ${x.pos} 지장간 속에 있어, ${HIDDEN_NOTE.인성}`); }
    else if(ins.monthMain) paras.push(monthOnly('인성'));
    else paras.push(absent(c,'인성'));
    const dom=domTen(c);
    ev.push(`신강·신약: ${c.verdict}`);
    paras.push(`${VERDICT.personality[c.verdict]} 일상 예: ${TEN[dom].daily_think}.`);
    const summary=`${DAY_SHORT[c.S]}${c.monthKnown?` · 월지 ${KOB[c.M]}(${c.M})의 ${c.benTen}이 바탕`:' · 월지는 월주 확정 후 반영'}`;
    return finish(c,{key:'personality',title:'성격',summary,paragraphs:paras,evidence:ev});
  }

  function career(c){
    const ev=[`일간 ${KOS[c.S]}(${c.S})`], paras=[DAY_WORK[c.S]];
    if(c.monthKnown){
      ev.push(`월지 ${KOB[c.M]}(${c.M}) 본기 ${c.benTen}`);
      paras.push(`월지 ${KOB[c.M]}(${c.M})의 본기 ${c.benTen}${josa(c.benTen,'은','는')} ${TEN[c.benTen].work}`);
    }else paras.push('월주가 확정되지 않아 월지 본기로 보는 업무 맞춤은 보류합니다.');
    const others=c.stems.filter(x=>x.ten!==c.benTen);
    if(others.length){ const x=others[0]; ev.push(`${x.pos} ${x.ten}(천간에 드러남)`); paras.push(`${x.pos}에 드러난 ${x.ten}${josa(x.ten,'은','는')} ${TEN[x.ten].work}`); }
    else{ const off=where(c,'관성'); if(off.hid.length){ const x=off.hid[0]; ev.push(`${x.pos} 지장간 ${x.hanja} ${x.ten}`); paras.push(`관성(${x.ten})은 겉으로 드러나지 않고 ${x.pos} 지장간 속에 있어, ${HIDDEN_NOTE.관성}`); } else if(off.monthMain) paras.push(monthOnly('관성')); else paras.push(absent(c,'관성')); }
    ev.push(`신강·신약: ${c.verdict}`);
    const dom=domTen(c);
    paras.push(`${VERDICT.career[c.verdict]} 예: ${TEN[dom].daily_work}.`);
    const summary=c.monthKnown?`월지 본기 ${c.benTen} 중심으로 맞는 업무를 봅니다`:'일간 중심으로 봅니다. 월주 확정 후 업무 맞춤을 더합니다';
    return finish(c,{key:'career',title:'직업·적성',summary,paragraphs:paras,evidence:ev});
  }

  function wealth(c){
    const ev=[], paras=[];
    const rj=where(c,'재성');
    let headline;
    if(rj.vis.length){ const x=rj.vis[0]; ev.push(`${x.pos} ${x.ten}(천간에 드러남)`); paras.push(`${x.pos}에 드러난 ${x.ten}${josa(x.ten,'은','는')} ${OPP[x.ten]}`); headline=`재성 ${x.ten}${josa(x.ten,'이','가')} ${x.pos}에 드러나 기회가 보이는 구조`; }
    else if(rj.hid.length){ const x=rj.hid[0]; ev.push(`${x.pos} 지장간 ${x.hanja} ${x.ten}`); paras.push(`재성(${x.ten})은 겉으로 드러나지 않고 ${x.pos} 지장간 속에 있어, ${HIDDEN_NOTE.재성}`); headline='재성이 지장간에 있어 기회가 늦게 드러나는 구조'; }
    else if(rj.monthMain){ paras.push(monthOnly('재성')); headline='재성이 월지 본기로만 있는 구조'; }
    else{ paras.push(absent(c,'재성')); headline=`${c.prefix}에 재성이 드러나지 않는 구조`; }
    if(c.monthKnown){
      ev.push(`월지 ${KOB[c.M]}(${c.M}) 본기 ${c.benTen}`);
      paras.push(`월지 ${KOB[c.M]}(${c.M})의 본기 ${c.benTen}${josa(c.benTen,'이','가')} 재물을 다루는 바탕입니다. ${TEN[c.benTen].money}`);
    }else paras.push('월주가 확정되지 않아 월지 본기로 보는 자원 관리 방식은 보류합니다.');
    const bj=where(c,'비겁');
    if(bj.vis.length){ const x=bj.vis[0]; ev.push(`${x.pos} ${x.ten}(천간에 드러남)`); paras.push(`${x.pos}에 드러난 ${x.ten}${josa(x.ten,'은','는')} 자원을 나누거나 겨루는 상대가 있다는 뜻입니다.`); }
    else if(bj.hid.length){ const x=bj.hid[0]; ev.push(`${x.pos} 지장간 ${x.hanja} ${x.ten}`); paras.push(`비겁(${x.ten})은 ${x.pos} 지장간 속에 있어, ${HIDDEN_NOTE.비겁}`); }
    else if(bj.monthMain) paras.push(monthOnly('비겁'));
    else paras.push(absent(c,'비겁'));
    ev.push(`신강·신약: ${c.verdict}`);
    const dom=rj.vis.length?rj.vis[0].ten:domTen(c);
    paras.push(`${VERDICT.wealth[c.verdict]} 예: ${TEN[dom].daily_money}.`);
    return finish(c,{key:'wealth',title:'재물',summary:headline,paragraphs:paras,evidence:ev});
  }

  function build(data){
    if(!data||!data.pillars||!data.pillars[2]) return {available:false,reason:'일주가 확정되지 않아 성격·직업·재물 풀이를 제공하지 않습니다.',sections:[],notes:[]};
    const c=ctxOf(data), notes=[];
    const LBL=['연주','월주',null,'시주'];
    c.missing=[0,1,3].filter(i=>!data.pillars[i]).map(i=>LBL[i]);
    c.known=[0,1,2,3].filter(i=>data.pillars[i]).map(i=>['연주','월주','일주','시주'][i]);
    c.prefix=c.missing.length?'확인된 기둥':'원국';
    if(!c.monthKnown) notes.push('월주가 확정되지 않아 월지와 월지 본기에서 나오는 풀이는 보류했습니다.');
    if(c.verdict==='보류') notes.push(`신강·신약은 확정되지 않은 기둥(${c.missing.join('·')})에 따라 판정이 달라져 보류합니다.`);
    return {available:true,reason:'',sections:[personality(c),career(c),wealth(c)],notes};
  }
  function toHtml(profile){
    if(!profile.available) return `<div class="theme"><b>성격·직업·재물</b><p>${esc(profile.reason)}</p></div>`;
    const blocks=profile.sections.map(s=>`<div id="reading-profile-${s.key}" class="theme"><b>${esc(s.title)} · ${esc(s.summary)}</b>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<small>근거: ${s.evidence.map(esc).join(' · ')}</small></div>`).join('');
    const notes=profile.notes.map(n=>`<p class="reading-note">${esc(n)}</p>`).join('');
    return `<div id="reading-profile" class="profile-block">${blocks}${notes}</div>`;
  }
  function toMarkdown(profile){
    if(!profile.available) return ['## 성격·직업·재물 풀이','',profile.reason];
    const lines=['## 성격·직업·재물 풀이',''];
    for(const s of profile.sections){
      lines.push(`### ${s.title}`,'',`**${s.summary}**`,'');
      s.paragraphs.forEach(p=>lines.push(p,''));
      lines.push(`근거: ${s.evidence.join(' · ')}`,'');
    }
    profile.notes.forEach(n=>lines.push(n,''));
    return lines;
  }
  return {build,toHtml,toMarkdown};
});
