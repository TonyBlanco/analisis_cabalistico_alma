// Base de Datos de los 72 Nombres de Dios (Shem HaMephorash)
// Los 72 Ángeles de la Cábala

export interface AngelName {
  id: number;
  hebrew: string;
  name: string; // Transliteración
}

export const ANGELS_DB: AngelName[] = [
  { id: 1, hebrew: "והו", name: "Vehuiah" },
  { id: 2, hebrew: "ילי", name: "Jeliel" },
  { id: 3, hebrew: "סיט", name: "Sitael" },
  { id: 4, hebrew: "עלם", name: "Elemiah" },
  { id: 5, hebrew: "מהש", name: "Mahasiah" },
  { id: 6, hebrew: "ללה", name: "Lelahel" },
  { id: 7, hebrew: "אכא", name: "Achaiah" },
  { id: 8, hebrew: "כהת", name: "Cahetel" },
  { id: 9, hebrew: "הזי", name: "Haziel" },
  { id: 10, hebrew: "אלד", name: "Aladiah" },
  { id: 11, hebrew: "לאו", name: "Lauviah" },
  { id: 12, hebrew: "ההע", name: "Hahaiah" },
  { id: 13, hebrew: "יזל", name: "Yezalel" },
  { id: 14, hebrew: "מבה", name: "Mebahel" },
  { id: 15, hebrew: "הרי", name: "Hariel" },
  { id: 16, hebrew: "הקם", name: "Hekamiah" },
  { id: 17, hebrew: "לאו", name: "Lauviah" },
  { id: 18, hebrew: "כלי", name: "Caliel" },
  { id: 19, hebrew: "לוו", name: "Leuviah" },
  { id: 20, hebrew: "פהל", name: "Pahaliah" },
  { id: 21, hebrew: "נלך", name: "Nelchael" },
  { id: 22, hebrew: "ייי", name: "Yeiayel" },
  { id: 23, hebrew: "מלה", name: "Melahel" },
  { id: 24, hebrew: "חהו", name: "Haheuiah" },
  { id: 25, hebrew: "נתה", name: "Nith-Haiah" },
  { id: 26, hebrew: "האא", name: "Haaiah" },
  { id: 27, hebrew: "ירת", name: "Yerathel" },
  { id: 28, hebrew: "שאה", name: "Seheiah" },
  { id: 29, hebrew: "ריי", name: "Reiyel" },
  { id: 30, hebrew: "אום", name: "Omael" },
  { id: 31, hebrew: "לכב", name: "Lecabel" },
  { id: 32, hebrew: "ושר", name: "Vasariah" },
  { id: 33, hebrew: "יחו", name: "Yehuiah" },
  { id: 34, hebrew: "להח", name: "Lehahiah" },
  { id: 35, hebrew: "כוק", name: "Chavakiah" },
  { id: 36, hebrew: "מנד", name: "Menadel" },
  { id: 37, hebrew: "אני", name: "Aniel" },
  { id: 38, hebrew: "חעם", name: "Haamiah" },
  { id: 39, hebrew: "רהע", name: "Rehael" },
  { id: 40, hebrew: "ייז", name: "Ieiazel" },
  { id: 41, hebrew: "ההה", name: "Hahahel" },
  { id: 42, hebrew: "מיכ", name: "Mikael" },
  { id: 43, hebrew: "וול", name: "Veuliah" },
  { id: 44, hebrew: "ילה", name: "Yelahiah" },
  { id: 45, hebrew: "סאל", name: "Sealiah" },
  { id: 46, hebrew: "ערי", name: "Ariel" },
  { id: 47, hebrew: "עשל", name: "Asaliah" },
  { id: 48, hebrew: "מיה", name: "Mihael" },
  { id: 49, hebrew: "והו", name: "Vehuel" },
  { id: 50, hebrew: "דני", name: "Daniel" },
  { id: 51, hebrew: "החש", name: "Hahasiah" },
  { id: 52, hebrew: "עמם", name: "Imamiah" },
  { id: 53, hebrew: "ננא", name: "Nanael" },
  { id: 54, hebrew: "נית", name: "Nithael" },
  { id: 55, hebrew: "מבה", name: "Mebahiah" },
  { id: 56, hebrew: "פוי", name: "Poyel" },
  { id: 57, hebrew: "נמם", name: "Nemamiah" },
  { id: 58, hebrew: "ייל", name: "Yeialel" },
  { id: 59, hebrew: "הרח", name: "Harahel" },
  { id: 60, hebrew: "מצר", name: "Mitzrael" },
  { id: 61, hebrew: "ומב", name: "Umabel" },
  { id: 62, hebrew: "יהה", name: "Iah-Hel" },
  { id: 63, hebrew: "ענו", name: "Anauel" },
  { id: 64, hebrew: "מחי", name: "Mehiel" },
  { id: 65, hebrew: "דמב", name: "Damabiah" },
  { id: 66, hebrew: "מנק", name: "Manakel" },
  { id: 67, hebrew: "איע", name: "Eyael" },
  { id: 68, hebrew: "חבו", name: "Habuhiah" },
  { id: 69, hebrew: "ראה", name: "Rochel" },
  { id: 70, hebrew: "יבמ", name: "Jabamiah" },
  { id: 71, hebrew: "היי", name: "Haiaiel" },
  { id: 72, hebrew: "מום", name: "Mumiah" }
];

export function getAngelName(number: number): AngelName {
  // Ajuste de índice (el array empieza en 0, los ángeles en 1)
  // Validar que el número esté en el rango válido
  if (number < 1 || number > 72) {
    return { id: number, hebrew: "???", name: "Desconocido" };
  }
  return ANGELS_DB[number - 1] || { id: number, hebrew: "???", name: "Desconocido" };
}





