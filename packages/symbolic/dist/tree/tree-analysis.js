/**
 * Tree Analysis — Deterministic Structural Metrics
 *
 * Pure, side-effect-free computation over TreeStructuralState + topology.
 * No network, no Date.now(), no randomness.
 * Same input → identical output (golden-test safe).
 *
 * Graph algorithms (zero external deps):
 *   - Degree centrality: edge count per node over active paths
 *   - Connected components: Union-Find on active paths
 *   - Longest active path: DFS with cycle guard, bounded to 22 edges
 */
import { SEFIROT_TOPOLOGY, TREE_PATHS } from './tree-topology';
// ─── Memoisation ────────────────────────────────────────────────────────────
const analysisCache = new Map();
function hashState(state) {
    const sefirot = state.sefirot
        .map((s) => `${s.id}:${s.activation.toFixed(6)}:${s.role}`)
        .sort()
        .join('|');
    const flows = state.flows
        .map((f) => `${f.from}->${f.to}:${f.polarity}:${f.intensity.toFixed(6)}`)
        .sort()
        .join('|');
    return `${state.source.method}|${sefirot}||${flows}`;
}
// ─── Pillar balance ──────────────────────────────────────────────────────────
function computePillarBalance(state) {
    const sums = { severity: 0, mercy: 0, equilibrium: 0 };
    let total = 0;
    for (const s of state.sefirot) {
        const topo = SEFIROT_TOPOLOGY[s.id];
        if (!topo)
            continue;
        sums[topo.pillar] += s.activation;
        total += s.activation;
    }
    if (total === 0)
        return { severity: 0, mercy: 0, equilibrium: 0 };
    return {
        severity: sums.severity / total,
        mercy: sums.mercy / total,
        equilibrium: sums.equilibrium / total,
    };
}
// ─── Triad activation ────────────────────────────────────────────────────────
function computeTriadActivation(state) {
    const sums = {
        supernal: 0, ethical: 0, astral: 0, receptacle: 0,
    };
    const counts = {
        supernal: 0, ethical: 0, astral: 0, receptacle: 0,
    };
    for (const s of state.sefirot) {
        const topo = SEFIROT_TOPOLOGY[s.id];
        if (!topo)
            continue;
        sums[topo.triad] += s.activation;
        counts[topo.triad]++;
    }
    return {
        supernal: counts.supernal > 0 ? sums.supernal / counts.supernal : 0,
        ethical: counts.ethical > 0 ? sums.ethical / counts.ethical : 0,
        astral: counts.astral > 0 ? sums.astral / counts.astral : 0,
        receptacle: counts.receptacle > 0 ? sums.receptacle / counts.receptacle : 0,
    };
}
// ─── Olam activation ─────────────────────────────────────────────────────────
function computeOlamActivation(state) {
    const sums = { atziluth: 0, beriah: 0, yetzirah: 0, assiah: 0 };
    const counts = { atziluth: 0, beriah: 0, yetzirah: 0, assiah: 0 };
    for (const s of state.sefirot) {
        const topo = SEFIROT_TOPOLOGY[s.id];
        if (!topo)
            continue;
        sums[topo.olam] += s.activation;
        counts[topo.olam]++;
    }
    return {
        atziluth: counts.atziluth > 0 ? sums.atziluth / counts.atziluth : 0,
        beriah: counts.beriah > 0 ? sums.beriah / counts.beriah : 0,
        yetzirah: counts.yetzirah > 0 ? sums.yetzirah / counts.yetzirah : 0,
        assiah: counts.assiah > 0 ? sums.assiah / counts.assiah : 0,
    };
}
// ─── Polarity distribution ───────────────────────────────────────────────────
function computePolarityDistribution(state) {
    const counts = { harmonic: 0, integrative: 0, tensional: 0 };
    const total = state.flows.length;
    for (const f of state.flows)
        counts[f.polarity]++;
    if (total === 0)
        return { harmonic: 0, integrative: 0, tensional: 0 };
    return {
        harmonic: counts.harmonic / total,
        integrative: counts.integrative / total,
        tensional: counts.tensional / total,
    };
}
// ─── Graph metrics ───────────────────────────────────────────────────────────
function computeGraphMetrics(state) {
    const activeNodeSet = new Set(state.sefirot.map((s) => s.id));
    // Active paths: canonical TREE_PATHS that match a flow (unordered edges)
    const activePathIds = new Set();
    for (const flow of state.flows) {
        for (const path of TREE_PATHS) {
            if ((path.from === flow.from && path.to === flow.to) ||
                (path.from === flow.to && path.to === flow.from)) {
                activePathIds.add(path.id);
                break;
            }
        }
    }
    // Degree centrality (count of active paths touching each node)
    const degree = {};
    for (const pathId of activePathIds) {
        const path = TREE_PATHS.find((p) => p.id === pathId);
        if (!path)
            continue;
        degree[path.from] = (degree[path.from] ?? 0) + 1;
        degree[path.to] = (degree[path.to] ?? 0) + 1;
    }
    const degreeCentrality = {
        keter: 0, chokmah: 0, binah: 0, chesed: 0, gevurah: 0,
        tiferet: 0, netzach: 0, hod: 0, yesod: 0, malchut: 0,
    };
    for (const [id, val] of Object.entries(degree)) {
        degreeCentrality[id] = val;
    }
    // Build adjacency list from active paths (restricted to active nodes)
    const adj = new Map();
    for (const id of activeNodeSet)
        adj.set(id, []);
    for (const pathId of activePathIds) {
        const path = TREE_PATHS.find((p) => p.id === pathId);
        if (!path)
            continue;
        if (activeNodeSet.has(path.from) && activeNodeSet.has(path.to)) {
            adj.get(path.from).push(path.to);
            adj.get(path.to).push(path.from);
        }
    }
    // Connected components (BFS / Union-Find via visited set)
    const visited = new Set();
    let connectedComponents = 0;
    for (const startNode of activeNodeSet) {
        if (visited.has(startNode))
            continue;
        connectedComponents++;
        const queue = [startNode];
        while (queue.length > 0) {
            const node = queue.shift();
            if (visited.has(node))
                continue;
            visited.add(node);
            for (const neighbor of (adj.get(node) ?? [])) {
                if (!visited.has(neighbor))
                    queue.push(neighbor);
            }
        }
    }
    // Longest active path (DFS, max 22 edges, no revisits within a single path)
    let longestActivePath = [];
    function dfs(node, visited, currentPath) {
        if (currentPath.length > longestActivePath.length) {
            longestActivePath = [...currentPath];
        }
        if (currentPath.length >= 23)
            return; // hard cap: 22 edges = 23 nodes
        for (const neighbor of (adj.get(node) ?? [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                currentPath.push(neighbor);
                dfs(neighbor, visited, currentPath);
                currentPath.pop();
                visited.delete(neighbor);
            }
        }
    }
    for (const startNode of activeNodeSet) {
        const vis = new Set([startNode]);
        dfs(startNode, vis, [startNode]);
    }
    return {
        activeNodes: [...activeNodeSet],
        activePaths: [...activePathIds],
        degreeCentrality,
        connectedComponents,
        longestActivePath,
    };
}
// ─── Public API ──────────────────────────────────────────────────────────────
export function analyzeTreeState(state) {
    const key = hashState(state);
    const cached = analysisCache.get(key);
    if (cached)
        return cached;
    const result = {
        sourceVersion: '0.2',
        pillarBalance: computePillarBalance(state),
        triadActivation: computeTriadActivation(state),
        olamActivation: computeOlamActivation(state),
        polarityDistribution: computePolarityDistribution(state),
        graph: computeGraphMetrics(state),
        ranking: [...state.sefirot]
            .sort((a, b) => b.activation - a.activation)
            .map(({ id, activation, role }) => ({ id, activation, role })),
    };
    analysisCache.set(key, result);
    return result;
}
