import { describe, it, expect } from 'vitest';
import { buildCorrespondencesResponse, isValidSystemId } from '../build-correspondences';
import { SYMBOLIC_API_VERSION } from '../dto';

describe('Symbolic API v1 contract', () => {
  it('isValidSystemId accepts known systems only', () => {
    expect(isValidSystemId('jewish-traditional')).toBe(true);
    expect(isValidSystemId('hermetic-golden-dawn')).toBe(true);
    expect(isValidSystemId('unknown')).toBe(false);
  });

  it('jewish-traditional keter has divineNameTranslit Eheieh', () => {
    const payload = buildCorrespondencesResponse('jewish-traditional');
    const keter = payload.sefirot.find((s) => s.id === 'keter');
    expect(keter).toBeDefined();
    expect(keter!.data).toMatchObject({ divineNameTranslit: 'Eheieh' });
  });

  it('hermetic-golden-dawn covers 10 sefirot and 22 paths', () => {
    const payload = buildCorrespondencesResponse('hermetic-golden-dawn');
    expect(payload.sefirot).toHaveLength(10);
    expect(payload.paths).toHaveLength(22);
  });

  it('jewish-traditional covers 10 sefirot and 22 paths', () => {
    const payload = buildCorrespondencesResponse('jewish-traditional');
    expect(payload.sefirot).toHaveLength(10);
    expect(payload.paths).toHaveLength(22);
  });

  it('API version constant is frozen at v1', () => {
    expect(SYMBOLIC_API_VERSION).toBe('v1');
  });
});