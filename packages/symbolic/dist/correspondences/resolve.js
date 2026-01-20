import { HEBREW_LETTERS } from '../cabala/letters';
import { TREE_PATHS } from '../cabala/paths';
import { ARCANOS_MAYORES } from '../tarot/arcanos';
function buildResolved(letterId) {
    const letter = HEBREW_LETTERS.find((item) => item.id === letterId);
    const path = TREE_PATHS.find((item) => item.letterId === letterId);
    if (!letter || !path) {
        return null;
    }
    return {
        letter,
        path,
        sefirot: [path.from, path.to],
    };
}
export function resolveByLetter(letterId) {
    return buildResolved(letterId);
}
export function resolveByArcano(arcanoNumber) {
    const arcano = ARCANOS_MAYORES.find((item) => item.number === arcanoNumber);
    if (!arcano) {
        return null;
    }
    return buildResolved(arcano.letterId);
}
export function resolveByPath(pathId) {
    const path = TREE_PATHS.find((item) => item.id === pathId);
    if (!path) {
        return null;
    }
    return buildResolved(path.letterId);
}
