(async function(){
  try{
    const r=await fetch('https://raw.githubusercontent.com/kuzzzzz/time-value-counter/5d3beed8d790c67667942b3245cc33704df2956b/app.js');
    let t=await r.text();
    if(t.length<10000){console.error('core app fetch failed',t.length);return}

    // Stop updateUI filling the draft from session.note
    t=t.replace(
      "const noteEl=document.getElementById('noteInput');if(document.activeElement!==noteEl)noteEl.value=state.currentSession?.note||'';",
      "const noteEl=document.getElementById('noteInput');"
    );

    // notes on default state
    t=t.replace("feedIndex:0};","feedIndex:0,notes:[]};");
    t=t.replace(
      "feedIndex:0};saveLocal();updateUI();showToast('Old local data cleared')}",
      "feedIndex:0,notes:[]};saveLocal();updateUI();showToast('Old local data cleared')}"
    );
    t=t.replace("if(!state.voiceRate)state.voiceRate=1;","if(!state.voiceRate)state.voiceRate=1;if(!Array.isArray(state.notes))state.notes=[];");

    // Core save: archive + clear (journal override applied after eval)
    t=t.replace(
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{if(!state.currentSession)startSession();state.currentSession.note=document.getElementById('noteInput').value.trim();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';saveLocal();updateNotesJournal();showToast('Note saved')});",
      "document.getElementById('saveNoteBtn').addEventListener('click',()=>{const text=(document.getElementById('noteInput').value||'').trim();if(!text){showToast('Type a note first');return}if(!state.currentSession)startSession();if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';if(!Array.isArray(state.notes))state.notes=[];state.notes.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:text,at:Date.now(),mode:state.currentSession.mode,counts:state.currentSession.counts||0,countAt:state.count||0});if(state.notes.length>500)state.notes=state.notes.slice(-500);state.currentSession.note='';document.getElementById('noteInput').value='';saveLocal();if(typeof scheduleSync==='function')scheduleSync();updateNotesJournal();showToast('Note saved to archive')});"
    );

    (0,eval)(t);

    // --- Reliable overrides after core is running ---
    if(!Array.isArray(state.notes))state.notes=[];

    window.updateNotesJournal=function(filterQ){
      const el=document.getElementById('notesJournal');
      if(!el)return;
      if(!Array.isArray(state.notes))state.notes=[];
      let list=state.notes.slice().reverse();
      const q=(filterQ||'').toLowerCase();
      if(q)list=list.filter(function(n){return (n.text||'').toLowerCase().includes(q)});
      if(!list.length){
        el.innerHTML='<div class="empty">'+(q?'No notes match':'Notes stay in an archive after you save')+'</div>';
        return;
      }
      el.innerHTML=list.slice(0,80).map(function(n){
        const mode=(n.mode||'focus');
        const when=new Date(n.at||Date.now()).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
        return '<div class="note-entry"><div class="note-meta"><span class="note-mode '+mode+'">'+mode+'</span>@'+(n.countAt!=null?formatNumber(n.countAt):'\u2014')+' \u00b7 '+when+'</div><div class="note-body">'+esc(n.text||'')+'</div></div>';
      }).join('');
    };

    window.exportNotes=function(){
      if(!Array.isArray(state.notes))state.notes=[];
      if(!state.notes.length){showToast('No notes to export');return}
      const text=state.notes.map(function(n){
        return '['+new Date(n.at||Date.now()).toISOString()+'] mode='+(n.mode||'focus')+' count@'+(n.countAt||0)+'\n'+(n.text||'');
      }).join('\n\n---\n\n');
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
      a.download='tvc-notes-'+Date.now()+'.txt';
      a.click();
      showToast(state.notes.length+' notes exported');
    };

    var exp=document.getElementById('exportNotesBtn');
    if(exp){
      var exp2=exp.cloneNode(true);
      exp.parentNode.replaceChild(exp2,exp);
      exp2.addEventListener('click',function(){exportNotes();});
    }
    var ns=document.getElementById('notesSearch');
    if(ns){
      ns.oninput=function(){updateNotesJournal((ns.value||'').trim().toLowerCase());};
    }

    updateNotesJournal();
    console.log('[tvc] notes archive ready, count=', state.notes.length);
  }catch(e){console.error(e)}
})();
