import tableau from './bota_tableau_complete.json';
function normalizeBotaKey(value) {
    if (typeof value !== 'string')
        return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\.png$/i, '')
        .replace(/[_\-\s]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^(\d{1,2}_)+/, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .trim();
}
function safeString(value) {
    if (typeof value !== 'string')
        return null;
    const v = value.trim();
    return v ? v : null;
}
function safeNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function safeStringArray(value) {
    if (!Array.isArray(value))
        return null;
    const items = value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
    return items.length ? items : null;
}
const _index = (() => {
    const majorArcana = Array.isArray(tableau?.majorArcana) ? tableau.majorArcana : [];
    const index = new Map();
    for (const entry of majorArcana) {
        if (!entry || typeof entry !== 'object')
            continue;
        const candidates = [
            entry.id,
            entry.code,
            entry.nameSpanish,
            entry.name,
            typeof entry.keyNumber === 'number' ? String(entry.keyNumber) : null,
        ];
        for (const candidate of candidates) {
            const key = normalizeBotaKey(typeof candidate === 'string' ? candidate : '');
            if (key && !index.has(key))
                index.set(key, entry);
        }
        const nameEs = safeString(entry.nameSpanish);
        const keyNumber = safeNumber(entry.keyNumber);
        if (nameEs && keyNumber !== null) {
            const base = normalizeBotaKey(nameEs);
            if (base) {
                const prefixed = `${String(keyNumber).padStart(2, '0')}_${base}`;
                if (!index.has(prefixed))
                    index.set(prefixed, entry);
            }
        }
    }
    return index;
})();
function extractFilename(value) {
    if (!value)
        return null;
    const parts = value.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
}
export function resolveBotaIdentity(card) {
    const symbols = card.symbols && typeof card.symbols === 'object' ? card.symbols : null;
    const symbolsNameSpanish = safeString(symbols?.nameSpanish);
    const primaryCandidates = [
        card.id,
        card.slug,
        card.code,
        symbolsNameSpanish,
    ];
    const fallbackCandidates = [
        card.nameSpanish,
        card.name,
        extractFilename(card.imageUrl),
        extractFilename(card.asset_path),
    ];
    const allCandidates = [...primaryCandidates, ...fallbackCandidates].filter(Boolean);
    let entry;
    for (const candidate of allCandidates) {
        const key = normalizeBotaKey(candidate);
        if (!key)
            continue;
        const found = _index.get(key);
        if (found) {
            entry = found;
            break;
        }
    }
    if (!entry)
        return null;
    const k = entry.kabbalistic && typeof entry.kabbalistic === 'object' ? entry.kabbalistic : {};
    const c = entry.consciousness && typeof entry.consciousness === 'object' ? entry.consciousness : null;
    const corr = entry.correspondences && typeof entry.correspondences === 'object' ? entry.correspondences : {};
    return {
        id: String(entry.id),
        nameSpanish: safeString(entry.nameSpanish),
        hebrewLetter: safeString(k.hebrewLetter),
        letterValue: safeNumber(k.letterValue),
        path: safeNumber(k.path),
        sefirot: safeStringArray(k.sefirot),
        cabalisticIntelligence: safeString(k.intelligence),
        consciousness: c
            ? {
                power: safeString(c.power),
                aspect: safeString(c.aspect),
                humanFaculty: safeString(c.humanFaculty),
            }
            : null,
        element: safeString(corr.element),
        astrology: corr.astrology ?? null,
    };
}
