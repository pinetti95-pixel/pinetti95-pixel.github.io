import { initNavigation } from './navigation.js';
import { initPlaces } from './places.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initLanguages(refreshPlaces) {
  const buttons = [document.getElementById('it'), document.getElementById('en')];
  const textNodes = document.querySelectorAll('[data-it][data-en]');
  const attributes = [
    ['label', 'aria-label'],
    ['alt', 'alt'],
    ['title', 'title'],
    ['content', 'content']
  ].map(([key, attribute]) => ({
    key, attribute,
    nodes: document.querySelectorAll('[data-' + key + '-it][data-' + key + '-en]')
  }));

  function setLanguage(language) {
    if (language === document.documentElement.lang) return;
    document.documentElement.lang = language;

    // Translation applies to leaves. A translated wrapper must never erase child links or controls.
    for (const element of textNodes) {
      if (element.childElementCount === 0) element.textContent = element.dataset[language];
    }
    for (const { key, attribute, nodes } of attributes) {
      for (const element of nodes) {
        element.setAttribute(attribute, element.getAttribute('data-' + key + '-' + language));
      }
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.id === language));
    }
    refreshPlaces();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => setLanguage(button.id));
  }
}

function initPortrait() {
  const portrait = document.querySelector('.hero-portrait img');
  function useFallback() {
    portrait.removeEventListener('error', useFallback);
    portrait.src = portrait.dataset.fallback;
  }
  portrait.addEventListener('error', useFallback);
  // The eager image can finish loading before this module executes.
  if (portrait.complete && !portrait.naturalWidth) useFallback();
}

function initPosts() {
  const feed = document.getElementById('linkedin-feed');
  const toggle = document.getElementById('load-linkedin');
  const posts = Array.from(feed.querySelectorAll('iframe'), frame => ({
    frame, source: frame.getAttribute('src')
  }));

  toggle.addEventListener('click', () => {
    feed.hidden = !feed.hidden;
    toggle.setAttribute('aria-expanded', String(!feed.hidden));
    for (const { frame, source } of posts) {
      if (feed.hidden) frame.removeAttribute('src');
      else frame.setAttribute('src', source);
    }
  });
}

function initRoles() {
  const words = ['Educator', 'Teacher', 'Pedagogist', 'Researcher'];
  const nodes = [...document.querySelectorAll('.role-changing')];
  let index = 0;
  let timer;
  let animations = [];

  function animate(visible, frames, timing) {
    animations = visible.map(node => node.animate(frames, timing));
    return Promise.all(animations.map(animation => animation.finished));
  }

  async function rotate() {
    const visible = nodes.filter(node => node.getClientRects().length && node.animate);
    try {
      await animate(visible, [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-.24em)' }
      ], { duration: 180, easing: 'ease-in' });

      if (document.hidden || reducedMotion.matches) return;
      index = (index + 1) % words.length;
      for (const node of nodes) {
        node.textContent = words[index];
        node.dataset.role = words[index];
      }

      await animate(visible, [
        { opacity: 0, transform: 'translateY(.27em)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 450, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      animations = [];
    }
  }

  function syncPlayback() {
    window.clearInterval(timer);
    for (const animation of animations) animation.cancel();
    if (!reducedMotion.matches && !document.hidden) timer = window.setInterval(rotate, 2800);
  }

  reducedMotion.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  syncPlayback();
}

function initReveals() {
  if (!('IntersectionObserver' in window)) return;
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches) entry.target.classList.add('motion-enter');
      reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -9% 0px' });
  const targets = [
    '.section-head', '.project', '.publication', '.entry', '.education-row',
    '.teaching article', '.social-post', '.credential-profile-intro', '.credential-frame',
    '.poster-gallery article', '.section > .intro', '.cols', '.map-controls',
    '.map-layout', '.sub', '.section > .affiliations', '.contact'
  ];
  document.querySelectorAll(targets.join(',')).forEach(element => reveal.observe(element));
}

document.documentElement.classList.add('js');
initPortrait();
initNavigation(reducedMotion);
initLanguages(initPlaces());
initPosts();
initRoles();
initReveals();
