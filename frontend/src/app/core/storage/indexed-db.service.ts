import { Injectable } from '@angular/core';

const DB_NAME = 'gastos-personales-db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  timestamp: number;
  actionType: string;
  payload: unknown;
  tempId?: string;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDb();
  }

  private initDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para el estado de la app (expenses, categories, etc.)
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', { keyPath: 'key' });
        }

        // Store para la cola de sincronización
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // === Estado de la App ===

  async saveState(key: string, state: unknown): Promise<void> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('appState', 'readwrite');
      const store = tx.objectStore('appState');
      const request = store.put({ key, state, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async loadState<T>(key: string): Promise<T | null> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('appState', 'readonly');
      const store = tx.objectStore('appState');
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.state : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // === Cola de Sincronización ===

  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<SyncQueueItem> {
    const db = await this.dbReady;
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.add(queueItem);
      request.onsuccess = () => resolve(queueItem);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingQueue(): Promise<SyncQueueItem[]> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllQueueItems(): Promise<SyncQueueItem[]> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updated = { ...item, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeFromQueue(id: string): Promise<void> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearQueue(): Promise<void> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getQueueCount(): Promise<number> {
    const db = await this.dbReady;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.count('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
