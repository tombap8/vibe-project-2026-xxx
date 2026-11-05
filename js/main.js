import { initFooter } from "./modules/footer.js";
import { initBestItem } from "./modules/best-item.js";
import { initCollection } from "./modules/collection.js";
import { initTrendPick } from "./modules/trend-pick.js";
import { renderNoticeTicker, showNoticeTickerError } from "./modules/notice-ticker.js";
import { noticeRepository } from "./services/notice-repository.js";
import { initBestItemShopping, initCartBadges } from "./modules/shop.js";

const menuImages = [
  "discovery-mob-11.png",
  "discovery-mob-15.png",
  "discovery-mob-17.png",
  "discovery-mob-19.png",
  "discovery-mob-20.png",
  "discovery-mob-22.png",
  "discovery-mob-30.png",
  "discovery-mob-32.png",
  "discovery-mob-56.png",
];

const menuCategories = {
  여성: [
    { title: "여성", items: ["닝닝PICK", "BEST", "NEW"] },
    { title: "다운", items: ["경량다운", "숏다운", "미드다운", "롱다운", "다운베스트"] },
    { title: "아우터", items: ["바람막이", "자켓", "플리스", "경량패딩", "경량자켓", "아노락", "베스트"] },
    { title: "상의", items: ["긴팔티", "맨투맨", "후드티", "반팔티", "카라티", "원피스", "브라탑"] },
    { title: "하의", items: ["롱팬츠", "카고/조거", "숏팬츠", "스커트", "레깅스"] },
    { title: "트레이닝 셋업", items: ["트레이닝 상의", "트레이닝 하의"] },
  ],
  남성: [
    { title: "남성", items: ["BEST", "NEW", "다운", "아우터", "상의", "하의"] },
    { title: "다운", items: ["경량다운", "숏다운", "미드다운", "롱다운", "다운베스트"] },
    { title: "아우터", items: ["바람막이", "자켓", "플리스", "경량패딩", "경량자켓", "아노락", "베스트"] },
    { title: "상의", items: ["긴팔티", "맨투맨", "후드티", "반팔티", "카라티"] },
    { title: "하의", items: ["롱팬츠", "카고/조거", "숏팬츠", "트레이닝 하의"] },
    { title: "트레이닝 셋업", items: ["트레이닝 상의", "트레이닝 하의"] },
  ],
  신발: [
    { title: "신발", items: ["BEST", "NEW", "트레킹화", "운동화", "샌들", "부츠"] },
    { title: "아웃도어", items: ["트레킹화", "하이킹화", "워킹화", "등산화"] },
    { title: "데일리", items: ["운동화", "슬립온", "샌들", "슬리퍼"] },
    { title: "시즌 슈즈", items: ["윈터부츠", "패딩슈즈", "방한화"] },
  ],
  용품: [
    { title: "용품", items: ["BEST", "NEW", "모자", "가방", "양말", "장갑"] },
    { title: "가방", items: ["백팩", "크로스백", "숄더백", "힙색"] },
    { title: "모자", items: ["볼캡", "버킷햇", "비니", "캡"] },
    { title: "액세서리", items: ["양말", "장갑", "벨트", "기타용품"] },
  ],
  키즈: [
    { title: "키즈", items: ["BEST", "NEW", "다운", "아우터", "상의", "하의"] },
    { title: "다운", items: ["경량다운", "숏다운", "롱다운", "다운베스트"] },
    { title: "아우터", items: ["바람막이", "자켓", "플리스", "경량패딩"] },
    { title: "의류", items: ["맨투맨", "후드티", "반팔티", "팬츠", "레깅스"] },
    { title: "신발·용품", items: ["운동화", "모자", "가방", "양말"] },
  ],
  아울렛: [
    { title: "아울렛", items: ["여성", "남성", "키즈", "신발", "용품"] },
    { title: "여성 아울렛", items: ["다운", "아우터", "상의", "하의"] },
    { title: "남성 아울렛", items: ["다운", "아우터", "상의", "하의"] },
    { title: "키즈·신발", items: ["키즈 의류", "운동화", "트레킹화", "용품"] },
  ],
};

const menuFeatures = ["프로모션", "트렌드", "RE MARKET"];

