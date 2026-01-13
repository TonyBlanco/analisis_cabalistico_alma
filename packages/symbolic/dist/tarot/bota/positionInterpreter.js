import positions from './bota_positions.json';
function normalizeKey(value) {
    if (typeof value !== 'string')
        return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\-\s]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .trim();
}
function resolvePositionKey(input) {
    const pid = normalizeKey(input.positionId ?? '');
    if (pid === 'origin')
        return 'origen';
    if (pid === 'present')
        return 'presente';
    if (pid === 'direction')
        return 'direccion';
    const label = normalizeKey(input.positionLabel ?? '');
    if (!label)
        return null;
    if (label.includes('origen'))
        return 'origen';
    if (label.includes('presente') || label.includes('estado_actual'))
        return 'presente';
    if (label.includes('direccion'))
        return 'direccion';
    return null;
}
export function buildBotaPositionMeaning(input) {
    const ontology = positions;
    const positionKey = resolvePositionKey(input);
    const position = positionKey ? ontology[positionKey] : null;
    const consciousness = input.identity.consciousness;
    if (!consciousness?.power && !consciousness?.aspect && !consciousness?.humanFaculty)
        return null;
    const parts = [];
    if (consciousness.power && consciousness.aspect) {
        parts.push(`Consciencia activa: ${consciousness.power} — ${consciousness.aspect}.`);
    }
    else if (consciousness.power) {
        parts.push(`Consciencia activa: ${consciousness.power}.`);
    }
    else if (consciousness.aspect) {
        parts.push(`Consciencia activa: ${consciousness.aspect}.`);
    }
    if (consciousness.humanFaculty) {
        parts.push(`Facultad humana: ${consciousness.humanFaculty}.`);
    }
    if (position) {
        parts.push(`Posición ${position.label}: ${position.definition}`);
        parts.push(`Alcance: ${position.scope}.`);
    }
    return parts.join(' ').trim() || null;
}
