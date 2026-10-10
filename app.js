(async function(){
  try{
    // Known-good full app (form strip, comparisons, feed, share, etc.)
    const r=await fetch('https://raw.githubusercontent.com/kuzzzzz/time-value-counter/5d3beed8d790c67667942b3245cc33704df2956b/app.js');
    const t=await r.text();
    if(t.length<10000){console.error('core app fetch failed',t.length);return}
    (0,eval)(t);
    // Notes archive patch (independent of session trim + clear-on-save)
    const p=await fetch('./app.notes.js?v=23');
    const pt=await p.text();
    if(pt.length>100)(0,eval)(pt);
  }catch(e){console.error(e)}
})();
