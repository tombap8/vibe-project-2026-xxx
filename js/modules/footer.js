export function initFooter(root = document) {
  const footer = root.querySelector('.outer-box--footer');
  if (!footer) return;

  // 1. 회사정보 아코디언 토글
  const accordionBtns = footer.querySelectorAll('[data-js="footer-accordion-btn"]');
  const companyInfo = footer.querySelector('#footer-company-info');

  accordionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!companyInfo) return;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;

      btn.setAttribute('aria-expanded', String(nextState));
      companyInfo.hidden = !nextState;
    });
  });

  // 2. 드롭다운 제어 헬퍼 (FAMILY SITE & 언어 선택)
  function setupDropdown(triggerSelector, listSelector, onSelect) {
    const triggers = footer.querySelectorAll(triggerSelector);
    const lists = footer.querySelectorAll(listSelector);

    triggers.forEach((trigger, idx) => {
      const list = lists[idx] || lists[0];
      if (!list) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns();
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          list.hidden = false;
        }
      });

      list.addEventListener('click', (e) => {
        const itemBtn = e.target.closest('[data-lang], a');
        if (!itemBtn) return;
        if (onSelect) onSelect(itemBtn);
        trigger.setAttribute('aria-expanded', 'false');
        list.hidden = true;
      });
    });
  }

  function closeAllDropdowns() {
    const allTriggers = footer.querySelectorAll('[data-js="footer-family-btn"], [data-js="footer-lang-btn"]');
    const allLists = footer.querySelectorAll('[data-js="footer-family-list"], [data-js="footer-lang-list"]');

    allTriggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    allLists.forEach((l) => (l.hidden = true));
  }

  // FAMILY SITE 드롭다운
  setupDropdown('[data-js="footer-family-btn"]', '[data-js="footer-family-list"]');

  // KOREAN/ENGLISH 언어 드롭다운 (데스크탑 + 모바일)
  setupDropdown('[data-js="footer-lang-btn"]', '[data-js="footer-lang-list"]', (item) => {
    const newLang = item.dataset.lang;
    if (!newLang) return;

    const currentLabels = footer.querySelectorAll('.footer__lang-current');
    currentLabels.forEach((label) => {
      label.textContent = newLang;
    });

    const langItems = footer.querySelectorAll('[data-lang]');
    langItems.forEach((btn) => {
      const isCurrent = btn.dataset.lang === newLang;
      btn.classList.toggle('footer__dropdown-item--active', isCurrent);
    });
  });

  // 바깥 영역 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.footer__select-box')) {
      closeAllDropdowns();
    }
  });

  // ESC 키 누를 시 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

