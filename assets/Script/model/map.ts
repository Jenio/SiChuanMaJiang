export class Map<K extends number | string, V extends number | string | object> {
  private _map: any;

  constructor() {
    this._map = {};
  }

  forEach(callback: (v: V, k: K) => void) {
    for (let key in this._map) {
      let val = this._map[key];
      callback(val, <K>key);
    }
  }

  get(key: K): V {
    return this._map[key];
  }

  set(key: K, val: V) {
    this._map[key] = val;
  }

  has(key: K) {
    return this._map[key] !== undefined;
  }

  clear() {
    this._map = {};
  }

  delete(key: K) {
    delete this._map[key];
  }

  get count(): number {
    return Object.getOwnPropertyNames(this._map).length;
  }
}