import { TREND_DATA } from "./trend-data.js";

const MOBILE_SLIDES_PER_VIEW = 1.25;
const DESKTOP_SLIDES_PER_VIEW = 4;

function createCardHtml(pick) {
  const productsHtml = (pick.products || [])
    .map(
      (prod) => `
      <a href="${prod.productUrl || "#trend-pick"}" class="trend-prod" aria-label="${prod.name} 상세보기">
        <div class="trend-prod__thumb-wrap">
          <img src="${prod.image}" alt="${prod.name} 상품 썸네일" class="trend-prod__thumb" loading="lazy" width="56" height="72">
        </div>
        <div class="trend-prod__info">
          <strong class="trend-prod__name">${prod.name}</strong>
          <span class="trend-prod__price">${Number(prod.price).toLocaleString()}</span>
        </div>
      </a>
    `
    )
    .join("");

  return `
    <article class="swiper-slide trend-card">
      <div class="trend-card__photo-box">
        <a href="${pick.detailUrl || "#trend-pick"}" class="trend-card__photo-link" aria-label="${pick.username} 스타일 픽 상세보기">
          <img src="${pick.image}" alt="${pick.username} 스타일 이미지" class="trend-card__photo" loading="lazy" width="400" height="400">
        </a>
        <span class="trend-card__username">${pick.username}</span>
      </div>
      <div class="trend-card__products">
        ${productsHtml}
      </div>
    </article>
  `;
}

export function initTrendPick(root = document) {
  const section = root.querySelector(".section-trend-pick");
  if (!section) return;

  const track = section.querySelector("#trend-pick-track");
  const tabs = section.querySelectorAll(".section-trend-pick__tab");
  const swiperEl = section.querySelector(".trend-pick-swiper");

  if (!track || !swiperEl) return;

  function renderCategory(category) {
    const picks = TREND_DATA[category] || [];
    track.innerHTML = picks.map(createCardHtml).join("");
  }

  // Initial render (defaults to 숏패딩)
  renderCategory("숏패딩");

  const SwiperLib = window.Swiper;
  let swiperInstance = null;

  if (SwiperLib) {
    swiperInstance = new SwiperLib(swiperEl, {
      slidesPerView: MOBILE_SLIDES_PER_VIEW,
      spaceBetween: 12,
      watchOverflow: true,
      grabCursor: true,
      a11y: true,
      observer: true,
      observeParents: true,
      breakpoints: {
        640: {
          slidesPerView: 2.2,
          spaceBetween: 16,
        },
        769: {
          slidesPerView: 3,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: DESKTOP_SLIDES_PER_VIEW,
          spaceBetween: 20,
        },
      },
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      if (!category) return;

      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      renderCategory(category);

      if (swiperInstance) {
        swiperInstance.update();
        swiperInstance.slideTo(0, 0);
      }
    });
  });
}

