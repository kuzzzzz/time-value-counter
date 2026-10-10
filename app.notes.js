(function(){
  if(typeof state==='undefined')return;
  if(!Array.isArray(state.notes))state.notes=[];
  function noteId(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
  function migrateSessionNotesToArchive(){
    if(!Array.isArray(state.notes))state.notes=[];
    var existing=new Set(state.notes.map(function(n){return (n.text||'')+'|'+(n.at||n.start||'')}));
    function addFrom(s){
      if(!s||!s.note||!String(s.note).trim())return;
      var at=s.start||Date.now();
      var key=String(s.note).trim()+'|'+at;
      if(existing.has(key))return;
      existing.add(key);
      state.notes.push({id:noteId(),text:String(s.note).trim(),at:at,mode:s.mode||'focus',counts:s.counts||0,countAt:state.count||0});
    }
    (state.sessions||[]).forEach(addFrom);
    if(state.notes.length>500)state.notes=state.notes.slice(-500);
  }
  window.saveNoteToArchive=function(text,meta){
    var t=String(text||'').trim();
    if(!t){showToast('Type a note first');return null}
    if(!Array.isArray(state.notes))state.notes=[];
    var entry={id:noteId(),text:t,at:Date.now(),mode:(meta&&meta.mode)||(state.feedMode?'feed':'focus'),counts:(meta&&meta.counts)||(state.currentSession?state.currentSession.counts:0),countAt:state.count||0};
    state.notes.push(entry);
    if(state.notes.length>500)state.notes=state.notes.slice(-500);
    return entry;
  };
  window.mergeNotesFromCloud=function(cloudNotes){
    if(!Array.isArray(cloudNotes)||!cloudNotes.length)return;
    if(!Array.isArray(state.notes))state.notes=[];
    var byId=new Map(state.notes.filter(function(n){return n&&n.id}).map(function(n){return [n.id,n]}));
    var byKey=new Set(state.notes.map(function(n){return (n.text||'')+'|'+(n.at||'')}));
    cloudNotes.forEach(function(n){
      if(!n||!n.text)return;
      if(n.id&&byId.has(n.id))return;
      var key=(n.text||'')+'|'+(n.at||'');
      if(byKey.has(key))return;
      byKey.add(key);
      state.notes.push({id:n.id||noteId(),text:n.text,at:n.at||Date.now(),mode:n.mode||'focus',counts:n.counts||0,countAt:n.countAt||0});
    });
    state.notes.sort(function(a,b){return (a.at||0)-(b.at||0)});
    if(state.notes.length>500)state.notes=state.notes.slice(-500);
  };
  window.updateNotesJournal=function(filterQ){
    var el=document.getElementById('notesJournal');
    if(!el)return;
    if(!Array.isArray(state.notes))state.notes=[];
    migrateSessionNotesToArchive();
    var list=state.notes.slice().reverse();
    var q=(filterQ||'').toLowerCase();
    if(q)list=list.filter(function(n){return (n.text||'').toLowerCase().includes(q)});
    if(!list.length){
      el.innerHTML='<div class="empty">'+(q?'No notes match':'Notes stay in an archive — they no longer vanish with old sessions')+'</div>';
      return;
    }
    el.innerHTML=list.slice(0,80).map(function(n){
      var mode=(n.mode||'focus');
      var when=new Date(n.at||Date.now()).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      return '<div class="note-entry"><div class="note-meta"><span class="note-mode '+mode+'">'+mode+'</span>@'+(n.countAt!=null?formatNumber(n.countAt):'\u2014')+' \u00b7 '+when+'</div><div class="note-body">'+esc(n.text||'')+'</div></div>';
    }).join('');
  };
  window.exportNotes=function(){
    if(!Array.isArray(state.notes))state.notes=[];
    migrateSessionNotesToArchive();
    var notes=state.notes.slice();
    if(!notes.length){showToast('No notes to export');return}
    var text=notes.map(function(n){
      return '['+new Date(n.at||Date.now()).toISOString()+'] mode='+(n.mode||'focus')+' count@'+(n.countAt||0)+'\n'+(n.text||'');
    }).join('\n\n---\n\n');
    var blob=new Blob([text],{type:'text/plain'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='tvc-notes-'+Date.now()+'.txt';
    a.click();
    showToast(notes.length+' notes exported');
  };
  var btn=document.getElementById('saveNoteBtn');
  if(btn){
    var fresh=btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh,btn);
    fresh.addEventListener('click',function(){
      var text=(document.getElementById('noteInput').value||'').trim();
      if(!text){showToast('Type a note first');return}
      if(!state.currentSession)startSession();
      if(!state.currentSession.mode)state.currentSession.mode=state.feedMode?'feed':'focus';
      saveNoteToArchive(text,{mode:state.currentSession.mode,counts:state.currentSession.counts||0});
      state.currentSession.note='';
      var ni=document.getElementById('noteInput');
      if(ni)ni.value='';
      saveLocal();
      if(typeof scheduleSync==='function')scheduleSync();
      updateNotesJournal();
      showToast('Note saved to archive');
    });
  }
  if(typeof pushToCloud==='function'){
    window.pushToCloud=async function(){
      if(!user||!sb)return;
      try{
        await ensureProfile();
        var payload={
          user_id:user.id,goal:state.goal,count:state.count,
          total_active_ms:state.totalActiveMs+(state.currentSession?Date.now()-state.currentSession.start:0),
          voice_enabled:state.voiceEnabled,
          last_count_at:state.lastCountAt?new Date(state.lastCountAt).toISOString():null,
          updated_at:new Date().toISOString(),
          notes:Array.isArray(state.notes)?state.notes.slice(-500):[]
        };
        var res=await sb.from('progress').upsert(payload,{onConflict:'user_id'});
        if(res.error){
          delete payload.notes;
          await sb.from('progress').upsert(payload,{onConflict:'user_id'});
        }
      }catch(e){console.warn(e)}
    };
  }
  if(typeof loadFromCloud==='function'){
    window.loadFromCloud=async function(){
      if(!user||!sb)return;
      try{
        var res=await sb.from('progress').select('*').eq('user_id',user.id).maybeSingle();
        if(res.error)throw res.error;
        var data=res.data;
        if(data){
          var cloudCount=data.count||0;
          var cloudMs=data.total_active_ms||0;
          if(data.notes)mergeNotesFromCloud(data.notes);
          if(cloudCount>state.count){
            state.count=cloudCount;
            state.goal=data.goal||state.goal;
            state.mainGoal=state.goal;
            state.totalActiveMs=Math.max(state.totalActiveMs,cloudMs);
            if(data.voice_enabled!=null)state.voiceEnabled=!!data.voice_enabled;
            state.lastCountAt=data.last_count_at?new Date(data.last_count_at).getTime():state.lastCountAt;
            saveLocal();updateUI();showToast('Synced from cloud ('+cloudCount.toLocaleString()+')');
          }else if(state.count>cloudCount){
            await pushToCloud();showToast('Uploaded local count to cloud');
          }else{
            state.totalActiveMs=Math.max(state.totalActiveMs,cloudMs);
            saveLocal();showToast('Already in sync');
          }
        }else await pushToCloud();
      }catch(e){console.warn(e);showToast('Sync failed')}
    };
  }
  migrateSessionNotesToArchive();
  saveLocal();
  updateNotesJournal();
  var ns=document.getElementById('notesSearch');
  if(ns){ns.oninput=function(){updateNotesJournal((ns.value||'').trim().toLowerCase())}}
  var ex=document.getElementById('exportNotesBtn');
  if(ex){ex.onclick=function(){exportNotes()}}
  console.log('[tvc] notes archive patch active, notes=', state.notes.length);
})();
