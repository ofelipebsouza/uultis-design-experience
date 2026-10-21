(() => {
 const $=s=>document.querySelector(s);const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if($('#directory-search')){
  const items=[...document.querySelectorAll('.directory-card')];
  const type=new URLSearchParams(location.search).get('type');if(['store','representative'].includes(type))$('#directory-type').value=type;
  const filter=()=>{const q=norm($('#directory-search').value),kind=$('#directory-type').value,country=$('#directory-country').value;let count=0;for(const item of items){item.hidden=!(norm(item.textContent).includes(q)&&(kind==='all'||item.dataset.kind===kind)&&(country==='all'||item.dataset.country===country));if(!item.hidden)count++;}$('#directory-count').textContent=`${count} ${count===1?'location':'locations'}`;$('#directory-empty').hidden=count>0;};
  $('.directory-filters').onsubmit=e=>e.preventDefault();$('#directory-search').oninput=filter;$('#directory-type').onchange=filter;$('#directory-country').onchange=filter;filter();
 }
 if($('#contact-form'))$('#contact-form').onsubmit=event=>{event.preventDefault();const data=new FormData(event.currentTarget);const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nLocation: ${data.get('location')}\n\n${data.get('message')}`;location.href=`mailto:contato@uultis.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;$('#contact-status').textContent='Email draft requested. Review and send it in your email app. If it did not open, email contato@uultis.com directly.';};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('details[open]').forEach(d=>d.open=false);});
})();
