(async function(){
  try{
    const r=await fetch('./app.full.js?v=22');
    const t=await r.text();
    if(t.length<1000){console.error('app.full.js missing', t);document.body&&(document.body.innerHTML+='<p style="color:red;padding:1rem">App logic file missing — hard refresh in a moment.</p>');return}
    (0,eval)(t);
  }catch(e){console.error(e)}
})();
