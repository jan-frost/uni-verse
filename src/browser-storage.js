import { Storage } from './storage.js';

const DB_NAME_PREFIX = 'uni-verse-';
const DB_VERSION = 1;
const CHUNK_STORE_NAME = 'chunks';

function openDB(seed) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${DB_NAME_PREFIX}${seed}`, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(CHUNK_STORE_NAME)) {
        db.createObjectStore(CHUNK_STORE_NAME, { keyPath: 'x' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export class BrowserStorage extends Storage {
  constructor(seed) {
    super();
    this.dbPromise = openDB(seed);
  }

  async getChunk(x) {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHUNK_STORE_NAME, 'readonly');
      const store = transaction.objectStore(CHUNK_STORE_NAME);
      const request = store.get(x);

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async saveTile(chunkX, x, y, tile) {
    const db = await this.dbPromise;
    const chunk = (await this.getChunk(chunkX)) || { x: chunkX, tiles: [] };

    const tileIndex = chunk.tiles.findIndex((t) => t.x === x && t.y === y);
    if (tileIndex > -1) {
      chunk.tiles[tileIndex] = { x, y, tile };
    } else {
      chunk.tiles.push({ x, y, tile });
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHUNK_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(CHUNK_STORE_NAME);
      const request = store.put(chunk);

      request.onsuccess = () => {
        this.events.emit("tile-changed", { chunkX, x, y, tile });
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
}
