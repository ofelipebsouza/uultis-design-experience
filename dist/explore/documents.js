(() => {
 const $=s=>document.querySelector(s),q=new URLSearchParams(location.search),product=(window.UULTIS_PRODUCTS||[]).find(p=>p.id===q.get('product'));
 if(!product){$('#document-status').textContent='Choose a product to view its technical sheets.';return;}
 const sheets=product.specs.map((s,index)=>({...s,index})).filter(s=>s.file_url?.startsWith('/documents/'));if(!sheets.length)return;
 const languages={'en-US':'English','pt-BR':'Portuguese','es-ES':'Spanish',es:'Spanish'};
 $('h1').textContent=product.name+' · Technical sheets';document.title=product.name+' technical sheets — Uultis';$('.document-controls').hidden=false;$('#document-product').href='/#product/'+product.id;
 for(const s of sheets){const o=document.createElement('option');o.value=s.index;o.textContent=(languages[s.language]||'Technical sheet')+' · File '+(s.index+1)+(s.local?' · Local copy':'');$('#document-version').append(o);}
 let controller,blobURL;
 async function show(index){
  const sheet=sheets.find(s=>s.index===Number(index))||sheets.find(s=>s.language==='en-US')||sheets[0];$('#document-version').value=sheet.index;$('#document-download').href=sheet.file_url;$('#document-frame').hidden=true;$('#document-frame').removeAttribute('src');$('#document-status').textContent='Loading technical sheet…';
  history.replaceState(null,'',`?product=${product.id}&file=${sheet.index}`);controller?.abort();controller=new AbortController();const active=controller;const timeout=setTimeout(()=>active.abort(),20000);if(blobURL)URL.revokeObjectURL(blobURL);
  try{const response=await fetch(sheet.file_url,{signal:active.signal});if(!response.ok)throw Error('Unavailable');const file=await response.blob();const signature=await file.slice(0,5).text();if(signature!=='%PDF-')throw Error('Not a PDF');if(active!==controller)return;blobURL=URL.createObjectURL(new Blob([file],{type:'application/pdf'}));$('#document-frame').src=blobURL;$('#document-frame').hidden=false;$('#document-status').textContent=`${product.name} · ${languages[sheet.language]||'Technical sheet'}`;}
  catch{if(active===controller)$('#document-status').textContent='This file is temporarily unavailable from the document provider. Try another version or request it from the team below.';}
  finally{clearTimeout(timeout);}
 }
 $('#document-version').onchange=e=>show(e.target.value);show(q.get('file')===null?-1:q.get('file'));
 window.addEventListener('pagehide',()=>{controller?.abort();if(blobURL)URL.revokeObjectURL(blobURL);},{once:true});
})();
