
import {
  DB_NAME,
  DB_VERSION,
  BOOKS_STORE_NAME,
  SETTINGS_STORE_NAME,
  PROGRESS_STORE_NAME,
  DEFAULT_SETTINGS
} from '../constants';
import type { BookRecord, ReaderSettings } from '../types';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(BOOKS_STORE_NAME)) {
        dbInstance.createObjectStore(BOOKS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        const settingsStore = dbInstance.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'id' });
        settingsStore.put({ id: 'readerSettings', ...DEFAULT_SETTINGS });
      }
      if (!dbInstance.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
        dbInstance.createObjectStore(PROGRESS_STORE_NAME, { keyPath: 'bookId' });
      }
    };
  });
};

export const addBook = (book: Omit<BookRecord, 'id' | 'coverUrl'> & { coverUrl: string | null }): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(BOOKS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BOOKS_STORE_NAME);
    const request = store.add(book);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject('Error adding book');
  });
};

export const getBooks = (): Promise<BookRecord[]> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(BOOKS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(BOOKS_STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result as BookRecord[]);
    request.onerror = () => reject('Error getting books');
  });
};

export const deleteBook = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction([BOOKS_STORE_NAME, PROGRESS_STORE_NAME], 'readwrite');
    const booksStore = transaction.objectStore(BOOKS_STORE_NAME);
    const progressStore = transaction.objectStore(PROGRESS_STORE_NAME);
    
    booksStore.delete(id);
    progressStore.delete(id);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error deleting book');
  });
};

export const getSettings = (): Promise<ReaderSettings> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    const request = store.get('readerSettings');
    
    request.onsuccess = () => {
        if(request.result){
            const {id, ...settings} = request.result;
            resolve(settings as ReaderSettings);
        } else {
            resolve(DEFAULT_SETTINGS);
        }
    }
    request.onerror = () => reject('Error getting settings');
  });
};

export const saveSettings = (settings: ReaderSettings): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    store.put({ id: 'readerSettings', ...settings });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error saving settings');
  });
};

export const getProgress = (bookId: number): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE_NAME);
    const request = store.get(bookId);
    
    request.onsuccess = () => {
        resolve(request.result ? request.result.cfi : null);
    }
    request.onerror = () => reject('Error getting progress');
  });
};

export const saveProgress = (bookId: number, cfi: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE_NAME);
    store.put({ bookId, cfi });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error saving progress');
  });
};