const menu = document.querySelector(".full-menu");
const menuContent = document.querySelector(".full-menu__content");
const menuTabs = [...document.querySelectorAll(".full-menu__tab")];
const menuClose = document.querySelector(".full-menu__close");
const desktopMenuTrigger = document.querySelector(".icon-button--menu");
const mobileMenuTrigger = document.querySelector(".tabbar__item--category");
const mobileMenuLabel = mobileMenuTrigger.querySelector("span");
const pageHeader = document.querySelector(".outer-box--header");
const pageMain = document.querySelector("main");
const floatingActions = document.querySelector(".floating-actions");
const tabbar = document.querySelector(".tabbar");
const paginationNav = document.querySelector(".hero__pagination");
const mobileViewport = window.matchMedia("(max-width: 768px)");

const searchModal = document.querySelector(".search-modal");
const desktopSearchTrigger = document.querySelector(".icon-button--search");
const mobileSearchTrigger = document.querySelector(".tabbar__item--search");
const searchCloseButton = document.querySelector(".search-modal__close");
const searchInput = document.querySelector(".search-modal__input");
const searchTabs = [...document.querySelectorAll(".search-modal__tab")];
const searchTagRemoveButtons = [...document.querySelectorAll(".search-modal__tag-remove")];
const searchClearAllButton = document.querySelector(".search-modal__clear-all");

let menuOpener = null;
let searchOpener = null;
let closeTimer = 0;
let openTimer = 0;
let searchCloseTimer = 0;

function createMenuItem(label, index) {
  const link = document.createElement("a");
  link.className = "full-menu__item";
  link.href = "#hero";

  const image = document.createElement("img");
  image.className = "full-menu__item-image";
  image.src = `./images/menu/${menuImages[index % menuImages.length]}`;
  image.alt = "";
  image.loading = "lazy";

  const itemLabel = document.createElement("span");
  itemLabel.className = "full-menu__item-label";
  itemLabel.textContent = label;

  link.append(image, itemLabel);
  return link;
}

function renderCategory(categoryName) {
  const sections = menuCategories[categoryName] ?? [];
  menuContent.innerHTML = "";

  const sectionList = document.createElement("div");
  sectionList.className = "full-menu__sections";

  sections.forEach((section, sectionIndex) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "full-menu__section";

    const heading = document.createElement("h3");
    heading.className = "full-menu__section-heading";

    const title = document.createElement("span");
    title.textContent = section.title;

    const viewAll = document.createElement("a");
    viewAll.className = "full-menu__view-all";
    viewAll.href = "#hero";
    viewAll.append(document.createTextNode("전체보기"));
    viewAll.insertAdjacentHTML(
      "beforeend",
      '<svg aria-hidden="true" viewBox="0 0 16 16"><path d="m6 3.5 4.5 4.5L6 12.5"></path></svg>'
    );

    heading.append(title, viewAll);

    const items = document.createElement("div");
    items.className = "full-menu__items";

    section.items.forEach((item, itemIndex) => {
      items.appendChild(createMenuItem(item, sectionIndex * 3 + itemIndex));
    });

    sectionElement.append(heading, items);
    sectionList.appendChild(sectionElement);
  });

  const features = document.createElement("div");
  features.className = "full-menu__features";
  menuFeatures.forEach((label) => {
    const feature = document.createElement("a");
    feature.className = "full-menu__feature";
    feature.href = "#hero";

    const image = document.createElement("span");
    image.className = "full-menu__feature-image";

    const text = document.createElement("span");
    text.textContent = label;

    feature.append(image, text);
    features.appendChild(feature);
  });

  menuContent.append(sectionList, features);
}

