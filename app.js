(async function(){
  try{
    const r=await fetch('./app.full.js?v=22');
    const t=await r.text();
    if(t.length<1000){console.error('app.full.js missing', t);return}
    (0,eval)(t);
    const p=await fetch('./app.notes.js?v=22');
    const pt=await p.text();
    if(pt.length>100)(0,eval)(pt);
  }catch(e){console.error(e)}
})();
