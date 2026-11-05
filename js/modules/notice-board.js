import { noticeRepository } from '../services/notice-repository.js';
import { initFooter } from './footer.js';

const PAGE_SIZE = 7;
const MAX_CONTENT_LENGTH = 5000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const NEW_POST_DAYS = 12;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'pdf', 'zip']);
const NOTICE_TYPES = {
  general: '일반공지',
  event: '이벤트안내',
  maintenance: '시스템점검',
  other: '기타',
};
const TYPE_PREFIXES = {
  general: '[안내]',
  event: '[이벤트]',
  maintenance: '[점검]',
  other: '[기타]',
};

const view = document.querySelector('[data-js="notice-view"]');
const pageTitle = document.querySelector('[data-js="page-title"]');
const pageDescription = document.querySelector('[data-js="page-description"]');
const breadcrumbCurrent = document.querySelector('[data-js="breadcrumb-current"]');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${dateParts.year}.${dateParts.month}.${dateParts.day}`;
}

function formatSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getSafeUrl(value, image = false) {
  try {
    const url = new URL(value, window.location.href);
    const allowed = image ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:'];
    return allowed.includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
}

function sanitizeContent(html) {
  const allowedTags = new Set([
    'A', 'B', 'BLOCKQUOTE', 'BR', 'CAPTION', 'CODE', 'DEL', 'DIV', 'EM', 'H2', 'H3',
    'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'S', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP',
    'TABLE', 'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'U', 'UL',
  ]);
  const safeStyleProperties = new Set(['color', 'background-color', 'text-align']);
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    if (!allowedTags.has(node.tagName)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM'].includes(node.tagName)) {
        return document.createDocumentFragment();
      }
      const fragment = document.createDocumentFragment();
      [...node.childNodes].forEach((child) => fragment.append(cleanNode(child)));
      return fragment;
    }

    const element = document.createElement(node.tagName.toLowerCase());
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name === 'style') {
        [...node.style].forEach((property) => {
          if (!safeStyleProperties.has(property)) return;
          const value = node.style.getPropertyValue(property);
          if (property === 'text-align' && !['left', 'center', 'right', 'justify'].includes(value)) return;
          if (property !== 'text-align' && !CSS.supports(property, value)) return;
          element.style.setProperty(property, value);
        });
      }
      if (node.tagName === 'A' && name === 'href') {
        const href = getSafeUrl(attribute.value);
        if (href) element.setAttribute('href', href);
      }
      if (node.tagName === 'A' && name === 'target' && attribute.value === '_blank') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
      if (node.tagName === 'IMG' && name === 'src') {
        const src = getSafeUrl(attribute.value, true);
        if (src) element.setAttribute('src', src);
      }
      if (node.tagName === 'IMG' && name === 'alt') element.setAttribute('alt', attribute.value);
      if (node.tagName === 'IMG' && ['width', 'height'].includes(name) && /^\d{1,4}$/.test(attribute.value)) {
        element.setAttribute(name, attribute.value);
      }
      if (node.tagName === 'TD' || node.tagName === 'TH') {
        if (['colspan', 'rowspan'].includes(name) && /^[1-9]\d?$/.test(attribute.value)) {
          element.setAttribute(name, attribute.value);
        }
      }
    });
    [...node.childNodes].forEach((child) => element.append(cleanNode(child)));
    if (node.tagName === 'IMG') {
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
    }
    return element;
  };
  const result = document.createElement('div');
  [...parsed.body.childNodes].forEach((child) => result.append(cleanNode(child)));
  return result.innerHTML;
}

function editorTextLength(editor) {
  return Array.from(editor.innerText.replaceAll('\n', '')).length;
}

function routeUrl(parameters) {
  const url = new URL('./notice.html', window.location.href);
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.href;
}

function renderError(message) {
  view.innerHTML = `<p class="notice-status" role="alert">${escapeHtml(message)}</p><p class="notice-actions"><a class="notice-button" href="./notice.html">목록으로</a></p>`;
}

function renderList(posts, parameters) {
  const type = parameters.get('type') || 'all';
  const query = parameters.get('q') || '';
  const currentPage = Math.max(1, Number(parameters.get('page')) || 1);
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
  const filtered = posts.filter((post) => {
    const matchesType = type === 'all' || post.type === type;
    const matchesQuery = !normalizedQuery || `${post.title} ${post.contentHtml}`.toLocaleLowerCase('ko-KR').includes(normalizedQuery);
    return matchesType && matchesQuery;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, pageCount);
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstPosition = posts.length - posts.findIndex((post) => post.id === pagePosts[0]?.id);
  const newThreshold = Date.now() - NEW_POST_DAYS * 24 * 60 * 60 * 1000;
  const rows = pagePosts.map((post, index) => {
    const number = post.number ?? Math.max(1, firstPosition - index);
    const createdAt = new Date(post.createdAt).getTime();
    const isNew = !post.pinned && createdAt >= newThreshold && createdAt <= Date.now();
    const title = post.pinned
      ? `<span class="notice-pin"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 1h6v2l-1 1v3l3 2v1H3V9l3-2V4L5 3V1Zm2 9v5"></path></svg>중요</span>`
      : number;
    return `<tr class="${post.pinned ? 'notice-table__row--pinned' : ''}">
      <td class="notice-table__number">${title}</td>
      <td class="notice-table__title"><a href="${routeUrl({ view: 'detail', id: post.id })}">${escapeHtml(post.title)}${isNew ? '<span class="notice-new">NEW</span>' : ''}</a></td>
      <td class="notice-table__date" data-label="등록일">${formatDate(post.createdAt)}</td>
      <td class="notice-table__views" data-label="조회수">${post.views.toLocaleString('ko-KR')}</td>
    </tr>`;
  }).join('');
  const pageButtons = Array.from({ length: pageCount }, (_, index) => {
    const number = index + 1;
    return `<button type="button" data-page="${number}" ${number === page ? 'aria-current="page"' : ''}>${number}</button>`;
  }).join('');

  pageTitle.textContent = '공지사항';
  pageDescription.textContent = '디스커버리 익스페디션의 새로운 소식과 안내를 확인하세요.';
  breadcrumbCurrent.textContent = '';
  view.innerHTML = `
    <div class="notice-list">
      <div class="notice-list__toolbar">
        <p class="notice-list__count">총 <strong>${filtered.length.toLocaleString('ko-KR')}</strong>건</p>
        <form class="notice-list__filters" data-js="search-form">
          <label class="visually-hidden" for="notice-type-filter">분류</label>
          <select class="notice-select" id="notice-type-filter" name="type">
            <option value="all" ${type === 'all' ? 'selected' : ''}>전체</option>
            ${Object.entries(NOTICE_TYPES).map(([key, label]) => `<option value="${key}" ${type === key ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
          <label class="notice-search">
            <span class="visually-hidden">검색어</span>
            <input class="notice-search__input" type="search" name="q" value="${escapeHtml(query)}" placeholder="검색어를 입력하세요.">
            <button class="notice-search__button" type="submit" aria-label="검색">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg>
            </button>
          </label>
          <a class="notice-button notice-button--primary" href="${routeUrl({ view: 'write' })}"><span aria-hidden="true">✎</span> 글쓰기</a>
        </form>
      </div>
      ${pagePosts.length ? `<div class="notice-table-wrap">
        <table class="notice-table">
          <caption class="visually-hidden">공지사항 목록</caption>
          <thead><tr><th class="notice-table__number" scope="col">번호</th><th class="notice-table__title" scope="col">제목</th><th class="notice-table__date" scope="col">등록일</th><th class="notice-table__views" scope="col">조회수</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : '<p class="notice-empty">검색 결과가 없습니다. 다른 분류나 검색어를 선택해 주세요.</p>'}
      <nav class="notice-pagination" aria-label="공지사항 페이지">
        <button type="button" data-page="${Math.max(1, page - 1)}" aria-label="이전 페이지" ${page === 1 ? 'disabled' : ''}>‹</button>
        ${pageButtons}
        <button type="button" data-page="${Math.min(pageCount, page + 1)}" aria-label="다음 페이지" ${page === pageCount ? 'disabled' : ''}>›</button>
      </nav>
    </div>`;
  view.querySelector('[data-js="search-form"]').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.location.assign(routeUrl({ type: data.get('type') === 'all' ? '' : data.get('type'), q: data.get('q'), page: '' }));
  });
  view.querySelector('.notice-pagination').addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (button && !button.disabled) {
      window.location.assign(routeUrl({ type: type === 'all' ? '' : type, q: query, page: button.dataset.page }));
    }
  });
}

