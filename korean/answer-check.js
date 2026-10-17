(function(){
'use strict';
/* 한국사 서술형 자기점검: 브라우저 안에서만 실행. 정답 채점/성적 산정 아님. */
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^가-힣a-z0-9一-龥]/g,'');
const CONNECT=/때문|그래서|따라서|그러므로|그러나|반면|한편|왜냐하면|이로 인해|이에 따라|그 결과|이어졌|이어지|불러왔|만들었|영향을|초래|해결|하였기|했기|하기 위|하므로|통해서|기여|가져왔|바탕으로|의미|보여 준|보여준|다르게|차이|비해|강화|약화|→|⇒/;
const ALIASES={
 '무리 생활':['협동','함께 생활','집단 생활'], '도구 제작':['도구를 만들','돌도구','석기 제작'], '뗀석기':['돌 도구','돌도구'],
 '자연 적응':['환경에 적응','자연에 대응'], '안정적 통치':['안정적인 지배','나라를 안정','안정되게 다스','국가 통합','통합'],
 '호족 통제':['호족을 통제','호족의 반발','호족의 협력','호족 포섭'],
 '신뢰 형성':['신뢰를 쌓','믿음','서로 신뢰'], '신뢰':['믿음','상호 신뢰'],
 '왕권 강화':['국왕의 권력 강화','왕의 힘이 강','국왕 중심의 정치'], '왕권':['왕의 권력','국왕의 힘'],
 '중앙 집권':['중앙집권','왕권 집중','중앙의 통제'], '자주 독립':['자주독립','독립 국가','나라의 자주권'],
 '일본의 침략':['일제의 침략','일본의 간섭','일제 침략'], '개화':['근대화','개혁 정책'],
 '식민지':['일제 강점','국권 상실'], '독립운동':['독립 운동','항일 운동'],
 '실력 양성':['교육 운동','경제 자립','민족 역량'], '무장 투쟁':['무장 독립','독립군'],
 '평화 통일':['평화로운 통일','남북 통일'], '민족주의':['민족의 독립','민족의식']
};
function matchWord(answer,word){
 const variants=[word,...(ALIASES[word]||[])];return variants.some(w=>{const n=normalize(w);return n.length>1&&answer.includes(n)});
}
function el(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!=null)e.textContent=value;return e}
function styles(){
 if(document.getElementById('history-selfcheck-style'))return;
 const css=`
.history-selfcheck{margin:12px 0 16px;clear:both}
.history-check-btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 17px;border:0;border-radius:10px;background:#244c93;color:#fff;font:700 13px 'Noto Sans KR',sans-serif;cursor:pointer}
.history-check-btn:hover{background:#173a79}
.history-check-btn:focus-visible{outline:3px solid #e0b05e;outline-offset:3px}
.history-check-note{display:block;font-size:11.5px;color:#697389;line-height:1.6;margin:7px 0}
.history-check-result{padding:14px 16px;margin-top:11px;background:#f7faff;color:#202c44;border:1px solid #d6e2f1;border-radius:12px;font-size:13px;line-height:1.7}
.history-check-result[hidden]{display:none!important}
.history-check-title{font-weight:800;font-size:14px;margin:0 0 9px}
.history-check-sub{font-weight:700;font-size:12px;margin:10px 0 6px}
.history-check-list{display:flex;gap:6px;flex-wrap:wrap}
.history-check-tag{display:inline-block;padding:5px 9px;border-radius:8px;font-weight:700;font-size:12px}
.history-check-tag.hit{background:#e8f7ef;color:#176047;border:1px solid #c3e7d2}
.history-check-tag.extra{background:#fff7e9;color:#86570e;border:1px solid #efdeb9}
.history-check-tip{margin:10px 0 0;padding:10px 12px;background:#fff;border-left:3px solid #96aecf;border-radius:6px}
.history-check-disclaimer{color:#66718a;font-size:11.5px;margin:10px 0 0}
@media(max-width:570px){.history-check-btn{width:100%}}
`;
 const style=document.createElement('style');style.id='history-selfcheck-style';style.textContent=css;document.head.appendChild(style);
}
function renderCheck(ta,holder,reference,choiceMode,label){
 if(!reference.length)return;
 const block=el('div','history-selfcheck');
 const btn=el('button','history-check-btn','🔎 핵심 요소 점검');btn.type='button';
 const note=el('small','history-check-note','학번·이름 입력이나 제출 없이 확인할 수 있습니다. 실제 채점 점수와 무관합니다.');
 const out=el('div','history-check-result');out.hidden=true;out.setAttribute('role','status');out.setAttribute('aria-live','polite');
 block.append(btn,note,out);
 if(label==='summarySentence') ta.parentNode.insertBefore(block,ta.nextSibling);
 else holder.parentNode.insertBefore(block,holder);
 const page=location.pathname;
 const key='history-selfcheck-draft:'+page+':'+(ta.id||ta.closest('.inquiry-card')?.id||label||'summary');
 if(!ta.value){try{const stored=localStorage.getItem(key);if(stored)ta.value=stored}catch(e){}}
 ta.addEventListener('input',()=>{
   try{localStorage.setItem(key,ta.value)}catch(e){}
   out.hidden=true;btn.textContent='🔎 수정한 답 다시 점검';
 });
 btn.addEventListener('click',()=>{
   out.replaceChildren();
   const answer=ta.value.trim();
   if(normalize(answer).length<10){
     out.appendChild(el('p','history-check-title','먼저 자신의 생각을 한 문장 이상 적어 보세요.'));out.hidden=false;ta.focus();return;
   }
   const clean=normalize(answer);
   const found=reference.filter(w=>matchWord(clean,w));
   const missing=reference.filter(w=>!matchWord(clean,w));
   out.appendChild(el('div','history-check-title',`참고 핵심 표현 ${found.length}/${reference.length}개 발견`));
   if(found.length){out.appendChild(el('div','history-check-sub','답에서 확인된 표현'));const wrap=el('div','history-check-list');found.forEach(w=>wrap.appendChild(el('span','history-check-tag hit','✓ '+w)));out.appendChild(wrap);}
   if(missing.length){out.appendChild(el('div','history-check-sub',choiceMode?'다른 답안에서 활용할 수 있는 표현':'추가로 검토할 표현'));const wrap=el('div','history-check-list');missing.slice(0,6).forEach(w=>wrap.appendChild(el('span','history-check-tag extra','+ '+w)));out.appendChild(wrap);}
   const linked=CONNECT.test(answer);
   let tip=choiceMode?'여러 선택지 중 하나를 골라 근거를 제시하는 문제입니다. 모든 참고 표현을 넣을 필요는 없습니다.':'모든 참고 표현을 억지로 포함할 필요는 없습니다. 질문에 맞는 근거를 연결해 설명했는지 살펴보세요.';
   if(!linked)tip+=' 사건·인물을 나열했다면 “왜냐하면”, “그 결과”, “반면” 등을 활용해 관계를 밝혀 보세요.';
   else tip+=' 인과·비교 표현이 있더라도 역사적 관계가 정확한지는 본문과 대조하세요.';
   out.appendChild(el('p','history-check-tip',tip));
   out.appendChild(el('p','history-check-disclaimer','※ 단어·일부 유사 표현을 찾는 규칙 기반 도구로, 문장의 참·거짓이나 역사적 타당성을 판정하지 않습니다. 같은 뜻의 다른 표현을 놓치거나 잘못된 설명에서 단어를 발견할 수 있습니다.'));
   out.hidden=false;btn.textContent='🔎 핵심 요소 다시 점검';
 });
}
function inquiry(){
 const cards=[...document.querySelectorAll('.inquiry-card')];let count=0;
 cards.forEach(card=>{
   const ta=card.querySelector('textarea.inquiry-textarea');
   const submit=card.querySelector('button.inquiry-submit');
   if(!ta||!submit||card.querySelector('.history-selfcheck'))return;
   const question=card.querySelector('.question-text');
   const hints=[];
   if(question){
     // 본문 끝의 (힌트: ...)에 명시된 교사 발문을 우선 사용
     const html=question.innerHTML||'';
     const at=html.lastIndexOf('힌트:');
     if(at>=0){
       const area=html.slice(at);
       const tmp=document.createElement('div');tmp.innerHTML=area;
       let sample=tmp.textContent.replace(/^힌트\s*:\s*/,'').replace(/[()]/g,'').trim();
       sample.split(/[,，、]/).forEach(x=>{const t=x.trim();if(t.length>=2&&t.length<40)hints.push(t)});
     }
   }
   const tags=[...card.querySelectorAll('.keyword-result .keywords-tags span')].map(x=>x.textContent.trim()).filter(Boolean);
   const list=[...new Set(hints.length?hints:tags)];
   const choice=/(가운데 하나|중 하나를 골라|하나를 선택|어느 쪽|어느 것을 선택|찬성|반대|입장을 선택)/.test(question?.textContent||'');
   renderCheck(ta,submit,list,choice,'inquiry');
   count++;
 });
 return count;
}
function summary(){
 const area=document.getElementById('summarySentence');
 if(!area)return 0;
 const btn=area.closest('.summary-write')?.querySelector('.summary-save, #history-summary-anchor');
 if(!btn)return 0;
 const path=location.pathname;
 const keys=path.includes('japanese_colonial_rule_national_movement_final')
   ?['무단 통치','문화 통치','민족 말살 통치','식민지 수탈','독립운동','민족 운동','탄압']
   :path.includes('daehan_empire_annexation_page')
   ?['자주독립','대한제국','광무개혁','일본의 침략','을사늑약','국권 상실','한일 병합']
   :['서양의 침략','일본의 침략','개화','개혁','외세 간섭','국내 혼란','아관파천'];
 renderCheck(area,btn,keys,false,'summarySentence');return 1;
}
styles();
const a=inquiry(),b=summary();
if(window.console)console.info('한국사 핵심 요소 자기점검:',a+b,'개 서술형 입력란 연결');
})();