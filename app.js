(async function(){
  try{
    const parts=[];
    for(let i=0;i<4;i++){
      const r=await fetch('./app.b64.'+i+'?v=23');
      parts.push(await r.text());
    }
    const b64=parts.join('');
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const code=new TextDecoder().decode(bytes);
    if(code.length<5000){console.error('decode failed',code.length);return}
    (0,eval)(code);
  }catch(e){console.error(e)}
})();