function renderDetail(posts, post) {
  const index = posts.findIndex((item) => item.id === post.id);
  const previous = posts[index - 1];
  const next = posts[index + 1];
  pageTitle.textContent = '공지사항';
  pageDescription.textContent = '디스커버리 익스페디션의 새로운 소식과 안내를 확인하세요.';
  breadcrumbCurrent.textContent = '상세보기';
  const attachmentRows = post.attachments.length
    ? post.attachments.map((file) => `<span class="notice-attachment">
        <span class="notice-attachment__icon" aria-hidden="true">⌁</span>
        <span>${escapeHtml(file.name)} (${formatSize(file.size)})</span>
        <button class="notice-attachment__download" type="button" data-download="${escapeHtml(file.storageId)}" data-filename="${escapeHtml(file.name)}" ${file.storageId ? '' : 'disabled'}>다운로드</button>
      </span>`).join('')
    : '<span>첨부된 파일이 없습니다.</span>';
  const adjacentLink = (item) => item
    ? `<a class="notice-neighbor__title" href="${routeUrl({ view: 'detail', id: item.id })}">${escapeHtml(item.title)}</a><time class="notice-neighbor__date" datetime="${escapeHtml(item.createdAt)}">${formatDate(item.createdAt)}</time>`
    : '<span class="notice-neighbor__title">게시물이 없습니다.</span>';
  view.innerHTML = `
    <article class="notice-detail">
      <div class="notice-detail__card">
        <header class="notice-detail__header">
          <div class="notice-detail__title">
            ${post.pinned ? '<span class="notice-badge">중요</span>' : ''}
            <span class="notice-badge">${NOTICE_TYPES[post.type]}</span>
            <h2>${escapeHtml(post.title)}</h2>
          </div>
          <div class="notice-detail__meta">
            <span>등록일 <time datetime="${escapeHtml(post.createdAt)}">${formatDate(post.createdAt)}</time></span>
            <span>조회수 ${post.views.toLocaleString('ko-KR')}</span>
          </div>
        </header>
        <div class="notice-detail__content">${sanitizeContent(post.contentHtml)}</div>
        <div class="notice-attachments">
          <div class="notice-attachments__row">
            <strong class="notice-attachments__label">첨부파일</strong>
            <div class="notice-file-list">${attachmentRows}</div>
          </div>
        </div>
      </div>
      <nav class="notice-neighbors" aria-label="이전글과 다음글">
        <div class="notice-neighbor"><span class="notice-neighbor__label">‹ 이전글</span>${adjacentLink(previous)}</div>
        <div class="notice-neighbor"><span class="notice-neighbor__label">다음글 ›</span>${adjacentLink(next)}</div>
      </nav>
      <div class="notice-detail__actions">
        <a class="notice-button" href="./notice.html">목록으로</a>
        <a class="notice-button" href="${routeUrl({ view: 'edit', id: post.id })}">수정</a>
        <button class="notice-button notice-button--primary" type="button" data-delete="${escapeHtml(post.id)}">삭제</button>
      </div>
    </article>`;
}