function activateTab(targetTab) {
  menuTabs.forEach((tab) => {
    const isSelected = tab === targetTab;
    tab.classList.toggle("full-menu__tab--active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  const categoryName = targetTab.textContent.trim();
  renderCategory(categoryName);
  menuContent.scrollTop = 0;
}

function setFocusTrap(container) {
  const focusable = container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return [...focusable];
}

function lockBackground(isLocked) {
  const elements = [pageMain, floatingActions, paginationNav].filter(Boolean);
  elements.forEach((el) => {
    if (isLocked) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    } else {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    }
  });

  if (mobileViewport.matches) {
    if (tabbar) {
      const tabbarItems = [...tabbar.querySelectorAll(".tabbar__item")];
      tabbarItems.forEach((item) => {
        if (!item.classList.contains("tabbar__item--category")) {
          if (isLocked) {
            item.setAttribute("inert", "");
            item.setAttribute("aria-hidden", "true");
          } else {
            item.removeAttribute("inert");
            item.removeAttribute("aria-hidden");
          }
        }
      });
    }
  } else if (pageHeader) {
    if (isLocked) {
      pageHeader.setAttribute("inert", "");
      pageHeader.setAttribute("aria-hidden", "true");
    } else {
      pageHeader.removeAttribute("inert");
      pageHeader.removeAttribute("aria-hidden");
    }
  }

  document.body.style.overflow = isLocked ? "hidden" : "";
}

function openMenu(trigger) {
  window.clearTimeout(closeTimer);
  window.clearTimeout(openTimer);

  menuOpener = trigger;
  desktopMenuTrigger.setAttribute("aria-expanded", "true");
  mobileMenuTrigger.setAttribute("aria-expanded", "true");
  mobileMenuLabel.textContent = "닫기";

  menu.hidden = false;
  menu.removeAttribute("inert");
  menu.dataset.state = "opening";
  menu.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("menu-open");
  document.body.classList.add("menu-open");

  lockBackground(true);

  const activeTab = menuTabs.find((tab) => tab.classList.contains("full-menu__tab--active")) ?? menuTabs[0];
  activateTab(activeTab);

  openTimer = window.setTimeout(() => {
    menu.dataset.state = "open";
    menuClose.focus();
  }, 20);
}

function closeMenu() {
  window.clearTimeout(closeTimer);
  window.clearTimeout(openTimer);

  desktopMenuTrigger.setAttribute("aria-expanded", "false");
  mobileMenuTrigger.setAttribute("aria-expanded", "false");
  mobileMenuLabel.textContent = "카테고리";

  menu.dataset.state = "closing";
  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");

  const duration = mobileViewport.matches ? 360 : 220;

  closeTimer = window.setTimeout(() => {
    menu.dataset.state = "closed";
    menu.hidden = true;
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    lockBackground(false);

    if (menuOpener instanceof HTMLElement) {
      menuOpener.focus();
    }
    menuOpener = null;
  }, duration);
}

function toggleMenu(trigger) {
  if (menu.dataset.state === "open" || menu.dataset.state === "opening") {
    closeMenu();
  } else {
    openMenu(trigger);
  }
}

desktopMenuTrigger.addEventListener("click", () => toggleMenu(desktopMenuTrigger));
mobileMenuTrigger.addEventListener("click", () => toggleMenu(mobileMenuTrigger));
menuClose.addEventListener("click", closeMenu);

menu.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.closest(".full-menu__item, .full-menu__view-all, .full-menu__feature")) {
    closeMenu();
  }
});

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", (event) => {
    const currentIndex = menuTabs.indexOf(tab);
    let nextIndex = -1;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % menuTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + menuTabs.length) % menuTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = menuTabs.length - 1;
    }

    if (nextIndex !== -1) {
      event.preventDefault();
      const nextTab = menuTabs[nextIndex];
      nextTab.focus();
      activateTab(nextTab);
    }
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (menu.dataset.state === "open" || menu.dataset.state === "opening")) {
    event.preventDefault();
    closeMenu();
    return;
  }

  if (event.key === "Tab" && menu.dataset.state === "open") {
    const focusable = setFocusTrap(menu);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function handleViewportChange() {
  if (menu.dataset.state === "open") {
    lockBackground(true);
  }
}

mobileViewport.addEventListener("change", handleViewportChange);
renderCategory("여성");

/* --- 검색 모달 인터랙션 및 제어 --- */
function initSearchModal() {
  if (!searchModal) return;

  function lockBackgroundForSearch(isLocked) {
    const elements = [pageMain, floatingActions, paginationNav].filter(Boolean);
    elements.forEach((el) => {
      if (isLocked) {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    });

    if (pageHeader) {
      if (isLocked) {
        pageHeader.setAttribute("inert", "");
        pageHeader.setAttribute("aria-hidden", "true");
      } else {
        pageHeader.removeAttribute("inert");
        pageHeader.removeAttribute("aria-hidden");
      }
    }

    if (tabbar) {
      if (isLocked) {
        tabbar.setAttribute("inert", "");
        tabbar.setAttribute("aria-hidden", "true");
      } else {
        tabbar.removeAttribute("inert");
        tabbar.removeAttribute("aria-hidden");
      }
    }

    document.body.style.overflow = isLocked ? "hidden" : "";
  }

  function openSearchModal(trigger) {
    window.clearTimeout(searchCloseTimer);
    searchOpener = trigger;

    if (desktopSearchTrigger) desktopSearchTrigger.setAttribute("aria-expanded", "true");
    if (mobileSearchTrigger) mobileSearchTrigger.setAttribute("aria-expanded", "true");

    searchModal.hidden = false;
    searchModal.removeAttribute("inert");
    searchModal.dataset.state = "opening";
    searchModal.setAttribute("aria-hidden", "false");

    lockBackgroundForSearch(true);

    window.setTimeout(() => {
      searchModal.dataset.state = "open";
      if (searchInput) {
        searchInput.focus();
      } else if (searchCloseButton) {
        searchCloseButton.focus();
      }
    }, 20);
  }

  function closeSearchModal() {
    window.clearTimeout(searchCloseTimer);

    if (desktopSearchTrigger) desktopSearchTrigger.setAttribute("aria-expanded", "false");
    if (mobileSearchTrigger) mobileSearchTrigger.setAttribute("aria-expanded", "false");

    searchModal.dataset.state = "closing";

    searchCloseTimer = window.setTimeout(() => {
      searchModal.dataset.state = "closed";
      searchModal.hidden = true;
      searchModal.setAttribute("inert", "");
      searchModal.setAttribute("aria-hidden", "true");
      lockBackgroundForSearch(false);

      if (searchOpener instanceof HTMLElement) {
        searchOpener.focus();
      }
      searchOpener = null;
    }, 200);
  }

  if (desktopSearchTrigger) {
    desktopSearchTrigger.addEventListener("click", () => openSearchModal(desktopSearchTrigger));
  }
  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener("click", () => openSearchModal(mobileSearchTrigger));
  }
  if (searchCloseButton) {
    searchCloseButton.addEventListener("click", closeSearchModal);
  }

  searchTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      searchTabs.forEach((t) => {
        const isSelected = t === tab;
        t.classList.toggle("search-modal__tab--active", isSelected);
        t.setAttribute("aria-selected", String(isSelected));
      });
    });
  });

  searchTagRemoveButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tag = btn.closest(".search-modal__tag");
      if (tag) tag.remove();
    });
  });

  if (searchClearAllButton) {
    searchClearAllButton.addEventListener("click", () => {
      const tagsList = document.querySelector(".search-modal__tags");
      if (tagsList) tagsList.innerHTML = "";
    });
  }

  window.addEventListener("keydown", (event) => {
    if (searchModal.dataset.state !== "open") return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearchModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = searchModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

initSearchModal();

/* --- 히어로 풀페이지 스크롤, 일반 스크롤 전환 & 헤더 테마 제어 --- */
function initFullPageScroll() {
  const heroSections = [...document.querySelectorAll(".hero")];
  const shortsSection = document.querySelector(".section-shorts");
  const paginationNav = document.querySelector(".hero__pagination");
  const paginationItems = [...document.querySelectorAll(".hero__pagination-item")];

  if (heroSections.length === 0) return;

  let currentHeroIndex = 0;
  let isScrolling = false;
  let scrollEndTimer = null;
  let isHeroSnapActive = true;
  let lastScrollTime = 0;
  const SCROLL_COOLDOWN = 850;
  const WHEEL_GESTURE_GAP = 120;
  let lastWheelTime = 0;

  // 헤더 스타일 실시간 동기화 (1,2,3페이지: 다크, 3페이지 하단: 화이트 반전)
  function updateHeaderTheme(currentScrollY) {
    if (!pageHeader) return;
    const currentY = typeof currentScrollY === "number" ? currentScrollY : (window.scrollY || window.pageYOffset);
    const hero3 = heroSections[heroSections.length - 1];
    if (!hero3) return;

    const shortsTop = shortsSection ? shortsSection.offsetTop : (hero3.offsetTop + hero3.offsetHeight);
    const isLight = currentY >= (shortsTop - 80);
    pageHeader.classList.toggle("outer-box--header--light", isLight);
  }

  // 히어로 자동 스냅 활성화
  function enableHeroSnap() {
    if (!isHeroSnapActive) {
      isHeroSnapActive = true;
      document.documentElement.style.scrollSnapType = "y mandatory";
    }
    if (paginationNav) {
      paginationNav.style.opacity = "";
      paginationNav.style.pointerEvents = "";
    }
  }

  // 일반 스크롤 모드로 전환 (스냅 해제 및 인디케이터 숨김)
  function disableHeroSnap() {
    if (isHeroSnapActive) {
      isHeroSnapActive = false;
      document.documentElement.style.scrollSnapType = "none";
    }
    if (paginationNav) {
      paginationNav.style.opacity = "0";
      paginationNav.style.pointerEvents = "none";
    }
  }

  function updatePagination(index) {
    if (index < 0 || index >= heroSections.length) {
      disableHeroSnap();
      updateHeaderTheme();
      return;
    }
    enableHeroSnap();
    currentHeroIndex = index;
    paginationItems.forEach((item, idx) => {
      const isActive = idx === index;
      item.classList.toggle("hero__pagination-item--active", isActive);
      item.setAttribute("aria-current", String(isActive));
    });
    updateHeaderTheme();
  }

  function scrollToSection(index) {
    if (index < 0 || index >= heroSections.length) return;
    const targetSection = heroSections[index];
    if (!targetSection) return;

    isScrolling = true;
    lastScrollTime = Date.now();
    enableHeroSnap();
    updatePagination(index);
    targetSection.scrollIntoView({ behavior: "smooth" });

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(() => {
      isScrolling = false;
      updateHeaderTheme();
    }, SCROLL_COOLDOWN);
  }

  function scrollToNormalContent() {
    if (!shortsSection) return;
    isScrolling = true;
    lastScrollTime = Date.now();
    disableHeroSnap();
    shortsSection.scrollIntoView({ behavior: "smooth" });

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(() => {
      isScrolling = false;
      updateHeaderTheme();
    }, SCROLL_COOLDOWN);
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const index = heroSections.indexOf(entry.target);
          if (index !== -1 && !isScrolling) {
            updatePagination(index);
          }
        }
      });
    },
    {
      root: null,
      threshold: [0.5, 0.7],
    }
  );
  heroSections.forEach((section) => heroObserver.observe(section));

  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY || window.pageYOffset;
      updateHeaderTheme(currentY);

      if (isScrolling) return;

      const hero3 = heroSections[heroSections.length - 1];
      if (!hero3) return;

      const heroBoundary = hero3.offsetTop + hero3.offsetHeight * 0.75;
      if (currentY >= heroBoundary) {
        disableHeroSnap();
      } else {
        enableHeroSnap();
      }
    },
    { passive: true }
  );

  paginationItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      scrollToSection(index);
    });
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (menu.dataset.state === "open" || menu.dataset.state === "opening") return;
      if (searchModal && searchModal.dataset.state === "open") return;
      const shortsModal = document.querySelector(".shorts-modal");
      if (shortsModal && shortsModal.dataset.state === "open") return;

      const now = Date.now();
      // 트랙패드 관성 휠은 쿨다운 이후에도 이어지므로, 이벤트 간격이 끊긴 뒤의 새 제스처만 페이지 이동으로 인정한다.
      const isNewGesture = now - lastWheelTime > WHEEL_GESTURE_GAP;
      lastWheelTime = now;

      if (isScrolling || (now - lastScrollTime < SCROLL_COOLDOWN)) {
        event.preventDefault();
        return;
      }

      const delta = event.deltaY;
      if (Math.abs(delta) < 15) return;

      const currentY = window.scrollY || window.pageYOffset;
      const hero3 = heroSections[heroSections.length - 1];
      const hero3Top = hero3 ? hero3.offsetTop : 0;
      const shortsTop = shortsSection ? shortsSection.offsetTop : hero3Top + window.innerHeight;

      // 1. 세번째 페이지 하단(일반 스크롤 영역)에 있는 경우
      if (currentY >= shortsTop - 20) {
        // 위로 휠 시 이번 이동이 숏츠 최상단을 넘어서면 일반 스크롤을 막고 3번째 페이지로만 정확히 이동
        if (delta < 0 && currentY + delta <= shortsTop + 15) {
          event.preventDefault();
          if (isNewGesture || currentY <= shortsTop + 15) {
            scrollToSection(heroSections.length - 1);
          }
        }
        return;
      }

      // 관성 휠이 이어지는 동안에는 히어로 페이지 추가 이동 차단
      if (!isNewGesture) {
        event.preventDefault();
        return;
      }

      // 2. 히어로 1~3페이지(자동 스크롤 영역)에 있는 경우
      if (delta > 0) {
        if (currentHeroIndex < heroSections.length - 1) {
          event.preventDefault();
          scrollToSection(currentHeroIndex + 1);
        } else if (currentHeroIndex === heroSections.length - 1) {
          event.preventDefault();
          scrollToNormalContent();
        }
      } else if (delta < 0) {
        if (currentHeroIndex > 0) {
          event.preventDefault();
          scrollToSection(currentHeroIndex - 1);
        }
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (menu.dataset.state === "open" || menu.dataset.state === "opening") return;
    if (searchModal && searchModal.dataset.state === "open") return;
    const shortsModal = document.querySelector(".shorts-modal");
    if (shortsModal && shortsModal.dataset.state === "open") return;
    if (document.activeElement?.closest("input, textarea, select")) return;

    const currentY = window.scrollY || window.pageYOffset;
    const hero3 = heroSections[heroSections.length - 1];
    const shortsTop = shortsSection ? shortsSection.offsetTop : (hero3 ? hero3.offsetTop + window.innerHeight : 0);

    if (currentY >= shortsTop - 20) {
      if ((event.key === "ArrowUp" || event.key === "PageUp") && currentY <= shortsTop + 15) {
        event.preventDefault();
        scrollToSection(heroSections.length - 1);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown") {
      if (currentHeroIndex < heroSections.length - 1) {
        event.preventDefault();
        scrollToSection(currentHeroIndex + 1);
      } else if (currentHeroIndex === heroSections.length - 1 && shortsSection) {
        event.preventDefault();
        scrollToNormalContent();
      }
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      if (currentHeroIndex > 0) {
        event.preventDefault();
        scrollToSection(currentHeroIndex - 1);
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      scrollToSection(0);
    } else if (event.key === "End") {
      event.preventDefault();
      if (shortsSection) {
        scrollToNormalContent();
      } else {
        scrollToSection(heroSections.length - 1);
      }
    }
  });

  window.addEventListener("scrollend", () => {
    isScrolling = false;
    updateHeaderTheme();
  });

  // 초기 로드 시 스크롤 위치에 맞추어 헤더 테마 및 스냅 모드 동기화
  const initialY = window.scrollY || window.pageYOffset;
  updateHeaderTheme(initialY);
  const hero3 = heroSections[heroSections.length - 1];
  const shortsTop = shortsSection ? shortsSection.offsetTop : (hero3 ? hero3.offsetTop + window.innerHeight : 0);
  if (initialY >= shortsTop - 30) {
    disableHeroSnap();
  } else {
    enableHeroSnap();
  }
}

