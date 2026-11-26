// Native scrolling remains in charge inside long sections and nested controls.
function initPanelSwipes(main, sections, mobile, reducedMotion, headerHeight) {
  const nav = document.getElementById('site-nav');
  const exempt = 'a, button, input, select, textarea, iframe, summary, [contenteditable], .map-layout, .map-controls';
  const edge = 28;
  const minimumSwipe = 36;
  let gesture = null;
  let landing = null;
  let landingFrame = 0;

  function stopLanding() {
    if (!landing) return;
    window.cancelAnimationFrame(landingFrame);
    landing = null;
    document.documentElement.classList.remove('panel-transition');
  }

  function snapTo(section) {
    stopLanding();
    landing = section;
    const root = document.documentElement;
    root.classList.add('panel-transition');
    const startY = window.scrollY;
    const destination = () => Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerHeight());
    const distance = destination() - startY;
    const started = performance.now();
    const duration = 380;

    // Let one animation own this gesture. Restore native snap at the exact landing point.
    function step(now) {
      const progress = Math.min(1, (now - started) / duration);
      if (progress < 1) {
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo({ top: startY + distance * eased, behavior: 'auto' });
        landingFrame = window.requestAnimationFrame(step);
      } else {
        window.scrollTo({ top: destination(), behavior: 'auto' });
        stopLanding();
      }
    }
    landingFrame = window.requestAnimationFrame(step);
  }

  function usesOwnGesture(target) {
    if (!(target instanceof Element) || target.closest(exempt)) return true;
    for (let node = target; node && node !== main; node = node.parentElement) {
      if (node.scrollHeight <= node.clientHeight + 4) continue;
      if (/^(auto|scroll)$/.test(getComputedStyle(node).overflowY)) return true;
    }
    return false;
  }

  function start(event) {
    gesture = null;
    if (event.touches.length !== 1 || nav.classList.contains('open') ||
        (window.visualViewport && window.visualViewport.scale !== 1) ||
        usesOwnGesture(event.target) || window.getSelection()?.isCollapsed === false) {
      stopLanding();
      return;
    }

    const header = headerHeight();
    const height = window.visualViewport?.height ?? window.innerHeight;
    const { clientX: x, clientY: y } = event.touches[0];
    if (landing && Math.abs(landing.getBoundingClientRect().top - header) > 2) {
      // A continuation of the first gesture must not advance a second section.
      gesture = { x, y, settling: true };
      return;
    }
    stopLanding();

    let index = 0;
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top > header + edge) break;
      index = i;
    }
    const bounds = sections[index].getBoundingClientRect();
    const next = bounds.bottom <= height + edge ? sections[index + 1] : null;
    const previous = bounds.top >= header - edge ? sections[index - 1] : null;
    if (next || previous) gesture = { x, y, next, previous };
  }

  function move(event) {
    if (!gesture) return;
    if (event.touches.length !== 1 || !event.cancelable) {
      gesture = null;
      return;
    }
    const { clientX, clientY } = event.touches[0];
    const dx = clientX - gesture.x;
    const dy = clientY - gesture.y;
    if (!gesture.captured) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      if (Math.abs(dx) > Math.abs(dy) * .8) {
        gesture = null;
        return;
      }
      gesture.target = dy < 0 ? gesture.next : gesture.previous;
      if (!gesture.target && !gesture.settling) {
        gesture = null;
        return;
      }
      gesture.captured = true;
    }
    event.preventDefault();
  }

  function end(event) {
    const current = gesture;
    gesture = null;
    if (!current?.captured || !current.target || event.touches.length) return;
    const distance = event.changedTouches[0].clientY - current.y;
    const advances = current.target === current.next;
    if ((advances ? -distance : distance) < minimumSwipe) return;
    snapTo(current.target);
  }

  function cancel() {
    gesture = null;
  }

  function syncListeners() {
    gesture = null;
    stopLanding();
    if (mobile.matches && !reducedMotion.matches) {
      main.addEventListener('touchstart', start, { passive: true });
      main.addEventListener('touchmove', move, { passive: false });
      main.addEventListener('touchend', end, { passive: true });
      main.addEventListener('touchcancel', cancel, { passive: true });
    } else {
      main.removeEventListener('touchstart', start);
      main.removeEventListener('touchmove', move);
      main.removeEventListener('touchend', end);
      main.removeEventListener('touchcancel', cancel);
    }
  }

  window.addEventListener('hashchange', stopLanding);
  window.addEventListener('wheel', stopLanding, { passive: true });
  document.addEventListener('keydown', stopLanding);
  document.addEventListener('focusin', stopLanding);
  document.addEventListener('visibilitychange', stopLanding);
  mobile.addEventListener('change', syncListeners);
  reducedMotion.addEventListener('change', syncListeners);
  syncListeners();
}

export function initNavigation(reducedMotion) {
  const root = document.documentElement;
  const main = document.getElementById('main');
  const header = document.querySelector('.top');
  const nav = document.getElementById('site-nav');
  const menu = document.getElementById('menu-toggle');
  const progress = document.getElementById('scroll-progress-fill');
  const sections = [...main.querySelectorAll('section[id]')];
  const links = new Map([...nav.querySelectorAll('a')].map(link => [link.hash.slice(1), link]));
  const mobile = window.matchMedia('(max-width: 999px)');
  let headerHeight = 0;
  let activeLink;
  let updatePending = false;

  function update() {
    updatePending = false;
    if (!nav.classList.contains('open')) {
      const height = mobile.matches ? Math.ceil(header.getBoundingClientRect().height) : 0;
      if (height !== headerHeight) {
        headerHeight = height;
        if (mobile.matches) root.style.setProperty('--mobile-header-height', height + 'px');
        else root.style.removeProperty('--mobile-header-height');
      }
    }

    const marker = headerHeight + Math.min(120, (window.innerHeight - headerHeight) * .18);
    const section = sections.find(panel => panel.getBoundingClientRect().bottom > marker) ?? sections[sections.length - 1];
    const link = links.get(section.id);
    if (activeLink !== link) {
      activeLink?.removeAttribute('aria-current');
      link?.setAttribute('aria-current', 'location');
      activeLink = link;
    }

    const range = root.scrollHeight - root.clientHeight;
    const ratio = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';
  }

  function scheduleUpdate() {
    if (updatePending) return;
    updatePending = true;
    window.requestAnimationFrame(update);
  }

  function setMenu(open) {
    nav.classList.toggle('open', open);
    root.classList.toggle('mobile-menu-open', open && mobile.matches);
    menu.setAttribute('aria-expanded', String(open));
    update();
  }

  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !nav.classList.contains('open')) return;
    setMenu(false);
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
    setMenu(false);
    menu.focus();
  });
  mobile.addEventListener('change', () => setMenu(false));
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.visualViewport?.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(header);
    observer.observe(main);
  }

  update();
  initPanelSwipes(main, sections, mobile, reducedMotion, () => headerHeight);
}