function makeToolbar() {
  const controls = [
    { command: 'bold', label: '굵게', text: '<strong>B</strong>' },
    { command: 'italic', label: '기울임', text: '<em>I</em>' },
    { command: 'underline', label: '밑줄', text: '<u>U</u>' },
    { command: 'strikeThrough', label: '취소선', text: '<s>S</s>' },
    { command: 'justifyLeft', label: '왼쪽 정렬', text: '≡' },
    { command: 'justifyCenter', label: '가운데 정렬', text: '☰' },
    { command: 'justifyRight', label: '오른쪽 정렬', text: '≡' },
    { command: 'insertUnorderedList', label: '글머리 기호 목록', text: '• 목록' },
    { command: 'insertOrderedList', label: '번호 목록', text: '1. 목록' },
  ];
  return `<div class="notice-editor__toolbar" role="toolbar" aria-label="본문 편집 도구">
    <label class="visually-hidden" for="notice-format-block">문단 서식</label>
    <select id="notice-format-block" data-command="formatBlock">
      <option value="p">본문</option><option value="h2">제목</option><option value="h3">소제목</option><option value="blockquote">인용</option>
    </select>
    ${controls.map((item) => `<button type="button" data-command="${item.command}" aria-label="${item.label}" title="${item.label}">${item.text}</button>`).join('')}
    <label class="notice-editor__color" title="글자색"><span class="visually-hidden">글자색</span><input type="color" data-color-command="foreColor" value="#000000"></label>
    <label class="notice-editor__color" title="배경색"><span class="visually-hidden">배경색</span><input type="color" data-color-command="hiliteColor" value="#f0f0f0"></label>
    <button type="button" data-action="link" aria-label="링크 삽입" title="링크 삽입">↗</button>
    <button type="button" data-action="image" aria-label="이미지 삽입" title="이미지 삽입">▧</button>
    <button type="button" data-action="table" aria-label="표 삽입" title="표 삽입">▦</button>
    <button type="button" data-command="removeFormat" aria-label="서식 제거" title="서식 제거">Tx</button>
    <button type="button" data-action="fullscreen" aria-label="전체 화면" title="전체 화면">⛶</button>
  </div>`;
}

