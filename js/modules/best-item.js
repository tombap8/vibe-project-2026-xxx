const MOBILE_SLIDES_PER_VIEW = 2.4;
const DESKTOP_BREAKPOINT = 769;

export function initBestItem(root = document) {
  const SwiperLib = window.Swiper;
  const swiperEl = root.querySelector('[data-js="best-item-swiper"]');
  const scrollbarEl = root.querySelector('[data-js="best-item-scrollbar"]');
  if (!SwiperLib || !swiperEl) return;

  new SwiperLib(swiperEl, {
    slidesPerView: MOBILE_SLIDES_PER_VIEW,
    spaceBetween: 10,
    freeMode: { enabled: true, sticky: false },
    scrollbar: scrollbarEl ? { el: scrollbarEl, draggable: true } : false,
    a11y: true,
    breakpoints: {
      [DESKTOP_BREAKPOINT]: {
        slidesPerView: 5,
        spaceBetween: 16,
        freeMode: false,
      },
    },
  });
}

