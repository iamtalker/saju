const form=document.querySelector('#form');
const result=document.querySelector('#result');
const error=document.querySelector('#error');
const unknown=document.querySelector('#unknown');
const time=document.querySelector('#time');
const profileName=document.querySelector('#profileName');
const savedProfiles=document.querySelector('#savedProfiles');
const storageKey='saju.birth-form.v1';
const profilesKey='saju.saved-profiles.v1';
const lastResultKey='saju.last-result.v1';
const fieldIds=['year','month','day','time','correction','boundary','profileName'];
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
    unknown:unknown.checked,
    correction:document.querySelector('#correction').value,
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
  for(const id of ['year','month','day','time','correction','boundary']){
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
    ['reading-pillars','네 기둥의 자리와 십이운성',true],
    ['reading-day','나의 중심 · 일간',Boolean(reading.day)],
    ['reading-elements','오행의 분포',true],
    ['reading-season','태어난 달 · 월지',Boolean(reading.season)],
    ['reading-ten','천간 십성',Boolean(reading.day)],
    ['reading-hidden','지장간 십성',Boolean(reading.day)],
    ['reading-relations','글자 사이의 관계',true],
    ['reading-shinsal','신살 표식',true],
    ['reading-years','앞으로 12년의 세운 관계',true]
  ].filter(item=>item[2]);
  return `<nav class="reading-toc" aria-label="풀이 목차"><strong>풀이 목차</strong><ol>${toc.map(([id,label])=>`<li><a href="#${id}">${label}</a></li>`).join('')}</ol></nav>`;
}
function renderReading(data,reading){
  const pillarGuide=[0,1,2,3].map(i=>{
    const p=data.pillars[i];
    return p?`<div class="theme"><b>${pillarNames[i]} · ${reading.pillarGuides[i]}</b><small>${reading.twelve?`십이운성 ${reading.twelve[i]}`:'일간 미상으로 십이운성 미산출'}</small></div>`:`<div class="theme"><b>${pillarNames[i]} · 미상</b><small>확정된 기둥이 없어 풀이에서 제외합니다.</small></div>`;
  }).join('');
  const dayHtml=reading.day?`<article id="reading-day" class="reading-card"><span>나의 중심 · 일간</span><h3>${reading.day.name}(${reading.day.hanja}), ${reading.day.metaphor}의 이미지</h3><p>명리에서는 ${reading.day.name}을 ${reading.day.image}에 비유하며, ${reading.day.theme}와 연결해 읽습니다. 이는 일간 하나의 상징이므로 다른 글자와 함께 살펴야 합니다.</p></article>`:`<article class="reading-card"><h3>일간 풀이를 확정하기 어려워요</h3><p>출생시간에 따라 일주가 달라질 수 있어 일간과 십성 해석은 보류합니다.</p></article>`;
  const elementCounts=Object.entries(reading.counts).map(([name,count])=>`<div><b>${name}</b><strong>${count}</strong></div>`).join('');
  const elementCard=`<article id="reading-elements" class="reading-card"><span>오행의 분포</span><h3>${reading.prominent.length?`${reading.prominent.join('·')}이 보이는 글자에서 많아요`:'오행을 확인할 수 없어요'}</h3><div class="element-count">${elementCounts}</div><p>확정된 ${reading.knownCount}글자의 천간과 지지 대표 오행을 한 번씩 셌습니다. ${reading.prominent.length?`${reading.prominent.map(x=>`${x}은 ${reading.elementText[x]}`).join(', ')}의 상징과 연결해 살펴볼 수 있습니다.`:''} ${reading.missing.length?`표면에 ${reading.missing.join('·')}이 보이지 않지만, 지장간과 계절을 반영한 강약 판정은 아닙니다.`:'다섯 오행이 표면에 모두 나타납니다.'} 개수가 많거나 적다는 것만으로 좋고 나쁨을 판단하지 않습니다.</p></article>`;
  const seasonCard=reading.season?`<article id="reading-season" class="reading-card"><span>태어난 달 · 월지</span><h3>${reading.season.branch}(${reading.season.element})에 담긴 기운</h3><p>월지는 태어난 달의 지지로 계절을 살피는 자리입니다. ${reading.season.branch} 안의 지장간은 ${[...new Set(reading.season.ten)].join('·')} 십성으로 분류됩니다. 월령과 지장간을 해석하는 방식은 학파마다 달라, 여기서는 구성만 보여 주며 강약이나 용신을 판정하지 않습니다.</p></article>`:'';
  const tenThemes=reading.tenThemes.length?reading.tenThemes.map(t=>`<div class="theme"><b>${t.name} · ${t.title}</b><small>${t.positions.join('·')}에 나타남</small><p>전통적으로 ${t.meaning}로 읽습니다. ${t.suggestion}</p></div>`).join(''):'확정된 다른 천간이 없어 십성 주제를 표시하지 않습니다.';
  const tenCard=reading.day?`<article id="reading-ten" class="reading-card"><span>관계와 활동 · 천간 십성</span><h3>겉으로 드러난 관계 주제</h3>${tenThemes}<p class="reading-note">천간과 지장간의 십성을 구분해 표시합니다. 지장간은 배열 목록이며 실제 작용력이나 비중을 판정하지 않습니다.</p></article>`:'';
  const hiddenThemes=reading.hiddenThemes.length?reading.hiddenThemes.map(t=>`<div class="theme"><b>${t.name} · ${t.title}</b><small>${t.positions.map(p=>`${p.position}: ${p.characters.join('·')}`).join(' / ')}</small><p>${t.meaning}. 각 지장간을 일간과 대조한 목록이며, 주된 작용이나 비중을 뜻하지 않습니다.</p></div>`).join(''):'확정된 지지의 지장간이 없습니다.';
  const hiddenCard=reading.day?`<article id="reading-hidden" class="reading-card"><span>지지 안에 숨은 천간 · 지장간 십성</span><h3>겉글자 아래 함께 보는 주제</h3>${hiddenThemes}<p class="reading-note">지장간의 배열만 표시합니다. 계절에 따른 사령·가중치와 작용력은 적용하지 않았습니다.</p></article>`:'';
  const relations=data.relations.length?data.relations.map(r=>`${r.positions}의 ${r.characters} ${r.name}${r.element?`(${r.element})`:''}${r.complete===false?` 부분 조합이며 ${r.missing.join('·')}이 빠져 있습니다`:''}`).join('. ')+'.':'확정된 글자에서 표시 대상 관계가 발견되지 않았습니다.';
  const relationCard=`<article id="reading-relations" class="reading-card"><span>글자 사이의 관계</span><h3>합과 충 살펴보기</h3><p>${relations} 관계 후보를 찾았다는 사실만으로 합화나 실제 사건·길흉을 결정하지 않습니다.</p></article>`;
  const shinsal=reading.shinsal.length?reading.shinsal.map(s=>`<div class="theme"><b>${s.name} · ${s.matches.map(m=>`${m.기준} 기준 ${m.대상지지}(${m.위치.join('·')})`).join(' / ')}</b><p>${s.meaning}</p></div>`).join(''):'확정된 기둥에서 이 기준표의 표식을 찾지 못했습니다.';
  const shinsalCard=`<article id="reading-shinsal" class="reading-card"><span>전통 신살 표식 · 기준을 공개합니다</span><h3>도화·역마·화개·천의성</h3>${shinsal}<p class="reading-note">도화·역마·화개는 년지와 일지의 삼합 그룹을 기준으로, 천의성은 월지에서 한 칸 앞선 지지를 보는 현대식 표를 적용했습니다. 신살은 보조 분류이며 개수로 길흉이나 실제 사건을 예측하지 않습니다.</p></article>`;
  const positionTopics={연지:'주변 환경과 사회적 배경',월지:'일과 생활 환경',일지:'가까운 관계와 일상',시지:'개인 계획과 장기 목표'};
  const years=Array.isArray(data.yearCycles)?data.yearCycles.filter(y=>y.natalPositions.length):[];
  const yearItems=years.length?years.map(y=>`<div class="theme"><b>${y.year}년 · ${y.pillar}년 · 만 ${y.ageBeforeBirthday}~${y.ageAfterBirthday}세</b><small>${y.natalPositions.join('·')}와 지지 충</small><p>세운의 지지 ${y.branch}와 원국의 ${y.natalPositions.join('·')}가 충 관계입니다. 전통적인 자리 해석을 참고한다면 ${y.natalPositions.map(p=>positionTopics[p]).join('·')}에서 변화가 있을 때 일정과 대화를 여유 있게 점검해 볼 수 있습니다. 이 관계만으로 사건이 생긴다고 볼 수는 없습니다.</p></div>`).join(''):'앞으로 12년 동안 세운 지지가 원국 지지와 충을 이루는 해가 없습니다.';
  const yearCard=`<article id="reading-years" class="reading-card"><span>세운의 지지와 원국의 충 관계</span><h3>앞으로 12년 중 점검해 볼 관계</h3>${yearItems}<p class="reading-note">나이는 해당 연도의 생일 전 만 나이부터 생일 후 만 나이까지입니다. 연도별 간지는 입춘 이후 기준으로 계산했습니다. 충은 전통적 관계 표식일 뿐 사고·질병·이별을 예고하지 않으며, 대운·월운·일진은 포함하지 않습니다.</p></article>`;
  return `<section class="reading"><div class="section-label">03 · 사주 풀이</div><h2>나의 사주 읽어보기</h2><p class="reading-intro">전통 명리의 상징을 바탕으로 원국의 글자를 풀어봅니다. ${reading.partial?'확정된 기둥만 살펴본 부분 풀이입니다.':'태어난 시각까지 포함한 여덟 글자를 살펴봅니다.'}</p><article id="reading-pillars" class="reading-card"><span>네 기둥의 자리와 십이운성</span>${pillarGuide}<p class="reading-note">십이운성은 화토동궁, 양간 순행·음간 역행 기준입니다. 전통적 분류이며 실제 생애 사건을 뜻하지 않습니다.</p></article>${dayHtml}${elementCard}${seasonCard}${tenCard}${hiddenCard}${relationCard}${shinsalCard}${yearCard}<p class="reading-note">이 풀이는 전통 명리의 상징적 분류를 설명합니다. 실제 성격이나 미래를 확인해 주는 결과가 아니며, 지장간 가중치·신강·신약, 격국·용신, 대운을 종합한 전문 간명은 포함하지 않습니다.</p></section>`;
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
  lines.push('','## 오행의 분포','',...Object.entries(reading.counts).map(([name,count])=>`- ${name}: ${count}`),'',`천간과 지지 대표 오행 ${reading.knownCount}글자를 단순 집계했습니다. ${reading.missing.length?`표면에 보이지 않는 오행: ${reading.missing.join('·')}.`:''} 단순 개수만으로 좋고 나쁨을 판단하지 않습니다.`);
  if(reading.season)lines.push('','## 태어난 달 · 월지','',`월지 ${reading.season.branch}(${reading.season.element})의 지장간 십성 분류: ${[...new Set(reading.season.ten)].join('·')}.`);
  if(reading.tenThemes.length)lines.push('','## 천간 십성','',...reading.tenThemes.map(t=>`- **${t.name} (${t.positions.join('·')})**: ${t.meaning}. ${t.suggestion}`));
  if(reading.hiddenThemes.length)lines.push('','## 지장간 십성','',...reading.hiddenThemes.map(t=>`- **${t.name}** — ${t.positions.map(p=>`${p.position}: ${p.characters.join('·')}`).join(' / ')}: ${t.meaning}.`));
  lines.push('','## 글자 사이의 관계','',reading.relations.length?reading.relations.map(r=>`- ${r.positions}: ${r.characters} ${r.name}${r.element?`(${r.element})`:''}${r.complete===false?` 부분 조합, 빠진 글자 ${r.missing.join('·')}`:''}`).join('\n'):'확정된 기둥에서 표시 대상 관계가 발견되지 않았습니다.');
  lines.push('','## 신살 표식','',reading.shinsal.length?reading.shinsal.map(s=>`- **${s.name}**: ${s.matches.map(m=>`${m.기준} 기준 ${m.대상지지} (${m.위치.join('·')})`).join(' / ')} — ${s.meaning}`).join('\n'):'이 기준표에서 발견한 표식이 없습니다.');
  const years=(data.yearCycles||[]).filter(y=>y.natalPositions.length);
  lines.push('','## 앞으로 12년의 세운 관계','',years.length?years.map(y=>`- **${y.year}년 ${y.pillar}년 (만 ${y.ageBeforeBirthday}~${y.ageAfterBirthday}세)**: 세운 ${y.branch}와 원국 ${y.natalPositions.join('·')}의 지지 충`).join('\n'):'앞으로 12년 동안 원국 지지와 충을 이루는 세운이 없습니다.','', '세운의 충은 전통적 관계 표식이며 사고·질병·이별을 예고하지 않습니다. 대운·월운·일진은 포함하지 않습니다.');
  lines.push('','## 계산 기준','',`- 출생시간 보정: ${data.correction}분`, `- 일주 경계: ${data.boundary==='23'?'밤 11시':'자정'}`,`- 십이운성: 화토동궁, 양간 순행·음간 역행`,`- 시간 미상 여부: ${data.pillars[3]?'아니요':'예'}`,'','이 결과는 전통 명리의 상징적 분류를 설명합니다. 실제 성격이나 미래를 입증하는 결과가 아니며, 강약·용신·대운 종합 해석은 포함하지 않습니다.','');
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
  result.innerHTML=`<div class="result-heading"><div><div class="section-label">02 · 나의 사주</div><h2>태어난 순간의 네 기둥</h2></div><button type="button" id="exportMarkdown" class="secondary-button">풀이를 Markdown으로 저장</button></div><p class="dates">양력 ${escapeHtml(data.solar)} <span>·</span> 음력 ${escapeHtml(data.lunar)}</p>${data.warning.map(w=>`<p class="notice">${escapeHtml(w)}</p>`).join('')}${renderReadingToc(reading)}<div class="pillars">${cards}</div>${detail}${readingHtml}${day?`<details><summary>지장간과 십성 더 보기</summary><p>지장간은 지지에 배속하는 천간입니다. 괄호 안의 십성은 일간과의 관계입니다.</p><div class="hidden-list">${hidden}</div></details>`:''}<details><summary>글자 사이의 관계</summary><p>천간합·육합·충과 삼합·방합의 짝 또는 조합 후보를 표시합니다. 부분 조합은 후보이며, 합화나 길흉을 확정하지 않습니다. 미상인 기둥은 검사하지 않습니다.</p><div class="hidden-list">${data.relations.length?data.relations.map(r=>`<div>${r.name} · ${r.positions} (${r.characters})${r.element?` · ${r.element}`:''}${r.complete===false?` · 빠진 글자 ${r.missing.join('·')}`:''}</div>`).join(''):'확인된 관계가 없습니다.'}</div></details><details><summary>계산 기준과 한계</summary><p>절입 시각으로 연주와 월주를 정합니다. 출생 시각은 한국의 당시 표준시를 기준으로 하며, 1987~1988년 서머타임을 반영합니다. 일주와 시주는 입력한 보정 분을 표준시에서 빼 계산합니다. 30분은 근사값이며 출생지나 날짜에 따른 보정값을 자동 계산하지 않습니다.</p><p>일주는 ${data.boundary==='23'?'보정 시각의 밤 11시':'보정 시각의 자정'}를 기준으로 바뀝니다. ${data.standardTime?`당시 표준시: ${data.standardTime} · 보정된 시각: ${data.adjustedTime}${data.dst?' (서머타임 보정)':''}.`:''}</p><p>절기 경계의 초 단위는 자료에 따라 차이가 날 수 있습니다. 용신·대운은 아직 제공하지 않습니다.</p></details>`;
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
