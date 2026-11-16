const form=document.querySelector('#form');
const result=document.querySelector('#result');
const error=document.querySelector('#error');
const unknown=document.querySelector('#unknown');
const time=document.querySelector('#time');
const profileName=document.querySelector('#profileName');
const savedProfiles=document.querySelector('#savedProfiles');
function josaOf(word,batchim,plain){ const c=String(word).slice(-1).charCodeAt(0); const has=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0; return has?batchim:plain; }
function withJosa(word,batchim,plain){ return word+josaOf(word,batchim,plain); }
function koBranch(h){ const m={子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'}; return m[h]||h; }
const storageKey='saju.birth-form.v1';
const profilesKey='saju.saved-profiles.v1';
const lastResultKey='saju.last-result.v1';
const fieldIds=['year','month','day','time','sex','correction','longitude','boundary','profileName'];
const pillarNames=['연주','월주','일주','시주'];
const pillarMeanings=['태어난 해','태어난 달','태어난 날','태어난 시간'];

function captureForm(){
  return {
    year:document.querySelector('#year').value,
    month:document.querySelector('#month').value,
    day:document.querySelector('#day').value,
    calendar:document.querySelector('[name=calendar]:checked').value,
    leap:document.querySelector('#leap').checked,
    time:time.value,
    sex:document.querySelector('#sex').value,
    unknown:unknown.checked,
    correction:document.querySelector('#correction').value,
    longitude:document.querySelector('#longitude').value,
    dayBoundary:document.querySelector('#boundary').value
  };
}
function syncForm(){
  const lunar=document.querySelector('[name=calendar]:checked').value==='lunar';
  document.querySelector('#leap-label').hidden=!lunar;
  if(!lunar)document.querySelector('#leap').checked=false;
  time.disabled=unknown.checked;
}
function saveForm(){
  try{
    const values=Object.fromEntries(fieldIds.map(id=>[id,document.getElementById(id).value]));
    values.calendar=document.querySelector('[name=calendar]:checked').value;
    values.leap=document.querySelector('#leap').checked;
    values.unknown=unknown.checked;
    localStorage.setItem(storageKey,JSON.stringify(values));
  }catch{}
}
function restoreForm(){
  try{
    const values=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(!values||typeof values!=='object')return;
    for(const id of fieldIds)if(typeof values[id]==='string')document.getElementById(id).value=values[id];
    if(values.calendar==='lunar'||values.calendar==='solar')document.querySelector(`[name=calendar][value=${values.calendar}]`).checked=true;
    document.querySelector('#leap').checked=values.leap===true;
    unknown.checked=values.unknown===true;
  }catch{}
}
function readProfiles(){
  try{
    const value=JSON.parse(localStorage.getItem(profilesKey)||'[]');
    return Array.isArray(value)?value.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.values&&typeof p.values==='object'):[];
  }catch{return [];}
}
function writeProfiles(profiles){
  localStorage.setItem(profilesKey,JSON.stringify(profiles));
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function renderProfiles(){
  const profiles=readProfiles();
  const rows=profiles.map(p=>`<li class="saved-profile"><div class="saved-profile-info"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.values.calendar==='lunar'?'음력':'양력')} ${escapeHtml(p.values.year)}-${escapeHtml(p.values.month)}-${escapeHtml(p.values.day)}${p.values.unknown?' · 시간 미상':` · ${escapeHtml(p.values.time||'시간 미상')}`}</small></div><div class="saved-profile-actions"><button type="button" data-action="load" data-id="${escapeHtml(p.id)}">불러오기</button><button type="button" data-action="rename" data-id="${escapeHtml(p.id)}">이름 변경</button><button type="button" class="delete-profile" data-action="delete" data-id="${escapeHtml(p.id)}">삭제</button></div></li>`).join('');
  savedProfiles.innerHTML=`<div class="section-label">04 · 저장한 사주</div><h2>내 사주 목록 <small>${profiles.length}</small></h2><p class="saved-intro">저장 목록은 이 브라우저에만 보관됩니다.</p>${rows?`<ul class="saved-profile-list">${rows}</ul>`:'<p class="saved-empty">아직 저장한 사주가 없습니다. 생년월일을 검색하면 여기에 추가됩니다.</p>'}`;
}
function saveProfile(values){
  const profiles=readProfiles();
  const currentName=profileName.value.trim();
  const existing=profiles.find(p=>JSON.stringify(p.values)===JSON.stringify(values));
  const fallback=`${values.year}-${String(values.month).padStart(2,'0')}-${String(values.day).padStart(2,'0')}`;
  if(existing){
    if(currentName)existing.name=currentName;
    existing.values=values;
  }else{
    profiles.unshift({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:currentName||fallback,values});
  }
  writeProfiles(profiles);
  renderProfiles();
}
function loadForm(values,name){
  for(const id of ['year','month','day','time','sex','correction','longitude','boundary']){
    document.getElementById(id).value=values[id]??'';
  }
  document.querySelector(`[name=calendar][value=${values.calendar==='lunar'?'lunar':'solar'}]`).checked=true;
  document.querySelector('#leap').checked=values.leap===true;
  unknown.checked=values.unknown===true;
  profileName.value=name||'';
  syncForm();
  saveForm();
}

restoreForm();
syncForm();
renderProfiles();
form.addEventListener('input',()=>{syncForm();saveForm();});
form.addEventListener('change',()=>{syncForm();saveForm();});

function renderReadingToc(reading){
  const toc=[
    ['reading-fun-all','종합 풀이',true],['reading-criteria','계산 기준',true],['reading-pillars','네 기둥의 자리와 십이운성',true],
    ['reading-day','나의 중심 · 일간',Boolean(reading.day)],
    ['reading-elements','오행의 분포',true],
    ['reading-season','태어난 달 · 월지',Boolean(reading.season)],
    ['reading-ten','천간 십성',Boolean(reading.day)],
    ['reading-hidden','지장간 십성',Boolean(reading.day)],
    ['reading-relations','글자 사이의 관계',true],
    ['reading-shinsal','신살 표식',true],
    
    ['reading-daeun','대운 흐름',false],['reading-extras','띠·공망·십신 개수·월운·일진',true],['reading-convention','재물과 연애의 상징',Boolean(reading.day)],['reading-fun','일간 한 줄',Boolean(reading.day)]
  ].filter(item=>item[2]);
  return `<nav class="reading-toc" aria-label="풀이 목차"><strong>풀이 목차</strong><ol>${toc.map(([id,label])=>`<li><a href="#${id}">${label}</a></li>`).join('')}</ol></nav>`;
}
function renderReading(data,reading){
  const pillarGuide=[0,1,2,3].map(i=>{
    const p=data.pillars[i];
    return p?`<div class="theme"><b>${pillarNames[i]} · ${reading.pillarGuides[i]}</b><small>${reading.twelve?`십이운성 ${reading.twelve[i]}`:'일간 미상으로 십이운성 미산출'}</small></div>`:`<div class="theme"><b>${pillarNames[i]} · 미상</b><small>확정된 기둥이 없어 풀이에서 제외합니다.</small></div>`;
  }).join('');
  const dayHtml=reading.day?`<article id="reading-day" class="reading-card"><span>나의 중심 · 일간</span><h3>${reading.day.name}(${reading.day.hanja}), ${reading.day.metaphor}의 이미지</h3><p>명리에서는 ${withJosa(reading.day.name,'을','를')} ${reading.day.image}에 비유하며, ${withJosa(reading.day.theme,'과','와')} 연결해 읽습니다. 이는 일간 하나의 상징이므로 다른 글자와 함께 살펴야 합니다.</p></article>`:`<article class="reading-card"><h3>일간 풀이를 확정하기 어려워요</h3><p>출생시간에 따라 일주가 달라질 수 있어 일간과 십성 해석은 보류합니다.</p></article>`;
  const elementCounts=Object.entries(reading.counts).map(([name,count])=>`<div><b>${name}</b><strong>${count}</strong></div>`).join('');
  const elementCard=`<article id="reading-elements" class="reading-card"><span>오행의 분포</span><h3>${reading.prominent.length?`${withJosa(reading.prominent.join('·'),'이','가')} 보이는 글자에서 많아요`:'오행을 확인할 수 없어요'}</h3><div class="element-count">${elementCounts}</div><p>확정된 ${reading.knownCount}글자의 천간과 지지 대표 오행을 한 번씩 셌습니다. ${reading.prominent.length?`${reading.prominent.map(x=>`${withJosa(x,'은','는')} ${reading.elementText[x]}`).join(', ')}의 상징과 연결해 살펴볼 수 있습니다.`:''} ${reading.missing.length?`표면에 ${withJosa(reading.missing.map(koBranch).join('·'),'이','가')} 보이지 않습니다.`:'다섯 오행이 표면에 모두 나타납니다.'}</p></article>`;
  const seasonCard=reading.season?`<article id="reading-season" class="reading-card"><span>태어난 달 · 월지</span><h3>${reading.season.branch}(${reading.season.element})에 담긴 기운</h3><p>${({인:'봄',묘:'봄',진:'봄',사:'여름',오:'여름',미:'여름',신:'가을',유:'가을',술:'가을',해:'겨울',자:'겨울',축:'겨울'})[reading.season.branch]}의 달에 태어났습니다.</p><p>월지는 태어난 달의 지지로 계절을 살피는 자리입니다. ${reading.season.branch} 안의 지장간은 ${[...new Set(reading.season.ten)].join('·')} 십성으로 분류됩니다. 월령과 지장간을 해석하는 방식은 학파마다 달라, 여기서는 구성만 보여 줍니다.</p></article>`:'';
  const tenThemes=reading.tenThemes.length?reading.tenThemes.map(t=>`<div class="theme"><b>${t.name} · ${t.title}</b><small>${t.positions.join('·')}에 나타남</small><p>전통적으로 ${t.meaning}로 읽습니다. ${t.suggestion}</p></div>`).join(''):'확정된 다른 천간이 없어 십성 주제를 표시하지 않습니다.';
  const tenCard=reading.day?`<article id="reading-ten" class="reading-card"><span>관계와 활동 · 천간 십성</span><h3>겉으로 드러난 관계 주제</h3>${tenThemes}<p class="reading-note">천간과 지장간의 십성을 구분해 표시합니다. 지장간은 배열 목록입니다.</p></article>`:'';
  const hiddenThemes=reading.hiddenThemes.length?reading.hiddenThemes.map(t=>`<div class="theme"><b>${t.name} · ${t.title}</b><small>${t.positions.map(p=>`${p.position}: ${p.characters.join('·')}`).join(' / ')}</small><p>${t.meaning}. 각 지장간을 일간과 대조한 목록입니다.</p></div>`).join(''):'확정된 지지의 지장간이 없습니다.';
  const hiddenCard=reading.day?`<article id="reading-hidden" class="reading-card"><span>지지 안에 숨은 천간 · 지장간 십성</span><h3>겉글자 아래 함께 보는 주제</h3>${hiddenThemes}<p class="reading-note">지장간의 배열만 표시합니다.</p></article>`:'';
  const relations=data.relations.length?data.relations.map(r=>`${r.positions}의 ${r.characters} ${r.name}${r.element?`(${r.element})`:''}${r.complete===false?` 미완성 방합입니다. ${withJosa(r.missing.map(koBranch).join('·'),'이','가')} 빠져 합이 성립하지 않습니다`:''}`).join('. ')+'.':'확정된 글자에서 표시 대상 관계가 발견되지 않았습니다.';
  const relationCard=`<article id="reading-relations" class="reading-card"><span>글자 사이의 관계</span><h3>합과 충 살펴보기</h3><p>${relations}</p></article>`;
  const shinsal=reading.shinsal.length?reading.shinsal.map(s=>`<div class="theme"><b>${s.name} · ${s.matches.map(m=>`${m.기준} 기준 ${m.대상지지}(${m.위치.join('·')})`).join(' / ')}</b><p>${s.meaning}</p></div>`).join(''):'확정된 기둥에서 이 기준표의 표식을 찾지 못했습니다.';
  const shinsalCard=`<article id="reading-shinsal" class="reading-card"><span>전통 신살 표식 · 기준을 공개합니다</span><h3>도화·역마·화개·천의성</h3>${shinsal}<p class="reading-note">도화·역마·화개는 년지와 일지의 삼합 그룹을 기준으로, 천의성은 월지에서 한 칸 앞선 지지를 보는 현대식 표를 적용했습니다. 신살은 보조 분류이며 개수로 길흉이나 실제 사건을 예측하지 않습니다.</p></article>`;
  const positionTopics={연지:'주변 환경과 사회적 배경',월지:'일과 생활 환경',일지:'가까운 관계와 일상',시지:'개인 계획과 장기 목표'};
  const hasRel=y=>y.natalPositions.length||(y.relations&&(y.relations.stemHap.length||y.relations.hap.length||y.relations.xing.length||(y.relations.self&&y.relations.self.length)));
  const years=Array.isArray(data.yearCycles)?data.yearCycles.filter(hasRel):[];
  const yearItems=years.length?years.map(y=>`<div class="theme"><b>${y.year}년 · ${y.pillar}년 · 만 ${y.ageBeforeBirthday}~${y.ageAfterBirthday}세</b>${y.natalPositions.length?`<small>${withJosa(y.natalPositions.join('·'),'과','와')} 지지 충</small>`:''}${y.relations&&y.relations.stemHap.length?`<small>${withJosa(y.relations.stemHap.join('·'),'과','와')} 천간합</small>`:''}${y.relations&&y.relations.hap.length?`<small>${withJosa(y.relations.hap.join('·'),'과','와')} 지지 육합</small>`:''}${y.relations&&y.relations.self&&y.relations.self.length?`<small>${withJosa(y.relations.self.join('·'),'과','와')} 자형</small>`:''}${y.relations&&y.relations.xing.length?`<small>${withJosa(y.relations.xing.join('·'),'과','와')} 지지 형</small>`:''}<p>세운의 지지 ${y.branch}(${koBranch(y.branch)})${josaOf(koBranch(y.branch),"과","와")} 원국의 ${y.natalPositions.join('·')}가 충 관계입니다. 전통적인 자리 해석을 참고한다면 ${y.natalPositions.map(p=>positionTopics[p]).join('·')}에서 변화가 있을 때 일정과 대화를 여유 있게 점검해 볼 수 있습니다. 이 관계만으로 사건이 생긴다고 볼 수는 없습니다.</p></div>`).join(''):'앞으로 12년 동안 세운 지지가 원국 지지와 충을 이루는 해가 없습니다.';
  const yearCard=`<article id="reading-years" class="reading-card"><span>세운의 지지와 원국의 충 관계</span><h3>앞으로 12년 중 점검해 볼 관계</h3>${yearItems}<p class="reading-note">나이는 해당 연도의 생일 전 만 나이부터 생일 후 만 나이까지입니다. 연도별 간지는 입춘 이후 기준으로 계산했습니다. 충은 전통적 관계 표식일 뿐 사고·질병·이별을 예고하지 않으며, 이 표는 세운과 대운·월운·일진의 상호작용을 계산하지 않습니다.</p></article>`;
  const daeun=data.daeun;
  const daeunRows=daeun?.available?daeun.cycles.map((c,i)=>`<div class="theme"><b>${i+1}대운 · ${c.pillar}</b><small>만 ${Math.floor(c.fromAgeMonths/12)}세부터 ${Math.floor(c.toAgeMonths/12)-1}세까지</small><p>시작일 약 ${c.startDate} · 다음 교체 시점 약 ${c.endDate}</p><p>${c.natalClashes.length?`대운 지지 ${c.branch}(${koBranch(c.branch)})${josaOf(koBranch(c.branch),"과","와")} 원국 ${c.natalClashes.join('·')}의 충 관계가 있습니다. ${c.natalClashes.map(p=>positionTopics[p]).join('·')}에서 변화가 있을 때 계획과 소통을 점검하는 참고로 볼 수 있습니다.`:'대운 지지와 원국 지지 사이에 충 표식은 없습니다.'}</p></div>`).join(''):'대운을 표시하려면 출생시간과 ‘대운 계산 기준 성별’을 입력해야 합니다.';
  const daeunTable=daeun?.available?`<table class="daeun-table"><thead><tr><th>순서</th><th>간지</th><th>나이</th><th>시작 시점(근사)</th><th>원국과의 관계</th></tr></thead><tbody>${daeun.cycles.map((c,i)=>`<tr><td>${i+1}대운</td><td>${escapeHtml(c.pillar)}</td><td>만 ${Math.floor(c.fromAgeMonths/12)}~${Math.floor(c.toAgeMonths/12)}세</td><td>${escapeHtml(c.startDate)}</td><td>${c.natalClashes.length?`지지 ${escapeHtml(c.branch)} 충: ${escapeHtml(c.natalClashes.join('·'))}`:'충 없음'}</td></tr>`).join('')}</tbody></table>`:'';
  const altDaeun=daeun?.alternatives?['male','female'].map(k=>{const d=daeun.alternatives[k];return `<div class="theme"><b>${k==='male'?'남성':'여성'} 기준 · ${d.direction} · 시작 약 ${d.startAge}</b>${d.cycles.map((c,i)=>`<small>${i+1}대운 ${c.pillar}: 만 ${Math.floor(c.fromAgeMonths/12)}세부터</small>`).join('<br>')}</div>`;}).join(''):'';
  const daeunCard=`<article id="reading-daeun" class="reading-card"><span>월주에서 진행하는 10년 단위 간지</span><h3>대운 흐름</h3>${daeun?.available?`<p>${daeun.yearStem}년 · ${daeun.sex==='male'?'남성':'여성'} 기준 ${daeun.direction} · ${daeun.jie}까지의 간격으로 산출</p><p>첫 대운 시작 나이 약 ${daeun.startAge} · 시작일 약 ${daeun.startDate}</p><div class="theme"><b>기준별 비교</b><p>다수 구현 기준(년 단위 반올림): ${daeun.comparison.rounded}. 개월 잔여를 남기는 기준(yhj1024 방식): ${daeun.comparison.monthCarry}. 두 값은 반올림 방식의 차이만 보여 주며, 어느 쪽이 맞는지 증명하지 않습니다.</p></div>${daeunTable}`:`<p>${daeun?.alternatives?altDaeun:(daeun?.reason||'출생시간과 순·역행 기준 성별을 입력해야 대운을 계산할 수 있습니다.')}</p>`}<p class="reading-note">방향은 양년 남성·음년 여성 순행, 음년 남성·양년 여성 역행 기준입니다. 절입까지의 실제 시간 차이를 3일=1년으로 환산한 뒤 년 단위로 반올림하며 최소 1년입니다. 다수 구현이 공통으로 쓰는 규칙입니다. 시작일은 반올림한 시작 나이를 1년=365.2425일로 환산한 근삿값입니다. 학파·서비스마다 반올림과 교운 시각이 달라 결과가 다를 수 있습니다. 대운 간지와 시기만 표시하며, 길흉·직업·건강·사건을 예측하지 않습니다.</p></article>`;
const funStems={'甲':'한번 정한 방향은 끝까지 밀고 가는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 작은 목표 하나를 골라 보세요.','乙':'주변 분위기를 잘 읽고 맞춰 가는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 좋아하는 사람에게 안부를 전해 보세요.','丙':'분위기를 밝히는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 좋은 점을 한 가지 칭찬해 보세요.','丁':'마음을 쏟는 일에 오래 집중하는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 좋아하는 일에 30분을 써 보세요.','戊':'묵직하게 중심을 잡는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 미뤄 둔 약속 하나를 정리해 보세요.','己':'챙기고 가꾸는 일을 잘하는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 가까운 사람의 작은 필요를 살펴보세요.','庚':'결단이 빠른 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 망설이던 결정 하나를 내려 보세요.','辛':'세밀하게 다듬는 일을 좋아하는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 하던 일의 마무리를 한 군데 손봐 보세요.','壬':'생각이 넓고 흐름을 잘 타는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 평소 가 보지 않은 길을 한 번 걸어 보세요.','癸':'조용히 관찰하고 깊이 생각하는 편이라는 말이 어울리는 사주입니다. 오늘의 한 줄: 하루 한 줄 일기를 써 보세요.'};
  const wealthTen=(reading.tenThemes||[]).filter(g=>g.name==='편재'||g.name==='정재');
  const wealthBranch=(data.pillars||[]).map((p,i)=>p&&p.hidden&&p.hidden.length&&['편재','정재'].includes(p.hidden[p.hidden.length-1].ten)?['연지','월지','일지','시지'][i]:null).filter(Boolean);
  const wealthStem=wealthTen.length?wealthTen[0].positions:[];
  const wealthText=(wealthStem.length||wealthBranch.length)?`원국에 재성(편재·정재)이 천간 ${wealthStem.length?wealthStem.join('·'):'없음'}, 지지 본기 ${wealthBranch.length?wealthBranch.join('·'):'없음'} 자리에 보입니다.`:'원국에 재성이 보이지 않습니다.';
  const spouseText=data.pillars[2]?`일지는 ${data.pillars[2].hangul[1]}입니다.`:'일지를 확정하지 못했습니다.';
  const dohwa=(reading.shinsal||[]).some(s=>s.name==='도화살');
  const ex=data.extras;
  const extrasCard=ex?`<article id="reading-extras" class="reading-card"><span>계산 항목</span><h3>띠, 공망, 십신 개수, 올해 월운·오늘 일진</h3><p><b>띠:</b> ${escapeHtml(ex.animal||'')}띠 (년지 기준)</p><p><b>공망:</b> 일주 기준 공망 지지 ${escapeHtml(ex.gongmang)}</p><p><b>십신 개수:</b> ${ex.sipsinCount.map(s=>`${escapeHtml(s.name)} ${'█'.repeat(s.count)} ${s.count}`).join('<br>')||'없음'} (천간 3개와 지지 본기 4개 기준)</p><p><b>${ex.year}년 월별 간지:</b> ${ex.monthlyFlow.map(m=>`${m.month}월 ${escapeHtml(m.pillar)}`).join(' · ')} (각 월 15일 기준)</p><p><b>오늘 일진:</b> ${escapeHtml(ex.today.date)} ${escapeHtml(ex.today.pillar)}</p>${ex.trueSolar?`<p><b>진태양시(참고):</b> ${ex.trueSolar.time} · 표준시와 ${ex.trueSolar.diffMinutes}분 차이 (균시차 ${ex.trueSolar.equationMinutes}분 포함, 경도 ${ex.trueSolar.longitude}°)</p>`:''}</article>`:'';
  const sg=data.strength;
  const sgRow=(ok,name,rule)=>`<div class="theme"><b>${name}: ${ok?'충족':'미충족'}</b><p>${rule}</p></div>`;
  const strengthCard=sg?`<article id="reading-strength" class="reading-card"><span>신강·신약 충족 여부</span><h3>${sg.verdict}</h3>${sgRow(sg.deryeong,'득령','월지 본기가 일간을 돕는 비겁·인성인지 봅니다.')}${sgRow(sg.deuji,'득지','일지 지장간 중 비겁·인성이 하나라도 있는지 봅니다.')}${sgRow(sg.deuse,'득세','일간을 뺀 천간 3개와 지지 본기 4개 중 비겁·인성이 2개 이상인지 봅니다.')}<p class="reading-note">충족 개수 3개는 신강, 0개는 신약, 1~2개는 갈림입니다. 점수는 쓰지 않습니다. 득지와 득세의 정의는 이 구현의 선택입니다.</p></article>`:'';
  const conventionCard=`<article id="reading-convention" class="reading-card"><span>관례 설명</span><h3>재물과 연애의 상징</h3><p><b>재물:</b> 사주 관례에서 재성(편재·정재)은 재물과 자원을 상징합니다. ${wealthText}</p><p><b>연애:</b> 관례에서 일지는 배우자 자리로 봅니다. ${spouseText}${dohwa?' 원국에 도화살 표식도 보입니다. 관례에서 도화는 이성 관계의 상징으로 풀이합니다.':''}</p></article>`;
  const funText=data.pillars[2]?funStems[data.pillars[2].stem]:null;
  const funCard=funText?`<article id="reading-fun" class="reading-card"><span>일간 한 줄</span><h3>일간 ${escapeHtml(data.pillars[2].hangul)}의 한 줄</h3><p>${escapeHtml(funText)}</p></article>`:'';
  return `<section class="reading"><div class="section-label">03 · 사주 풀이</div><h2>나의 사주 읽어보기</h2><p class="reading-intro">전통 명리의 상징을 바탕으로 원국의 글자를 풀어봅니다. ${reading.partial?'확정된 기둥만 살펴본 부분 풀이입니다.':'태어난 시각까지 포함한 여덟 글자를 살펴봅니다.'}</p>${window.FunReading?window.FunReading.build(data):''}<article id="reading-pillars" class="reading-card"><span>네 기둥의 자리와 십이운성</span>${pillarGuide}<p class="reading-note">십이운성은 화토동궁, 양간 순행·음간 역행 기준입니다. 戊의 장생은 寅으로 봅니다. 전통적 분류입니다.</p></article>${dayHtml}${elementCard}${seasonCard}${tenCard}${hiddenCard}${relationCard}${shinsalCard}${extrasCard}<article id="reading-criteria" class="reading-card"><span>계산 기준</span><h3>판정에 쓴 기준</h3>${Object.entries((data.analysis&&data.analysis.criteria)||{}).map(([k,v])=>`<div class="theme"><b>${escapeHtml({strength:'신강·신약 판정',johu:'조후',yong:'용신·희신·기신',gi:'기신·한신',month:'월운',relations:'관계 식별',shinsal:'신살과 공망',gyeok:'격국'}[k]||k)}</b><p>${escapeHtml(v)}</p></div>`).join("")}<p class="reading-note">사주는 근거 없는 점술입니다. 이 풀이는 재미로만 봐 주세요.</p><p class="reading-note">버전 v${data.version}</p></article></section>`;
}
function renderMarkdown(data,reading){
  const lines=['# 사주 풀이','',`양력: ${data.solar}`,`음력: ${data.lunar}`,'','## 네 기둥','', '| 기둥 | 간지 | 십성 |','|---|---|---|'];
  for(let i=0;i<4;i++){
    const p=data.pillars[i];
    lines.push(`| ${pillarNames[i]} | ${p?`${p.stem}${p.branch} (${p.hangul})`:'미상'} | ${p?(i===2?'일간':p.stemTen):'미상'} |`);
  }
  lines.push('','## 네 기둥의 자리와 십이운성','');
  for(let i=0;i<4;i++)lines.push(`- **${pillarNames[i]}**: ${reading.pillarGuides[i]}${reading.twelve?` · 십이운성 ${reading.twelve[i]}`:''}`);
  if(reading.day)lines.push('','## 나의 중심 · 일간','',`${reading.day.name}(${reading.day.hanja})은 명리에서 ${reading.day.image}에 비유합니다. ${reading.day.theme}.`);
  lines.push('','## 오행의 분포','',...Object.entries(reading.counts).map(([name,count])=>`- ${name}: ${count}`),'',`천간과 지지 대표 오행 ${reading.knownCount}글자를 단순 집계했습니다. ${reading.missing.length?`표면에 보이지 않는 오행: ${reading.missing.join('·')}.`:''} `);
  if(reading.season)lines.push('','## 태어난 달 · 월지','',`월지 ${reading.season.branch}(${reading.season.element})의 지장간 십성 분류: ${[...new Set(reading.season.ten)].join('·')}.`);
  if(reading.tenThemes.length)lines.push('','## 천간 십성','',...reading.tenThemes.map(t=>`- **${t.name} (${t.positions.join('·')})**: ${t.meaning}. ${t.suggestion}`));
  if(reading.hiddenThemes.length)lines.push('','## 지장간 십성','',...reading.hiddenThemes.map(t=>`- **${t.name}** — ${t.positions.map(p=>`${p.position}: ${p.characters.join('·')}`).join(' / ')}: ${t.meaning}.`));
  lines.push('','## 글자 사이의 관계','',reading.relations.length?reading.relations.map(r=>`- ${r.positions}: ${r.characters} ${r.name}${r.element?`(${r.element})`:''}${r.complete===false?` 미완성 방합, 빠진 글자 ${r.missing.join('·')}(합이 성립하지 않음)`:''}`).join('\n'):'확정된 기둥에서 표시 대상 관계가 발견되지 않았습니다.');
  lines.push('','## 신살 표식','',reading.shinsal.length?reading.shinsal.map(s=>`- **${s.name}**: ${s.matches.map(m=>`${m.기준} 기준 ${m.대상지지} (${m.위치.join('·')})`).join(' / ')} — ${s.meaning}`).join('\n'):'이 기준표에서 발견한 표식이 없습니다.');
  const years=(data.yearCycles||[]).filter(y=>y.natalPositions.length||(y.relations&&(y.relations.stemHap.length||y.relations.hap.length||y.relations.xing.length)));
  lines.push('','## 앞으로 12년의 세운 관계','',years.length?years.map(y=>`- **${y.year}년 ${y.pillar}년 (만 ${y.ageBeforeBirthday}~${y.ageAfterBirthday}세)**: 세운 ${y.branch}(${koBranch(y.branch)})${josaOf(koBranch(y.branch),"과","와")} 원국 ${y.natalPositions.join('·')}의 지지 충`).join('\n'):'앞으로 12년 동안 원국 지지와 충을 이루는 세운이 없습니다.','', '세운의 충은 전통적 관계 표식이며 사고·질병·이별을 예고하지 않습니다. 대운·월운·일진은 포함하지 않습니다.');
  const daeun=data.daeun;
  const daeunLines=daeun?.available?[`- 순역행: ${daeun.direction} (${daeun.yearStem}년 ${daeun.sex==='male'?'남성':'여성'} 기준)`,`- 첫 대운 시작: 약 ${daeun.startAge} · ${daeun.startDate}`,...daeun.cycles.map((c,i)=>`- ${i+1}대운 ${c.pillar}: 만 ${Math.floor(c.fromAgeMonths/12)}세부터 ${Math.floor(c.toAgeMonths/12)-1}세까지 · 약 ${c.startDate}~${c.endDate}${c.natalClashes.length?` · 지지 ${c.branch}(${koBranch(c.branch)})${josaOf(koBranch(c.branch),"과","와")} 원국 ${c.natalClashes.join('·')} 충`:''}`)]:[`- ${daeun?.reason||'출생시간과 대운 계산 기준 성별이 필요합니다.'}`];
  const ex=data.extras;
  if(ex) lines.push('','## 계산 항목','',`- 띠: ${ex.animal}띠 (년지 기준)`,`- 공망: ${ex.gongmang}`,`- 십신 개수: ${ex.sipsinCount.map(s=>`${s.name} ${s.count}`).join(' · ')||'없음'}`,`- ${ex.year}년 월별 간지: ${ex.monthlyFlow.map(m=>`${m.month}월 ${m.pillar}`).join(' · ')} (각 월 15일 기준)`,`- 오늘 일진(${ex.today.date}): ${ex.today.pillar}`,...(ex.trueSolar?[`- 진태양시(참고): ${ex.trueSolar.time}, 표준시와 ${ex.trueSolar.diffMinutes}분 차이 (경도 ${ex.trueSolar.longitude}°)`]:[]));
  lines.push('','## 대운 흐름','',...daeunLines,'','순역행은 양년 남성·음년 여성 순행, 음년 남성·양년 여성 역행 기준입니다. 3일=1년으로 환산하고 시작 나이는 년 단위로 반올림합니다(최소 1년). 시작일은 반올림한 시작 나이를 환산한 근삿값입니다. 대운 간지와 시기만 표시하며 길흉이나 실제 사건을 예측하지 않습니다.');
  lines.push('','## 계산 기준','',`- 출생시간 보정: ${data.correction}분`, `- 일주 경계: ${data.boundary==='23'?'밤 11시':'자정'}`,`- 십이운성: 화토동궁, 양간 순행·음간 역행`,`- 시간 미상 여부: ${data.pillars[3]?'아니요':'예'}`,'','이 결과는 전통 명리의 상징적 분류를 설명합니다. 실제 성격이나 미래를 입증하는 결과가 아니며, 강약·격국·용신에 따른 종합 해석은 포함하지 않습니다.','');
  lines.push('','버전 v'+data.version);
  return lines.join('\n');
}

function renderResult(data,values,{persist=true}={}){
  const cards=[3,2,1,0].map(i=>{
    const p=data.pillars[i];
    return p?`<div class="pillar"><div class="pillar-name">${pillarNames[i]} <span>${pillarMeanings[i]}</span></div><div class="character ${p.stemElement}">${p.stem}<small>${p.hangul[0]} · ${p.stemElement}</small></div><div class="character ${p.branchElement}">${p.branch}<small>${p.hangul[1]} · ${p.branchElement}</small></div><div class="ten">${!data.pillars[2]?'십성 미상':i===2?'일간 · 나의 기준':p.stemTen}</div></div>`:`<div class="pillar"><div class="pillar-name">${pillarNames[i]} <span>${pillarMeanings[i]}</span></div><div class="missing">미상</div></div>`;
  }).join('');
  const day=data.pillars[2];
  const detail=day?`<div class="explain"><span class="section-label">나를 나타내는 글자</span><h3>일간 ${day.stem}(${day.hangul[0]}) · ${day.stemElement}</h3><p>일간은 태어난 날의 천간으로, 다른 글자와의 관계를 살피는 기준입니다. ${day.stemYin}의 성질과 ${day.stemElement}의 오행으로 분류합니다.</p></div>`:'<div class="explain"><p>일간이 확정되지 않아 십성을 표시할 수 없습니다.</p></div>';
  const hidden=data.pillars.map((p,i)=>p?`<div><b>${pillarNames[i]}</b> ${p.hidden.map(x=>`${x.hanja}(${x.hangul}, ${x.ten})`).join(' · ')}</div>`:'').join('');
  const reading=SajuReading.create(data);
  const readingHtml=renderReading(data,reading);
  const markdown=renderMarkdown(data,reading);
  result.innerHTML=`<p class="notice fun-banner"><b>사주는 근거 없는 점술입니다. 아래 내용은 모두 재미로만 봐 주세요.</b></p><div class="result-heading"><div><div class="section-label">02 · 나의 사주</div><h2>태어난 순간의 네 기둥</h2></div><button type="button" id="exportMarkdown" class="secondary-button">풀이를 Markdown으로 저장</button></div><p class="dates">양력 ${escapeHtml(data.solar)} <span>·</span> 음력 ${escapeHtml(data.lunar)}</p>${data.warning.map(w=>`<p class="notice">${escapeHtml(w)}</p>`).join('')}${(data.boundaryInfo&&data.boundaryInfo.alternatives||[]).map(a=>`<p class="notice">${escapeHtml(a.label)}: ${a.pillars.join(' ')}</p>`).join('')}${renderReadingToc(reading)}<div class="pillars">${cards}</div>${detail}${readingHtml}${day?`<details><summary>지장간과 십성 더 보기</summary><p>지장간은 지지에 배속하는 천간입니다. 괄호 안의 십성은 일간과의 관계입니다.</p><div class="hidden-list">${hidden}</div></details>`:''}<details><summary>글자 사이의 관계</summary><p>천간합·육합·충과 삼합·방합의 짝 또는 조합 후보를 표시합니다. 부분 조합은 후보이며, 합화나 길흉을 확정하지 않습니다. 미상인 기둥은 검사하지 않습니다.</p><div class="hidden-list">${data.relations.length?data.relations.map(r=>`<div>${r.name} · ${r.positions} (${r.characters})${r.element?` · ${r.element}`:''}${r.complete===false?` · 빠진 글자 ${r.missing.join('·')}`:''}</div>`).join(''):'확인된 관계가 없습니다.'}</div></details><details><summary>계산 기준과 한계</summary><p>절입 시각으로 연주와 월주를 정합니다. 출생 시각은 한국의 당시 표준시를 기준으로 하며, 1987~1988년 서머타임을 반영합니다. 일주와 시주는 입력한 보정 분을 표준시에서 빼 계산합니다. 30분은 근사값이며 출생지나 균시차를 자동 계산하지 않습니다.</p><p>일주는 ${data.boundary==='23'?'보정 시각의 밤 11시':'보정 시각의 자정'}를 기준으로 바뀝니다. ${data.standardTime?`당시 표준시: ${data.standardTime} · 보정된 시각: ${data.adjustedTime}${data.dst?' (서머타임 보정)':''}.`:''}</p><p>대운은 ${data.daeun?.available?'양년남·음년녀 순행 기준이며 3일=1년 환산과 년 단위 반올림을 적용한 근사치입니다.':(data.daeun?.alternatives?'성별을 고르지 않아 남성 기준과 여성 기준을 함께 표시했습니다.':'출생시각 또는 계산 기준 성별이 없어 생략했습니다.')} 용신을 포함한 종합 길흉 해석은 제공하지 않습니다.</p></details>`;
  result.querySelector('#exportMarkdown').addEventListener('click',()=>{
    const blob=new Blob([markdown],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=`사주풀이-${String(values.year)}-${String(values.month).padStart(2,'0')}-${String(values.day).padStart(2,'0')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  });
  if(persist){
    try{localStorage.setItem(lastResultKey,JSON.stringify({data,values}));}catch{}
    try{saveProfile(values);}catch{error.textContent='결과는 표시했지만 브라우저 저장 공간에 기록하지 못했습니다.';}
    saveForm();
  }
}

try{
  const saved=JSON.parse(localStorage.getItem(lastResultKey)||'null');
  if(saved?.data?.pillars&&saved?.values){
    const profile=readProfiles().find(p=>JSON.stringify(p.values)===JSON.stringify(saved.values));
    loadForm(saved.values,profile?.name||profileName.value);
    renderResult(saved.data,saved.values,{persist:false});
  }
}catch{}

form.addEventListener('submit',async event=>{
  event.preventDefault();
  error.textContent='';
  const values=captureForm();
  try{
    const response=await fetch('/api/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error);
    renderResult(data,values);
  }catch(err){error.textContent=err.message;}
});

savedProfiles.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');
  if(!button)return;
  const profiles=readProfiles();
  const profile=profiles.find(p=>p.id===button.dataset.id);
  if(!profile)return;
  if(button.dataset.action==='load'){
    loadForm(profile.values,profile.name);
    form.requestSubmit();
  }else if(button.dataset.action==='rename'){
    const name=window.prompt('목록에 표시할 이름을 입력하세요.',profile.name);
    if(name===null)return;
    if(!name.trim()){window.alert('이름을 입력해 주세요.');return;}
    profile.name=name.trim();
    try{writeProfiles(profiles);renderProfiles();}catch{window.alert('브라우저 저장 공간에 기록하지 못했습니다.');}
  }else if(button.dataset.action==='delete'){
    if(!window.confirm(`“${profile.name}” 항목을 삭제할까요?`))return;
    try{writeProfiles(profiles.filter(p=>p.id!==profile.id));renderProfiles();}catch{window.alert('브라우저 저장 공간에서 삭제하지 못했습니다.');}
  }
});
