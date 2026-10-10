(async function(){
  try{
    const r=await fetch('https://raw.githubusercontent.com/kuzzzzz/time-value-counter/5d3beed8d790c67667942b3245cc33704df2956b/app.js');
    let t=await r.text();
    if(t.length<10000){console.error('core app fetch failed',t.length);return}

    // 1) Stop updateUI from putting session.note back into the text box
    t=t.replace(
      "const noteEl=document.getElementById('noteInput');if(document.activeElement!==noteEl)noteEl.value=state.currentSession?.note||'';",
      "const noteEl=document.getElementById('noteInput');"
    );

    // 2) Replace core save handler: archive + clear box (notes array in state)
    t=t.replace(
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{if(!state.currentSession)startSession();state.currentSession.note=document.getElementById('noteInput').value.trim();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';saveLocal();updateNotesJournal();showToast('Note saved')});",
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{const text=(document.getElementById('noteInput').value||'').trim();if(!text){showToast('Type a note first');return}if(!state.currentSession)startSession();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';if(!Array.isArray(state.notes))state.notes=[];state.notes.push({id:Date.now().toString(36),text:text,at:Date.now(),mode:state.currentSession.mode,counts:state.currentSession.counts||0,countAt:state.count||0});if(state.notes.length>500)state.notes=state.notes.slice(-500);state.currentSession.note='';document.getElementById('noteInput').value='';saveLocal();if(typeof scheduleSync==='function')scheduleSync();if(typeof updateNotesJournal==='function')updateNotesJournal();showToast('Note saved to archive')});"
    );

    // Ensure notes array exists on state defaults
    t=t.replace(
      "feedIndex:0};",
      "feedIndex:0,notes:[]};"
    );

    (0,eval)(t);

    // Optional extra notes UI (search/export/cloud) if present
    try{
      const p=await fetch('./app.notes.js?v=25');
      const pt=await p.text();
      if(pt.length>100)(0,eval)(pt);
    }catch(e2){}
  }catch(e){console.error(e)}
})();
