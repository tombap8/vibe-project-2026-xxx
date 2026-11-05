import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';
import { firestore } from './firebase.js';
import { createLocalStorageNoticeRepository } from './notice-local-storage-repository.js';

const COLLECTION_NAME = 'notices';
const BATCH_SIZE = 400;
const localRepository = createLocalStorageNoticeRepository();

function makeRepositoryError(error, action) {
  if (error?.code === 'permission-denied') {
    return new Error(`Firestore 권한이 없어 공지사항을 ${action} 못했습니다. Firebase 콘솔에서 Firestore 보안 규칙을 확인해 주세요.`, { cause: error });
  }
  if (error?.code === 'unavailable') {
    return new Error(`네트워크 연결 문제로 공지사항을 ${action} 못했습니다. 잠시 후 다시 시도해 주세요.`, { cause: error });
  }
  return error instanceof Error ? error : new Error(`공지사항을 ${action} 못했습니다.`);
}

async function runRepositoryAction(action, callback) {
  try {
    return await callback();
  } catch (error) {
    throw makeRepositoryError(error, action);
  }
}

function getNoticeCollection() {
  return collection(firestore, COLLECTION_NAME);
}

function mapDocument(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

function sortPosts(posts) {
  return posts.sort((first, second) => Number(second.pinned) - Number(first.pinned)
    || second.createdAt.localeCompare(first.createdAt));
}

async function writePosts(posts) {
  for (let index = 0; index < posts.length; index += BATCH_SIZE) {
    const batch = writeBatch(firestore);
    posts.slice(index, index + BATCH_SIZE).forEach(({ id, ...post }) => {
      batch.set(doc(firestore, COLLECTION_NAME, id), post);
    });
    await batch.commit();
  }
}

async function migrateLocalPostsWhenEmpty() {
  const snapshot = await getDocs(getNoticeCollection());
  if (!snapshot.empty) return snapshot.docs.map(mapDocument);

  const localPosts = await localRepository.getAll();
  await writePosts(localPosts);
  return localPosts;
}

async function getNextNumber() {
  const snapshot = await getDocs(getNoticeCollection());
  const numbers = snapshot.docs.map((item) => item.data().number ?? 0);
  return Math.max(0, ...numbers) + 1;
}

export function createFirestoreNoticeRepository() {
  return {
    async getAll() {
      return runRepositoryAction('불러오지', async () => (
        sortPosts(await migrateLocalPostsWhenEmpty())
      ));
    },

    async getById(id) {
      if (!id) return null;
      return runRepositoryAction('불러오지', async () => {
        const snapshot = await getDoc(doc(firestore, COLLECTION_NAME, id));
        return snapshot.exists() ? mapDocument(snapshot) : null;
      });
    },

    async create(input) {
      return runRepositoryAction('등록하지', async () => {
        const reference = doc(getNoticeCollection());
        const now = new Date().toISOString();
        const post = {
          ...input,
          id: reference.id,
          number: await getNextNumber(),
          views: 0,
          createdAt: now,
          updatedAt: now,
        };
        const { id, ...data } = post;
        await setDoc(reference, data);
        return post;
      });
    },

    async update(id, input, refreshUpdatedAt = true) {
      return runRepositoryAction('수정하지', async () => {
        const reference = doc(firestore, COLLECTION_NAME, id);
        const snapshot = await getDoc(reference);
        if (!snapshot.exists()) throw new Error('수정할 공지사항을 찾을 수 없습니다.');

        const current = mapDocument(snapshot);
        const retainedIds = new Set(input.attachments.map((file) => file.storageId).filter(Boolean));
        const removedIds = current.attachments
          .map((file) => file.storageId)
          .filter((storageId) => storageId && !retainedIds.has(storageId));
        const updatedAt = refreshUpdatedAt ? new Date().toISOString() : current.updatedAt;

        await updateDoc(reference, { ...input, updatedAt });
        await Promise.all(removedIds.map((storageId) => localRepository.removeAttachment(storageId)));
        return { ...current, ...input, updatedAt };
      });
    },

    async remove(id) {
      return runRepositoryAction('삭제하지', async () => {
        const reference = doc(firestore, COLLECTION_NAME, id);
        const snapshot = await getDoc(reference);
        if (!snapshot.exists()) throw new Error('삭제할 공지사항을 찾을 수 없습니다.');

        const post = mapDocument(snapshot);
        await deleteDoc(reference);
        await Promise.all(post.attachments.map((file) => (
          file.storageId ? localRepository.removeAttachment(file.storageId) : undefined
        )));
      });
    },

    async incrementViews(id) {
      const reference = doc(firestore, COLLECTION_NAME, id);
      return runRepositoryAction('갱신하지', () => (
        runTransaction(firestore, async (transaction) => {
          const snapshot = await transaction.get(reference);
          if (!snapshot.exists()) throw new Error('조회할 공지사항을 찾을 수 없습니다.');
          const post = mapDocument(snapshot);
          const views = post.views + 1;
          transaction.update(reference, { views });
          return { ...post, views };
        })
      ));
    },

    async saveAttachment(file) {
      return localRepository.saveAttachment(file);
    },

    async getAttachment(storageId) {
      return localRepository.getAttachment(storageId);
    },

    async removeAttachment(storageId) {
      return localRepository.removeAttachment(storageId);
    },
  };
}

