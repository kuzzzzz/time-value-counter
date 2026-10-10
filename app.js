(async function(){
  try{
    const r=await fetch('https://raw.githubusercontent.com/kuzzzzz/time-value-counter/5d3beed8d790c67667942b3245cc33704df2956b/app.js');
    let t=await r.text();
    if(t.length<10000){console.error('core app fetch failed',t.length);return}

    // Stop updateUI rehydrating the draft box from session.note
    t=t.replace(
      "const noteEl=document.getElementById('noteInput');if(document.activeElement!==noteEl)noteEl.value=state.currentSession?.note||'';",
      "const noteEl=document.getElementById('noteInput');"
    );

    // Replace journal to read permanent archive (state.notes), not session.note
    t=t.replace(
      "function updateNotesJournal(){const el=document.getElementById('notesJournal');if(!el)return;const notes=[];if(state.currentSession&&state.currentSession.note)notes.push({...state.currentSession,live:true});[...(state.sessions||[])].reverse().forEach(s=>{if(s.note&&s.note.trim())notes.push(s)});if(!notes.length){el.innerHTML='<div class=\"empty\">Notes you save while counting show up here</div>';return}el.innerHTML=notes.slice(0,40).map(s=>{const mode=(s.mode||'focus');const when=new Date(s.start).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});const live=s.live?' · live':'';return '<div class=\"note-entry\"><div class=\"note-meta\"><span class=\"note-mode '+mode+'\">'+mode+'</span>+'+(s.counts||0)+' counts · '+when+live+'</div><div class=\"note-body\">'+esc(s.note)+'</div></div>'}).join('')}",
      "function updateNotesJournal(filterQ){const el=document.getElementById('notesJournal');if(!el)return;if(!Array.isArray(state.notes))state.notes=[];let list=state.notes.slice().reverse();const q=(filterQ||'').toLowerCase();if(q)list=list.filter(n=>(n.text||'').toLowerCase().includes(q));if(!list.length){el.innerHTML='<div class=\"empty\">'+(q?'No notes match':'Notes stay in an archive after you save')+'</div>';return}el.innerHTML=list.slice(0,80).map(n=>{const mode=(n.mode||'focus');const when=new Date(n.at||Date.now()).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});return '<div class=\"note-entry\"><div class=\"note-meta\"><span class=\"note-mode '+mode+'\">'+mode+'</span>@'+(n.countAt!=null?formatNumber(n.countAt):'—')+' · '+when+'</div><div class=\"note-body\">'+esc(n.text||'')+'</div></div>'}).join('')}function exportNotes(){if(!Array.isArray(state.notes))state.notes=[];if(!state.notes.length){showToast('No notes to export');return}const text=state.notes.map(n=>'['+new Date(n.at||Date.now()).toISOString()+'] mode='+(n.mode||'focus')+' count@'+(n.countAt||0)+'\\n'+(n.text||'')).join('\\n\\n---\\n\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));a.download='tvc-notes-'+Date.now()+'.txt';a.click();showToast(state.notes.length+' notes exported')}"
    );

    // Save: push to archive, clear draft, refresh journal
    t=t.replace(
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{if(!state.currentSession)startSession();state.currentSession.note=document.getElementById('noteInput').value.trim();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';saveLocal();updateNotesJournal();showToast('Note saved')});",
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{const text=(document.getElementById('noteInput').value||'').trim();if(!text){showToast('Type a note first');return}if(!state.currentSession)startSession();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';if(!Array.isArray(state.notes))state.notes=[];state.notes.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:text,at:Date.now(),mode:state.currentSession.mode,counts:state.currentSession.counts||0,countAt:state.count||0});if(state.notes.length>500)state.notes=state.notes.slice(-500);state.currentSession.note='';document.getElementById('noteInput').value='';saveLocal();if(typeof scheduleSync==='function')scheduleSync();updateNotesJournal();showToast('Note saved to archive')});document.getElementById('exportNotesBtn')&&document.getElementById('exportNotesBtn').addEventListener('click',exportNotes);document.getElementById('notesSearch')&&document.getElementById('notesSearch').addEventListener('input',function(){updateNotesJournal((document.getElementById('notesSearch').value||'').trim().toLowerCase())});"
    );

    // notes on state
    t=t.replace("feedIndex:0};","feedIndex:0,notes:[]};");
    t=t.replace(
      "feedIndex:0};saveLocal();updateUI();showToast('Old local data cleared')}",
      "feedIndex:0,notes:[]};saveLocal();updateUI();showToast('Old local data cleared')}"
    );
    t=t.replace("if(!state.voiceRate)state.voiceRate=1;","if(!state.voiceRate)state.voiceRate=1;if(!Array.isArray(state.notes))state.notes=[];");

    (0,eval)(t);

    // Cloud notes merge if patch present
    try{
      const p=await fetch('./app.notes.js?v=26');
      const pt=await p.text();
      if(pt.length>100)(0,eval)(pt);
    }catch(e2){}
  }catch(e){console.error(e)}
})();
