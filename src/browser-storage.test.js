import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BrowserStorage } from './browser-storage.js';
import 'fake-indexeddb/auto';

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('uni-verse');
    req.onsuccess = resolve;
    req.onerror = reject;
  });
});

test('can save and retrieve a tile', async () => {
  const storage = new BrowserStorage();
  await storage.saveTile(1, 10, 20, { id: 'grass' });
  const chunk = await storage.getChunk(1);
  assert.deepStrictEqual(chunk, {
    x: 1,
    tiles: [{ x: 10, y: 20, tile: { id: 'grass' } }],
  });
  await storage.dbPromise.then(db => db.close());
});

test('can save multiple tiles in the same chunk', async () => {
  const storage = new BrowserStorage();
  await storage.saveTile(1, 10, 20, { id: 'grass' });
  await storage.saveTile(1, 11, 21, { id: 'dirt' });
  const chunk = await storage.getChunk(1);
  assert.deepStrictEqual(chunk, {
    x: 1,
    tiles: [
      { x: 10, y: 20, tile: { id: 'grass' } },
      { x: 11, y: 21, tile: { id: 'dirt' } },
    ],
  });
  await storage.dbPromise.then(db => db.close());
});

test('can update a tile', async () => {
  const storage = new BrowserStorage();
  await storage.saveTile(1, 10, 20, { id: 'grass' });
  await storage.saveTile(1, 10, 20, { id: 'dirt' });
  const chunk = await storage.getChunk(1);
  assert.deepStrictEqual(chunk, {
    x: 1,
    tiles: [{ x: 10, y: 20, tile: { id: 'dirt' } }],
  });
  await storage.dbPromise.then(db => db.close());
});

test('can handle negative chunk indexes', async () => {
  const storage = new BrowserStorage();
  await storage.saveTile(-1, 10, 20, { id: 'grass' });
  const chunk = await storage.getChunk(-1);
  assert.deepStrictEqual(chunk, {
    x: -1,
    tiles: [{ x: 10, y: 20, tile: { id: 'grass' } }],
  });
  await storage.dbPromise.then(db => db.close());
});

test('returns null for a chunk that does not exist', async () => {
  const storage = new BrowserStorage();
  const chunk = await storage.getChunk(1);
  assert.strictEqual(chunk, null);
  await storage.dbPromise.then(db => db.close());
});
