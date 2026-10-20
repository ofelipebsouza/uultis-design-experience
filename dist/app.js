(() => {
  'use strict';
  const products = Array.isArray(window.UULTIS_PRODUCTS) ? window.UULTIS_PRODUCTS : [];
  const byId = new Map(products.map(p => [String(p.id), p]));
  const $ = (s, parent = document) => parent.querySelector(s);
  const $$ = (s, parent = document) => [...parent.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const homeView = $('#home-view');
  const catalogView = $('#catalog-view');
  const productDialog = $('#product-dialog');
  const searchDialog = $('#search-dialog');
  const menuDialog = $('#menu-dialog');
  const filmDialog = $('#film-dialog');
  const curatedIds = ['274','269','300','295','314','28','303','273','298','267','286','308','294','65','120','18','297','281','302','258','142','257','169','8'];
  const curatedRank = new Map(curatedIds.map((id, i) => [id,i]));
  let favorites;
  try { const saved = JSON.parse(localStorage.getItem('uultis-selection-v1') || '[]'); favorites = new Set(Array.isArray(saved) ? saved.filter(id => byId.has(String(id))).map(String) : []); } catch { favorites = new Set(); }
  const state = { mode:'all', category:'', query:'', sort:'featured', limit:24, view:'home' };
  let baseHash = '#inicio';
  let lastFocus = null;
  let toastTimer;
  let activeProductId = null;
  let closingForRoute = false;
  let currentMaterial = -1;
  let manualMaterial = null;
  let needsFrame = false;
  let searchTimer;
  const searchIndexes = new Map(products.map(p => [p.id, normalize([p.name,p.category,p.designer,p.description,...(p.tags || []).map(t => t.label)].join(' '))]));

  function announce(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function favoriteButton(p, className = '') {
    const selected = favorites.has(p.id);
    return `<button class="favorite-button ${className}" data-favorite="${esc(p.id)}" aria-pressed="${selected}" aria-label="${selected ? 'Remover' : 'Adicionar'} ${esc(p.name)} ${selected ? 'da' : 'à'} minha seleção">${icon('heart')}</button>`;
  }

  function productCard(p, index = 0) {
    const hasAlt = p.display_images?.length > 1;
    const tag = p.availability_note ? 'Edição de colecionador' : p.year === '2026' ? 'Coleção 2026' : '';
    return `<article class="product-card"><a class="product-image-link" href="#produto/${esc(p.id)}" aria-label="Conhecer ${esc(p.name)}, ${esc(p.category)}">${tag ? `<span class="product-tag">${tag}</span>` : ''}<img src="${esc(p.thumbnail || p.image)}" alt="${esc(p.name)} — ${esc(p.category)} Uultis" width="760" height="760" loading="lazy" decoding="async">${hasAlt ? `<img class="card-alternate" src="${esc(p.display_images[1])}" alt="" aria-hidden="true" width="760" height="760" loading="lazy" decoding="async">` : ''}<span class="card-discover">${icon('arrow')}</span></a>${favoriteButton(p)}<div class="product-card-info"><div><h3><a href="#produto/${esc(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.designer || 'Uultis')}</p></div><span>${esc(p.category)}</span></div></article>`;
  }

  function ordered(list, order = 'featured') {
    return [...list].sort((a,b) => {
      if (order === 'name') return a.name.localeCompare(b.name,'pt-BR');
      if (order === 'newest') return Number(b.year || 0) - Number(a.year || 0) || a.name.localeCompare(b.name,'pt-BR');
      return (curatedRank.get(a.id) ?? 999) - (curatedRank.get(b.id) ?? 999) || Number(b.year || 0) - Number(a.year || 0) || a.name.localeCompare(b.name,'pt-BR');
    });
  }

  function matchesCategory(p, category) {
    return !category || category === 'Todos' || (category === 'Mesas' ? /mesa/i.test(p.category) : p.category === category);
  }

  function matchesQuery(p, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return words.every(word => searchIndexes.get(p.id).includes(word));
  }

  function renderCuration(category = 'Destaques') {
    const list = ordered(products.filter(p => category === 'Destaques' || matchesCategory(p,category))).slice(0,6);
    $('#curation-grid').innerHTML = list.map(productCard).join('');
    $$('[data-curation]').forEach(button => {
      const active = button.dataset.curation === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function filteredProducts() {
    return ordered(products.filter(p => {
      if (state.mode === 'favorites' && !favorites.has(p.id)) return false;
      if (state.mode === 'simbiose' && !(p.tags || []).some(t => normalize(t.label) === 'simbiose 2026')) return false;
      return matchesCategory(p,state.category) && matchesQuery(p,state.query);
    }),state.sort);
  }

  function renderCatalog(append = false) {
    const list = filteredProducts();
    const shown = list.slice(0,state.limit);
    const grid = $('#catalog-grid');
    const oldCount = append ? grid.children.length : 0;
    if (append) grid.insertAdjacentHTML('beforeend', shown.slice(oldCount).map(productCard).join(''));
    else grid.innerHTML = shown.map(productCard).join('');
    $('#catalog-count').textContent = `${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
    $('#catalog-shown').textContent = list.length ? `${shown.length} de ${list.length} ${list.length === 1 ? 'peça' : 'peças'}` : '';
    $('#load-more').hidden = shown.length >= list.length;
    $('#catalog-empty').hidden = list.length > 0;
    if (!list.length) {
      $('#catalog-empty > span').textContent = state.mode === 'favorites' && !favorites.size ? 'Sua seleção começa aqui.' : 'Vamos descobrir algo novo?';
      $('#catalog-empty p').textContent = state.mode === 'favorites' && !favorites.size ? 'Toque no coração de uma peça para guardá-la e voltar quando quiser.' : 'Nenhuma peça encontrada com esses filtros.';
      $('#clear-filters').innerHTML = (state.mode === 'favorites' && !favorites.size ? 'Explorar a coleção ' : 'Limpar filtros ') + icon('arrow');
    }
    $$('#filter-chips button').forEach(button => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    $('#category-select').value = [...$('#category-select').options].some(o => o.value === state.category) ? state.category : '';
    $('#catalog-sort').value = state.sort;
    $('#catalog-query').value = state.query;
    const filters = $('#active-filters');
    filters.hidden = !state.category && !state.query;
    filters.innerHTML = `${state.category ? `<button data-reset="category">${esc(state.category)} ${icon('close')}</button>` : ''}${state.query ? `<button data-reset="query">“${esc(state.query)}” ${icon('close')}</button>` : ''}`;
  }

  function updateFavorites() {
    const count = $('#favorite-count');
    count.textContent = String(favorites.size);
    count.hidden = !favorites.size;
    $('.menu-fav-count').textContent = String(favorites.size);
    $('.favorites-nav').setAttribute('aria-label',`Minha seleção, ${favorites.size} ${favorites.size === 1 ? 'peça' : 'peças'}`);
    $$('[data-favorite]').forEach(button => {
      const id = button.dataset.favorite;
      const selected = favorites.has(id);
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',`${selected ? 'Remover' : 'Adicionar'} ${byId.get(id)?.name || 'peça'} ${selected ? 'da' : 'à'} minha seleção`);
    });
    try { localStorage.setItem('uultis-selection-v1',JSON.stringify([...favorites])); } catch { /* The selection remains available for the current session. */ }
  }

  function syncDialogState() {
    const anyOpen = !!$('dialog[open]');
    document.body.classList.toggle('dialog-open',anyOpen);
    $('#open-menu').setAttribute('aria-expanded',String(menuDialog.open));
  }

  function openDialog(dialog) {
    lastFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    syncDialogState();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
    syncDialogState();
  }

  function openProduct(id) {
    const p = byId.get(id);
    if (!p) {
      announce('Esta peça não foi encontrada. Explore a coleção.');
      location.replace('#colecao');
      return;
    }
    const pics = p.display_images?.length ? p.display_images : [p.image];
    const preferredSpec = (p.specs || []).find(s => s.language === 'pt-BR' && /ficha/i.test(s.label));
    const model = (p.specs || []).find(s => /modelo 3d/i.test(s.label));
    const resources = [];
    if (preferredSpec) resources.push(`<a href="${esc(preferredSpec.url)}" target="_blank" rel="noopener"><span>Ficha técnica · Português</span>${icon('download')}</a>`);
    if (model) resources.push(`<a href="${esc(model.url)}" target="_blank" rel="noopener"><span>Modelo 3D · SketchUp</span>${icon('diagonal')}</a>`);
    if (p.video_url) {
      const match = p.video_url.match(/embed\/([\w-]+)/);
      const url = match ? `https://www.youtube.com/watch?v=${match[1]}` : p.video_url;
      resources.push(`<a href="${esc(url)}" target="_blank" rel="noopener"><span>Filme da peça</span>${icon('play')}</a>`);
    }
    activeProductId = id;
    $('#product-content').innerHTML = `<div class="product-content-layout"><div class="product-gallery"><div class="product-main-image"><img id="product-main-img" src="${esc(pics[0])}" alt="${esc(p.name)} — ${esc(p.category)} Uultis" width="1400" height="1400"></div><div class="product-gallery-label"><span>O DESIGN EM CADA DETALHE</span><span id="product-image-index">01 / ${String(pics.length).padStart(2,'0')}</span></div>${pics.length > 1 ? `<div class="product-thumbnails" role="group" aria-label="Imagens de ${esc(p.name)}">${pics.map((src,i) => `<button class="${i === 0 ? 'active' : ''}" data-gallery-image="${i}" aria-label="Ver imagem ${i+1}" aria-pressed="${i === 0}"><img src="${esc(src)}" alt="" width="62" height="62"></button>`).join('')}</div>` : ''}</div><div class="product-detail"><span class="eyebrow">UULTIS / ${esc(p.category).toUpperCase()}</span><h2 id="product-title">${esc(p.name)}</h2><div class="product-byline"><span>DESIGN</span>${p.designer_url ? `<a href="${esc(p.designer_url)}" target="_blank" rel="noopener">${esc(p.designer)}</a>` : esc(p.designer || 'Uultis')}</div><div class="product-description">${p.description.split(/\n\s*\n/).map(par => `<p>${esc(par)}</p>`).join('')}</div><dl class="product-meta"><div><dt>CATEGORIA</dt><dd>${esc(p.category)}</dd></div>${p.year ? `<div><dt>ANO</dt><dd>${esc(p.year)}</dd></div>` : ''}</dl>${p.availability_note ? `<p class="product-category-label">Edição de colecionador · Unidades já comercializadas, conforme descrição da marca.</p>` : ''}<div class="product-actions"><a class="outline-button" href="https://www.uultis.com/onde-encontrar" target="_blank" rel="noopener">${p.availability_note ? 'Conheça os pontos de venda' : 'Encontre uma loja'} ${icon('diagonal')}</a>${favoriteButton(p)}</div><a class="product-source" href="${esc(p.url)}" target="_blank" rel="noopener">Ver ${esc(p.name)} no site Uultis ${icon('diagonal')}</a>${resources.length ? `<div class="product-resources">${resources.join('')}</div>` : ''}</div></div>`;
    openDialog(productDialog);
    productDialog.scrollTop = 0;
    document.title = `${p.name} — ${p.category} | Uultis`;
  }

  function closeProduct() {
    if (location.hash.startsWith('#produto/')) history.replaceState(null,'',baseHash);
    closeDialog(productDialog);
    activeProductId = null;
    document.title = state.view === 'catalog' ? 'Coleção — Uultis' : 'Uultis — Expressões de vida';
    if (lastFocus?.isConnected) lastFocus.focus({preventScroll:true});
  }

  function openCatalog(mode, keepQuery = false) {
    const isDifferent = state.view !== 'catalog' || state.mode !== mode;
    state.view = 'catalog';
    state.mode = mode;
    if (isDifferent) { state.category = ''; state.sort = 'featured'; state.limit = 24; if (!keepQuery) state.query = ''; }
    homeView.hidden = true;
    catalogView.hidden = false;
    $('#site-header').classList.add('solid');
    if (mode === 'favorites') {
      $('#catalog-title').innerHTML = 'O seu olhar.<br>A sua <em>seleção.</em>';
      $('#catalog-eyebrow').textContent = 'PEÇAS QUE CONVERSAM COM VOCÊ';
      $('#catalog-description').textContent = 'Suas peças favoritas, guardadas neste dispositivo.';
    } else if (mode === 'simbiose') {
      $('#catalog-title').innerHTML = 'Simbiose.<br><em>2026.</em>';
      $('#catalog-eyebrow').textContent = 'A MATÉRIA ENCONTRA NOVAS EXPRESSÕES';
      $('#catalog-description').textContent = 'Explore os encontros da coleção Simbiose.';
    } else {
      $('#catalog-title').innerHTML = 'Todas as formas<br>de <em>sentir.</em>';
      $('#catalog-eyebrow').textContent = 'DESIGN AUTORAL BRASILEIRO';
      $('#catalog-description').textContent = 'Encontre a peça que conversa com o seu espaço.';
    }
    renderCatalog();
    document.title = mode === 'favorites' ? 'Minha seleção — Uultis' : mode === 'simbiose' ? 'Simbiose 2026 — Uultis' : 'Coleção — Uultis';
    return isDifferent;
  }

  function route(initial = false) {
    const hash = location.hash || '#inicio';
    if (hash.startsWith('#produto/')) {
      closeDialog(menuDialog);
      closeDialog(searchDialog);
      openProduct(decodeURIComponent(hash.slice(9)));
      return;
    }
    const wasProduct = productDialog.open;
    if (wasProduct) {
      closingForRoute = true;
      closeDialog(productDialog);
      closingForRoute = false;
      activeProductId = null;
    }
    closeDialog(menuDialog);
    baseHash = hash;
    const mode = hash === '#favoritos' ? 'favorites' : hash === '#simbiose' ? 'simbiose' : hash === '#colecao' ? 'all' : null;
    if (mode) {
      openCatalog(mode);
      if (!wasProduct) window.scrollTo({top:0,behavior:'instant'});
    } else {
      state.view = 'home';
      catalogView.hidden = true;
      homeView.hidden = false;
      $('#site-header').classList.remove('solid');
      document.title = 'Uultis — Expressões de vida';
      if (!wasProduct) {
        const target = document.getElementById(hash.slice(1)) || $('#inicio');
        requestAnimationFrame(() => target.scrollIntoView({behavior:initial || reducedMotion.matches ? 'instant' : 'smooth',block:'start'}));
      }
      observeReveals();
    }
    scheduleFrame();
  }

  function renderSearch(query = '') {
    const matches = ordered(products.filter(p => matchesQuery(p,query)));
    $('#search-summary').textContent = query.trim() ? `${matches.length} ${matches.length === 1 ? 'peça encontrada' : 'peças encontradas'}. Pressione Enter para explorar todos os resultados.` : 'Algumas peças para começar a descobrir.';
    $('#search-results').innerHTML = matches.slice(0,8).map(p => `<a href="#produto/${esc(p.id)}" class="search-result"><img src="${esc(p.thumbnail || p.image)}" alt="${esc(p.name)}" width="92" height="92" loading="lazy"><div>${esc(p.name)}<span>${esc(p.category)}</span></div></a>`).join('') || '<p class="search-summary">Experimente um nome, um designer ou uma categoria diferente.</p>';
  }

  function showSearch() {
    $('#global-search').value = '';
    renderSearch();
    openDialog(searchDialog);
    requestAnimationFrame(() => $('#global-search').focus());
  }

  function submitSearch() {
    const query = $('#global-search').value;
    closeDialog(searchDialog);
    state.query = query;
    state.category = '';
    state.limit = 24;
    openCatalog('all',true);
    baseHash = '#colecao';
    history.pushState(null,'','#colecao');
    window.scrollTo({top:0,behavior:'instant'});
  }

  let revealObserver;
  function observeReveals() {
    if (reducedMotion.matches) { $$('.reveal').forEach(el => el.classList.add('is-visible')); return; }
    if (!revealObserver) revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
    },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    $$('.reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
  }

  function showMaterial(index) {
    if (currentMaterial === index) return;
    currentMaterial = index;
    $$('.material-image').forEach((el,i) => el.classList.toggle('active',i === index));
    $$('.material-chapter').forEach((el,i) => {
      el.classList.toggle('active',i === index);
      el.setAttribute('aria-hidden',String(i !== index));
    });
    $$('[data-material]').forEach((el,i) => {
      el.classList.toggle('active',i === index);
      el.setAttribute('aria-pressed',String(i === index));
    });
    $('#material-step').textContent = String(index+1);
  }

  function frame() {
    needsFrame = false;
    const y = window.scrollY;
    $('#site-header').classList.toggle('scrolled',y > 70);
    if (state.view !== 'home') return;
    const hero = $('.hero');
    if (y < hero.offsetHeight + 100 && !reducedMotion.matches) {
      $('.hero-image').style.transform = `translateY(${Math.min(y*.18,170)}px) scale(1.045)`;
      $('.hero-progress span').style.width = `${Math.min(100,y/hero.offsetHeight*100)}%`;
    }
    if (manualMaterial && Math.abs(y-manualMaterial.y) > 100) manualMaterial = null;
    if (reducedMotion.matches) { if (currentMaterial < 0) showMaterial(0); return; }
    const story = $('.material-story');
    const rect = story.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = Math.max(0,Math.min(.999,-rect.top / Math.max(1,story.offsetHeight-window.innerHeight)));
      showMaterial(manualMaterial ? manualMaterial.index : Math.min(2,Math.floor(progress*3)));
    }
  }

  function scheduleFrame() {
    if (!needsFrame) { needsFrame = true; requestAnimationFrame(frame); }
  }

  document.addEventListener('click',event => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
      event.preventDefault();
      const id = favorite.dataset.favorite;
      const wasSelected = favorites.has(id);
      wasSelected ? favorites.delete(id) : favorites.add(id);
      updateFavorites();
      announce(`${byId.get(id)?.name || 'Peça'} ${wasSelected ? 'removida da' : 'adicionada à'} sua seleção.`);
      if (state.view === 'catalog' && state.mode === 'favorites') renderCatalog();
      return;
    }
    const thumbnail = event.target.closest('[data-gallery-image]');
    if (thumbnail && activeProductId) {
      const p = byId.get(activeProductId);
      const index = Number(thumbnail.dataset.galleryImage);
      $('#product-main-img').src = p.display_images[index];
      $('#product-image-index').textContent = `${String(index+1).padStart(2,'0')} / ${String(p.display_images.length).padStart(2,'0')}`;
      $$('[data-gallery-image]').forEach((el,i) => { el.classList.toggle('active',i === index); el.setAttribute('aria-pressed',String(i === index)); });
      return;
    }
    const curation = event.target.closest('[data-curation]');
    if (curation) { renderCuration(curation.dataset.curation); return; }
    const category = event.target.closest('[data-category]');
    if (category) { state.category = category.dataset.category; state.limit = 24; renderCatalog(); return; }
    const reset = event.target.closest('[data-reset]');
    if (reset) { state[reset.dataset.reset] = ''; state.limit = 24; renderCatalog(); return; }
    const searchTerm = event.target.closest('[data-search-term]');
    if (searchTerm) { $('#global-search').value = searchTerm.dataset.searchTerm; renderSearch(searchTerm.dataset.searchTerm); return; }
    const material = event.target.closest('[data-material]');
    if (material) { const index = Number(material.dataset.material); manualMaterial = {index,y:window.scrollY}; showMaterial(index); return; }
    const dialogClose = event.target.closest('.close-dialog');
    if (dialogClose) { closeDialog(dialogClose.closest('dialog')); return; }
    const internal = event.target.closest('a[href^="#"]');
    if (internal) {
      const href = internal.getAttribute('href');
      if (href === '#conteudo') { event.preventDefault(); $('#conteudo').focus({preventScroll:true}); $('#conteudo').scrollIntoView({behavior:'instant'}); return; }
      if (href.startsWith('#produto/') && !location.hash.startsWith('#produto/')) baseHash = location.hash || '#inicio';
      if (href === location.hash || (href === '#inicio' && !location.hash)) { event.preventDefault(); route(); }
      if (menuDialog.open) closeDialog(menuDialog);
    }
  });

  $('#open-search').addEventListener('click',showSearch);
  $('#open-menu').addEventListener('click',() => openDialog(menuDialog));
  $('#close-product').addEventListener('click',closeProduct);
  $('#global-search').addEventListener('input',event => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderSearch(event.target.value),100);
  });
  $('#search-form').addEventListener('submit',event => { event.preventDefault(); submitSearch(); });
  $('#catalog-query').addEventListener('input',event => {
    const query = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = query; state.limit = 24; renderCatalog(); },140);
  });
  $('#category-select').addEventListener('change',event => { state.category = event.target.value; state.limit = 24; renderCatalog(); });
  $('#catalog-sort').addEventListener('change',event => { state.sort = event.target.value; state.limit = 24; renderCatalog(); });
  $('#load-more').addEventListener('click',() => { state.limit += 24; renderCatalog(true); });
  $('#clear-filters').addEventListener('click',() => {
    if (state.mode === 'favorites' && !favorites.size) { location.hash = '#colecao'; return; }
    state.category = ''; state.query = ''; state.limit = 24; renderCatalog();
  });
  $('#open-film').addEventListener('click',() => {
    $('#film-player').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/UgiDXOVckDc?autoplay=1&rel=0" title="Filme institucional Uultis" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    openDialog(filmDialog);
  });
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click',event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog === productDialog ? closeProduct() : closeDialog(dialog);
    });
    dialog.addEventListener('close',() => {
      if (dialog === filmDialog) $('#film-player').innerHTML = '';
      if (dialog === productDialog && !closingForRoute && location.hash.startsWith('#produto/')) {
        history.replaceState(null,'',baseHash);
        activeProductId = null;
        document.title = state.view === 'catalog' ? 'Coleção — Uultis' : 'Uultis — Expressões de vida';
      }
      syncDialogState();
    });
  });
  document.addEventListener('keydown',event => {
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$('dialog[open]')) { event.preventDefault(); showSearch(); }
  });
  document.addEventListener('error',event => {
    const img = event.target;
    if (img.tagName === 'IMG' && !img.dataset.failed) {
      img.dataset.failed = 'true';
      img.src = 'assets/logo-black.svg';
      img.classList.add('image-missing');
      img.alt = 'Imagem indisponível. Consulte a página original da peça.';
    }
  },true);
  window.addEventListener('hashchange',() => route());
  window.addEventListener('scroll',scheduleFrame,{passive:true});
  window.addEventListener('resize',scheduleFrame,{passive:true});
  reducedMotion.addEventListener('change',() => { observeReveals(); scheduleFrame(); });

  // Keep motion progressive: complete content is visible if JavaScript is unavailable.
  if (!reducedMotion.matches) document.documentElement.classList.add('js-motion');
  $('#current-year').textContent = String(new Date().getFullYear());
  const chips = [['','Todos'],['Poltronas','Poltronas'],['Sofás','Sofás'],['Cadeiras','Cadeiras'],['Mesas','Mesas'],['Sense Outdoor','Outdoor']];
  $('#filter-chips').innerHTML = chips.map(([value,label]) => `<button data-category="${esc(value)}" aria-pressed="${!value}" class="${!value ? 'active' : ''}">${label}</button>`).join('');
  const categories = [...new Set(products.map(p => p.category))].sort((a,b) => a.localeCompare(b,'pt-BR'));
  $('#category-select').insertAdjacentHTML('beforeend',categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join(''));
  $('#inspiration-grid').innerHTML = (window.UULTIS_GALLERIES || []).map(gallery => `<a href="${esc(gallery.url)}" target="_blank" rel="noopener" class="inspiration-card reveal"><div class="inspiration-photo"><img src="${esc(gallery.image)}" alt="${esc(gallery.alt)}" loading="lazy" width="1600" height="1400"></div><div class="inspiration-caption"><div><h3>${esc(gallery.name)}</h3><p>${esc(gallery.credit)}</p></div>${icon('diagonal')}</div></a>`).join('');
  renderCuration();
  updateFavorites();
  renderSearch();
  showMaterial(0);
  route(true);
  observeReveals();
  scheduleFrame();
})();
