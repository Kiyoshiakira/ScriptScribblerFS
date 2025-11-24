/**
 * @jest-environment jsdom
 */

import { Draft } from '../saveManager';

// Mock idb-keyval
jest.mock('idb-keyval', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  entries: jest.fn(),
  createStore: jest.fn(() => ({})),
}));

describe('SaveManager', () => {
  let SaveManager: any;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockDel: jest.Mock;
  let mockEntries: jest.Mock;

  beforeEach(() => {
    // Reset modules to get a fresh instance
    jest.resetModules();
    
    // Get mocked functions
    const idbKeyval = require('idb-keyval');
    mockGet = idbKeyval.get as jest.Mock;
    mockSet = idbKeyval.set as jest.Mock;
    mockDel = idbKeyval.del as jest.Mock;
    mockEntries = idbKeyval.entries as jest.Mock;

    // Clear all mocks
    jest.clearAllMocks();
    
    // Import SaveManager after mocking
    SaveManager = require('../saveManager').default;
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      
      const manager = new SaveManager();
      expect(manager.isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      const manager = new SaveManager();
      expect(manager.isOnline()).toBe(false);
    });
  });

  describe('saveDraft', () => {
    it('should save a draft to IndexedDB', async () => {
      mockSet.mockResolvedValue(undefined);
      
      const manager = new SaveManager();
      const id = 'test-draft-1';
      const content = 'Test content';
      const metadata = { title: 'Test Draft', type: 'screenplay' };

      await manager.saveDraft(id, content, metadata);

      expect(mockSet).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          id,
          content,
          metadata,
          synced: expect.any(Boolean),
          timestamp: expect.any(Number),
        }),
        expect.any(Object)
      );
    });

    it('should mark draft as synced when online', async () => {
      mockSet.mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const manager = new SaveManager();
      await manager.saveDraft('test-id', 'content');

      expect(mockSet).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({ synced: true }),
        expect.any(Object)
      );
    });

    it('should mark draft as unsynced when offline', async () => {
      mockSet.mockResolvedValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const manager = new SaveManager();
      await manager.saveDraft('test-id', 'content');

      expect(mockSet).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({ synced: false }),
        expect.any(Object)
      );
    });
  });

  describe('getDraft', () => {
    it('should retrieve a draft from IndexedDB', async () => {
      const mockDraft: Draft = {
        id: 'test-draft',
        content: 'Test content',
        timestamp: Date.now(),
        synced: true,
        metadata: { title: 'Test' },
      };
      
      mockGet.mockResolvedValue(mockDraft);

      const manager = new SaveManager();
      const result = await manager.getDraft('test-draft');

      expect(mockGet).toHaveBeenCalledWith('test-draft', expect.any(Object));
      expect(result).toEqual(mockDraft);
    });

    it('should return null for non-existent draft', async () => {
      mockGet.mockResolvedValue(undefined);

      const manager = new SaveManager();
      const result = await manager.getDraft('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('deleteDraft', () => {
    it('should delete a draft from IndexedDB', async () => {
      mockDel.mockResolvedValue(undefined);

      const manager = new SaveManager();
      await manager.deleteDraft('test-draft');

      expect(mockDel).toHaveBeenCalledWith('test-draft', expect.any(Object));
    });
  });

  describe('getAllDrafts', () => {
    it('should return all drafts from IndexedDB', async () => {
      const mockDrafts: [string, Draft][] = [
        ['draft-1', {
          id: 'draft-1',
          content: 'Content 1',
          timestamp: Date.now(),
          synced: true,
        }],
        ['draft-2', {
          id: 'draft-2',
          content: 'Content 2',
          timestamp: Date.now(),
          synced: false,
        }],
      ];

      mockEntries.mockResolvedValue(mockDrafts);

      const manager = new SaveManager();
      const result = await manager.getAllDrafts();

      expect(mockEntries).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockDrafts[0][1]);
      expect(result[1]).toEqual(mockDrafts[1][1]);
    });

    it('should return empty array when no drafts exist', async () => {
      mockEntries.mockResolvedValue([]);

      const manager = new SaveManager();
      const result = await manager.getAllDrafts();

      expect(result).toEqual([]);
    });
  });

  describe('online/offline events', () => {
    it('should call onOnline callback when browser comes online', (done) => {
      const onOnline = jest.fn();
      const manager = new SaveManager({ onOnline });

      // Simulate online event
      window.dispatchEvent(new Event('online'));

      // Use setTimeout to allow event handlers to execute
      setTimeout(() => {
        expect(onOnline).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should call onOffline callback when browser goes offline', (done) => {
      const onOffline = jest.fn();
      const manager = new SaveManager({ onOffline });

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));

      // Use setTimeout to allow event handlers to execute
      setTimeout(() => {
        expect(onOffline).toHaveBeenCalled();
        done();
      }, 10);
    });
  });
});
