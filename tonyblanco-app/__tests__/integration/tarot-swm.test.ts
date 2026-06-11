/**
 * Integration tests for SWM Tarot Frontend-Backend
 * 
 * Tests the complete flow:
 * 1. Create workspace instance
 * 2. Start session
 * 3. Save spread
 * 4. Load history
 * 5. Seal workspace
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { swmTarotApi } from '../../lib/api/swm/tarot/client';
import type {
  CreateInstanceRequest,
  SaveSpreadRequest,
  WorkspaceInstance,
  WorkspaceSession,
  WorkspaceArtifact,
} from '../../lib/api/swm/tarot/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'test-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

describe('SWM Tarot API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  describe('getDefinition', () => {
    it('should fetch workspace definition', async () => {
      const mockDefinition = {
        id: '123',
        code: 'TAROT_EVOLUTIVO',
        name: 'Tarot Evolutivo',
        is_active: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDefinition),
      });

      const result = await swmTarotApi.getDefinition();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/swm/tarot/definition'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Token test-token',
          }),
        })
      );
      expect(result).toEqual(mockDefinition);
    });
  });

  describe('createInstance', () => {
    it('should create a new workspace instance', async () => {
      const mockInstance: Partial<WorkspaceInstance> = {
        id: 'instance-123',
        status: 'draft',
        spread_type: 'free',
        tarot_system: 'thoth',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ instance: mockInstance }),
      });

      const request: CreateInstanceRequest = {
        subject_user_id: 1,
        spread_type: 'free',
        tarot_system: 'thoth',
      };

      const result = await swmTarotApi.createInstance(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/swm/tarot/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockInstance);
    });
  });

  describe('startSession', () => {
    it('should start a new session', async () => {
      const mockSession: Partial<WorkspaceSession> = {
        id: 'session-123',
        is_active: true,
        phase: 'setup',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ session: mockSession }),
      });

      const result = await swmTarotApi.startSession({ instance_id: 'instance-123' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/swm/tarot/start'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('saveSpread', () => {
    it('should save a tarot spread', async () => {
      const mockArtifact: Partial<WorkspaceArtifact> = {
        id: 'artifact-123',
        artifact_type: 'spread',
        is_sealed: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ artifact: mockArtifact }),
      });

      const request: SaveSpreadRequest = {
        instance_id: 'instance-123',
        cards: [
          { position: 1, card_id: 'fool', reversed: false },
        ],
        therapist_notes: 'Test notes',
      };

      const result = await swmTarotApi.saveSpread(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/swm/tarot/save-spread'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockArtifact);
    });
  });

  describe('listWorkspaces', () => {
    it('should list workspaces with filters', async () => {
      const mockWorkspaces = [
        { id: '1', status: 'active' },
        { id: '2', status: 'sealed' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: mockWorkspaces.length, results: mockWorkspaces }),
      });

      const result = await swmTarotApi.listWorkspaces({ subject_user_id: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/swm\/tarot\/list\?subject_user_id=1/),
        expect.any(Object)
      );
      expect(result).toEqual(mockWorkspaces);
    });
  });

  describe('sealWorkspace', () => {
    it('should seal a workspace', async () => {
      const mockInstance: Partial<WorkspaceInstance> = {
        id: 'instance-123',
        status: 'sealed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ instance: mockInstance }),
      });

      const result = await swmTarotApi.sealWorkspace({ instance_id: 'instance-123' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/swm/tarot/seal'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.status).toBe('sealed');
    });
  });

  describe('error handling', () => {
    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' }),
      });

      await expect(swmTarotApi.getDefinition()).rejects.toThrow('Bad request');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(swmTarotApi.getDefinition()).rejects.toThrow('Network error');
    });
  });
});

describe('SWM Tarot Integration Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  it('should complete full workflow: create -> start -> save -> seal', async () => {
    // Step 1: Create instance
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        instance: { id: 'instance-1', status: 'draft' },
      }),
    });

    const instance = await swmTarotApi.createInstance({
      subject_user_id: 1,
      spread_type: 'free',
      tarot_system: 'thoth',
    });
    expect(instance.id).toBe('instance-1');

    // Step 2: Start session
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        session: { id: 'session-1', is_active: true },
      }),
    });

    const session = await swmTarotApi.startSession({ instance_id: instance.id });
    expect(session.is_active).toBe(true);

    // Step 3: Save spread
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        artifact: { id: 'artifact-1', artifact_type: 'spread' },
      }),
    });

    const artifact = await swmTarotApi.saveSpread({
      instance_id: instance.id,
      cards: [{ position: 1, card_id: 'fool', reversed: false }],
    });
    expect(artifact.artifact_type).toBe('spread');

    // Step 4: Seal workspace
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        instance: { id: 'instance-1', status: 'sealed' },
      }),
    });

    const sealed = await swmTarotApi.sealWorkspace({ instance_id: instance.id });
    expect(sealed.status).toBe('sealed');

    // Verify all API calls were made
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });
});
