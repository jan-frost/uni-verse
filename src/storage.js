/**
 * @typedef {object} Tile
 * @property {number} x
 * @property {number} y
 * @property {any} tile
 */

/**
 * @typedef {object} Chunk
 * @property {number} x
 * @property {Tile[]} tiles
 */

/**
 * @interface
 */
export class Storage {
  /**
   * @param {number} x
   * @returns {Promise<Chunk|null>}
   */
  getChunk(x) {
    throw new Error("Not implemented");
  }

  /**
   * @param {number} chunkX
   * @param {number} x
   * @param {number} y
   * @param {any} tile
   * @returns {Promise<void>}
   */
  saveTile(chunkX, x, y, tile) {
    throw new Error("Not implemented");
  }
}

export class FakeStorage extends Storage {
  constructor() {
    super();
    /** @type {Map<number, Chunk>} */
    this.chunks = new Map();
  }

  /**
   * @param {number} x
   * @returns {Promise<Chunk|null>}
   */
  async getChunk(x) {
    return this.chunks.get(x) || null;
  }

  /**
   * @param {number} chunkX
   * @param {number} x
   * @param {number} y
   * @param {any} tile
   * @returns {Promise<void>}
   */
  async saveTile(chunkX, x, y, tile) {
    let chunk = this.chunks.get(chunkX);
    if (!chunk) {
      chunk = { x: chunkX, tiles: [] };
      this.chunks.set(chunkX, chunk);
    }

    const tileIndex = chunk.tiles.findIndex((t) => t.x === x && t.y === y);
    if (tileIndex > -1) {
      chunk.tiles[tileIndex] = { x, y, tile };
    } else {
      chunk.tiles.push({ x, y, tile });
    }
  }
}
