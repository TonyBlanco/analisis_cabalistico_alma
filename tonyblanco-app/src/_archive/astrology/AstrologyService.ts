import planets from "./types/Planets";

import type { Planet, PlanetId } from "./types/Planets";

export function getPlanet(id: PlanetId): Planet | undefined {
	return planets[id];
}

export function listPlanets(): Planet[] {
	return Object.values(planets);
}

export default { getPlanet, listPlanets };