function renderForm(post = null) {
  const isEditing = Boolean(post);
  pageTitle.textContent = isEditing ? '공지사항 글수정' : '공지사항 글쓰기';
  pageDescription.textContent = isEditing ? '기존 공지사항의 내용을 수정할 수 있습니다.' : '디스커버리 익스페디션의 공지사항을 작성해 주세요.';
  breadcrumbCurrent.textContent = isEditing ? '글수정' : '글쓰기';
  const attachments = post?.attachments ?? [];
  view.innerHTML = `
    <form class="notice-form" data-js="notice-form" novalidate>
      <div class="notice-form__row">
        <label class="notice-form__label" for="notice-title">제목<span class="notice-form__required" aria-hidden="true">*</span></label>
        <div class="notice-form__field"><input class="notice-form__input" id="notice-title" name="title" maxlength="120" required value="${escapeHtml(post?.title ?? '')}" placeholder="제목을 입력해 주세요."></div>
      </div>
      <div class="notice-form__row">
        <span class="notice-form__label" id="notice-type-label">공지유형<span class="notice-form__required" aria-hidden="true">*</span></span>
        <fieldset class="notice-form__types" aria-labelledby="notice-type-label">
          <legend class="visually-hidden">공지유형</legend>
          ${Object.entries(NOTICE_TYPES).map(([key, label]) => `<label><input type="radio" name="type" value="${key}" ${post?.type === key || (!post && key === 'general') ? 'checked' : ''} required>${label}</label>`).join('')}
        </fieldset>
      </div>
      <div class="notice-form__row">
        <label class="notice-form__label" for="notice-files">첨부파일</label>
        <div class="notice-form__field">
          <div class="notice-file-list" data-js="file-list">
            ${attachments.map((file) => `<span class="notice-form__file-item" data-existing-file="${escapeHtml(file.id)}">${escapeHtml(file.name)} (${formatSize(file.size)})<button class="notice-form__file-remove" type="button" data-remove-file="${escapeHtml(file.id)}" aria-label="${escapeHtml(file.name)} 삭제">×</button></span>`).join('')}
          </div>
          <input class="notice-form__file-input" id="notice-files" type="file" data-js="file-input" accept=".jpg,.jpeg,.png,.pdf,.zip,image/jpeg,image/png,application/pdf,application/zip,application/x-zip-compressed" multiple>
          <span class="notice-form__help">최대 10MB 이하 / JPG, PNG, PDF, ZIP 파일 (최대 5개)</span>
        </div>
      </div>
      <div class="notice-form__row notice-form__row--content">
        <label class="notice-form__label" for="notice-content">내용<span class="notice-form__required" aria-hidden="true">*</span></label>
        <div class="notice-form__field">
          <div class="notice-editor">
            ${makeToolbar()}
            <div class="notice-editor__body" id="notice-content" data-js="editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="공지사항 본문" data-placeholder="내용을 입력해 주세요.">${post ? sanitizeContent(post.contentHtml) : ''}</div>
            <div class="notice-editor__footer"><span class="notice-form__counter" data-js="counter">0 / 5,000자</span></div>
          </div>
        </div>
      </div>
      ${isEditing ? `<div class="notice-form__field">
        <label class="notice-form__update-date"><input type="checkbox" name="refreshUpdatedAt" checked> 수정일을 현재 날짜로 갱신합니다.</label>
      </div>` : ''}
      <p class="notice-form__error" data-js="form-error" role="alert" hidden></p>
      <div class="notice-form__actions">
        <a class="notice-button" href="./notice.html">목록으로</a>
        ${isEditing ? '<a class="notice-button" href="' + routeUrl({ view: 'detail', id: post.id }) + '">취소</a>' : ''}
        <button class="notice-button notice-button--primary" type="submit">${isEditing ? '수정완료' : '등록하기'}</button>
      </div>
    </form>`;
  setupEditor(post);
  setupForm(post);
}

