export type ElementId = "fire" | "water" | "air" | "earth";
export interface Element {
  id: ElementId;
  name: { en: string };
}

const elements: Record<ElementId, Element> = {
  fire: { id: "fire", name: { en: "Fire" } },
  water: { id: "water", name: { en: "Water" } },
  air: { id: "air", name: { en: "Air" } },
  earth: { id: "earth", name: { en: "Earth" } },
};

export default elements;