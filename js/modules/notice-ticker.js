const TICKER_INTERVAL = 5000;

const ticker = document.querySelector('[data-js="notice-ticker"]');
const tickerLink = ticker?.querySelector('[data-js="notice-ticker-link"]');
const pauseButton = ticker?.querySelector('[data-js="notice-ticker-pause"]');
const playButton = ticker?.querySelector('[data-js="notice-ticker-play"]');
const closeButton = ticker?.querySelector('[data-js="notice-ticker-close"]');
let posts = [];
let currentIndex = 0;
let timer = null;
let isPlaying = false;

function updatePost(noticePageUrl) {
  const post = posts[currentIndex];
  const url = new URL(noticePageUrl, window.location.href);
  url.searchParams.set('view', 'detail');
  url.searchParams.set('id', post.id);
  tickerLink.href = url.href;
  tickerLink.textContent = post.title;
}

function updateControls() {
  const canRotate = posts.length > 1;
  pauseButton.disabled = !canRotate;
  playButton.disabled = !canRotate;
  pauseButton.setAttribute('aria-pressed', String(!isPlaying));
  playButton.setAttribute('aria-pressed', String(isPlaying));
}

function pause() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  isPlaying = false;
  updateControls();
}

function play(noticePageUrl) {
  if (posts.length < 2 || timer !== null) return;
  isPlaying = true;
  timer = window.setInterval(() => {
    currentIndex = (currentIndex + 1) % posts.length;
    updatePost(noticePageUrl);
  }, TICKER_INTERVAL);
  updateControls();
}

function closeTicker() {
  if (ticker.hidden) return;
  const scrollPosition = window.scrollY;
  const tickerHeight = ticker.offsetHeight;
  pause();
  ticker.hidden = true;
  document.body.classList.remove('notice-ticker-visible');
  window.scrollTo({
    top: Math.max(0, scrollPosition - tickerHeight),
    behavior: 'instant',
  });
}

function handleScrollKeydown(event) {
  if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
  if (event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
  closeTicker();
}

export function renderNoticeTicker(noticePosts, noticePageUrl) {
  if (!ticker || !noticePosts.length) return;

  posts = noticePosts.slice(0, 3);
  currentIndex = 0;
  updatePost(noticePageUrl);
  ticker.hidden = false;
  document.body.classList.add('notice-ticker-visible');

  ticker.addEventListener('focusin', pause);
  ticker.addEventListener('pointerenter', pause);
  pauseButton.addEventListener('click', pause);
  playButton.addEventListener('click', () => play(noticePageUrl));
  closeButton.addEventListener('click', closeTicker);
  window.addEventListener('wheel', (event) => {
    if (event.deltaY !== 0) closeTicker();
  }, { passive: true });
  window.addEventListener('touchmove', closeTicker, { passive: true });
  window.addEventListener('keydown', handleScrollKeydown);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateControls();
  } else {
    play(noticePageUrl);
  }
}

export function showNoticeTickerError() {
  if (!ticker || !tickerLink) return;
  tickerLink.removeAttribute('href');
  tickerLink.textContent = '공지사항을 불러오지 못했습니다.';
  tickerLink.setAttribute('role', 'alert');
  ticker.hidden = false;
  document.body.classList.add('notice-ticker-visible');
  pauseButton.hidden = true;
  playButton.hidden = true;
}
