
import {
  DB_NAME,
  DB_VERSION,
  BOOKS_STORE_NAME,
  SETTINGS_STORE_NAME,
  PROGRESS_STORE_NAME,
  DEFAULT_SETTINGS
} from '../constants.js';

let db;

export const initDB = () => {
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
      const dbInstance = event.target.result;
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

export const addBook = (book) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(BOOKS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(BOOKS_STORE_NAME);
    const request = store.add(book);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error adding book');
  });
};

export const getBooks = () => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(BOOKS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(BOOKS_STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error getting books');
  });
};

export const deleteBook = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    // Using separate transactions for clarity, though one would work
    const bookTx = db.transaction(BOOKS_STORE_NAME, 'readwrite');
    const bookStore = bookTx.objectStore(BOOKS_STORE_NAME);
    const bookDeleteRequest = bookStore.delete(id);
    
    bookDeleteRequest.onerror = () => reject('Error deleting book entry');

    const progressTx = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
    const progressStore = progressTx.objectStore(PROGRESS_STORE_NAME);
    const progressDeleteRequest = progressStore.delete(id);
    
    progressDeleteRequest.onerror = () => reject('Error deleting book progress');

    Promise.all([
        new Promise(res => bookTx.oncomplete = res),
        new Promise(res => progressTx.oncomplete = res)
    ]).then(() => resolve()).catch(reject);
  });
};

export const getSettings = () => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    const request = store.get('readerSettings');
    
    request.onsuccess = () => {
        if(request.result){
            // Merge defaults with saved settings to ensure new settings are applied
            const savedSettings = { ...DEFAULT_SETTINGS, ...request.result };
            delete savedSettings.id;
            resolve(savedSettings);
        } else {
            resolve(DEFAULT_SETTINGS);
        }
    }
    request.onerror = () => reject('Error getting settings');
  });
};

export const saveSettings = (settings) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    store.put({ id: 'readerSettings', ...settings });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error saving settings');
  });
};

export const getProgress = (bookId) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE_NAME);
    const request = store.get(bookId);
    
    request.onsuccess = () => {
        resolve(request.result ? (request.result.cfi || request.result.page) : null);
    }
    request.onerror = () => reject('Error getting progress');
  });
};

export const saveProgress = (bookId, progress) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(PROGRESS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE_NAME);
    const data = { bookId };
    if (typeof progress === 'string') {
        data.cfi = progress;
    } else {
        data.page = progress;
    }
    store.put(data);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error saving progress');
  });
};
