/**
 * Build read-only correspondence tables for API v1.
 */
import { type SystemId } from '../correspondences/system';
import type { CorrespondencesResponseV1 } from './dto';
export declare function isValidSystemId(value: string): value is SystemId;
export declare function buildCorrespondencesResponse(systemId: SystemId): CorrespondencesResponseV1;
//# sourceMappingURL=build-correspondences.d.ts.map