initFullPageScroll();

/* --- 숏츠 비디오 모달 플레이어 인터랙션 --- */
function initShortsModal() {
  const shortsModal = document.querySelector("#shorts-modal");
  if (!shortsModal) return;

  const closeButton = shortsModal.querySelector(".shorts-modal__close");
  const iframe = shortsModal.querySelector("#shorts-modal-iframe");
  const productThumb = shortsModal.querySelector(".shorts-modal__product-thumb");
  const productTitle = shortsModal.querySelector(".shorts-modal__product-title");
  const productPrice = shortsModal.querySelector(".shorts-modal__product-price");
  let shortsOpener = null;

  function openShortsModal(card, trigger) {
    shortsOpener = trigger || card;
    const youtubeId = card.dataset.youtubeId || "7Uk01TEEm8w";
    const title = card.querySelector(".shorts-card__caption-title")?.textContent || "";
    const pName = card.querySelector(".shorts-card__product-name")?.textContent || "";
    const pPrice = card.querySelector(".shorts-card__product-price")?.textContent || "";
    const pThumb = card.querySelector(".shorts-card__product-image img")?.src || "";

    if (iframe) {
      iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${youtubeId}`;
    }

    if (productTitle) productTitle.textContent = pName || title;
    if (productPrice) productPrice.textContent = pPrice;
    if (productThumb) {
      productThumb.src = pThumb;
      productThumb.alt = pName;
    }

    shortsModal.hidden = false;
    shortsModal.removeAttribute("inert");
    shortsModal.dataset.state = "open";
    shortsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (closeButton) closeButton.focus();
  }

  function closeShortsModal() {
    shortsModal.dataset.state = "closed";
    if (iframe) {
      iframe.src = "";
    }

    window.setTimeout(() => {
      shortsModal.hidden = true;
      shortsModal.setAttribute("inert", "");
      shortsModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      if (shortsOpener instanceof HTMLElement) {
        shortsOpener.focus();
      }
      shortsOpener = null;
    }, 200);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeShortsModal);
  }

  shortsModal.addEventListener("click", (e) => {
    if (e.target === shortsModal) {
      closeShortsModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (shortsModal.dataset.state === "open" && e.key === "Escape") {
      e.preventDefault();
      closeShortsModal();
    }
  });

  // 전역 노출을 위해 윈도우 객체 또는 이벤트 바인딩
  window._openShortsModal = openShortsModal;
}

initShortsModal();

/* --- 디스커버리 숏츠 데이터 동적 연동 및 렌더링 --- */
async function initShortsSection() {
  const shortsContainer = document.querySelector(".section-shorts");
  if (!shortsContainer) return;

  const titleElement = shortsContainer.querySelector("#shorts-title");
  const listElement = shortsContainer.querySelector(".shorts__list");
  if (!listElement) return;

  function bindCardEvents() {
    const cards = listElement.querySelectorAll(".shorts-card");
    cards.forEach((card) => {
      const videoWrap = card.querySelector(".shorts-card__video-wrap");
      if (videoWrap) {
        videoWrap.addEventListener("click", () => {
          if (typeof window._openShortsModal === "function") {
            window._openShortsModal(card, videoWrap);
          }
        });
      }
    });
  }

  // 초기 정적 마크업 바인딩
  bindCardEvents();

  try {
    const response = await fetch("./data/yt-shorts.json");
    if (!response.ok) return;

    const data = await response.json();
    if (!data || !Array.isArray(data.items)) return;

    if (titleElement && data.section_title) {
      titleElement.textContent = data.section_title;
    }

    listElement.innerHTML = data.items
      .map((item) => {
        const product = item.product || {};
        const formattedPrice = typeof product.price === "number" ? product.price.toLocaleString("ko-KR") : product.price || "";
        const youtubeId = item.youtube_id || "7Uk01TEEm8w";

        return `
          <article class="shorts-card" data-video-url="${item.video_url || ""}" data-youtube-id="${youtubeId}">
            <div class="shorts-card__video-wrap" role="button" tabindex="0" aria-label="${item.title} 숏츠 영상 재생">
              <iframe class="shorts-card__video-element" src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&modestbranding=1" title="${item.title}" allow="autoplay" loading="lazy"></iframe>
              <img class="shorts-card__thumbnail" src="${item.thumbnail_url}" alt="${item.title} 숏츠 영상" loading="lazy">
              <div class="shorts-card__badges">
                <span class="shorts-card__play" aria-hidden="true">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <path d="M1 1.5l8 4.5-8 4.5V1.5z"></path>
                  </svg>
                </span>
                <span class="shorts-card__views">
                  <svg class="shorts-card__views-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"></path>
                  </svg>
                  ${item.view_count ?? ""}
                </span>
              </div>
              <div class="shorts-card__caption">
                <strong class="shorts-card__caption-title">${item.title}</strong>
              </div>
            </div>
            <a class="shorts-card__product" href="#hero" aria-label="${product.name || "상품"} 상세 보기">
              <div class="shorts-card__product-image">
                <img src="${product.thumbnail_url || ""}" alt="" loading="lazy">
              </div>
              <div class="shorts-card__product-info">
                <span class="shorts-card__product-name">${product.name || ""}</span>
                <strong class="shorts-card__product-price">${formattedPrice}</strong>
              </div>
            </a>
          </article>
        `;
      })
      .join("");

    bindCardEvents();
  } catch (err) {
    // 폴백 유지
  }
}

initShortsSection();

initBestItem();

initCartBadges();
initBestItemShopping();

initCollection();

initTrendPick();

initFooter();

noticeRepository.getAll()
  .then((posts) => renderNoticeTicker(posts, "./pages/notice.html"))
  .catch(showNoticeTickerError);
