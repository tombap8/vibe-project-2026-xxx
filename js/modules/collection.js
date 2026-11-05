const MOBILE_SLIDES_PER_VIEW = 2.7;
const DESKTOP_BREAKPOINT = 769;
const FEATURE_AUTOPLAY_DELAY = 4000;

export function initCollection(root = document) {
  const SwiperLib = window.Swiper;
  const featureEl = root.querySelector('[data-js="collection-feature"]');
  const listEl = root.querySelector('[data-js="collection-products"]');
  const scrollbarEl = root.querySelector('[data-js="collection-scrollbar"]');
  if (!SwiperLib || !featureEl || !listEl) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  new SwiperLib(featureEl, {
    loop: true,
    speed: 500,
    autoplay: prefersReducedMotion ? false : { delay: FEATURE_AUTOPLAY_DELAY, disableOnInteraction: false },
    pagination: { el: featureEl.querySelector('.swiper-pagination'), clickable: true },
    a11y: true,
  });

  new SwiperLib(listEl, {
    slidesPerView: MOBILE_SLIDES_PER_VIEW,
    spaceBetween: 8,
    freeMode: { enabled: true, sticky: false },
    scrollbar: { el: scrollbarEl, draggable: true },
    a11y: true,
    breakpoints: {
      [DESKTOP_BREAKPOINT]: {
        slidesPerView: 2,
        spaceBetween: 6,
        freeMode: false,
      },
    },
  });
}