function setupEditor(post) {
  const form = view.querySelector('[data-js="notice-form"]');
  const editor = form.querySelector('[data-js="editor"]');
  const counter = form.querySelector('[data-js="counter"]');
  const toolbar = form.querySelector('[role="toolbar"]');
  let savedRange = null;
  let textLength = editorTextLength(editor);
  counter.textContent = `${textLength.toLocaleString('ko-KR')} / 5,000자`;

  editor.addEventListener('keyup', updateCount);
  editor.addEventListener('input', updateCount);
  editor.addEventListener('mouseup', rememberRange);
  editor.addEventListener('keyup', rememberRange);
  toolbar.addEventListener('mousedown', (event) => {
    if (event.target.closest('button')) event.preventDefault();
    rememberRange();
  });
  toolbar.addEventListener('change', (event) => {
    const colorControl = event.target.closest('[data-color-command]');
    const blockControl = event.target.closest('[data-command="formatBlock"]');
    if (colorControl) runEditorCommand(colorControl.dataset.colorCommand, colorControl.value);
    if (blockControl) runEditorCommand('formatBlock', blockControl.value);
  });
  toolbar.addEventListener('click', (event) => {
    const control = event.target.closest('button');
    if (!control) return;
    event.preventDefault();
    restoreRange();
    if (control.dataset.command) runEditorCommand(control.dataset.command);
    if (control.dataset.action) runEditorAction(control.dataset.action);
    editor.focus();
    rememberRange();
  });
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const editorBox = form.querySelector('.notice-editor.is-fullscreen');
    if (!editorBox) return;
    editorBox.classList.remove('is-fullscreen');
    toolbar.querySelector('[data-action="fullscreen"]').setAttribute('aria-pressed', 'false');
  });

  function rememberRange() {
    const selection = window.getSelection();
    if (selection.rangeCount && editor.contains(selection.anchorNode)) savedRange = selection.getRangeAt(0).cloneRange();
  }

  function restoreRange() {
    if (!savedRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  function runEditorCommand(command, value = null) {
    document.execCommand(command, false, value);
    updateCount();
  }

  function runEditorAction(action) {
    if (action === 'link') {
      const url = window.prompt('연결할 URL을 입력해 주세요.');
      if (url && getSafeUrl(url)) runEditorCommand('createLink', url);
      return;
    }
    if (action === 'image') {
      const url = window.prompt('삽입할 이미지의 HTTPS 주소를 입력해 주세요.');
      if (url && getSafeUrl(url, true)) runEditorCommand('insertImage', url);
      return;
    }
    if (action === 'table') {
      runEditorCommand('insertHTML', '<table><tbody><tr><td>내용</td><td>내용</td></tr><tr><td>내용</td><td>내용</td></tr></tbody></table><p><br></p>');
      return;
    }
    const editorBox = form.querySelector('.notice-editor');
    editorBox.classList.toggle('is-fullscreen');
    const fullScreenButton = toolbar.querySelector('[data-action="fullscreen"]');
    const isFullScreen = editorBox.classList.contains('is-fullscreen');
    fullScreenButton.setAttribute('aria-pressed', String(isFullScreen));
    fullScreenButton.setAttribute('aria-label', isFullScreen ? '전체 화면 닫기' : '전체 화면');
  }

  function updateCount() {
    textLength = editorTextLength(editor);
    counter.textContent = `${textLength.toLocaleString('ko-KR')} / 5,000자`;
    counter.setAttribute('aria-live', 'polite');
  }
}

function validateFiles(files, existingFiles) {
  const totalCount = files.length + existingFiles.length;
  if (totalCount > MAX_FILES) throw new Error('첨부파일은 최대 5개까지 등록할 수 있습니다.');
  files.forEach((file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error('JPG, PNG, PDF, ZIP 파일만 첨부할 수 있습니다.');
    if (file.size > MAX_FILE_SIZE) throw new Error('파일 하나의 크기는 10MB를 넘을 수 없습니다.');
  });
}

function setupForm(post) {
  const form = view.querySelector('[data-js="notice-form"]');
  const fileInput = form.querySelector('[data-js="file-input"]');
  const fileList = form.querySelector('[data-js="file-list"]');
  const errorMessage = form.querySelector('[data-js="form-error"]');
  const editor = form.querySelector('[data-js="editor"]');
  let existingFiles = [...(post?.attachments ?? [])];
  let newFiles = [];
  fileInput.addEventListener('change', () => {
    try {
      const selected = [...fileInput.files];
      validateFiles([...newFiles, ...selected], existingFiles);
      newFiles = [...newFiles, ...selected];
      fileInput.value = '';
      renderFiles();
      showError('');
    } catch (error) {
      showError(error.message);
      fileInput.value = '';
    }
  });
  fileList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-file]');
    if (!removeButton) return;
    existingFiles = existingFiles.filter((file) => file.id !== removeButton.dataset.removeFile);
    renderFiles();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = form.elements.title.value.trim();
    const selectedType = form.querySelector('[name="type"]:checked')?.value;
    const content = sanitizeContent(editor.innerHTML);
    const contentLength = editorTextLength(editor);
    try {
      if (!title) throw new Error('제목을 입력해 주세요.');
      if (!selectedType || !NOTICE_TYPES[selectedType]) throw new Error('공지유형을 선택해 주세요.');
      if (contentLength === 0) throw new Error('내용을 입력해 주세요.');
      if (contentLength > MAX_CONTENT_LENGTH) throw new Error('내용은 5,000자 이하로 입력해 주세요.');
      validateFiles(newFiles, existingFiles);
      form.querySelector('[type="submit"]').disabled = true;
      const savedFiles = [];
      try {
        for (const file of newFiles) savedFiles.push(await noticeRepository.saveAttachment(file));
        const input = {
          title,
          type: selectedType,
          contentHtml: content,
          attachments: [...existingFiles, ...savedFiles],
          pinned: post?.pinned ?? false,
        };
        if (post) {
          await noticeRepository.update(post.id, input, form.elements.refreshUpdatedAt.checked);
          window.location.assign(routeUrl({ view: 'detail', id: post.id }));
        } else {
          const created = await noticeRepository.create(input);
          window.location.assign(routeUrl({ view: 'detail', id: created.id }));
        }
      } catch (error) {
        await Promise.all(savedFiles.map((file) => noticeRepository.removeAttachment(file.storageId)));
        throw error;
      }
    } catch (error) {
      form.querySelector('[type="submit"]').disabled = false;
      showError(error.message || '저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  });

  function renderFiles() {
    const savedMarkup = existingFiles.map((file) => `<span class="notice-form__file-item" data-existing-file="${escapeHtml(file.id)}">${escapeHtml(file.name)} (${formatSize(file.size)})<button class="notice-form__file-remove" type="button" data-remove-file="${escapeHtml(file.id)}" aria-label="${escapeHtml(file.name)} 삭제">×</button></span>`).join('');
    const stagedMarkup = newFiles.map((file, index) => `<span class="notice-form__file-item">${escapeHtml(file.name)} (${formatSize(file.size)})<button class="notice-form__file-remove" type="button" data-remove-staged="${index}" aria-label="${escapeHtml(file.name)} 삭제">×</button></span>`).join('');
    fileList.innerHTML = savedMarkup + stagedMarkup;
    fileList.querySelectorAll('[data-remove-staged]').forEach((button) => {
      button.addEventListener('click', () => {
        newFiles.splice(Number(button.dataset.removeStaged), 1);
        renderFiles();
      });
    });
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = !message;
  }
}

async function handleView(parameters, posts) {
  const mode = parameters.get('view') || 'list';
  if (mode === 'write') {
    renderForm();
    return;
  }
  if (mode === 'list') {
    renderList(posts, parameters);
    return;
  }
  const id = parameters.get('id');
  const post = await noticeRepository.getById(id);
  if (!post) {
    renderError('요청한 공지사항을 찾을 수 없습니다.');
    return;
  }
  if (mode === 'edit') {
    renderForm(post);
    return;
  }
  if (mode !== 'detail') {
    renderError('요청한 화면을 찾을 수 없습니다.');
    return;
  }
  const viewedPost = await noticeRepository.incrementViews(id);
  renderDetail(posts.map((item) => item.id === id ? viewedPost : item), viewedPost);
}

function setupViewActions() {
  view.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;
      try {
        await noticeRepository.remove(deleteButton.dataset.delete);
        window.location.assign('./notice.html');
      } catch (error) {
        renderError(error.message);
      }
      return;
    }
    const downloadButton = event.target.closest('[data-download]');
    if (downloadButton && !downloadButton.disabled) {
      try {
        const blob = await noticeRepository.getAttachment(downloadButton.dataset.download);
        if (!blob) throw new Error('첨부파일을 찾을 수 없습니다.');
        const attachmentUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = attachmentUrl;
        link.download = downloadButton.dataset.filename;
        link.hidden = true;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(attachmentUrl), 1000);
      } catch (error) {
        window.alert(error.message);
      }
    }
  });
}

async function initialize() {
  initFooter();
  setupViewActions();
  try {
    const posts = await noticeRepository.getAll();
    await handleView(new URLSearchParams(window.location.search), posts);
  } catch (error) {
    renderError(error.message || '공지사항을 불러오지 못했습니다.');
  }
}

initialize();
