import type { Element, ElementId } from "../../astrology/types/Elements";
import type { Zodiac, ZodiacId } from "../astrology/types/Zodiac";
import _kerubim from "./kerubim.json";

type KerubId = "earth" | "air" | "water" | "fire";

interface Kerub {
  id: KerubId;
  title: { en: string };
  face: { en: string; he: string; roman: string };
  zodiacId: ZodiacId;
  zodiac?: Zodiac;
  elementId: ElementId;
  element?: Element;
}

type Kerubim = Record<KerubId, Kerub>;

const kerubim: Kerubim = _kerubim as Kerubim;

export type { Kerub, KerubId, Kerubim };
export default kerubim;
