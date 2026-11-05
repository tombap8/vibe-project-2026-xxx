import { NOTICE_SEED } from './notice-seed.js';

const STORAGE_KEY = 'discovery:notice:posts';
const FILE_DATABASE = 'discovery-notice-files';
const FILE_STORE = 'attachments';

function createId() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('이 브라우저에서는 안전한 고유 ID를 만들 수 없습니다.');
  }
  return globalThis.crypto.randomUUID();
}

function readStoredPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const posts = JSON.parse(raw);
    if (!Array.isArray(posts)) throw new Error('공지사항 저장 데이터 형식이 올바르지 않습니다.');
    return posts;
  } catch (error) {
    throw new Error('공지사항을 불러오지 못했습니다. 브라우저 저장 공간을 확인해 주세요.', { cause: error });
  }
}

function makeSamplePdf() {
  const content = 'BT /F1 14 Tf 50 750 Td (Sample file for the privacy notice.) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let document = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(document).length);
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(document).length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    document += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([document, ' '.repeat(Math.max(0, 1258291 - document.length))], { type: 'application/pdf' });
}

async function getPosts() {
  const stored = readStoredPosts();
  if (stored) return stored;
  const posts = NOTICE_SEED.map((post) => structuredClone(post));
  const sampleAttachment = posts[0].attachments[0];
  sampleAttachment.storageId = createId();
  const samplePdf = makeSamplePdf();
  sampleAttachment.size = samplePdf.size;
  await updateFileStore('readwrite', (store) => store.put(samplePdf, sampleAttachment.storageId));
  writePosts(posts);
  return posts;
}

function writePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    throw new Error('공지사항을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.', { cause: error });
  }
}

function openFileDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('첨부 파일 저장을 지원하지 않는 브라우저입니다.'));
      return;
    }
    const request = indexedDB.open(FILE_DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(FILE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('첨부 파일 저장소를 열지 못했습니다.', { cause: request.error }));
  });
}

async function updateFileStore(mode, action) {
  const database = await openFileDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, mode);
    const result = action(transaction.objectStore(FILE_STORE));
    transaction.oncomplete = () => {
      database.close();
      resolve(result?.result);
    };
    transaction.onerror = () => {
      database.close();
      reject(new Error('첨부 파일을 처리하지 못했습니다.', { cause: transaction.error }));
    };
  });
}

export function createLocalStorageNoticeRepository() {
  return {
    async getAll() {
      await Promise.resolve();
      return (await getPosts()).sort((first, second) => Number(second.pinned) - Number(first.pinned)
        || second.createdAt.localeCompare(first.createdAt));
    },

    async getById(id) {
      await Promise.resolve();
      return (await getPosts()).find((post) => post.id === id) ?? null;
    },

    async create(input) {
      const posts = await getPosts();
      const now = new Date().toISOString();
      const post = {
        ...input,
        id: createId(),
        number: Math.max(0, ...posts.map((item) => item.number ?? 0)) + 1,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      writePosts([post, ...posts]);
      return post;
    },

    async update(id, input, refreshUpdatedAt = true) {
      const posts = await getPosts();
      const index = posts.findIndex((post) => post.id === id);
      if (index < 0) throw new Error('수정할 공지사항을 찾을 수 없습니다.');
      const retainedStorageIds = new Set(input.attachments.map((file) => file.storageId).filter(Boolean));
      const removedStorageIds = posts[index].attachments
        .map((file) => file.storageId)
        .filter((storageId) => storageId && !retainedStorageIds.has(storageId));
      posts[index] = {
        ...posts[index],
        ...input,
        updatedAt: refreshUpdatedAt ? new Date().toISOString() : posts[index].updatedAt,
      };
      writePosts(posts);
      await Promise.all(removedStorageIds.map((storageId) => this.removeAttachment(storageId)));
      return posts[index];
    },

    async remove(id) {
      const posts = await getPosts();
      const target = posts.find((post) => post.id === id);
      if (!target) throw new Error('삭제할 공지사항을 찾을 수 없습니다.');
      writePosts(posts.filter((post) => post.id !== id));
      await Promise.all(target.attachments.map((file) => file.storageId ? this.removeAttachment(file.storageId) : undefined));
    },

    async incrementViews(id) {
      const posts = await getPosts();
      const index = posts.findIndex((post) => post.id === id);
      if (index < 0) throw new Error('조회할 공지사항을 찾을 수 없습니다.');
      posts[index] = { ...posts[index], views: posts[index].views + 1 };
      writePosts(posts);
      return posts[index];
    },

    // Firebase Storage로 전환할 때 첨부 파일 메서드를 모두 교체합니다.
    async saveAttachment(file) {
      const storageId = createId();
      await updateFileStore('readwrite', (store) => store.put(file, storageId));
      return { id: createId(), name: file.name, size: file.size, type: file.type, storageId };
    },

    async getAttachment(storageId) {
      return updateFileStore('readonly', (store) => store.get(storageId));
    },

    async removeAttachment(storageId) {
      return updateFileStore('readwrite', (store) => store.delete(storageId));
    },
  };
}
