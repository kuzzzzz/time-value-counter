(async function(){
  try{
    const r=await fetch('./app.full.js?v=23');
    const t=await r.text();
    if(t.length<5000){console.error('app.full.js incomplete', t.length);return}
    (0,eval)(t);
  }catch(e){console.error(e)}
})();
