// biome-ignore assist/source/organizeImports: organized by hand
import planet from "./astrology/types/Planets";
import zodiac from "./astrology/types/Zodiac";
import house from "./astrology/types/Houses";

import chakra from "./chakras.json";
import enochianLetter from "./enochian/Letters";

import gdGrade from "./gd/Grades";


import angelicOrder from "./kabbalah/types/AngelicOrders";
import archangel from "./kabbalah/types/Archangels";
import fourWorlds from "./kabbalah/types/FourWorlds";
import godName from "./kabbalah/types/GodNames";
import kerub from "./kabbalah/types/Kerubim";
import tolPath from "./kabbalah/types/Paths";
import sephirah from "./kabbalah/types/Sephirot";
import soul from "./kabbalah/data/souls.json";

// geomancy and alchemy removed

import hebrewLetter from "./HebrewLetters";

const allData = {
  // ASTROLOGY
  planet,
  zodiac,
  house,

  hebrewLetter,

  // ENOCHIAN
  enochianLetter,

  // GEOMANCY (removed)

  gdGrade,

  // KABBALAH
  archangel,
  angelicOrder,
  fourWorlds,
  godName,
  kerub,
  sephirah,
  tolPath,
  soul,

  chakra,

  // ALCHEMY (removed)
};

function insertRefs(row) {
  Object.keys(row).forEach((key) => {
    if (key.substr(key.length - 2) == "Id") {
      const name = key.substr(0, key.length - 2);
      const value = row[key];
      if (allData[name] && allData[name][value]) {
        row[name] = allData[name][value];

        // move to end
        //let tmp = sephirah[key];
        //delete sephirah[key];
        //sephirah[key] = tmp;
      }
    } else if (
      typeof row[key + "Id"] === "undefined" &&
      typeof row[key] === "object"
    ) {
      insertRefs(row[key]);
    }
  });
}

for (const [set, data] of Object.entries(allData)) {
  if (Array.isArray(data)) continue;
  if (data) {
    for (const row of Object.values(data)) {
      insertRefs(row);
    }
  } else {
    console.warn("No data for", set);
  }
}

// @ts-expect-error: ok
if (typeof window !== "undefined") window.magickData = allData;

// module.exports = allData;
export default allData;

// geomancy exports removed
