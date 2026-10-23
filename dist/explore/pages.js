(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const norm = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categories = [
    'Armchairs', 'Bar cabinets', 'Bar carts', 'Beds', 'Bedside tables', 'Benches',
    'Chairs', 'Chaise lounges', 'Coffee tables', 'Console tables', 'Desks',
    'Dining tables', 'Mattresses', 'Mirrors', 'Occasional tables', 'Ottomans',
    'Panels', 'Sense Outdoor', 'Sideboards & display cabinets', 'Sofas', 'Stools'
  ];

  const arrow = '<span aria-hidden="true">↗</span>';
  const categoryLinks = (className = '') => categories.map((category) => (
    `<a class="${className}" href="/#collection" data-menu-category="${category}">${category}</a>`
  )).join('');

  function internalHeaderMarkup() {
    return `
      <a class="internal-logo" href="/" aria-label="Uultis home">
        <img src="/assets/logo-black.svg" alt="Uultis" width="110" height="34">
      </a>
      <button class="internal-products-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="internal-products-menu">
        Products <span aria-hidden="true">+</span>
      </button>
      <nav class="internal-primary" aria-label="Primary navigation">
        <a href="/#essence">Our Essence</a>
        <a href="/blog/">Journal</a>
        <a href="/room-studio/">Room Studio</a>
        <a class="internal-stores" href="/stores/">Stores</a>
      </nav>
      <a class="internal-trade-link" href="/corporate/">Trade / Dealers ${arrow}</a>
      <button class="internal-mobile-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="internal-mobile-panel">Menu</button>
      <div class="internal-products-menu" id="internal-products-menu" hidden>
        <div class="internal-menu-intro">
          <span class="eyebrow">PRODUCTS</span>
          <p>Explore the Uultis catalogue by category, material and the way a piece lives in a room.</p>
          <a class="text-link" href="/#collection">Browse all 213 pieces ${arrow}</a>
        </div>
        <div class="internal-category-grid" aria-label="Product categories">${categoryLinks()}</div>
        <div class="internal-menu-actions">
          <a href="/stores/"><span class="eyebrow">FIND A SHOWROOM</span><strong>Stores</strong><small>Visit the directory and plan your next conversation.</small>${arrow}</a>
          <a href="/corporate/"><span class="eyebrow">FOR PROFESSIONAL PROJECTS</span><strong>Trade / Dealers</strong><small>Explore references, technical sheets and a clear path to the Uultis team.</small>${arrow}</a>
        </div>
      </div>
      <div class="internal-mobile-panel" id="internal-mobile-panel" hidden>
        <nav aria-label="Mobile navigation">
          <a href="/#essence">Our Essence</a>
          <a href="/blog/">Journal</a>
          <a href="/room-studio/">Room Studio</a>
          <a href="/stores/">Stores</a>
          <a href="/corporate/">Trade / Dealers</a>
          <a href="/contact/">Contact Uultis</a>
        </nav>
        <div class="internal-mobile-categories">
          <span class="eyebrow">SHOP BY CATEGORY</span>
          <div>${categoryLinks()}</div>
          <a class="text-link" href="/#collection">View all products ${arrow}</a>
        </div>
        <a class="internal-general-contact" href="mailto:contato@uultis.com">contato@uultis.com</a>
      </div>`;
  }

  function installInternalHeader() {
    const header = $('header');
    if (!header || document.body.classList.contains('biolink-page')) return;
    header.className = 'internal-header';
    header.innerHTML = internalHeaderMarkup();

    const productsButton = $('.internal-products-trigger', header);
    const productsMenu = $('#internal-products-menu', header);
    const mobileButton = $('.internal-mobile-toggle', header);
    const mobilePanel = $('#internal-mobile-panel', header);
    let productsPrimedOpen = false;

    const closeProducts = (restoreFocus = false) => {
      productsMenu.hidden = true;
      productsButton.setAttribute('aria-expanded', 'false');
      productsPrimedOpen = false;
      if (restoreFocus) productsButton.focus();
    };
    const closeMobile = (restoreFocus = false) => {
      mobilePanel.hidden = true;
      mobileButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) mobileButton.focus();
    };
    const openProducts = () => {
      closeMobile();
      productsMenu.hidden = false;
      productsButton.setAttribute('aria-expanded', 'true');
      productsPrimedOpen = true;
    };

    productsButton.addEventListener('click', () => {
      if (productsMenu.hidden) openProducts();
      else if (productsPrimedOpen) productsPrimedOpen = false;
      else closeProducts();
    });
    productsButton.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch' && matchMedia('(hover: hover) and (pointer: fine)').matches) openProducts();
    });
    productsMenu.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'touch' && matchMedia('(hover: hover) and (pointer: fine)').matches) closeProducts();
    });
    mobileButton.addEventListener('click', () => {
      const isOpen = !mobilePanel.hidden;
      if (isOpen) closeMobile();
      else {
        closeProducts();
        mobilePanel.hidden = false;
        mobileButton.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) {
        closeProducts();
        closeMobile();
        return;
      }
      if (productsPrimedOpen && event.target === productsButton) productsPrimedOpen = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!productsMenu.hidden) closeProducts(true);
      if (!mobilePanel.hidden) closeMobile(true);
    });
  }

  function initDirectory() {
    if (!$('#directory-search')) return;
    const items = [...document.querySelectorAll('.directory-card')];
    const type = new URLSearchParams(location.search).get('type');
    if (['store', 'representative'].includes(type)) $('#directory-type').value = type;
    const filter = () => {
      const query = norm($('#directory-search').value);
      const kind = $('#directory-type').value;
      const country = $('#directory-country').value;
      let count = 0;
      for (const item of items) {
        item.hidden = !(norm(item.textContent).includes(query)
          && (kind === 'all' || item.dataset.kind === kind)
          && (country === 'all' || item.dataset.country === country));
        if (!item.hidden) count += 1;
      }
      $('#directory-count').textContent = `${count} ${count === 1 ? 'location' : 'locations'}`;
      $('#directory-empty').hidden = count > 0;
    };
    $('.directory-filters').onsubmit = (event) => event.preventDefault();
    $('#directory-search').oninput = filter;
    $('#directory-type').onchange = filter;
    $('#directory-country').onchange = filter;
    filter();
  }

  function initContact() {
    if (!$('#contact-form')) return;
    $('#contact-form').onsubmit = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nLocation: ${data.get('location')}\n\n${data.get('message')}`;
      location.href = `mailto:contato@uultis.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
      $('#contact-status').textContent = 'Email draft requested. Review and send it in your email app. If it did not open, email contato@uultis.com directly.';
    };
  }

  function initCorporateRoute() {
    if (!location.pathname.startsWith('/corporate/')) return;
    const eyebrow = $('.page-heading .eyebrow');
    if (eyebrow) eyebrow.textContent = 'TRADE / DEALERS · PROFESSIONAL PROJECTS';
    const pageBody = $('.page-body');
    if (!pageBody || $('.trade-route', pageBody)) return;
    const route = document.createElement('section');
    route.className = 'trade-route';
    route.setAttribute('aria-labelledby', 'trade-route-title');
    route.innerHTML = '<span class="eyebrow" id="trade-route-title">A CLEARER PROJECT CONVERSATION</span><p>For hospitality, retail and professional spaces, start with the references and technical information here, then share your project type, location and selected products with the Uultis team. There is no login or stock portal in this experience; contact remains the next step.</p>';
    pageBody.prepend(route);
  }

  installInternalHeader();
  initDirectory();
  initContact();
  initCorporateRoute();
})();
