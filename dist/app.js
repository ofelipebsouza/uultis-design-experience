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
  const productsMenuGroup = $('#products-menu-group');
  const productsTrigger = $('#open-products');
  const productsMegaMenu = $('#products-megamenu');
  const filmDialog = $('#film-dialog');
  const curatedIds = ['274','269','300','295','314','28','303','273','298','267','286','308','294','65','120','18','297','281','302','258','142','257','169','8'];
  const curatedRank = new Map(curatedIds.map((id, i) => [id,i]));
  let favorites;
  try { const saved = JSON.parse(localStorage.getItem('uultis-selection-v1') || '[]'); favorites = new Set(Array.isArray(saved) ? saved.filter(id => byId.has(String(id))).map(String) : []); } catch { favorites = new Set(); }
  const state = { mode:'all', category:'', query:'', sort:'featured', limit:24, view:'home' };
  let baseHash = '#home';
  let lastFocus = null;
  let toastTimer;
  let activeProductId = null;
  let closingForRoute = false;
  let currentMaterial = -1;
  let manualMaterial = null;
  let pendingMenuCategory = '';
  let needsFrame = false;
  let searchTimer;
  const searchIndexes = new Map(products.map(p => [p.id, normalize([p.name,p.category,p.designer,p.description,...(p.tags || []).map(t => t.label)].join(' '))]));

  // Keep existing bookmarks working while all published navigation uses English.
  function canonicalHash(hash) {
    if (hash.startsWith('#produto/')) return hash.replace('#produto/', '#product/');
    return ({ '#inicio':'#home', '#colecao':'#collection', '#favoritos':'#favorites', '#essencia':'#essence', '#ambientes':'#inspiration', '#materia':'#materials', '#curadoria':'#curation', '#encontre':'#find-us', '#conteudo':'#content' })[hash] || hash;
  }

  function announce(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function favoriteButton(p, className = '') {
    const selected = favorites.has(p.id);
    return `<button class="favorite-button ${className}" data-favorite="${esc(p.id)}" aria-pressed="${selected}" aria-label="${selected ? 'Remove' : 'Add'} ${esc(p.name)} ${selected ? 'from' : 'to'} my selection">${icon('heart')}</button>`;
  }

  function productCard(p, index = 0) {
    const hasAlt = p.display_images?.length > 1;
    const tag = p.availability_note ? 'Collector’s edition' : p.year === '2026' ? '2026 Collection' : '';
    return `<article class="product-card"><a class="product-image-link" href="#product/${esc(p.id)}" aria-label="Discover ${esc(p.name)}, ${esc(p.category)}">${tag ? `<span class="product-tag">${tag}</span>` : ''}<img src="${esc(p.thumbnail || p.image)}" alt="${esc(p.name)} — ${esc(p.category)} Uultis" width="760" height="760" loading="lazy" decoding="async">${hasAlt ? `<img class="card-alternate" src="${esc(p.display_images[1])}" alt="" aria-hidden="true" width="760" height="760" loading="lazy" decoding="async">` : ''}<span class="card-discover">${icon('arrow')}</span></a>${favoriteButton(p)}<div class="product-card-info"><div><h3><a href="#product/${esc(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.designer || 'Uultis')}</p></div><span>${esc(p.category)}</span></div></article>`;
  }

  function ordered(list, order = 'featured') {
    return [...list].sort((a,b) => {
      if (order === 'name') return a.name.localeCompare(b.name,'en-US');
      if (order === 'newest') return Number(b.year || 0) - Number(a.year || 0) || a.name.localeCompare(b.name,'en-US');
      return (curatedRank.get(a.id) ?? 999) - (curatedRank.get(b.id) ?? 999) || Number(b.year || 0) - Number(a.year || 0) || a.name.localeCompare(b.name,'en-US');
    });
  }

  function matchesCategory(p, category) {
    return !category || category === 'All' || (category === 'Tables' ? /table/i.test(p.category) : p.category === category);
  }

  function matchesQuery(p, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return words.every(word => searchIndexes.get(p.id).includes(word));
  }

  function renderCuration(category = 'Featured') {
    const list = ordered(products.filter(p => category === 'Featured' || matchesCategory(p,category))).slice(0,6);
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
    $('#catalog-count').textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
    $('#catalog-shown').textContent = list.length ? `${shown.length} of ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` : '';
    $('#load-more').hidden = shown.length >= list.length;
    $('#catalog-empty').hidden = list.length > 0;
    if (!list.length) {
      $('#catalog-empty > span').textContent = state.mode === 'favorites' && !favorites.size ? 'Your selection begins here.' : 'Ready to discover something new?';
      $('#catalog-empty p').textContent = state.mode === 'favorites' && !favorites.size ? 'Tap the heart on a piece to save it and return whenever you like.' : 'No pieces match these filters.';
      $('#clear-filters').innerHTML = (state.mode === 'favorites' && !favorites.size ? 'Explore the collection ' : 'Clear filters ') + icon('arrow');
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
    $('.favorites-nav').setAttribute('aria-label',`My selection, ${favorites.size} ${favorites.size === 1 ? 'piece' : 'pieces'}`);
    $$('[data-favorite]').forEach(button => {
      const id = button.dataset.favorite;
      const selected = favorites.has(id);
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',`${selected ? 'Remove' : 'Add'} ${byId.get(id)?.name || 'piece'} ${selected ? 'from' : 'to'} my selection`);
    });
    try { localStorage.setItem('uultis-selection-v1',JSON.stringify([...favorites])); } catch { /* The selection remains available for the current session. */ }
  }

  function syncDialogState() {
    const anyOpen = !!$('dialog[open]');
    document.body.classList.toggle('dialog-open',anyOpen);
    $('#open-menu').setAttribute('aria-expanded',String(menuDialog.open));
  }

  let productsCloseTimer;
  let productsPrimedOpen = false;
  function setProductsMenu(open, restoreFocus = false, prime = false) {
    if (!productsMegaMenu || !productsTrigger) return;
    clearTimeout(productsCloseTimer);
    productsMegaMenu.hidden = !open;
    productsTrigger.setAttribute('aria-expanded',String(open));
    productsMenuGroup?.classList.toggle('is-open',open);
    productsPrimedOpen = open && prime;
    if (!open && restoreFocus) productsTrigger.focus({preventScroll:true});
  }
  function closeProductsMenu(restoreFocus = false) { setProductsMenu(false,restoreFocus); }
  function scheduleProductsMenuClose() {
    clearTimeout(productsCloseTimer);
    productsCloseTimer = setTimeout(() => closeProductsMenu(),160);
  }
  function selectMenuCategory(category) {
    pendingMenuCategory = category;
    state.query = '';
    state.limit = 24;
    closeProductsMenu();
    closeDialog(menuDialog);
    if (location.hash === '#collection') route();
    else location.hash = '#collection';
  }

  function openDialog(dialog) {
    lastFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    syncDialogState();
  }

  function closeDialog(dialog) {
    if (dialog === productDialog) stopProductViewer();
    if (dialog.open) dialog.close();
    syncDialogState();
  }

  function productResources(p) {
    const result = { sheets:[], models:[], other:[] };
    for (const resource of p.specs || []) {
      if (!resource?.url) continue;
      let url;
      try { url = new URL(resource.url, location.origin); } catch { continue; }
      if (!['https:','http:'].includes(url.protocol)) continue;
      if (/technical sheet|ficha/.test(normalize(resource.label))) {
        result.sheets.push(resource);
      } else if (url.hostname === '3dwarehouse.sketchup.com') {
        result.models.push({ ...resource, provider:'SketchUp', direct:/^\/model\/[^/]+/.test(url.pathname) });
      } else if (/(^|\.)casoca\.com\.br$/.test(url.hostname)) {
        result.models.push({ ...resource, provider:'Casoca', direct:false });
      } else {
        result.other.push(resource);
      }
    }
    const order = { 'en-US':0, 'pt-BR':1, 'es-ES':2, 'es':2 };
    result.sheets.sort((a,b) => (order[a.language] ?? 3) - (order[b.language] ?? 3));
    return result;
  }

  function sheetLanguage(language) {
    return ({ 'pt-BR':'Portuguese', 'en-US':'English', 'es-ES':'Spanish', es:'Spanish' })[language] || 'Other version';
  }

  function modelResourceLink(resource) {
    const title = resource.provider === 'SketchUp' ? (resource.direct ? '3D model · SketchUp' : 'Find models · SketchUp') : '3D files · Casoca';
    const detail = resource.provider === 'SketchUp' ? (resource.direct ? 'Model of this piece' : 'Search the official Uultis collection') : 'This piece on Casoca';
    return `<a class="product-resource-link" href="${esc(resource.url)}" target="_blank" rel="noopener"><span><strong>${title}</strong><small>${detail} · Opens in a new tab</small></span>${icon('diagonal')}</a>`;
  }

  function projectResources(p, resources) {
    const sheets = resources.sheets.map((resource,index) => {
      const sameLanguage = resources.sheets.filter(sheet => sheet.language === resource.language);
      const number = resources.sheets.slice(0,index+1).filter(sheet => sheet.language === resource.language).length;
      const fileLabel = sameLanguage.length > 1 ? ` · File ${number}` : '';
      return `<a class="product-resource-link" href="${esc(resource.url)}" target="_blank" rel="noopener"${resource.language ? ` hreflang="${esc(resource.language)}"` : ''}><span><strong>Technical sheet · ${esc(sheetLanguage(resource.language))}${fileLabel}</strong><small>${resource.language ? esc(resource.language) : 'Language not specified'} · PDF · Opens in a new tab</small></span>${icon('download')}</a>`;
    }).join('');
    const extra = resources.other.map(resource => `<a class="product-resource-link" href="${esc(resource.url)}" target="_blank" rel="noopener"><span><strong>${esc(resource.label || 'Official resource')}</strong><small>Opens in a new tab</small></span>${icon('diagonal')}</a>`);
    if (p.video_url) {
      const match = p.video_url.match(/embed\/([\w-]+)/);
      const url = match ? `https://www.youtube.com/watch?v=${match[1]}` : p.video_url;
      extra.push(`<a class="product-resource-link" href="${esc(url)}" target="_blank" rel="noopener"><span><strong>Product film</strong><small>Opens in a new tab</small></span>${icon('play')}</a>`);
    }
    if (!sheets && !resources.models.length && !extra.length) return '';
    return `<section class="product-project" aria-labelledby="product-project-title"><div class="product-project-heading"><span class="eyebrow">FROM INSPIRATION TO YOUR PROJECT</span><h3 id="product-project-title">For your <em>project.</em></h3><p>Technical sheets and resources published by Uultis to help you discover the piece and plan your space.</p></div>${sheets ? `<div class="product-resource-group"><h4>Technical sheets <span>${resources.sheets.length} ${resources.sheets.length === 1 ? 'file' : 'files'}</span></h4>${sheets}</div>` : ''}${resources.models.length ? `<div class="product-resource-group"><h4>3D models and files</h4>${resources.models.map(modelResourceLink).join('')}</div>` : ''}${extra.length ? `<div class="product-resource-group"><h4>More about this piece</h4>${extra.join('')}</div>` : ''}</section>`;
  }

  function stopProductViewer() {
    // Removing a provider frame also stops its rendering and releases its resources.
    $$('iframe',productDialog).forEach(frame => frame.remove());
  }

  function selectProductMedia(mode, moveFocus = false) {
    const models = mode === 'models';
    const photoPanel = $('#product-photo-panel');
    const modelPanel = $('#product-model-panel');
    if (!photoPanel || !modelPanel) return;
    photoPanel.hidden = models;
    modelPanel.hidden = !models;
    if (!models) stopProductViewer();
    $$('[data-product-media]',productDialog).forEach(tab => {
      const selected = tab.dataset.productMedia === mode;
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus({preventScroll:true});
    });
  }

  function openProduct(id) {
    const p = byId.get(id);
    if (!p) {
      announce('This piece could not be found. Explore the collection.');
      location.replace('#collection');
      return;
    }
    stopProductViewer();
    const pics = p.display_images?.length ? p.display_images : [p.image];
    const resources = productResources(p);
    const hasModels = resources.models.length > 0;
    const galleryTabs = hasModels ? `<div class="product-media-tabs" role="tablist" aria-label="Explore ${esc(p.name)}"><button type="button" id="product-tab-photos" role="tab" aria-controls="product-photo-panel" aria-selected="true" data-product-media="photos">Photos <span>${String(pics.length).padStart(2,'0')}</span></button><button type="button" id="product-tab-models" role="tab" aria-controls="product-model-panel" aria-selected="false" tabindex="-1" data-product-media="models">3D resources ${icon('diagonal')}</button></div>` : '';
    const nativeStudy = ['290','291','289','82','64','100','134','12','80','211'].includes(String(p.id)) ? `<a class="native-studio-link" href="/room-studio/?product=${esc(p.id)}"><span class="eyebrow">INTERACTIVE ROOM STUDIO</span><strong>See ${esc(p.name)} in a space.</strong><span>Orbit, zoom, explore finishes and placement ${icon('arrow')}</span><small>Illustrative 3D study. See dimension notes in the studio.</small></a>` : '';
    const modelPanel = hasModels ? `<div class="product-model-panel" id="product-model-panel" role="tabpanel" aria-labelledby="product-tab-models" tabindex="0" hidden>${nativeStudy}<div class="product-model-preview"><img src="${esc(pics[0])}" alt="${esc(p.name)} — product photograph" width="1400" height="1400"><span class="product-model-mark" aria-hidden="true">3D</span></div><div class="product-model-copy"><span class="eyebrow">FROM OBJECT TO SPACE</span><h3>Imagine every <em>angle.</em></h3><p>Explore models and files for this piece in the official collections. Choose a platform to continue in a new tab.</p></div><div class="product-model-links">${resources.models.map(modelResourceLink).join('')}</div></div>` : '';
    activeProductId = id;
    $('#product-content').innerHTML = `<div class="product-content-layout"><div class="product-gallery">${galleryTabs}<div id="product-photo-panel" class="product-photo-panel"${hasModels ? ' role="tabpanel" aria-labelledby="product-tab-photos" tabindex="0"' : ''}><div class="product-main-image"><img id="product-main-img" src="${esc(pics[0])}" alt="${esc(p.name)} — ${esc(p.category)} Uultis" width="1400" height="1400"></div><div class="product-gallery-label"><span>DESIGN IN EVERY DETAIL</span><span id="product-image-index">01 / ${String(pics.length).padStart(2,'0')}</span></div>${pics.length > 1 ? `<div class="product-thumbnails" role="group" aria-label="Images of ${esc(p.name)}">${pics.map((src,i) => `<button class="${i === 0 ? 'active' : ''}" data-gallery-image="${i}" aria-label="View image ${i+1}" aria-pressed="${i === 0}"><img src="${esc(src)}" alt="" width="62" height="62"></button>`).join('')}</div>` : ''}</div>${modelPanel}</div><div class="product-detail"><span class="eyebrow">UULTIS / ${esc(p.category).toUpperCase()}</span><h2 id="product-title">${esc(p.name)}</h2><div class="product-byline"><span>DESIGN</span>${p.designer_url ? `<a href="${esc(p.designer_url)}">${esc(p.designer)}</a>` : esc(p.designer || 'Uultis')}</div><div class="product-description">${p.description.split(/\n\s*\n/).map(par => `<p>${esc(par)}</p>`).join('')}</div><dl class="product-meta"><div><dt>CATEGORY</dt><dd>${esc(p.category)}</dd></div>${p.year ? `<div><dt>YEAR</dt><dd>${esc(p.year)}</dd></div>` : ''}</dl>${p.availability_note ? `<p class="product-category-label">${esc(p.availability_note)}</p>` : ''}<div class="product-actions"><a class="outline-button" href="/stores/">${p.availability_note ? 'Explore our stores' : 'Find a store'} ${icon('diagonal')}</a>${favoriteButton(p)}</div><a class="product-source" href="/#collection">Explore the full collection ${icon('diagonal')}</a>${nativeStudy}${projectResources(p,resources)}</div></div>`;
    openDialog(productDialog);
    productDialog.scrollTop = 0;
    document.title = `${p.name} — ${p.category} | Uultis`;
  }

  function closeProduct() {
    if (location.hash.startsWith('#product/')) history.replaceState(null,'',baseHash);
    closeDialog(productDialog);
    activeProductId = null;
    document.title = state.view === 'catalog' ? 'Collection — Uultis' : 'Uultis — Expressions of life';
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
      $('#catalog-title').innerHTML = 'Your perspective.<br>Your <em>selection.</em>';
      $('#catalog-eyebrow').textContent = 'PIECES THAT SPEAK TO YOU';
      $('#catalog-description').textContent = 'Your favorite pieces, saved on this device.';
    } else if (mode === 'simbiose') {
      $('#catalog-title').innerHTML = 'Simbiose.<br><em>2026.</em>';
      $('#catalog-eyebrow').textContent = 'MATERIAL FINDS NEW EXPRESSIONS';
      $('#catalog-description').textContent = 'Explore the connections within the Simbiose collection.';
    } else {
      $('#catalog-title').innerHTML = 'Every way<br>to <em>feel.</em>';
      $('#catalog-eyebrow').textContent = 'ORIGINAL BRAZILIAN DESIGN';
      $('#catalog-description').textContent = 'Find the piece that speaks to your space.';
    }
    renderCatalog();
    document.title = mode === 'favorites' ? 'My selection — Uultis' : mode === 'simbiose' ? 'Simbiose 2026 — Uultis' : 'Collection — Uultis';
    return isDifferent;
  }

  function route(initial = false) {
    const hash = canonicalHash(location.hash || '#home');
    if (location.hash && hash !== location.hash) history.replaceState(null,'',hash);
    if (hash.startsWith('#product/')) {
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
    closeProductsMenu();
    baseHash = hash;
    const mode = hash === '#favorites' ? 'favorites' : hash === '#simbiose' ? 'simbiose' : hash === '#collection' ? 'all' : null;
    if (mode) {
      openCatalog(mode);
      if (pendingMenuCategory) {
        state.category = pendingMenuCategory;
        pendingMenuCategory = '';
        renderCatalog();
      }
      if (!wasProduct) window.scrollTo({top:0,behavior:'instant'});
    } else {
      state.view = 'home';
      catalogView.hidden = true;
      homeView.hidden = false;
      $('#site-header').classList.remove('solid');
      document.title = 'Uultis — Expressions of life';
      if (!wasProduct) {
        const target = document.getElementById(hash.slice(1)) || $('#home');
        requestAnimationFrame(() => target.scrollIntoView({behavior:initial || reducedMotion.matches ? 'instant' : 'smooth',block:'start'}));
      }
      observeReveals();
    }
    scheduleFrame();
  }

  function renderSearch(query = '') {
    const matches = ordered(products.filter(p => matchesQuery(p,query)));
    $('#search-summary').textContent = query.trim() ? `${matches.length} ${matches.length === 1 ? 'piece found' : 'pieces found'}. Press Enter to explore all results.` : 'A few pieces to begin your discovery.';
    $('#search-results').innerHTML = matches.slice(0,8).map(p => `<a href="#product/${esc(p.id)}" class="search-result"><img src="${esc(p.thumbnail || p.image)}" alt="${esc(p.name)}" width="92" height="92" loading="lazy"><div>${esc(p.name)}<span>${esc(p.category)}</span></div></a>`).join('') || '<p class="search-summary">Try a different name, designer or category.</p>';
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
    baseHash = '#collection';
    history.pushState(null,'','#collection');
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
    const menuCategory = event.target.closest('[data-menu-category]');
    if (menuCategory) {
      event.preventDefault();
      selectMenuCategory(menuCategory.dataset.menuCategory);
      return;
    }
    if (productsMenuGroup?.contains(event.target) && event.target.closest('a') && event.target.closest('a') !== productsTrigger) closeProductsMenu();
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
      event.preventDefault();
      const id = favorite.dataset.favorite;
      const wasSelected = favorites.has(id);
      wasSelected ? favorites.delete(id) : favorites.add(id);
      updateFavorites();
      announce(`${byId.get(id)?.name || 'Piece'} ${wasSelected ? 'removed from' : 'added to'} your selection.`);
      if (state.view === 'catalog' && state.mode === 'favorites') renderCatalog();
      return;
    }
    const mediaTab = event.target.closest('[data-product-media]');
    if (mediaTab && activeProductId) { selectProductMedia(mediaTab.dataset.productMedia); return; }
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
      if (href === '#content') { event.preventDefault(); $('#content').focus({preventScroll:true}); $('#content').scrollIntoView({behavior:'instant'}); return; }
      if (href.startsWith('#product/') && !location.hash.startsWith('#product/')) baseHash = location.hash || '#home';
      if (href === location.hash || (href === '#home' && !location.hash)) { event.preventDefault(); route(); }
      if (menuDialog.open) closeDialog(menuDialog);
    }
  });

  $('#open-search').addEventListener('click',showSearch);
  $('#open-menu').addEventListener('click',() => { closeProductsMenu(); openDialog(menuDialog); });
  productsTrigger?.addEventListener('click',event => {
    event.preventDefault();
    if (productsPrimedOpen) { productsPrimedOpen = false; return; }
    setProductsMenu(productsMegaMenu.hidden);
  });
  productsMenuGroup?.addEventListener('mouseenter',() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (productsMegaMenu.hidden) setProductsMenu(true,false,true);
  });
  productsMenuGroup?.addEventListener('mouseleave',scheduleProductsMenuClose);
  productsMenuGroup?.addEventListener('focusin',() => {
    if (productsMegaMenu.hidden) setProductsMenu(true,false,true);
  });
  productsMenuGroup?.addEventListener('focusout',event => {
    if (!productsMenuGroup.contains(event.relatedTarget)) scheduleProductsMenuClose();
  });
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
    if (state.mode === 'favorites' && !favorites.size) { location.hash = '#collection'; return; }
    state.category = ''; state.query = ''; state.limit = 24; renderCatalog();
  });
  $('#open-film').addEventListener('click',() => {
    $('#film-player').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/UgiDXOVckDc?autoplay=1&rel=0" title="Uultis brand film" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
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
      if (dialog === productDialog) stopProductViewer();
      if (dialog === productDialog && !closingForRoute && location.hash.startsWith('#product/')) {
        history.replaceState(null,'',baseHash);
        activeProductId = null;
        document.title = state.view === 'catalog' ? 'Collection — Uultis' : 'Uultis — Expressions of life';
      }
      syncDialogState();
    });
  });
  document.addEventListener('keydown',event => {
    const mediaTab = event.target.closest?.('[data-product-media]');
    if (mediaTab && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault();
      const mode = event.key === 'Home' ? 'photos' : event.key === 'End' ? 'models' : mediaTab.dataset.productMedia === 'photos' ? 'models' : 'photos';
      selectProductMedia(mode,true);
      return;
    }
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$('dialog[open]')) { event.preventDefault(); showSearch(); }
    if (event.key === 'Escape' && productsMegaMenu && !productsMegaMenu.hidden) { event.preventDefault(); closeProductsMenu(true); }
  });
  // Keep the primary photograph until its alternate is safe to display.
  document.addEventListener('load',event => {
    const img = event.target;
    if (img.tagName !== 'IMG' || !img.classList.contains('card-alternate')) return;
    img.decode().then(() => {
      if (img.isConnected && img.naturalWidth > 0) img.closest('.product-image-link')?.classList.add('has-alternate');
    }).catch(() => { /* A failed alternate must not hide the primary photograph. */ });
  },true);
  document.addEventListener('error',event => {
    const img = event.target;
    // Editorial studies keep their descriptive alt text, not a product-logo fallback.
    if (img.tagName === 'IMG' && img.dataset.studyImage !== undefined) {
      img.dataset.failed = 'true';
      return;
    }
    if (img.tagName === 'IMG' && img.classList.contains('card-alternate')) {
      img.closest('.product-image-link')?.classList.remove('has-alternate');
      img.remove();
      return;
    }
    if (img.tagName === 'IMG' && !img.dataset.failed) {
      img.dataset.failed = 'true';
      img.src = 'assets/logo-black.svg';
      img.classList.add('image-missing');
      img.alt = 'Product photograph unavailable. Explore the product details.';
    }
  },true);
  window.addEventListener('hashchange',() => route());
  window.addEventListener('scroll',scheduleFrame,{passive:true});
  window.addEventListener('resize',scheduleFrame,{passive:true});
  reducedMotion.addEventListener('change',() => { observeReveals(); scheduleFrame(); });

  // Keep motion progressive: complete content is visible if JavaScript is unavailable.
  if (!reducedMotion.matches) document.documentElement.classList.add('js-motion');
  $('#current-year').textContent = String(new Date().getFullYear());
  const chips = [['','All'],['Armchairs','Armchairs'],['Sofas','Sofas'],['Chairs','Chairs'],['Tables','Tables'],['Sense Outdoor','Outdoor']];
  $('#filter-chips').innerHTML = chips.map(([value,label]) => `<button data-category="${esc(value)}" aria-pressed="${!value}" class="${!value ? 'active' : ''}">${label}</button>`).join('');
  const categories = [...new Set(products.map(p => p.category))].sort((a,b) => a.localeCompare(b,'en-US'));
  $('#category-select').insertAdjacentHTML('beforeend',categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join(''));
  $('#inspiration-grid').innerHTML = (window.UULTIS_GALLERIES || []).map(gallery => `<a href="${esc(gallery.url)}" class="inspiration-card reveal"><div class="inspiration-photo"><img src="${esc(gallery.image)}" alt="${esc(gallery.alt)}" loading="lazy" width="1600" height="1400"></div><div class="inspiration-caption"><div><h3>${esc(gallery.name)}</h3><p>${esc(gallery.credit)}</p></div>${icon('diagonal')}</div></a>`).join('');
  renderCuration();
  updateFavorites();
  renderSearch();
  showMaterial(0);
  route(true);
  observeReveals();
  scheduleFrame();
})();
