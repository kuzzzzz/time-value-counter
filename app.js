(async function(){
  try{
    const r=await fetch('./app.gz.b64?v=23');
    const b64=await r.text();
    if(!b64||b64.length<100){console.error('app.gz.b64 missing');return}
    const bin=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0)});
    const ds=new DecompressionStream('gzip');
    const stream=new Blob([bin]).stream().pipeThrough(ds);
    const code=await new Response(stream).text();
    if(code.length<5000){console.error('decompress failed',code.length);return}
    (0,eval)(code);
  }catch(e){console.error(e)}
})();
