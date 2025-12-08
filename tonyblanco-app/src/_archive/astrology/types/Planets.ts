import { HebrewLetter, HebrewLetterId } from "../../HebrewLetters";
import { Archangel, ArchangelId } from "../../kabbalah/types/Archangels";
import { GodNameId } from "../../kabbalah/types/GodNames";
import _planets from "../data/planets.json";

type PlanetId =
  | "sol"
  | "mercury"
  | "venus"
  | "earth"
  | "luna"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "rahu"
  | "ketu";

type LangObject = { en?: string; roman?: string; he?: string };

interface Planet {
  id: PlanetId;
  symbol: string;
  hebrewLetterId: HebrewLetterId;
  hebrewLetter?: HebrewLetter;
  name: {
    en: LangObject;
    he: LangObject;
  };
  godNameId: GodNameId;
  archangelId: ArchangelId;
  archangel?: Archangel;
  intelligenceId?: string;
  spiritId?: string;
  magickTypes?: {
    en: string;
  };
}

type Planets = {
  [key in PlanetId]: Planet;
};

const planets: Planets = _planets as unknown as Planets;

export type { Planet, PlanetId, Planets };
export default planets;
