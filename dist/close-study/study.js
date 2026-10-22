(() => {
  'use strict';
  const section = document.getElementById('close-study');
  if (!section) return;
  const home = document.getElementById('home-view');
  const story = section.querySelector('.study-story');
  const stage = section.querySelector('.study-stage');
  const frames = [...section.querySelectorAll('[data-study-frame]')];
  const images = frames.map(frame => frame.querySelector('img'));
  const buttons = [...section.querySelectorAll('[data-study-step]')];
  const toggle = document.getElementById('study-motion-toggle');
  const media = window.matchMedia('(min-width: 1000px) and (min-height: 600px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let reached = false;
  let stills = false;
  let failed = false;
  let prepared;
  let context;
  let timeline;
  let current = -1;
  let serial = 0;

  function loadScript(src, globalName) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => window[globalName] ? resolve() : reject(new Error('Motion unavailable'));
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function prepare() {
    if (!prepared) prepared = (async () => {
      // Leave the HTML image gallery untouched if any required resource fails.
      await Promise.all(images.map(async img => {
        img.loading = 'eager';
        if (img.decode) await img.decode();
        else if (!img.complete) await new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', reject, { once: true });
        });
        if (!img.naturalWidth || img.dataset.failed) throw new Error('Study image unavailable');
      }));
      await loadScript('assets/vendor/gsap-3.15.0.min.js', 'gsap');
      await loadScript('assets/vendor/ScrollTrigger-3.15.0.min.js', 'ScrollTrigger');
      window.gsap.registerPlugin(window.ScrollTrigger);
    })();
    return prepared;
  }

  function select(index) {
    if (index === current) return;
    current = index;
    frames.forEach((frame, i) => frame.setAttribute('aria-hidden', String(i !== index)));
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('study-frame-number').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
    document.getElementById('study-frame-title').textContent = frames[index].dataset.title;
    document.getElementById('study-frame-copy').textContent = frames[index].dataset.copy;
  }

  function reset() {
    context?.revert();
    context = null;
    timeline = null;
    current = -1;
    section.classList.remove('is-motion');
    frames.forEach(frame => frame.removeAttribute('aria-hidden'));
    buttons.forEach(button => button.removeAttribute('aria-current'));
  }

  async function sync() {
    const request = ++serial;
    const eligible = media.matches && !home.hidden && reached && !failed;
    toggle.hidden = !eligible;
    toggle.setAttribute('aria-pressed', String(stills));
    toggle.textContent = stills ? 'Follow the scroll' : 'View all stills';
    if (!eligible || stills) { reset(); return; }
    if (context) return;
    try { await prepare(); } catch { failed = true; toggle.hidden = true; reset(); return; }
    if (request !== serial || !media.matches || home.hidden || stills) return;
    const { gsap } = window;
    section.classList.add('is-motion');
    context = gsap.context(() => {
      gsap.set(frames.slice(1), { clipPath: 'inset(0 100% 0 0)' });
      gsap.set(images, { scale: 1.055 });
      timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'igriega-close-study', trigger: story,
          start: 'top 76px',
          end: () => `+=${Math.max(1, story.offsetHeight - stage.offsetHeight)}`,
          scrub: 0.45, invalidateOnRefresh: true,
        },
        onUpdate() { select(Math.min(3, Math.max(0, Math.floor(this.time())))); },
      });
      frames.forEach((frame, index) => {
        timeline.to(images[index], { scale: 1, duration: 1.15 }, index ? index - 0.15 : 0);
        if (index) timeline.to(frame, { clipPath: 'inset(0 0% 0 0)', duration: 0.28 }, index - 0.15);
        timeline.to(buttons[index].querySelector('i'), { scaleX: 1, duration: 1 }, index);
      });
      select(0);
    }, section);
    timeline.scrollTrigger.refresh();
  }

  toggle.addEventListener('click', () => {
    const top = section.getBoundingClientRect().top + window.scrollY;
    stills = !stills;
    sync();
    // A deliberate view-mode change returns to the study heading, not mid-gallery.
    window.scrollTo({ top: Math.max(0, top - 76), behavior: 'instant' });
  });
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    const trigger = timeline?.scrollTrigger;
    if (!trigger) return;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * ((index + 0.3) / 4), behavior: 'smooth' });
  }));
  media.addEventListener('change', sync);
  document.addEventListener('error', event => {
    if (!images.includes(event.target)) return;
    failed = true;
    sync();
  }, true);
  // Catalog navigation hides the home view. Revert its timeline while hidden and
  // create exactly one fresh instance on return, including Back/Forward.
  const routeObserver = new MutationObserver(sync);
  routeObserver.observe(home, { attributes: true, attributeFilter: ['hidden'] });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      reached = true;
      observer.disconnect();
      sync();
    }, { rootMargin: '900px 0px' });
    observer.observe(section);
  } else { reached = true; sync(); }
  window.addEventListener('pageshow', () => { if (timeline) timeline.scrollTrigger.refresh(); else sync(); });
})();
