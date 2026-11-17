// Testi di kerning — plugin per Fontra
//
// Nella panoramica del font aggiunge alla barra a sinistra la sezione "Margini e
// gruppi di kerning": margini, larghezza e gruppi dei glifi selezionati (anche più
// glifi insieme), modificabili, come nel pannello in basso a sinistra di Glyphs.
//
// Un pannello nell'editor (menu View → "Testi di kerning", oppure ⌥⌘K) con
// testi pronti per il kerning, come i testi di esempio di Glyphs:
// - categorie: spaziatura, maiuscole, maiuscola + minuscola, minuscole, numeri,
//   punteggiatura e virgolette, parentesi e trattini, accentate e casi limite,
//   italiano, altre lingue, alternative del font, una lettera, testi tuoi;
// - le liste "tutte le coppie" sono generate dai glifi del font, una coppia per
//   ogni combinazione di gruppi di kerning: coprono tutto senza ripetizioni;
// - una coppia alla volta (o 10, o 30), tra lettere di controllo (HH AV HH),
//   già selezionata nello strumento Kerning: ← → regolano, ↑ ↓ passano alla
//   coppia precedente o successiva;
// - per ogni coppia: gruppi, valore e a quali altre coppie vale lo stesso valore;
// - le coppie viste restano spuntate, così riprendi da dove eri rimasto.

const EDITOR_KEY = "__kerningTextsPlugin";
const TAG = "fontra-kerning-texts";
const SETTINGS_KEY = "fontra-plugin-kerning-texts-settings";
const DONE_KEY = "fontra-plugin-kerning-texts-done";
const MINE_KEY = "fontra-plugin-kerning-texts-mine";
const KERNING_TOOL = "kerning-tool";

// ---------------------------------------------------------------------------
// Insiemi di caratteri
// ---------------------------------------------------------------------------

const UC = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const LC = [..."abcdefghijklmnopqrstuvwxyz"];
const DIGITS = [..."0123456789"];
const PUNCT_AFTER = [..." .,:;!?…’”»›)]}*°%-–—/".replace(" ", "")];
const PUNCT_BEFORE = [..."‘“«‹([{¿¡*-–—/"];
const QUOTES_AFTER = [..."’”»›\"'"];
const QUOTES_BEFORE = [..."‘“«‹\"'"];
const DASHES = [..."-–—"];

const words = (text) => text.trim().split(/\s+/);

// ---------------------------------------------------------------------------
// Coppie classiche (scelte a mano: quelle che quasi sempre vanno corrette)
// ---------------------------------------------------------------------------

const UC_CLASSIC = words(`
  AC AG AO AQ AT AU AV AW AY AJ AS
  BA BT BV BW BY BX BJ
  CA CT CV CW CY CO CX
  DA DJ DT DV DW DX DY DZ
  EC EG EO EQ EJ ET EV EW EY
  FA FJ FO FC FG FQ FS FT
  GA GT GV GW GY GJ
  HA HJ HT HV HY
  JA JO JJ
  KC KG KO KQ KU KY KW KV KS
  LC LG LO LQ LT LU LV LW LY LJ LA
  MA MJ MT MV MY
  NA NJ NT NV NY
  OA OJ OT OV OW OX OY OZ
  PA PJ PO PC PG PZ PX PY
  QA QT QU QV QW QY QJ
  RA RC RG RO RQ RT RU RV RW RY RJ
  SA SJ ST SV SW SY SX
  TA TC TG TJ TO TQ TS TT TY TV TW TX
  UA UJ UT UV
  VA VC VG VJ VO VQ VS VT VV
  WA WC WG WJ WO WQ WS WT
  XA XC XG XO XQ XU XY
  YA YC YG YJ YO YQ YS YT YY
  ZA ZC ZG ZO ZQ ZY
`);

const UC_LC_RULES = [
  ["T", "a c d e g m n o p q r s u v w x y z i j"],
  ["V", "a c d e g m n o p q r s u v w x y z i j"],
  ["W", "a c d e g m n o p q r s u v w x y z i j"],
  ["Y", "a c d e g m n o p q r s u v w x y z i j"],
  ["F", "a c d e g o q r s u y j i"],
  ["P", "a c d e g o q r s u y j i"],
  ["K", "a c e o u v w y"],
  ["R", "a c e o u v w y t"],
  ["L", "t u v w y j"],
  ["A", "f g j t u v w y"],
  ["X", "a e o u y"],
  ["Z", "a e o"],
  ["J", "a e o u"],
  ["D", "j"],
  ["O", "j"],
  ["S", "j"],
];

const LC_CLASSIC = words(`
  av aw ay ax at aj af
  bv bw by bx bt bj
  ce cv cw cy co ck cj
  ev ew ey ex et ej ef
  fa fc fd fe fg fo fq fs ff fi fl fj ft fy
  gj gy gg ga ge go
  ja je jo jj
  ka kc kd ke kg ko kq ks ku ky
  lt lv lw ly lj
  ov ow oy ox ot oj of oz
  pv pw py px pt pj
  ra rc rd re rg ro rq rs rv rw ry rt rf
  sv sw sy st sj
  ta tc td te tg to tq ts tt tv tw ty tj
  va vc vd ve vg vo vq vs vv vw vy
  wa wc wd we wg wo wq ws ww wv wy
  xa xc xd xe xg xo xq xs
  ya yc yd ye yg yo yq ys yy yv yw
  za zc ze zo
`);

// ---------------------------------------------------------------------------
// Testi (parole, frasi, casi limite). "/nome" = glifo per nome.
// ---------------------------------------------------------------------------

const SPACING_EXTRA = [
  "HAMBURGEFONSTIV hamburgefonstiv",
  "HOHOHOHO nonononon 01010101",
  "HHOOHHOO nnoonnoo 00110011",
  "nnnnnnnn oooooooo HHHHHHHH OOOOOOOO",
];

const COMBINATIONS_UC = [
  "AVATAR · LYTTA · TATTOO · WAVY · YAWN",
  "AVA ATA AWA AYA LTL LVL LYL",
  "VAV TAT WAW YAY OVO OTO OYO",
  "FAJ PAJ TAJ VAJ YAJ",
  "LT’ LV’ LY’ L’T L’V L’Y",
];

const EXTREME = [
  "fï fî fì fí fj fy f’ f” f) f] f} f? f! f* f°",
  "(f) [f] {f} «f» ‘f’ “f” /f/",
  "j) j] j} (j) [j] {j} «j» ‘j’ “j” gj jj yj ij",
  "T’ T” T» V’ V” W’ Y’ L’ L” L» L* L™ P’ F’",
  "’T ’V ’W ’Y ‘A ’A “A ”A",
  "Ť’ Ľ’ ľ’ ď’ ť’ ďľ ľľ ľk ľb ľh ďk ďl ďb ďh ťť",
  "Tï Tî Tì Tí Tő Tö Tü Tÿ Vï Vî Vì Wï Wî Yï Yî Pï Fï Kï",
  "TÁ ÁT VÁ ÁV ÅV VÅ LŤ ĽT ĽV ĽY ŤA ŤO ÝA AÝ",
  "(T) (V) (W) (Y) (J) (Q) [T] [V] {Y} /A/ /V/",
  "«A» «T» «V» «Y» «J» ‹A› ‹T› “A” “T” “V” ‘A’ ‘T’",
  "A. A, T. T, V. V, W. W, Y. Y, F. F, P. P, L. L,",
  "r. r, v. v, w. w, y. y, f. f, k. k, t. t,",
  "1. 4. 7. 1, 4, 7, 7: 1% 7% 4% 1° 7° (1) (7) [1] [7]",
  "-T- -V- -Y- -A- -1- -7- -j- -f- -y- -v-",
  "T-T V-V Y-Y A-A L-L r-r f-f y-y",
  "ŀl Ŀl Łł Đđ Ħħ Ĳ ĳ Ǆ ǆ",
];

const ITALIAN_APOSTROPHES = [
  "L’ALBA L’ORA L’UOVO L’ITALIA L’EROE L’YACHT L’HOTEL",
  "D’ACCORDO D’ORO D’ESTATE DELL’ANNO NELL’ISOLA ALL’ALBA",
  "l’alba l’ora l’uovo l’isola l’eroe l’yacht l’hotel",
  "dell’anno nell’isola all’alba sull’erba un’ora quest’estate",
  "po’ c’è c’era d’oro d’accordo dov’è com’è cos’è",
  "E’ È’ PO’ C’È L’È",
];

const ITALIAN_WORDS = [
  "AVVOCATO TAVOLA VOLTA LAVATRICE ATTIVITÀ TRATTATIVA",
  "ACQUA AVVENTURA FATTORIA PIAVE VALTELLINA RAVENNA",
  "TATUAGGIO YACHT WAFER VOTAVA AVVIATA LETTERA",
  "PERCHÉ È COSÌ CITTÀ VIRTÙ PIÙ GIÀ PERÒ",
  "avvocato tavola volta attraverso affettato ferrovia",
  "ottavo avventura kayak yogurt whisky fiaba fiordo",
  "effetto rivoltella vertice vivevano tettoia frattaglie",
  "perché è così città virtù più già però",
  "Tavola Volta Avvocato Yacht Fattoria Pavia Treviso Vasto",
  "Quel vituperabile xenofobo zelante assaggia il whisky ed esclama: alleluja!",
  "QUEL VITUPERABILE XENOFOBO ZELANTE ASSAGGIA IL WHISKY ED ESCLAMA: ALLELUJA!",
  "Ma la volpe, col suo balzo, ha raggiunto il quieto Fido.",
];

const OTHER_LANGUAGES = [
  "AVATAR AWAY LAWYER TYPOGRAPHY VOYAGE WAVY YAWN TAWNY AWKWARD",
  "every avoid away kayak voyage wavy yolk lofty attic",
  "The quick brown fox jumps over the lazy dog.",
  "Sphinx of black quartz, judge my vow.",
  "L’ÉTÉ D’ŒUVRE À L’ÉCOLE ÇA VA «QU’Y A-T-IL ?»",
  "l’été c’était l’œil «Où vas-tu ?» Ça va.",
  "VÖLKER WÜRZBURG TÄTER ÄRA GRÖSSE Füße Ärger Övelgönne",
  "¿QUÉ? ¡VAYA! AÑO ¿Ya? ¡Ay! año señor",
  "AÇÃO VOVÔ VOCÊ ação vovô você",
  "ŁÓDŹ ŻÓŁW ŚWIAT Łódź żółw świat",
  "ŤAVA ĽAVÝ Ľudovít ďakujem Ťuk ľúbiť",
  "ȘTIINȚĂ ȚARĂ știință țară",
  "İSTANBUL ŞİŞLİ İstanbul Şişli",
  "IJSSEL ĲSSEL ijs ĳs",
  "TŐKE ŐRÜLT Győr tőke",
];

const NUMBERS_TEXT = [
  "1.000,00 € · € 7,77 · $ 1.474 · £ 41",
  "17:41 · 07/11/2026 · 1–7 · 4–7",
  "(1) (4) (7) [1] [7] 1/4 3/4 7/8",
  "+1 −7 ±4 41% 74‰ 1° 7° 4°",
  "1º 1ª 2° 4° 7°",
  "11 17 71 77 14 41 47 74",
];

// ---------------------------------------------------------------------------
// Utilità
// ---------------------------------------------------------------------------

const MARKS_NOT_ABOVE = new Set([
  0x0316, 0x0317, 0x0318, 0x0319, 0x031b, 0x031c, 0x031d, 0x031e, 0x031f, 0x0320, 0x0321,
  0x0322, 0x0323, 0x0324, 0x0325, 0x0326, 0x0327, 0x0328, 0x0329, 0x032a, 0x032b, 0x032c,
  0x032d, 0x032e, 0x032f, 0x0330, 0x0331, 0x0332, 0x0333, 0x0334, 0x0335, 0x0336, 0x0337,
  0x0338, 0x0339, 0x033a, 0x033b, 0x033c, 0x0345, 0x0347, 0x0348, 0x0349, 0x034d, 0x034e,
  0x0353, 0x0354, 0x0355, 0x0356, 0x0359, 0x035a,
]);

function isMarkAbove(codePoint) {
  return codePoint >= 0x0300 && codePoint <= 0x036f && !MARKS_NOT_ABOVE.has(codePoint);
}

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // spazio del browser non disponibile: pazienza
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// ---------------------------------------------------------------------------
// Il font: caratteri → glifi, gruppi di kerning
// ---------------------------------------------------------------------------

class FontView {
  constructor(fontController, kerningController) {
    this.fc = fontController;
    this.kc = kerningController;
    this.missing = new Set(); // caratteri delle liste che il font non ha
  }

  glyphForChar(char) {
    const codePoint = char.codePointAt(0);
    const name = this.fc.characterMap?.[codePoint];
    if (name && name in this.fc.glyphMap) return name;
    this.missing.add(char);
    return null;
  }

  has(name) {
    return !!name && name in this.fc.glyphMap;
  }

  charForGlyph(name) {
    const codePoint = this.fc.glyphMap[name]?.[0];
    return codePoint !== undefined ? String.fromCodePoint(codePoint) : null;
  }

  label(name) {
    return this.charForGlyph(name) ?? `/${name}`;
  }

  // "maiuscola", "minuscola", "cifra" o "altro"
  kind(name) {
    const char = this.charForGlyph(name);
    if (!char) {
      const base = name.split(".")[0];
      const baseChar = this.charForGlyph(base);
      return baseChar ? this.kindOfChar(baseChar) : "other";
    }
    return this.kindOfChar(char);
  }

  kindOfChar(char) {
    if (/\p{Lu}/u.test(char)) return "upper";
    if (/\p{Ll}/u.test(char)) return "lower";
    if (/\p{Nd}/u.test(char)) return "digit";
    return "other";
  }

  leftKey(name) {
    const group = this.kc?.leftPairGroupMapping?.[name];
    return group ? `@${group}` : name;
  }

  rightKey(name) {
    const group = this.kc?.rightPairGroupMapping?.[name];
    return group ? `@${group}` : name;
  }

  // Testo → nomi di glifo. "/nome" indica un glifo per nome. null se manca qualcosa.
  tokenize(text) {
    const names = [];
    const chars = [...text];
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (char === "/" && i + 1 < chars.length && /[A-Za-z0-9_.]/.test(chars[i + 1])) {
        let name = "";
        while (i + 1 < chars.length && /[A-Za-z0-9_.\-]/.test(chars[i + 1])) name += chars[++i];
        if (!this.has(name)) return null;
        names.push(name);
        continue;
      }
      const name = this.glyphForChar(char);
      if (!name) {
        // continua a cercare: così tutti i caratteri mancanti finiscono nella nota
        names.length = 0;
        names.missingFound = true;
        continue;
      }
      if (!names.missingFound) names.push(name);
    }
    return names.missingFound ? null : names;
  }

  // Lettere accentate del font. where: "above" = solo con segni in alto,
  // base: solo quelle di queste lettere (es. "ij")
  accented(kind, { where = null, base = null } = {}) {
    const result = [];
    for (const [name, codePoints] of Object.entries(this.fc.glyphMap)) {
      const codePoint = codePoints?.[0];
      if (codePoint === undefined) continue;
      const char = String.fromCodePoint(codePoint);
      const parts = [...char.normalize("NFD")];
      if (parts.length < 2 || !/\p{L}/u.test(parts[0])) continue;
      if (base && !base.includes(parts[0])) continue;
      if (where === "above" && !parts.slice(1).some((m) => isMarkAbove(m.codePointAt(0)))) continue;
      if (this.kindOfChar(char) === kind) result.push({ name, codePoint });
    }
    return result.sort((a, b) => a.codePoint - b.codePoint).map((g) => g.name);
  }

  alternates() {
    const result = [];
    for (const name of Object.keys(this.fc.glyphMap)) {
      const dot = name.indexOf(".", 1);
      if (dot < 0) continue;
      const base = name.slice(0, dot);
      if (/comb$/.test(base) || name.endsWith(".case") || !this.has(base)) continue;
      const kind = this.kind(base);
      if (kind === "other") continue;
      result.push(name);
    }
    return result.sort();
  }
}

// ---------------------------------------------------------------------------
// Costruzione delle liste
// ---------------------------------------------------------------------------

// Coppie da due elenchi di caratteri (o nomi). dedupe: una per coppia di gruppi.
function pairsFrom(view, lefts, rights, { dedupe = true, names = false } = {}) {
  const items = [];
  const seen = new Set();
  let hidden = 0;
  for (const l of lefts) {
    const left = names ? (view.has(l) ? l : null) : view.glyphForChar(l);
    for (const r of rights) {
      const right = names ? (view.has(r) ? r : null) : view.glyphForChar(r);
      if (!left || !right) {
        hidden++;
        continue;
      }
      const key = dedupe ? `${view.leftKey(left)} ${view.rightKey(right)}` : `${left} ${right}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ type: "pair", left, right });
    }
  }
  return { items, hidden };
}

function pairsFromStrings(view, pairStrings) {
  const items = [];
  const seen = new Set();
  let hidden = 0;
  for (const text of pairStrings) {
    const chars = [...text];
    if (chars.length !== 2) continue;
    const left = view.glyphForChar(chars[0]);
    const right = view.glyphForChar(chars[1]);
    if (!left || !right) {
      hidden++;
      continue;
    }
    const key = `${left} ${right}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ type: "pair", left, right });
  }
  return { items, hidden };
}

// I testi lunghi diventano più righe, una per gruppo di parole (· o spazio doppio)
function textsFrom(view, texts) {
  const items = [];
  let hidden = 0;
  for (const text of texts) {
    // Ogni parola separata da spazio è un "pezzo": si mostrano i pezzi che il font ha
    const glyphs = view.tokenize(text);
    if (glyphs) {
      items.push({ type: "text", text, glyphs });
      continue;
    }
    // Si tengono le parole che il font sa scrivere
    const pieces = text.split(" ").filter((piece) => piece && view.tokenize(piece));
    const joined = pieces.join(" ");
    const joinedGlyphs = pieces.length ? view.tokenize(joined) : null;
    if (joinedGlyphs) {
      items.push({ type: "text", text: joined, glyphs: joinedGlyphs });
    } else {
      // manca anche lo spazio: una riga per parola
      for (const piece of pieces) items.push({ type: "text", text: piece, glyphs: view.tokenize(piece) });
    }
    hidden++;
  }
  return { items, hidden };
}

function merge(...results) {
  return {
    items: results.flatMap((r) => r.items),
    hidden: results.reduce((n, r) => n + r.hidden, 0),
  };
}

function ucLcClassic() {
  const result = [];
  for (const [left, rights] of UC_LC_RULES) {
    for (const right of words(rights)) result.push(left + right);
  }
  return result;
}

const LIST_DEFINITIONS = [
  {
    category: "Spaziatura",
    lists: [
      {
        id: "spacing-uc",
        title: "Maiuscole (HH·HOHO·OO)",
        build: (v) => textsFrom(v, UC.map((c) => `HH${c}HOHO${c}OO`)),
      },
      {
        id: "spacing-lc",
        title: "Minuscole (nn·nono·oo)",
        build: (v) => textsFrom(v, LC.map((c) => `nn${c}nono${c}oo`)),
      },
      {
        id: "spacing-digits",
        title: "Numeri (00·0101·11)",
        build: (v) => textsFrom(v, DIGITS.map((c) => `00${c}0101${c}11`)),
      },
      {
        id: "spacing-punct",
        title: "Punteggiatura",
        build: (v) => textsFrom(v, [...new Set([...PUNCT_AFTER, ...PUNCT_BEFORE])].map((c) => `HH${c}HH nn${c}nn`)),
      },
      { id: "spacing-extra", title: "Parole di controllo", build: (v) => textsFrom(v, SPACING_EXTRA) },
    ],
  },
  {
    category: "Maiuscole",
    lists: [
      { id: "uc-classic", title: "Coppie classiche", build: (v) => pairsFromStrings(v, UC_CLASSIC) },
      { id: "uc-all", title: "Tutte le coppie (una per gruppo)", build: (v) => pairsFrom(v, UC, UC) },
      { id: "uc-combos", title: "Combinazioni", build: (v) => textsFrom(v, COMBINATIONS_UC) },
    ],
  },
  {
    category: "Maiuscola + minuscola",
    lists: [
      { id: "ul-classic", title: "Coppie classiche", build: (v) => pairsFromStrings(v, ucLcClassic()) },
      { id: "ul-all", title: "Tutte le coppie (una per gruppo)", build: (v) => pairsFrom(v, UC, LC) },
      { id: "lu-all", title: "Minuscola + maiuscola (una per gruppo)", build: (v) => pairsFrom(v, LC, UC) },
    ],
  },
  {
    category: "Minuscole",
    lists: [
      { id: "lc-classic", title: "Coppie classiche", build: (v) => pairsFromStrings(v, LC_CLASSIC) },
      { id: "lc-all", title: "Tutte le coppie (una per gruppo)", build: (v) => pairsFrom(v, LC, LC) },
    ],
  },
  {
    category: "Numeri",
    lists: [
      { id: "num-all", title: "Tutte le coppie di cifre", build: (v) => pairsFrom(v, DIGITS, DIGITS) },
      {
        id: "num-punct",
        title: "Cifre e punteggiatura",
        build: (v) =>
          merge(
            pairsFrom(v, DIGITS, [..." .,:;%‰°′″)]–-/".replace(" ", "")]),
            pairsFrom(v, [..."([$€£¥#+−±×=<>–-/"], DIGITS)
          ),
      },
      {
        id: "num-letters",
        title: "Cifre e lettere",
        build: (v) =>
          merge(
            pairsFrom(v, DIGITS, [..."ATVWYJLaovxy"]),
            pairsFrom(v, [..."ATVWYLFPaorvxy"], DIGITS)
          ),
      },
      { id: "num-text", title: "Prezzi, date e orari", build: (v) => textsFrom(v, NUMBERS_TEXT) },
    ],
  },
  {
    category: "Punteggiatura e virgolette",
    lists: [
      { id: "p-uc-after", title: "Maiuscola + punteggiatura", build: (v) => pairsFrom(v, UC, PUNCT_AFTER) },
      { id: "p-uc-before", title: "Punteggiatura + maiuscola", build: (v) => pairsFrom(v, PUNCT_BEFORE, UC) },
      { id: "p-lc-after", title: "Minuscola + punteggiatura", build: (v) => pairsFrom(v, LC, PUNCT_AFTER) },
      { id: "p-lc-before", title: "Punteggiatura + minuscola", build: (v) => pairsFrom(v, PUNCT_BEFORE, LC) },
      {
        id: "p-quotes",
        title: "Virgolette e apostrofi",
        build: (v) =>
          merge(
            pairsFrom(v, [...UC, ...LC], QUOTES_AFTER),
            pairsFrom(v, QUOTES_BEFORE, [...UC, ...LC]),
            pairsFrom(v, [..."’”»"], [..."’”»."]),
            pairsFrom(v, [..."«“‘"], [..."«“‘"])
          ),
      },
    ],
  },
  {
    category: "Parentesi, trattini e barre",
    lists: [
      {
        id: "b-brackets",
        title: "Parentesi",
        build: (v) =>
          merge(
            pairsFrom(v, [..."([{"], [...UC, ...LC, ...DIGITS]),
            pairsFrom(v, [...UC, ...LC, ...DIGITS], [...")]}"])
          ),
      },
      {
        id: "b-dashes",
        title: "Trattini",
        build: (v) =>
          merge(pairsFrom(v, DASHES, [...UC, ...LC, ...DIGITS]), pairsFrom(v, [...UC, ...LC, ...DIGITS], DASHES)),
      },
      {
        id: "b-slash",
        title: "Barre, & e simboli",
        build: (v) =>
          merge(
            pairsFrom(v, [..."/\\&@#*•·§¶+"], [...UC, ...LC]),
            pairsFrom(v, [...UC, ...LC], [..."/\\&@#*•·®™"])
          ),
      },
    ],
  },
  {
    category: "Accentate e casi limite",
    lists: [
      {
        // Qui niente "una per gruppo": si cercano proprio le accentate per cui il
        // valore del gruppo non va bene (l'accento urta la lettera accanto).
        id: "a-uc",
        title: "Maiuscole accentate accanto a T V W Y",
        build: (v) => {
          const acc = v.accented("upper", { where: "above" });
          const overhangs = [..."TVWY"].map((c) => v.glyphForChar(c)).filter(Boolean);
          return merge(
            pairsFrom(v, overhangs, acc, { names: true, dedupe: false }),
            pairsFrom(v, acc, overhangs, { names: true, dedupe: false })
          );
        },
      },
      {
        id: "a-uc-lc",
        title: "T V W Y F P + minuscola accentata",
        build: (v) => {
          const lefts = [..."TVWYFP"].map((c) => v.glyphForChar(c)).filter(Boolean);
          return pairsFrom(v, lefts, v.accented("lower", { where: "above" }), { names: true, dedupe: false });
        },
      },
      {
        id: "a-lc",
        title: "Minuscole accentate (f, ascendenti, virgolette)",
        build: (v) => {
          const above = v.accented("lower", { where: "above" });
          const iFamily = v.accented("lower", { where: "above", base: "ij" });
          const others = above.filter((n) => !iFamily.includes(n));
          const f = [..."f"].map((c) => v.glyphForChar(c)).filter(Boolean);
          const tall = [..."lkbhdft’”)?!"].map((c) => v.glyphForChar(c)).filter(Boolean);
          const closing = [..."’”)"].map((c) => v.glyphForChar(c)).filter(Boolean);
          return merge(
            pairsFrom(v, f, above, { names: true, dedupe: false }),
            pairsFrom(v, iFamily, tall, { names: true, dedupe: false }),
            pairsFrom(v, tall.filter((n) => /^[lkbhd]$/.test(n)), iFamily, { names: true, dedupe: false }),
            pairsFrom(v, others, closing, { names: true, dedupe: false })
          );
        },
      },
      {
        id: "a-caron",
        title: "ď ľ ť Ľ con tutto",
        build: (v) => {
          const carons = [..."ďľťĽ"].map((c) => v.glyphForChar(c)).filter(Boolean);
          const rights = [...LC, ...UC, ..."’”)]}?!.,:;-"].map((c) => v.glyphForChar(c)).filter(Boolean);
          return pairsFrom(v, carons, rights, { names: true });
        },
      },
      { id: "a-extreme", title: "Casi estremi", build: (v) => textsFrom(v, EXTREME) },
    ],
  },
  {
    category: "Italiano",
    lists: [
      { id: "it-apostrophes", title: "Apostrofi", build: (v) => textsFrom(v, ITALIAN_APOSTROPHES) },
      { id: "it-words", title: "Parole e frasi", build: (v) => textsFrom(v, ITALIAN_WORDS) },
    ],
  },
  {
    category: "Altre lingue",
    lists: [{ id: "other-languages", title: "Inglese, francese, tedesco, …", build: (v) => textsFrom(v, OTHER_LANGUAGES) }],
  },
  {
    category: "Alternative del font",
    lists: [
      {
        id: "alternates",
        title: "Alternative (.ss01, .alt, …)",
        build: (v) => {
          const result = { items: [], hidden: 0 };
          for (const alt of v.alternates()) {
            const kind = v.kind(alt);
            const partners =
              kind === "upper" ? [..."HOATVWYL.,’"] : kind === "lower" ? [..."noaevwyfrt.,’"] : [..."0147.,"];
            const names = partners.map((c) => v.glyphForChar(c)).filter(Boolean);
            const r = merge(pairsFrom(v, [alt], names, { names: true }), pairsFrom(v, names, [alt], { names: true }));
            result.items.push(...r.items);
          }
          return result;
        },
      },
    ],
  },
  {
    category: "Una lettera",
    lists: [{ id: "one-letter", title: "Tutte le coppie di una lettera", special: "letter" }],
  },
  {
    category: "Testi miei",
    lists: [{ id: "mine", title: "I miei testi", special: "mine" }],
  },
];

function buildLetterList(view, letter, side) {
  let name = null;
  if (letter.startsWith("/")) name = view.has(letter.slice(1)) ? letter.slice(1) : null;
  else if (letter) name = view.glyphForChar([...letter][0]);
  if (!name) return { items: [], hidden: 0 };
  const partners = [...UC, ...LC, ...DIGITS, ...new Set([...PUNCT_AFTER, ...PUNCT_BEFORE])]
    .map((c) => view.glyphForChar(c))
    .filter(Boolean);
  const results = [];
  if (side !== "left") results.push(pairsFrom(view, [name], partners, { names: true }));
  if (side !== "right") results.push(pairsFrom(view, partners, [name], { names: true }));
  return merge(...results);
}

// ---------------------------------------------------------------------------
// Pannello
// ---------------------------------------------------------------------------

const CONTEXTS = {
  straight: { label: "HH  nn  11", upper: "HH", lower: "nn", digit: "11" },
  round: { label: "OO  oo  00", upper: "OO", lower: "oo", digit: "00" },
  mixed: { label: "HO  no  10", upper: ["HO", "OH"], lower: ["no", "on"], digit: ["10", "01"] },
  none: { label: "nessuno", upper: "", lower: "", digit: "" },
};

const CSS = `
  :host { all: initial; }
  .panel {
    position: fixed; z-index: 30; width: 330px;
    font-family: fontra-ui-regular, -apple-system, system-ui, sans-serif; font-size: 12px;
    color: var(--ui-element-foreground-color, #222);
    background: var(--ui-element-background-color, #fff);
    border-radius: 10px; box-shadow: 0 4px 18px #0003, 0 0 0 0.5px #0003;
    display: flex; flex-direction: column; max-height: calc(100vh - 120px);
  }
  .header { display: flex; align-items: center; gap: 6px; padding: 6px 8px 4px; cursor: grab; user-select: none; }
  .header:active { cursor: grabbing; }
  .header .title { flex: 1; font-weight: bold; font-size: 12.5px; }
  .header button { border: none; background: transparent; color: inherit; cursor: pointer; font-size: 14px; opacity: 0.6; padding: 0 4px; }
  .header button:hover { opacity: 1; }
  .body { display: flex; flex-direction: column; gap: 6px; padding: 0 8px 8px; min-height: 0; }
  .row { display: flex; gap: 6px; align-items: center; }
  .row > * { min-width: 0; }
  select, input, textarea, .button {
    font: inherit; color: inherit; border-radius: 5px; border: 1px solid #8884;
    background: var(--text-input-background-color, #f2f2f2); padding: 3px 5px; box-sizing: border-box;
  }
  select { flex: 1; }
  .label { opacity: 0.6; white-space: nowrap; }
  .button { cursor: pointer; background: transparent; white-space: nowrap; }
  .button:hover { background: #8882; }
  .button.primary { background: #3b82f6; border-color: #3b82f6; color: #fff; }
  textarea { width: 100%; min-height: 54px; resize: vertical; }
  .list {
    overflow: auto; min-height: 80px; max-height: 34vh; border-radius: 6px;
    border: 1px solid #8883; padding: 2px 0; font-size: 13px;
  }
  .item { display: flex; gap: 6px; padding: 2px 8px; cursor: pointer; white-space: pre; overflow: hidden; text-overflow: ellipsis; }
  .item:hover { background: #8881; }
  .item.current { background: #3b82f633; }
  .item .check { width: 10px; color: #16a34a; flex: none; }
  .item .text { overflow: hidden; text-overflow: ellipsis; }
  .item .delete { margin-left: auto; opacity: 0.4; }
  .item .delete:hover { opacity: 1; }
  .empty { padding: 8px; opacity: 0.6; white-space: normal; }
  .info {
    border-radius: 6px; background: #8881; padding: 6px 8px; line-height: 1.45; min-height: 3em;
  }
  .info b { font-size: 13px; }
  .info .value { font-variant-numeric: tabular-nums; }
  .info .muted, .hint { opacity: 0.6; font-size: 11px; }
  .counter { margin-left: auto; opacity: 0.7; font-variant-numeric: tabular-nums; }
  .mgrid { border-collapse: collapse; margin-top: 4px; font-variant-numeric: tabular-nums; font-size: 11.5px; }
  .mgrid th { font-weight: normal; opacity: 0.55; padding: 1px 5px; text-align: right; }
  .mgrid td { padding: 1px 5px; text-align: right; border-radius: 4px; }
  .mgrid td.zero { opacity: 0.4; }
  .mgrid td.target { background: #3b82f622; }
  .mgrid td.current { outline: 1.5px solid #3b82f6; font-weight: bold; }
  .small { font-size: 11px; padding: 2px 6px; }
  [hidden] { display: none !important; }
`;

class KerningTextsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="panel">
        <div class="header">
          <span class="title">Testi di kerning</span>
          <button id="close" title="Chiudi (⌥⌘K)">×</button>
        </div>
        <div class="body">
          <div class="row"><select id="category"></select></div>
          <div class="row"><select id="list"></select></div>
          <div class="row" id="letter-row" hidden>
            <input id="letter" placeholder="Lettera, es. T o /a.ss01" style="flex:1" />
            <select id="side" style="flex:none; width: 110px">
              <option value="both">tutti e due i lati</option>
              <option value="right">a destra (T·)</option>
              <option value="left">a sinistra (·T)</option>
            </select>
          </div>
          <div id="mine-row" hidden>
            <textarea id="mine-text" placeholder="Un testo per riga. Usa /nome per un glifo senza Unicode, es. /a.ss01"></textarea>
            <div class="row"><button class="button" id="mine-add">Aggiungi</button></div>
          </div>
          <div class="row">
            <span class="label">Contesto</span><select id="context"></select>
            <span class="label">Per volta</span>
            <select id="per-page" style="flex:none; width:56px"><option>1</option><option>10</option><option>30</option></select>
          </div>
          <div class="row">
            <span class="label">Master</span>
            <select id="master-mode" title="Dove vanno le modifiche fatte con ← →"></select>
          </div>
          <div class="list" id="items"></div>
          <div class="row">
            <button class="button" id="prev" title="Coppia precedente (↑)">↑ Prec.</button>
            <button class="button primary" id="next" title="Coppia successiva (↓)">↓ Succ.</button>
            <button class="button" id="resume" title="Vai alla prima coppia non ancora vista">Riprendi</button>
            <span class="counter" id="counter"></span>
          </div>
          <div class="info" id="info"></div>
          <div class="row">
            <span class="label">Master intermedi</span>
            <button class="button small" id="interp-pair" title="Calcola dagli angoli i master intermedi di questa coppia (prima vedi cosa cambia)">Questa coppia</button>
            <button class="button small" id="interp-all" title="Calcola dagli angoli i master intermedi di tutte le coppie (prima vedi cosa cambia)">Tutto il font…</button>
          </div>
          <div class="row hint">
            <span>← → regolano (⇧ ×10, ⌥ ×5) nei master scelti sopra · ↑ ↓ coppia · tasto destro sulla coppia: eccezione</span>
          </div>
          <div class="row hint">
            <span id="hidden-note" style="flex:1"></span>
            <button class="button small" id="check" title="Eccezioni, valori senza gruppo, master vuoti">Controlla kerning…</button>
            <button class="button small" id="reset-done" title="Togli le spunte da questa lista, nel master in cui sei">Azzera spunte</button>
          </div>
        </div>
      </div>`;
    this.$ = (sel) => this.shadowRoot.querySelector(sel);
  }
}
if (!customElements.get(TAG)) customElements.define(TAG, KerningTextsPanel);

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

class KerningTextsPlugin {
  constructor(editor) {
    this.editor = editor;
    this.fc = editor.fontController;
    this.sc = editor.sceneController;
    MetricsKeysEngine.install(this.fc);
    this.settings = {
      open: false, category: "Maiuscole", list: "uc-classic", context: "straight",
      perPage: 1, x: null, y: null, letter: "T", side: "both", current: {}, masterMode: "this",
      ...loadJSON(SETTINGS_KEY, {}),
    };
    this.items = [];
    this.hidden = 0;
    this.current = 0;
    this.project = new URL(window.location.href).searchParams.get("project") || "";
    this.done = loadJSON(`${DONE_KEY}:${this.project}`, {});

    this.panel = document.createElement(TAG);
    this.panel.hidden = true;
    document.body.appendChild(this.panel);
    this.setupPanel();
    this.installMenu();
    this.installKeys();
    this.linkOverviewWindows();

    this.fc.getKerningController("kern").then(
      (kc) => {
        this.kc = kc;
        if (this.settings.open) this.open();
      },
      () => {}
    );
    this.fc.addChangeListener({ kerning: null }, () => this.scheduleInfo(), false);
    this.fc.addChangeListener({ glyphMap: null }, () => {
      if (!this.panel.hidden) this.rebuild();
    }, false);
    // Master aggiunti o tolti: si ricalcola la griglia
    this.fc.addChangeListener({ sources: null }, () => this.loadGrid(), false);
    this.fc.addChangeListener({ kerning: null }, (change) => {
      if (JSON.stringify(change || {}).includes("sourceIdentifiers")) this.loadGrid();
    }, false);
    // Cambiando master le spunte e la griglia dei valori seguono
    try {
      this.editor.sceneSettingsController?.addKeyListener?.("fontLocationSourceMapped", () => {
        if (this.panel.hidden) return;
        this.renderList();
        this.scheduleInfo();
      });
    } catch (error) {
      // ignora
    }
    this.wrapKerningTool();
  }

  // --- più master -----------------------------------------------------------------

  async loadGrid() {
    try {
      this.grid = await loadMasterGrid(this.fc);
    } catch (error) {
      console.warn("[Testi di kerning] Master:", error);
      this.grid = null;
    }
    this.fillMasterModes();
    if (!this.panel.hidden) this.renderList();
    this.scheduleInfo();
  }

  fillMasterModes() {
    const select = this.panel.$("#master-mode");
    select.innerHTML = "";
    const add = (value, text) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    };
    add("this", "Solo il master in cui sei");
    const axes = this.grid?.axes || [];
    if (this.grid && this.grid.masters.length > 1) {
      add("all", `Tutti i master (${this.grid.masters.filter((m) => m.inKerning).length})`);
      if (axes.length > 1) {
        for (const axis of axes) {
          const label = axisLabel(axis.name);
          const feminine = /a$|ione$|e ottica$/.test(label);
          add(`axis:${axis.name}`, `Stess${feminine ? "a" : "o"} ${label} del master in cui sei`);
        }
      }
    }
    if (![...select.options].some((o) => o.value === this.settings.masterMode)) this.settings.masterMode = "this";
    select.value = this.settings.masterMode;
  }

  currentLocation() {
    const location = { ...(this.sc.sceneSettings.fontLocationSourceMapped || {}) };
    for (const axis of this.grid?.axes || []) if (location[axis.name] === undefined) location[axis.name] = axis.def;
    return location;
  }

  currentSourceId() {
    try {
      return this.fc.fontSourcesInstancer.getSourceIdentifierForLocation(this.sc.sceneSettings.fontLocationSourceMapped || {}, false) || null;
    } catch (error) {
      return null;
    }
  }

  // I master a cui vanno le modifiche (null = solo quello in cui sei)
  targetSourceIds() {
    const mode = this.settings.masterMode || "this";
    if (mode === "this" || !this.grid) return null;
    const masters = this.grid.masters.filter((m) => m.inKerning);
    if (mode === "all") return masters.map((m) => m.id);
    if (mode.startsWith("axis:")) {
      const axisName = mode.slice(5);
      const value = this.currentLocation()[axisName];
      const ids = masters.filter((m) => m.location[axisName] === value).map((m) => m.id);
      return ids.length ? ids : null;
    }
    return null;
  }

  // ← → dello strumento Kerning: con "Tutti i master" (o una riga/colonna) lo
  // stesso spostamento va a ogni master scelto, in un solo passo di annullamento
  wrapKerningTool() {
    const tool = this.editor.tools?.[KERNING_TOOL];
    if (!tool || tool.__kerningTextsWrapped || typeof tool.handleArrowKeys !== "function") return;
    tool.__kerningTextsWrapped = true;
    const original = tool.handleArrowKeys.bind(tool);
    tool.handleArrowKeys = async (event) => {
      const targets = this.panel.hidden ? null : this.targetSourceIds();
      if (!targets || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return original(event);
      if (!tool.sceneSettings?.applyTextShaping || !tool.selectedHandles?.length) return original(event);
      try {
        await this.editInMasters(tool, event, targets);
      } catch (error) {
        console.error("[Testi di kerning] Kerning su più master:", error);
      }
    };
  }

  async editInMasters(tool, event, targets) {
    const kc = tool.kerningController || this.kc || (await this.fc.getKerningController("kern"));
    if (!kc) return;
    const delta = (event.key === "ArrowLeft" ? -1 : 1) * (tool.getStepValue?.(event) ?? (event.shiftKey ? 10 : event.altKey ? 5 : 1));
    const selectors = [];
    const newValues = [];
    const seen = new Set();
    for (const handle of tool.selectedHandles) {
      const { leftGlyph, rightGlyph } = tool.getGlyphNamesFromSelector(handle.selector);
      for (const sourceIdentifier of targets) {
        const { leftName, rightName } = kc.getPairNames(leftGlyph, rightGlyph, sourceIdentifier);
        const key = `${leftName} ${rightName} ${sourceIdentifier}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selectors.push({ leftName, rightName, sourceIdentifier });
        newValues.push((kc.getPairValueForSource(leftName, rightName, sourceIdentifier) || 0) + delta);
      }
    }
    if (!selectors.length) return;
    tool.updateScrollAdjustBehavior?.();
    const label = `kerning (${targets.length} master)`;
    const changes = await kc.getEditContext(selectors).edit(newValues, label, event);
    tool.pushUndoItem(changes, label);
    this.scheduleInfo();
  }

  // Modifiche della finestra "Controlla kerning" / "Master intermedi"
  async applyKerning(builder, label) {
    const { change, rollbackChange } = builder.build(label);
    await this.fc.applyChange(change);
    await this.fc.postChange(change, rollbackChange, label);
    try {
      this.kc?.clearCaches?.();
      this.editor.tools?.[KERNING_TOOL]?.pushUndoItem?.({ change, rollbackChange }, label);
    } catch (error) {
      // l'annullamento resta quello di Fontra
    }
    this.scheduleInfo();
  }

  openKerningDialog(mode, options = {}) {
    const dialog = new KerningToolsDialog({ fc: this.fc, apply: (builder, label) => this.applyKerning(builder, label) }, mode, options);
    dialog.open();
  }

  interpolateCurrentPair() {
    const item = this.items[this.current];
    if (!item || item.type !== "pair" || !this.kc) return;
    const { leftName, rightName } = this.kc.getPairNames(item.left, item.right);
    const exists = this.kc.getPairValues(leftName, rightName);
    const label = `${this.view.label(item.left)}${this.view.label(item.right)}`;
    this.openKerningDialog("interpolate", {
      pairs: exists ? [[leftName, rightName]] : [],
      title: `Master intermedi di ${label} (${leftName} ${rightName})`,
    });
  }

  get view() {
    return new FontView(this.fc, this.kc);
  }

  saveSettings() {
    saveJSON(SETTINGS_KEY, this.settings);
  }

  // --- apertura ----------------------------------------------------------------

  installMenu() {
    const original = this.editor.getViewMenuItems;
    if (typeof original !== "function") return;
    const plugin = this;
    this.editor.getViewMenuItems = (...args) => [
      ...(original.apply(this.editor, args) || []),
      { title: "-" },
      {
        title: "Testi di kerning  (⌥⌘K)",
        get checked() {
          return !plugin.panel.hidden;
        },
        enabled: () => true,
        callback: () => plugin.toggle(),
      },
    ];
  }

  installKeys() {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    window.addEventListener(
      "keydown",
      (event) => {
        const commandKey = isMac ? event.metaKey : event.ctrlKey;
        if (commandKey && event.altKey && event.code === "KeyK") {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.toggle();
          return;
        }
        if (this.panel.hidden || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        if (this.editor.selectedToolIdentifier !== KERNING_TOOL || isTyping()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.step(event.key === "ArrowDown" ? 1 : -1);
      },
      true
    );
  }

  toggle() {
    if (this.panel.hidden) this.open();
    else this.close();
  }

  open() {
    this.panel.hidden = false;
    this.settings.open = true;
    this.saveSettings();
    this.placePanel();
    this.fillCategories();
    this.rebuild();
    this.wrapKerningTool();
    this.loadGrid();
  }

  close() {
    this.panel.hidden = true;
    this.settings.open = false;
    this.saveSettings();
  }

  placePanel() {
    const box = this.panel.$(".panel");
    const x = this.settings.x ?? window.innerWidth - 330 - 64;
    const y = this.settings.y ?? 96;
    box.style.left = `${Math.max(0, Math.min(x, window.innerWidth - 120))}px`;
    box.style.top = `${Math.max(40, Math.min(y, window.innerHeight - 80))}px`;
  }

  // --- pannello ----------------------------------------------------------------

  setupPanel() {
    const $ = this.panel.$;
    // trascinare
    const header = $(".header");
    let start = null;
    header.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      const box = $(".panel").getBoundingClientRect();
      start = { x: event.clientX, y: event.clientY, left: box.left, top: box.top };
      header.setPointerCapture(event.pointerId);
    });
    header.addEventListener("pointermove", (event) => {
      if (!start) return;
      this.settings.x = start.left + event.clientX - start.x;
      this.settings.y = start.top + event.clientY - start.y;
      this.placePanel();
    });
    const end = () => {
      if (!start) return;
      start = null;
      this.saveSettings();
    };
    header.addEventListener("pointerup", end);
    header.addEventListener("pointercancel", end);
    $("#close").addEventListener("click", () => this.close());

    for (const [key, value] of Object.entries(CONTEXTS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value.label;
      $("#context").appendChild(option);
    }
    $("#context").value = this.settings.context;
    $("#per-page").value = String(this.settings.perPage);
    $("#letter").value = this.settings.letter;
    $("#side").value = this.settings.side;

    $("#category").addEventListener("change", () => {
      this.settings.category = $("#category").value;
      const definition = LIST_DEFINITIONS.find((d) => d.category === this.settings.category);
      this.settings.list = definition.lists[0].id;
      this.saveSettings();
      this.fillLists();
      this.rebuild();
    });
    $("#list").addEventListener("change", () => {
      this.settings.list = $("#list").value;
      this.saveSettings();
      this.rebuild();
    });
    $("#context").addEventListener("change", () => {
      this.settings.context = $("#context").value;
      this.saveSettings();
      this.show();
    });
    $("#per-page").addEventListener("change", () => {
      this.settings.perPage = parseInt($("#per-page").value, 10) || 1;
      this.saveSettings();
      this.show();
    });
    let letterTimer;
    $("#letter").addEventListener("input", () => {
      clearTimeout(letterTimer);
      letterTimer = setTimeout(() => {
        this.settings.letter = $("#letter").value.trim();
        this.saveSettings();
        this.rebuild();
      }, 300);
    });
    $("#side").addEventListener("change", () => {
      this.settings.side = $("#side").value;
      this.saveSettings();
      this.rebuild();
    });
    $("#mine-add").addEventListener("click", () => {
      const lines = $("#mine-text").value.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.length) return;
      saveJSON(MINE_KEY, [...loadJSON(MINE_KEY, []), ...lines]);
      $("#mine-text").value = "";
      this.rebuild();
    });
    for (const input of this.panel.shadowRoot.querySelectorAll("input, textarea")) {
      input.addEventListener("keydown", (event) => event.stopPropagation());
    }
    $("#prev").addEventListener("click", () => this.step(-1));
    $("#next").addEventListener("click", () => this.step(1));
    $("#resume").addEventListener("click", () => {
      const doneSet = this.doneSet();
      const index = this.items.findIndex((item) => !doneSet.has(itemKey(item)));
      this.select(index >= 0 ? index : 0);
    });
    $("#reset-done").addEventListener("click", () => {
      // Le spunte vecchie (di prima della 1.5) valevano per tutti i master:
      // restano agli altri master e si tolgono solo da questo
      const legacy = this.done[this.settings.list];
      if (legacy) {
        for (const master of this.grid?.masters || []) {
          const key = this.doneKey(master.id);
          this.done[key] = [...new Set([...(this.done[key] || []), ...legacy])];
        }
        delete this.done[this.settings.list];
      }
      delete this.done[this.doneKey(this.currentSourceId())];
      this.saveDone();
      this.renderList();
    });
    $("#master-mode").addEventListener("change", () => {
      this.settings.masterMode = $("#master-mode").value;
      this.saveSettings();
      this.scheduleInfo();
    });
    $("#interp-pair").addEventListener("click", () => this.interpolateCurrentPair());
    $("#interp-all").addEventListener("click", () => this.openKerningDialog("interpolate"));
    $("#check").addEventListener("click", () => this.openKerningDialog("check"));
  }

  fillCategories() {
    const select = this.panel.$("#category");
    select.innerHTML = "";
    for (const definition of LIST_DEFINITIONS) {
      const option = document.createElement("option");
      option.value = definition.category;
      option.textContent = definition.category;
      select.appendChild(option);
    }
    if (!LIST_DEFINITIONS.some((d) => d.category === this.settings.category)) {
      this.settings.category = LIST_DEFINITIONS[0].category;
    }
    select.value = this.settings.category;
    this.fillLists();
  }

  fillLists() {
    const definition = LIST_DEFINITIONS.find((d) => d.category === this.settings.category);
    const select = this.panel.$("#list");
    select.innerHTML = "";
    for (const list of definition.lists) {
      const option = document.createElement("option");
      option.value = list.id;
      option.textContent = list.title;
      select.appendChild(option);
    }
    if (!definition.lists.some((l) => l.id === this.settings.list)) this.settings.list = definition.lists[0].id;
    select.value = this.settings.list;
  }

  get listDefinition() {
    for (const definition of LIST_DEFINITIONS) {
      const list = definition.lists.find((l) => l.id === this.settings.list);
      if (list) return list;
    }
    return LIST_DEFINITIONS[0].lists[0];
  }

  rebuild() {
    if (this.panel.hidden) return;
    const list = this.listDefinition;
    const view = new FontView(this.fc, this.kc);
    this.panel.$("#letter-row").hidden = list.special !== "letter";
    this.panel.$("#mine-row").hidden = list.special !== "mine";
    let result;
    if (list.special === "letter") result = buildLetterList(view, this.settings.letter, this.settings.side);
    else if (list.special === "mine") result = textsFrom(view, loadJSON(MINE_KEY, []));
    else result = list.build(view);
    this.items = result.items;
    this.hidden = result.hidden;
    if (list.special === "mine") {
      // Ricorda la riga originale per poterla cancellare
      const mine = loadJSON(MINE_KEY, []);
      this.items.forEach((item) => (item.mineIndex = mine.indexOf(item.text)));
    }
    this.current = Math.min(this.settings.current[list.id] ?? 0, Math.max(0, this.items.length - 1));
    const note = this.panel.$("#hidden-note");
    const missing = [...view.missing].filter((c) => c.trim());
    note.textContent = missing.length
      ? `Mancano nel font, quindi saltati: ${missing.slice(0, 24).join(" ")}${missing.length > 24 ? " …" : ""}`
      : "";
    note.title = missing.join(" ");
    this.renderList();
    this.show();
  }

  // Le spunte valgono per master: "viste" nel Bold non vuol dire viste nel Light
  doneKey(sourceId) {
    return `${this.settings.list}|${sourceId || "?"}`;
  }

  doneSet() {
    return new Set([...(this.done[this.settings.list] || []), ...(this.done[this.doneKey(this.currentSourceId())] || [])]);
  }

  saveDone() {
    saveJSON(`${DONE_KEY}:${this.project}`, this.done);
  }

  markDone(item) {
    if (!item) return;
    const key = itemKey(item);
    let changed = false;
    for (const sourceId of this.targetSourceIds() || [this.currentSourceId()]) {
      const doneKey = this.doneKey(sourceId);
      const list = this.done[doneKey] || (this.done[doneKey] = []);
      if (!list.includes(key)) {
        list.push(key);
        changed = true;
      }
    }
    if (changed) this.saveDone();
  }

  itemLabel(item) {
    const view = this.view;
    if (item.type === "pair") return `${view.label(item.left)}${view.label(item.right)}`;
    return item.text;
  }

  renderList() {
    const container = this.panel.$("#items");
    container.innerHTML = "";
    if (!this.items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent =
        this.listDefinition.special === "mine"
          ? "Scrivi qui sopra i tuoi testi e premi Aggiungi."
          : this.listDefinition.special === "letter"
            ? "Scrivi una lettera che il font ha (o /nome del glifo)."
            : "Niente da mostrare: nel font mancano i glifi di questa lista.";
      container.appendChild(empty);
      this.updateCounter();
      return;
    }
    const doneSet = this.doneSet();
    const fragment = document.createDocumentFragment();
    this.items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "item" + (index === this.current ? " current" : "");
      row.innerHTML = `<span class="check">${doneSet.has(itemKey(item)) ? "✓" : ""}</span><span class="text">${escapeHTML(this.itemLabel(item))}</span>`;
      if (item.mineIndex >= 0 && this.listDefinition.special === "mine") {
        const del = document.createElement("span");
        del.className = "delete";
        del.textContent = "×";
        del.title = "Elimina questo testo";
        del.addEventListener("click", (event) => {
          event.stopPropagation();
          const mine = loadJSON(MINE_KEY, []);
          mine.splice(item.mineIndex, 1);
          saveJSON(MINE_KEY, mine);
          this.rebuild();
        });
        row.appendChild(del);
      }
      row.addEventListener("click", () => this.select(index));
      fragment.appendChild(row);
    });
    container.appendChild(fragment);
    this.scrollCurrentIntoView();
    this.updateCounter();
  }

  scrollCurrentIntoView() {
    const row = this.panel.$("#items").children[this.current];
    row?.scrollIntoView({ block: "nearest" });
  }

  updateCounter() {
    const doneSet = this.doneSet();
    const done = this.items.filter((item) => doneSet.has(itemKey(item))).length;
    const sourceId = this.currentSourceId();
    const master = this.grid?.masters.find((m) => m.id === sourceId);
    this.panel.$("#counter").textContent = this.items.length
      ? `${this.current + 1} / ${this.items.length} · viste ${done}${master ? ` (${master.short})` : ""}`
      : "";
    this.panel.$("#counter").title = master ? `Coppie viste nel master ${master.name}` : "";
  }

  step(direction) {
    if (!this.items.length) return;
    this.markDone(this.items[this.current]);
    this.select(Math.max(0, Math.min(this.items.length - 1, this.current + direction)));
  }

  select(index) {
    if (index < 0 || index >= this.items.length) return;
    const previousPage = Math.floor(this.current / this.settings.perPage);
    this.current = index;
    this.settings.current[this.settings.list] = index;
    this.saveSettings();
    const rows = this.panel.$("#items").children;
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("current", i === index);
    if (rows[index]) {
      const doneSet = this.doneSet();
      for (let i = 0; i < rows.length; i++) {
        const check = rows[i].querySelector(".check");
        if (check) check.textContent = doneSet.has(itemKey(this.items[i])) ? "✓" : "";
      }
    }
    this.scrollCurrentIntoView();
    this.updateCounter();
    if (Math.floor(index / this.settings.perPage) !== previousPage) this.show();
    else this.selectInCanvas();
  }

  // --- canvas ------------------------------------------------------------------

  contextFor(name, side) {
    const style = CONTEXTS[this.settings.context] || CONTEXTS.straight;
    const kind = this.view.kind(name);
    const value = style[kind === "other" ? "upper" : kind];
    const text = Array.isArray(value) ? value[side === "left" ? 0 : 1] : value;
    const names = this.view.tokenize(text || "");
    return names || [];
  }

  // Le righe da mostrare: [{ glyphs, pairIndex }] (pairIndex = indice del glifo di destra)
  lineFor(item) {
    if (item.type === "text") return { glyphs: item.glyphs, pairIndex: item.glyphs.length > 1 ? 1 : null };
    const view = this.view;
    // Il contesto segue il tipo di lettera; per la punteggiatura quello della lettera accanto
    const leftKind = view.kind(item.left);
    const rightKind = view.kind(item.right);
    const leftContext = this.contextFor(leftKind === "other" && rightKind !== "other" ? item.right : item.left, "left");
    const rightContext = this.contextFor(rightKind === "other" && leftKind !== "other" ? item.left : item.right, "right");
    const glyphs = [...leftContext, item.left, item.right, ...rightContext];
    return { glyphs, pairIndex: leftContext.length + 1 };
  }

  glyphInfo(name) {
    const codePoint = this.fc.glyphMap[name]?.[0];
    return codePoint !== undefined
      ? { glyphName: name, character: String.fromCodePoint(codePoint) }
      : { glyphName: name };
  }

  async show() {
    if (this.panel.hidden || !this.items.length) {
      this.updateInfo();
      return;
    }
    const perPage = this.settings.perPage;
    const pageStart = Math.floor(this.current / perPage) * perPage;
    const pageItems = this.items.slice(pageStart, pageStart + perPage);
    this.lines = pageItems.map((item) => this.lineFor(item));
    this.pageStart = pageStart;
    const settings = this.sc.sceneSettings;
    if (settings.selectedGlyph) settings.selectedGlyph = undefined;
    // La vista si adatta al testo (anche se prima stavi modificando un glifo da vicino)
    this.sc.autoViewBox = true;
    const changed = Promise.race([
      this.editor.sceneSettingsController?.waitForKeyChange?.("positionedLines") ?? sleep(300),
      sleep(800),
    ]);
    settings.characterLines = this.lines.map((line) => line.glyphs.map((name) => this.glyphInfo(name)));
    await changed;
    await sleep(0);
    this.fitView();
    this.selectInCanvas();
  }

  // Inquadra il testo nella parte di canvas non coperta dal pannello
  fitView() {
    try {
      const bounds = this.sc.getSceneBounds?.();
      const canvas = this.editor.canvasController?.canvas;
      if (!bounds || !canvas) return;
      const width = bounds.xMax - bounds.xMin;
      const height = bounds.yMax - bounds.yMin;
      const margin = 0.1 * Math.max(width, height);
      const box = {
        xMin: bounds.xMin - margin,
        yMin: bounds.yMin - margin,
        xMax: bounds.xMax + margin,
        yMax: bounds.yMax + margin,
      };
      const canvasRect = canvas.getBoundingClientRect();
      const panelRect = this.panel.$(".panel").getBoundingClientRect();
      const overlaps = panelRect.right > canvasRect.left && panelRect.left < canvasRect.right;
      if (overlaps && canvasRect.width > 0) {
        const boxWidth = box.xMax - box.xMin;
        if (panelRect.left + panelRect.width / 2 > canvasRect.left + canvasRect.width / 2) {
          const free = (panelRect.left - canvasRect.left - 16) / canvasRect.width;
          if (free > 0.2) box.xMax = box.xMin + boxWidth / free;
        } else {
          const free = (canvasRect.right - panelRect.right - 16) / canvasRect.width;
          if (free > 0.2) box.xMin = box.xMax - boxWidth / free;
        }
      }
      this.sc.sceneSettings.viewBox = box;
      // Da qui in poi la vista resta ferma (anche mentre cambi il kerning)
      this.sc.autoViewBox = false;
    } catch (error) {
      // vista non adattabile: pazienza
    }
  }

  selectInCanvas() {
    const lineIndex = this.current - (this.pageStart ?? 0);
    const line = this.lines?.[lineIndex];
    if (this.editor.selectedToolIdentifier !== KERNING_TOOL) {
      try {
        this.editor.setSelectedTool(KERNING_TOOL, true);
      } catch (error) {
        console.warn("[Testi di kerning] Strumento Kerning non trovato:", error);
      }
    }
    const tool = this.editor.tools?.[KERNING_TOOL];
    if (tool && line && line.pairIndex !== null) {
      const positioned = this.sc.sceneSettings.positionedLines?.[lineIndex]?.glyphs || [];
      // L'indice del glifo nel testo (cluster) → l'indice del glifo disegnato
      let glyphIndex = positioned.findIndex((g) => g.cluster === line.pairIndex);
      if (glyphIndex < 1) glyphIndex = Math.min(line.pairIndex, positioned.length - 1);
      if (glyphIndex >= 1) {
        try {
          tool.metricSelection = [{ lineIndex, glyphIndex }];
        } catch (error) {
          console.warn("[Testi di kerning]", error);
        }
      }
    }
    this.editor.canvasController?.canvas?.focus();
    this.updateInfo();
  }

  // --- informazioni sulla coppia -------------------------------------------------

  scheduleInfo() {
    clearTimeout(this.infoTimer);
    this.infoTimer = setTimeout(() => this.updateInfo(), 60);
  }

  updateInfo() {
    const info = this.panel.$("#info");
    const item = this.items[this.current];
    if (!item) {
      info.innerHTML = `<span class="muted">Scegli una lista.</span>`;
      return;
    }
    if (item.type !== "pair") {
      info.innerHTML =
        `<b>${escapeHTML(item.text)}</b><br>` +
        `<span class="muted">Testo: con Tab passi da una coppia all'altra nello strumento Kerning.</span>`;
      return;
    }
    const view = this.view;
    const kc = this.kc;
    const { left, right } = item;
    const leftGroup = kc?.leftPairGroupMapping?.[left];
    const rightGroup = kc?.rightPairGroupMapping?.[right];
    let value = null;
    let pairNames = null;
    try {
      pairNames = kc?.getPairNames(left, right);
      value = kc?.getGlyphPairValue(left, right, this.sc.sceneSettings.fontLocationSourceMapped || {});
    } catch (error) {
      value = null;
    }
    const exists = pairNames && kc?.getPairValues(pairNames.leftName, pairNames.rightName);
    let kind;
    if (!exists) {
      kind = leftGroup || rightGroup ? "nessun kerning: verrà salvato tra i gruppi" : "nessun kerning";
    } else {
      const leftIsGroup = pairNames.leftName.startsWith("@");
      const rightIsGroup = pairNames.rightName.startsWith("@");
      // Eccezione = un glifo che ha un gruppo, ma qui è usato da solo
      const exception = (!leftIsGroup && leftGroup) || (!rightIsGroup && rightGroup);
      if (exception) kind = !leftIsGroup && !rightIsGroup ? "eccezione (solo questa coppia)" : "eccezione";
      else kind = leftIsGroup || rightIsGroup ? "tra i gruppi" : "tra i due glifi";
    }

    const groupText = `${leftGroup ? "@" + escapeHTML(leftGroup) : escapeHTML(left)} → ${rightGroup ? "@" + escapeHTML(rightGroup) : escapeHTML(right)}`;
    let coverage = "";
    const coversGroups = !exists ? leftGroup || rightGroup : pairNames.leftName.startsWith("@") || pairNames.rightName.startsWith("@");
    if (coversGroups) {
      const lefts = (exists ? pairNames.leftName.startsWith("@") : leftGroup) ? kc.kernData.groupsSide1[leftGroup] || [left] : [left];
      const rights = (exists ? pairNames.rightName.startsWith("@") : rightGroup) ? kc.kernData.groupsSide2[rightGroup] || [right] : [right];
      const total = lefts.length * rights.length;
      if (total > 1) {
        const examples = [];
        for (const l of lefts) {
          for (const r of rights) {
            if (l === left && r === right) continue;
            if (examples.length < 8) examples.push(view.label(l) + view.label(r));
          }
        }
        coverage = `<br><span class="muted">Vale per ${total} coppie: ${escapeHTML(examples.join(" "))}${total - 1 > examples.length ? " …" : ""}</span>`;
      }
    }
    const valueText = value === null || value === undefined ? "0" : String(Math.round(value));
    info.innerHTML =
      `<b>${escapeHTML(view.label(left) + view.label(right))}</b>  <span class="muted">${escapeHTML(left)} ${escapeHTML(right)}</span><br>` +
      `Valore <span class="value"><b>${valueText}</b></span> · ${kind}<br>` +
      `<span class="muted">Gruppi: ${groupText}</span>` +
      coverage +
      this.masterGridHTML(left, right);
  }

  // I valori della coppia in tutti i master. Riquadrato il master in cui sei,
  // in azzurro quelli a cui vanno le modifiche.
  masterGridHTML(left, right) {
    const grid = this.grid;
    const kc = this.kc;
    if (!grid || !kc || grid.masters.length < 2) return "";
    const currentId = this.currentSourceId();
    const targets = new Set(this.targetSourceIds() || (currentId ? [currentId] : []));
    const cell = (master) => {
      if (!master) return "<td></td>";
      let value = null;
      try {
        value = master.inKerning ? kc.getGlyphPairValueForSource(left, right, master.id) : null;
      } catch (error) {
        value = null;
      }
      const v = value === null || value === undefined ? 0 : Math.round(value);
      const classes = [v === 0 ? "zero" : "", targets.has(master.id) ? "target" : "", master.id === currentId ? "current" : ""].join(" ");
      return `<td class="${classes}" title="${escapeHTML(master.name)}">${v}</td>`;
    };
    if (grid.axes.length === 2) {
      const [a, b] = grid.axes;
      const rows = [...new Set(grid.masters.map((m) => m.location[a.name]))].sort((x, y) => x - y);
      const cols = [...new Set(grid.masters.map((m) => m.location[b.name]))].sort((x, y) => x - y);
      if (rows.length * cols.length <= 30) {
        let html = `<table class="mgrid"><tr><th title="${escapeHTML(axisLabel(a.name))} ↓  ${escapeHTML(axisLabel(b.name))} →">${escapeHTML(axisLabel(a.name).slice(0, 4))}·${escapeHTML(axisLabel(b.name).slice(0, 4))}</th>`;
        html += cols.map((c) => `<th>${c}</th>`).join("") + "</tr>";
        for (const r of rows) {
          html += `<tr><th>${r}</th>`;
          for (const c of cols) html += cell(grid.masters.find((m) => m.location[a.name] === r && m.location[b.name] === c));
          html += "</tr>";
        }
        return html + "</table>";
      }
    }
    return `<table class="mgrid"><tr>${grid.masters.map((m) => `<th title="${escapeHTML(m.name)}">${escapeHTML(m.short)}</th>`).join("")}</tr><tr>${grid.masters.map(cell).join("")}</tr></table>`;
  }
}

// ---------------------------------------------------------------------------
// Kerning su più master: la griglia dei master, i master intermedi calcolati
// dagli angoli e il controllo del kerning (eccezioni, valori senza gruppo,
// master vuoti). Usato dal pannello nell'editor e dalla panoramica.
// ---------------------------------------------------------------------------

const KERN_TAG = "kern";
const AXIS_LABELS = {
  weight: "peso", wght: "peso", width: "larghezza", wdth: "larghezza",
  "optical size": "dimensione ottica", opsz: "dimensione ottica", slant: "inclinazione", italic: "corsivo",
};

function axisLabel(name) {
  return AXIS_LABELS[String(name).toLowerCase()] || name;
}

// I master del font in ordine di griglia, con la posizione di ognuno tra il
// minimo e il massimo di ogni asse (da 0 a 1) e quali sono gli angoli.
async function loadMasterGrid(fontController) {
  const kerning = await loadKerning(fontController);
  const table = kerning?.[KERN_TAG] || null;
  let sources = {};
  try {
    sources = (await fontController.getSources?.()) || fontController.sources || {};
  } catch (error) {
    sources = fontController.sources || {};
  }
  const axes = (fontController.fontAxesSourceSpace || [])
    .filter((axis) => axis.minValue !== axis.maxValue)
    .map((axis) => ({ name: axis.name, min: axis.minValue, max: axis.maxValue, def: axis.defaultValue }));
  const kernIds = table?.sourceIdentifiers || [];
  const defaultLocation = Object.fromEntries(axes.map((axis) => [axis.name, axis.def]));
  const masters = [];
  for (const [id, source] of Object.entries(sources)) {
    if (source.isSparse || source.inactive) continue;
    const location = { ...defaultLocation, ...(source.location || {}) };
    const t = {};
    for (const axis of axes) t[axis.name] = (location[axis.name] - axis.min) / (axis.max - axis.min);
    masters.push({
      id,
      name: source.name || id,
      location,
      t,
      inKerning: kernIds.includes(id),
      isDefault: axes.every((axis) => location[axis.name] === axis.def),
      isCorner: axes.length > 0 && axes.every((axis) => location[axis.name] === axis.min || location[axis.name] === axis.max),
    });
  }
  masters.sort((a, b) => {
    for (const axis of axes) {
      const d = a.location[axis.name] - b.location[axis.name];
      if (d) return d;
    }
    return 0;
  });
  // Nomi brevi: le iniziali ("Light Compact" → LC)
  const used = new Set();
  for (const master of masters) {
    let short = master.name.split(/[\s_\-]+/).filter(Boolean).map((w) => w[0].toUpperCase()).join("") || master.name;
    if (used.has(short)) short = master.name;
    used.add(short);
    master.short = short;
  }
  const cornerKey = (m) => axes.map((axis) => (m.location[axis.name] === axis.max ? 1 : 0)).join("");
  const corners = [];
  const seen = new Set();
  for (const master of masters) {
    if (!master.isCorner || !master.inKerning || seen.has(cornerKey(master))) continue;
    seen.add(cornerKey(master));
    corners.push(master);
  }
  return {
    axes,
    masters,
    corners,
    complete: axes.length > 0 && corners.length === 2 ** axes.length,
    table,
    kernIds,
    defaultMaster: masters.find((m) => m.isDefault) || null,
  };
}

// Un master calcolato dagli angoli, in proporzione alla sua posizione su ogni asse
function valueFromCorners(grid, valueOf, master) {
  let sum = 0;
  for (const corner of grid.corners) {
    let weight = 1;
    for (const axis of grid.axes) {
      const atMax = corner.location[axis.name] === axis.max;
      const t = master.t[axis.name];
      weight *= atMax ? t : 1 - t;
    }
    if (Math.abs(weight) < 1e-9) continue;
    const value = valueOf(corner.id);
    if (value === null || value === undefined) return null;
    sum += weight * value;
  }
  return Math.round(sum);
}

function pairValueGetter(grid, values) {
  return (id) => {
    const index = grid.kernIds.indexOf(id);
    return index < 0 ? null : values?.[index] ?? null;
  };
}

// Cosa cambierebbe calcolando i master intermedi delle coppie indicate
// (tutte, se pairs non c'è). Gli angoli non si toccano mai.
function planInterpolation(grid, { pairs = null, overwrite = false, includeDefault = false } = {}) {
  const values = grid.table?.values || {};
  const list = pairs || Object.entries(values).flatMap(([left, row]) => Object.keys(row).map((right) => [left, right]));
  const results = [];
  let missingCorners = 0;
  for (const [left, right] of list) {
    const old = values[left]?.[right];
    if (!old) continue;
    const valueOf = pairValueGetter(grid, old);
    const next = grid.kernIds.map((id, i) => old[i] ?? null);
    const cells = [];
    let missing = false;
    for (const master of grid.masters) {
      if (master.isCorner || !master.inKerning) continue;
      if (master.isDefault && !includeDefault) continue;
      const current = valueOf(master.id);
      if (current !== null && !overwrite) continue;
      const value = valueFromCorners(grid, valueOf, master);
      if (value === null) {
        missing = true;
        continue;
      }
      if (current === value) continue;
      next[grid.kernIds.indexOf(master.id)] = value;
      cells.push({ id: master.id, from: current, to: value });
    }
    if (missing && !cells.length) missingCorners++;
    if (cells.length) results.push({ left, right, old, next, cells });
  }
  return { results, missingCorners };
}

function kerningGroupMaps(table) {
  const side1 = {};
  const side2 = {};
  for (const [group, members] of Object.entries(table?.groupsSide1 || {})) for (const m of members) side1[m] = group;
  for (const [group, members] of Object.entries(table?.groupsSide2 || {})) for (const m of members) side2[m] = group;
  return { side1, side2 };
}

// Le tre cose da controllare: eccezioni che scavalcano un gruppo, valori
// legati a gruppi che non esistono più, coppie con master vuoti.
function analyzeKerning(grid, glyphMap) {
  const table = grid.table || { values: {}, groupsSide1: {}, groupsSide2: {} };
  const values = table.values || {};
  const { side1, side2 } = kerningGroupMaps(table);
  const n = grid.kernIds.length;
  const row = (arr) => Array.from({ length: n }, (_, i) => arr?.[i] ?? null);
  const exceptions = [];
  const orphans = [];
  const incomplete = [];
  const countMembers = (name, groups) => (name.startsWith("@") ? (groups[name.slice(1)] || []).length : 1);

  for (const [left, rightValues] of Object.entries(values)) {
    for (const [right, raw] of Object.entries(rightValues)) {
      const own = row(raw);
      const key = `${left} ${right}`;
      const leftIsGroup = left.startsWith("@");
      const rightIsGroup = right.startsWith("@");
      const leftOrphan = leftIsGroup && !table.groupsSide1?.[left.slice(1)];
      const rightOrphan = rightIsGroup && !table.groupsSide2?.[right.slice(1)];

      // 1. Valori legati a gruppi che non esistono più
      if (leftOrphan || rightOrphan) {
        const options = [];
        const namesake = (name, groups, map) => {
          if (!name.startsWith("@")) return { group: name, glyph: name };
          const groupName = name.slice(1);
          if (groups[groupName]) return { group: name, glyph: glyphMap[groupName] !== undefined ? groupName : null };
          if (glyphMap[groupName] === undefined) return { group: null, glyph: null };
          return { group: map[groupName] ? `@${map[groupName]}` : groupName, glyph: groupName };
        };
        const l = namesake(left, table.groupsSide1 || {}, side1);
        const r = namesake(right, table.groupsSide2 || {}, side2);
        if (l.group && r.group && (l.group !== left || r.group !== right) && values[l.group]?.[r.group] === undefined) {
          options.push({
            kind: "move",
            left: l.group,
            right: r.group,
            count: countMembers(l.group, table.groupsSide1 || {}) * countMembers(r.group, table.groupsSide2 || {}),
          });
        }
        const sameAsMove = options.some((o) => o.left === l.glyph && o.right === r.glyph);
        if (l.glyph && r.glyph && !sameAsMove && (l.glyph !== l.group || r.glyph !== r.group) && values[l.glyph]?.[r.glyph] === undefined) {
          options.push({ kind: "exception", left: l.glyph, right: r.glyph, count: 1 });
        }
        orphans.push({
          key, left, right, own,
          missing: [leftOrphan ? `${left} (lato sinistro)` : null, rightOrphan ? `${right} (lato destro)` : null].filter(Boolean),
          options,
        });
        continue;
      }

      // 2. Eccezioni: un glifo che ha un gruppo, usato da solo
      const leftGroup = !leftIsGroup && side1[left] ? `@${side1[left]}` : null;
      const rightGroup = !rightIsGroup && side2[right] ? `@${side2[right]}` : null;
      if (leftGroup || rightGroup) {
        const chain = [];
        if (rightGroup) chain.push([left, rightGroup]);
        if (leftGroup) chain.push([leftGroup, right]);
        if (leftGroup && rightGroup) chain.push([leftGroup, rightGroup]);
        const fallback = Array.from({ length: n }, (_, i) => {
          for (const [l, r] of chain) {
            const v = values[l]?.[r]?.[i];
            if (v !== null && v !== undefined) return v;
          }
          return null;
        });
        const fallbackPair = chain.find(([l, r]) => values[l]?.[r]) || chain[chain.length - 1];
        const differs = own.map((v, i) => v !== null && v !== (fallback[i] ?? 0));
        exceptions.push({
          key, left, right, own, fallback,
          fallbackLabel: `${fallbackPair[0]} ${fallbackPair[1]}`,
          same: !differs.some(Boolean),
          differs,
        });
        continue;
      }

      // 3. Master vuoti (solo per le coppie che non sono eccezioni: in
      // un'eccezione un master vuoto vuol dire "usa il gruppo")
      const empty = own.map((v) => v === null);
      // (se dove c'è il valore è sempre 0, la coppia non fa niente: non serve riempirla)
      if (empty.some(Boolean) && !empty.every(Boolean) && own.some((v) => v)) {
        const valueOf = pairValueGetter(grid, own);
        const fromCorners = grid.kernIds.map((id, i) => {
          if (own[i] !== null) return null;
          const master = grid.masters.find((m) => m.id === id);
          if (!master || master.isCorner || !grid.complete) return null;
          return valueFromCorners(grid, valueOf, master);
        });
        const canCorners = grid.complete && own.some((v, i) => v === null && fromCorners[i] !== null);
        const present = own.filter((v) => v !== null);
        const common = present.every((v) => v === present[0]) ? present[0] : null;
        incomplete.push({ key, left, right, own, empty, fromCorners, canCorners, common });
      }
    }
  }
  exceptions.sort((a, b) => Number(b.same) - Number(a.same));
  return { exceptions, orphans, incomplete };
}

// Scrittura nella tabella "kern" (con annullamento)
function setPairValues(builder, table, left, right, next) {
  const base = ["kerning", KERN_TAG, "values"];
  builder._createdRows = builder._createdRows || new Set();
  if (!table.values?.[left] && !builder._createdRows.has(left)) {
    builder.set(base, left, {}, undefined);
    builder._createdRows.add(left);
  }
  builder.set([...base, left], right, next, clone(table.values?.[left]?.[right]));
}

function deletePairValues(builder, table, left, right) {
  const old = table.values?.[left]?.[right];
  if (old === undefined) return;
  builder.delete(["kerning", KERN_TAG, "values", left], right, clone(old));
}

// Come si legge una coppia: "T z" con i nomi dei gruppi, e i caratteri se ci sono
function pairLabel(glyphMap, left, right) {
  const show = (name) => {
    if (name.startsWith("@")) return name;
    const cp = glyphMap[name]?.[0];
    return cp !== undefined && name.length > 1 ? `${name} ${String.fromCodePoint(cp)}` : name;
  };
  return `${show(left)}  ${show(right)}`;
}

const DIALOG_TAG = "fontra-kerning-tools-dialog";
const DIALOG_CSS = `
  :host { all: initial; }
  .overlay {
    position: fixed; inset: 0; z-index: 1000; background: #0006;
    display: flex; align-items: center; justify-content: center;
    font-family: fontra-ui-regular, -apple-system, system-ui, sans-serif; font-size: 12px;
  }
  .box {
    background: var(--ui-element-background-color, #fff); color: var(--ui-element-foreground-color, #222);
    border-radius: 10px; box-shadow: 0 10px 40px #0006; width: min(1080px, 95vw); max-height: 90vh;
    display: flex; flex-direction: column;
  }
  .head { display: flex; align-items: center; gap: 8px; padding: 12px 16px 4px; }
  .head b { font-size: 14px; }
  .head .x { margin-left: auto; border: none; font-size: 18px; opacity: 0.6; padding: 0 6px; }
  .content { overflow: auto; padding: 0 16px 10px; }
  .foot { display: flex; gap: 8px; align-items: center; padding: 10px 16px; border-top: 1px solid #8883; }
  .foot .msg { flex: 1; opacity: 0.8; }
  h3 { font-size: 12.5px; margin: 16px 0 2px; }
  p { margin: 3px 0 6px; line-height: 1.45; opacity: 0.8; }
  .toolbar { display: flex; gap: 6px; align-items: center; margin: 4px 0 6px; flex-wrap: wrap; }
  table { border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { padding: 2px 6px; text-align: right; white-space: nowrap; border-bottom: 1px solid #8882; }
  th { font-weight: normal; opacity: 0.65; }
  .l { text-align: left; }
  td.pair { font-weight: bold; }
  td.muted, span.muted { opacity: 0.55; }
  td.empty { opacity: 0.3; }
  td.diff { color: #e03131; font-weight: bold; }
  td.new { color: #2563eb; font-weight: bold; }
  td.new s { color: inherit; opacity: 0.45; font-weight: normal; margin-right: 3px; }
  tr.sub td { opacity: 0.6; }
  tr.first td { border-top: 1px solid #8884; }
  .tag { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; background: #8882; }
  .tag.same { background: #16a34a22; color: #15803d; }
  .tag.diff { background: #e0313122; color: #c92a2a; }
  button, select {
    font: inherit; color: inherit; border-radius: 5px; border: 1px solid #8884;
    background: transparent; padding: 3px 9px; cursor: pointer;
  }
  select { background: var(--text-input-background-color, #f2f2f2); padding: 2px 4px; }
  button.primary { background: #3b82f6; border-color: #3b82f6; color: #fff; }
  button:disabled { opacity: 0.4; cursor: default; }
  label.opt { display: flex; gap: 6px; align-items: center; margin: 3px 0; }
  .none { opacity: 0.6; margin: 4px 0 8px; }
`;

class KerningToolsDialogElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${DIALOG_CSS}</style>
      <div class="overlay">
        <div class="box">
          <div class="head"><b id="title"></b><button class="x" id="close" title="Chiudi (Esc)">×</button></div>
          <div class="content" id="content"></div>
          <div class="foot"><span class="msg" id="msg"></span><button id="cancel">Chiudi</button><button class="primary" id="apply">Applica</button></div>
        </div>
      </div>`;
    this.$ = (sel) => this.shadowRoot.querySelector(sel);
  }
}
if (!customElements.get(DIALOG_TAG)) customElements.define(DIALOG_TAG, KerningToolsDialogElement);

// host: { fc, apply(builder, label) }
// mode: "check" (Controlla kerning) o "interpolate" (master intermedi)
class KerningToolsDialog {
  constructor(host, mode, { pairs = null, title = null } = {}) {
    this.host = host;
    this.fc = host.fc;
    this.mode = mode;
    this.pairs = pairs;
    this.title = title;
    this.options = { overwrite: false, includeDefault: false };
    this.selected = new Set();
    this.choices = new Map();
  }

  async open() {
    this.element = document.createElement(DIALOG_TAG);
    document.body.appendChild(this.element);
    const $ = this.element.$;
    const close = () => this.close();
    $("#close").addEventListener("click", close);
    $("#cancel").addEventListener("click", close);
    $(".overlay").addEventListener("pointerdown", (event) => {
      if (event.target === $(".overlay")) close();
    });
    this.element.addEventListener("keydown", (event) => event.stopPropagation());
    this.onKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    };
    window.addEventListener("keydown", this.onKey, true);
    $("#apply").addEventListener("click", () => this.apply());
    $("#title").textContent =
      this.title || (this.mode === "check" ? "Controlla kerning" : "Calcola i master intermedi");
    await this.reload();
    $("#apply").focus();
  }

  close() {
    window.removeEventListener("keydown", this.onKey, true);
    this.element?.remove();
    this.element = null;
  }

  async reload() {
    this.grid = await loadMasterGrid(this.fc);
    this.render();
  }

  masterHeader(extraLeft = 1) {
    return `<tr>${"<th></th>".repeat(extraLeft)}${this.grid.masters
      .map((m) => `<th title="${escapeHTML(m.name)}">${escapeHTML(m.short)}</th>`)
      .join("")}</tr>`;
  }

  valueCells(values, { classFor = () => "" } = {}) {
    const valueOf = pairValueGetter(this.grid, values);
    return this.grid.masters
      .map((m) => {
        const v = valueOf(m.id);
        const extra = classFor(m, v);
        return v === null ? `<td class="empty ${extra}">·</td>` : `<td class="${extra}">${v}</td>`;
      })
      .join("");
  }

  render() {
    if (!this.element) return;
    const content = this.element.$("#content");
    if (!this.grid.table) {
      content.innerHTML = `<p>Il font non ha ancora una tabella di kerning.</p>`;
      this.element.$("#apply").disabled = true;
      return;
    }
    if (this.mode === "check") this.renderCheck(content);
    else this.renderInterpolate(content);
  }

  // --- master intermedi ---------------------------------------------------------

  renderInterpolate(content) {
    const grid = this.grid;
    const $ = this.element.$;
    if (!grid.complete) {
      content.innerHTML = `<p>Per calcolare i master intermedi servono i master negli angoli dello spazio di design (per esempio Light Compact, Light Wide, Bold Compact, Bold Wide): questo font non li ha tutti.</p>`;
      $("#apply").disabled = true;
      return;
    }
    const defaultName = grid.defaultMaster?.name || "Regular";
    const plan = planInterpolation(grid, { pairs: this.pairs, ...this.options });
    this.plan = plan;
    const cornerNames = grid.corners.map((m) => m.name).join(", ");
    const cells = plan.results.reduce((sum, r) => sum + r.cells.length, 0);
    const changed = new Set();
    let rows = "";
    for (const result of plan.results) {
      const byId = new Map(result.cells.map((c) => [c.id, c]));
      const valueOf = pairValueGetter(grid, result.old);
      rows +=
        `<tr><td class="l pair">${escapeHTML(pairLabel(this.fc.glyphMap, result.left, result.right))}</td>` +
        grid.masters
          .map((m) => {
            const cell = byId.get(m.id);
            if (cell) {
              changed.add(m.id);
              return `<td class="new">${cell.from === null ? "" : `<s>${cell.from}</s>`}${cell.to}</td>`;
            }
            const v = valueOf(m.id);
            return v === null ? `<td class="empty">·</td>` : `<td class="${m.isCorner ? "" : "muted"}">${v}</td>`;
          })
          .join("") +
        `</tr>`;
    }
    content.innerHTML =
      `<p>Gli angoli (${escapeHTML(cornerNames)}) restano come sono. Gli altri master si calcolano dagli angoli, in proporzione alla loro posizione su ogni asse. In blu i valori nuovi; barrati quelli di adesso.</p>` +
      `<label class="opt"><input type="checkbox" id="overwrite" ${this.options.overwrite ? "checked" : ""}> Sovrascrivi anche i valori già messi (se spento, riempie solo i master vuoti)</label>` +
      `<label class="opt"><input type="checkbox" id="include-default" ${this.options.includeDefault ? "checked" : ""}> Calcola anche il ${escapeHTML(defaultName)} (se spento, il ${escapeHTML(defaultName)} resta come l'hai fatto)</label>` +
      (plan.results.length
        ? `<table><thead>${this.masterHeader()}</thead><tbody>${rows}</tbody></table>`
        : `<p class="none">Niente da calcolare con queste opzioni.</p>`) +
      (plan.missingCorners
        ? `<p>${plan.missingCorners} ${plan.missingCorners === 1 ? "coppia è saltata" : "coppie sono saltate"}: manca il valore in almeno uno degli angoli che servono.</p>`
        : "");
    $("#overwrite").addEventListener("change", (e) => {
      this.options.overwrite = e.target.checked;
      this.render();
    });
    $("#include-default").addEventListener("change", (e) => {
      this.options.includeDefault = e.target.checked;
      this.render();
    });
    $("#apply").disabled = !cells;
    $("#apply").textContent = cells
      ? `Applica (${cells} ${cells === 1 ? "valore" : "valori"} in ${plan.results.length} ${plan.results.length === 1 ? "coppia" : "coppie"})`
      : "Applica";
  }

  // --- controllo ------------------------------------------------------------------

  renderCheck(content) {
    const $ = this.element.$;
    const analysis = analyzeKerning(this.grid, this.fc.glyphMap);
    this.analysis = analysis;
    const glyphMap = this.fc.glyphMap;
    const sameCount = analysis.exceptions.filter((e) => e.same).length;
    let html = `<p>Niente viene cambiato finché non scegli e premi <b>Applica</b>. Tutto si annulla con ⌘Z.</p>`;

    // 1. Eccezioni
    html += `<h3>Eccezioni che scavalcano un gruppo (${analysis.exceptions.length})</h3>`;
    if (analysis.exceptions.length) {
      html +=
        `<p>Una coppia scritta per un glifo singolo vince sul valore del suo gruppo: quando cambi il gruppo, questa coppia non cambia. ` +
        `<span class="tag same">uguale al gruppo</span> vuol dire che cancellandola non cambia niente di quello che vedi (${sameCount} su ${analysis.exceptions.length}). ` +
        `Cancellata, la coppia torna a seguire il gruppo. In rosso i master dove l'eccezione è diversa dal gruppo.</p>` +
        `<div class="toolbar"><button id="sel-same">Seleziona le uguali al gruppo</button><button id="sel-none">Nessuna</button></div>` +
        `<table><thead>${this.masterHeader(3)}</thead><tbody>`;
      for (const e of analysis.exceptions) {
        html +=
          `<tr class="first"><td><input type="checkbox" data-exc="${escapeHTML(e.key)}" ${this.selected.has(e.key) ? "checked" : ""}></td>` +
          `<td class="l pair">${escapeHTML(pairLabel(glyphMap, e.left, e.right))}</td>` +
          `<td class="l">${e.same ? `<span class="tag same">uguale al gruppo</span>` : `<span class="tag diff">diversa</span>`}</td>` +
          this.valueCells(e.own, { classFor: (m) => (e.differs[this.grid.kernIds.indexOf(m.id)] ? "diff" : "") }) +
          `</tr><tr class="sub"><td></td><td class="l">gruppo ${escapeHTML(e.fallbackLabel)}</td><td></td>` +
          this.valueCells(e.fallback) +
          `</tr>`;
      }
      html += `</tbody></table>`;
    } else html += `<p class="none">Nessuna.</p>`;

    // 2. Valori senza gruppo
    html += `<h3>Valori legati a gruppi che non esistono più (${analysis.orphans.length})</h3>`;
    if (analysis.orphans.length) {
      html +=
        `<p>Quando un gruppo si svuota (per esempio spostando i suoi glifi in un altro gruppo), Fontra non sposta il kerning: questi valori restano nel file ma non valgono per nessuna coppia.</p>` +
        `<table><thead>${this.masterHeader(3)}</thead><tbody>`;
      for (const o of analysis.orphans) {
        const choice = this.choices.get(o.key) || "keep";
        const options = [`<option value="keep">Lascia così</option>`, `<option value="delete">Cancella</option>`];
        o.options.forEach((opt, i) => {
          const text =
            opt.kind === "move"
              ? `Sposta su ${opt.left} ${opt.right} (vale per ${opt.count} ${opt.count === 1 ? "coppia" : "coppie"})`
              : `Eccezione ${opt.left} ${opt.right}`;
          options.push(`<option value="opt${i}">${escapeHTML(text)}</option>`);
        });
        html +=
          `<tr class="first"><td class="l"><select data-orphan="${escapeHTML(o.key)}">${options.join("")}</select></td>` +
          `<td class="l pair">${escapeHTML(`${o.left}  ${o.right}`)}</td>` +
          `<td class="l muted">non esiste: ${escapeHTML(o.missing.join(", "))}</td>` +
          this.valueCells(o.own) +
          `</tr>`;
        this._pendingSelect = this._pendingSelect || [];
        this._pendingSelect.push([o.key, choice]);
      }
      html += `</tbody></table>`;
    } else html += `<p class="none">Nessuno.</p>`;

    // 3. Master vuoti
    html += `<h3>Coppie con master vuoti (${analysis.incomplete.length})</h3>`;
    if (analysis.incomplete.length) {
      html +=
        `<p>In un master vuoto la coppia vale 0, quindi il kerning salta da un master all'altro. Non sempre è un errore: a volte serve davvero solo in un master. Scegli tu, coppia per coppia.</p>` +
        `<table><thead>${this.masterHeader(2)}</thead><tbody>`;
      for (const p of analysis.incomplete) {
        const options = [`<option value="keep">Lascia così</option>`];
        if (p.canCorners) options.push(`<option value="corners">Riempi i vuoti dagli angoli</option>`);
        if (p.common !== null && p.common !== 0) options.push(`<option value="copy">Metti ${p.common} nei vuoti</option>`);
        const choice = this.choices.get(p.key) || "keep";
        html +=
          `<tr class="first"><td class="l"><select data-incomplete="${escapeHTML(p.key)}">${options.join("")}</select></td>` +
          `<td class="l pair">${escapeHTML(pairLabel(glyphMap, p.left, p.right))}</td>` +
          this.valueCells(p.own) +
          `</tr>`;
        if (p.canCorners) {
          html +=
            `<tr class="sub"><td></td><td class="l">dagli angoli</td>` +
            this.grid.masters
              .map((m) => {
                const i = this.grid.kernIds.indexOf(m.id);
                const v = i < 0 ? null : p.fromCorners[i];
                return v === null ? `<td></td>` : `<td class="new">${v}</td>`;
              })
              .join("") +
            `</tr>`;
        }
        this._pendingSelect = this._pendingSelect || [];
        this._pendingSelect.push([p.key, choice]);
      }
      html += `</tbody></table>`;
    } else html += `<p class="none">Nessuna.</p>`;

    content.innerHTML = html;
    for (const [key, choice] of this._pendingSelect || []) {
      const select = [...content.querySelectorAll("select")].find(
        (s) => s.dataset.orphan === key || s.dataset.incomplete === key
      );
      if (select && [...select.options].some((o) => o.value === choice)) select.value = choice;
    }
    this._pendingSelect = [];

    for (const box of content.querySelectorAll("input[data-exc]")) {
      box.addEventListener("change", () => {
        if (box.checked) this.selected.add(box.dataset.exc);
        else this.selected.delete(box.dataset.exc);
        this.updateCheckButton();
      });
    }
    for (const select of content.querySelectorAll("select")) {
      select.addEventListener("change", () => {
        this.choices.set(select.dataset.orphan ?? select.dataset.incomplete, select.value);
        this.updateCheckButton();
      });
    }
    $("#sel-same")?.addEventListener("click", () => {
      for (const e of analysis.exceptions) if (e.same) this.selected.add(e.key);
      this.render();
    });
    $("#sel-none")?.addEventListener("click", () => {
      this.selected.clear();
      this.render();
    });
    this.updateCheckButton();
  }

  checkActions() {
    const actions = [];
    for (const e of this.analysis.exceptions) if (this.selected.has(e.key)) actions.push({ type: "delete", item: e });
    for (const o of this.analysis.orphans) {
      const choice = this.choices.get(o.key) || "keep";
      if (choice === "delete") actions.push({ type: "delete", item: o });
      else if (choice.startsWith("opt")) actions.push({ type: "move", item: o, target: o.options[Number(choice.slice(3))] });
    }
    for (const p of this.analysis.incomplete) {
      const choice = this.choices.get(p.key) || "keep";
      if (choice === "corners" || choice === "copy") actions.push({ type: choice, item: p });
    }
    return actions;
  }

  updateCheckButton() {
    const n = this.checkActions().length;
    const button = this.element.$("#apply");
    button.disabled = !n;
    button.textContent = n ? `Applica (${n} ${n === 1 ? "modifica" : "modifiche"})` : "Applica";
  }

  // --- applica --------------------------------------------------------------------

  async apply() {
    const table = this.grid.table;
    if (!table) return;
    const builder = new ChangeBuilder();
    let label;
    let summary;
    if (this.mode === "interpolate") {
      let cells = 0;
      for (const result of this.plan?.results || []) {
        setPairValues(builder, table, result.left, result.right, result.next);
        cells += result.cells.length;
      }
      label = "Calcola i master intermedi";
      summary = `Fatto: ${cells} ${cells === 1 ? "valore calcolato" : "valori calcolati"}.`;
    } else {
      const actions = this.checkActions();
      for (const action of actions) {
        const { item } = action;
        if (action.type === "delete") {
          deletePairValues(builder, table, item.left, item.right);
        } else if (action.type === "move") {
          setPairValues(builder, table, action.target.left, action.target.right, clone(table.values[item.left][item.right]));
          deletePairValues(builder, table, item.left, item.right);
        } else {
          const next = item.own.map((v, i) => {
            if (v !== null) return v;
            if (action.type === "copy") return item.common;
            return item.fromCorners[i];
          });
          setPairValues(builder, table, item.left, item.right, next);
        }
      }
      label = "Controlla kerning";
      summary = `Fatto: ${actions.length} ${actions.length === 1 ? "modifica" : "modifiche"}. ⌘Z per annullare.`;
    }
    if (builder.isEmpty) return;
    const button = this.element.$("#apply");
    button.disabled = true;
    try {
      await this.host.apply(builder, label);
      this.selected.clear();
      this.choices.clear();
      await this.reload();
      if (this.element) this.element.$("#msg").textContent = summary;
    } catch (error) {
      console.error("[Testi di kerning]", error);
      if (this.element) this.element.$("#msg").textContent = `Non è stato possibile applicare: ${error?.message || error}`;
      button.disabled = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Panoramica del font: la sezione "Margini e gruppi" nella barra a sinistra.
// Fontra carica i plugin solo nell'editor: l'editor installa questo modulo
// nella panoramica che l'ha aperto (o che apre dal menu Font).
// ---------------------------------------------------------------------------

const OVERVIEW_KEY = "__kerningTextsOverview";
const OVERVIEW_POLL_MS = 1500;
const METRICS_TAG = "fontra-kerning-metrics";
const METRICS_META = "kerningTextsPlugin";
const GROUP_NAME = /^[A-Za-z0-9_.\-]+$/;
const GLYPHS_PER_CHUNK = 40;
const METRICS_SETTINGS_KEY = "fontra-plugin-kerning-texts-metrics";

KerningTextsPlugin.prototype.linkOverviewWindows = function () {
  this.overviewWindows = new Set();
  try {
    if (window.opener) this.overviewWindows.add(window.opener);
  } catch (error) {
    // finestra di un altro sito: ignorata
  }
  const originalOpen = window.open;
  const windows = this.overviewWindows;
  const plugin = this;
  window.open = function (...args) {
    const opened = originalOpen.apply(this, args);
    if (opened && /fontoverview/.test(`${args[0] ?? ""} ${args[1] ?? ""}`)) {
      windows.add(opened);
      setTimeout(() => plugin.installInOverviews(), 500);
    }
    return opened;
  };
  this.installInOverviews();
  setInterval(() => this.installInOverviews(), OVERVIEW_POLL_MS);
};

KerningTextsPlugin.prototype.installInOverviews = function () {
  const project = new URL(window.location.href).searchParams.get("project");
  for (const win of this.overviewWindows) {
    try {
      if (!win || win.closed) {
        this.overviewWindows.delete(win);
        continue;
      }
      if (win[OVERVIEW_KEY] || !win.fontOverviewController) continue;
      if (new URL(win.location.href).searchParams.get("project") !== project) continue;
      win[OVERVIEW_KEY] = "loading";
      const script = win.document.createElement("script");
      script.type = "module";
      script.textContent =
        `import(${JSON.stringify(import.meta.url)})` +
        `.then((m) => m.startOverview(window.fontOverviewController))` +
        `.catch((e) => console.error("[Testi di kerning]", e));`;
      win.document.head.appendChild(script);
    } catch (error) {
      // finestra non raggiungibile
    }
  }
};

// Il kerning va caricato sempre passando da getKerningController: Fontra tiene
// una sola richiesta in corso. Due getKerning() contemporanei, mentre il font si
// carica, scaricano due copie e la seconda può cancellare una modifica appena fatta.
async function loadKerning(fontController) {
  try {
    await fontController.getKerningController("kern");
  } catch (error) {
    // nessun kerning: getKerning() restituisce comunque l'oggetto vuoto
  }
  return await fontController.getKerning();
}

// Raccoglie le modifiche e, in ordine inverso, quelle per annullarle.
class ChangeBuilder {
  constructor() {
    this.forward = [];
    this.backward = [];
  }

  get isEmpty() {
    return !this.forward.length;
  }

  set(path, key, newValue, oldValue) {
    this.forward.push({ p: path, f: "=", a: [key, newValue] });
    this.backward.unshift(
      oldValue === undefined ? { p: path, f: "d", a: [key] } : { p: path, f: "=", a: [key, oldValue] }
    );
  }

  delete(path, key, oldValue) {
    this.forward.push({ p: path, f: "d", a: [key] });
    this.backward.unshift({ p: path, f: "=", a: [key, oldValue] });
  }

  build(label) {
    return {
      change: { c: this.forward, [METRICS_META]: { label } },
      rollbackChange: { c: this.backward, [METRICS_META]: { label } },
    };
  }
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function glyphNameOfChange(change) {
  const path = change.p || [];
  if (path[0] !== "glyphs") return null;
  return path.length > 1 ? path[1] : change.a?.[0] ?? null;
}

function countGlyphs(change) {
  return new Set((change.c || []).map(glyphNameOfChange).filter((n) => n !== null)).size;
}

// Il server di Fontra tiene in memoria al massimo 128 glifi per volta:
// le modifiche grandi partono a blocchi.
async function postChunked(fontController, change, label) {
  let chunk = [];
  let names = new Set();
  const send = async () => {
    if (!chunk.length) return;
    await fontController.postChange({ c: chunk, [METRICS_META]: change[METRICS_META] }, { c: [] }, label);
    chunk = [];
    names = new Set();
  };
  for (const sub of change.c || []) {
    const name = glyphNameOfChange(sub);
    if (name !== null && !names.has(name) && names.size >= GLYPHS_PER_CHUNK) await send();
    if (name !== null) names.add(name);
    chunk.push(sub);
  }
  await send();
}

// Numero o operazione: "30", "590/2", "+10", "--10", "*2", "/2"
function evaluateInput(text, current) {
  let t = String(text).trim().replace(/,/g, ".").replace(/−/g, "-");
  if (!t) return null;
  let relative = null;
  if (t.startsWith("--")) relative = "-";
  else if (/^[+*/]/.test(t)) relative = t[0];
  if (relative) {
    t = t.slice(relative === "-" ? 2 : 1);
    const operand = evaluateInput(t, 0);
    if (operand === null || current === null || current === undefined) return null;
    return { "+": current + operand, "-": current - operand, "*": current * operand, "/": operand ? current / operand : null }[relative];
  }
  const value = calculate(t);
  return Number.isFinite(value) ? value : null;
}

// Calcolatrice per + - * / e parentesi, senza eval: funziona anche dove il
// browser blocca il codice generato al volo
function calculate(text) {
  const tokens = String(text).replace(/\s+/g, "").match(/\d+(?:\.\d*)?|\.\d+|[-+*/()]/g);
  if (!tokens || tokens.join("") !== String(text).replace(/\s+/g, "")) return NaN;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const factor = () => {
    const token = next();
    if (token === "-") return -factor();
    if (token === "+") return factor();
    if (token === "(") {
      const value = sum();
      return next() === ")" ? value : NaN;
    }
    const number = parseFloat(token);
    return Number.isFinite(number) ? number : NaN;
  };
  const product = () => {
    let value = factor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const right = factor();
      value = op === "*" ? value * right : value / right;
    }
    return value;
  };
  const sum = () => {
    let value = product();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const right = product();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  };
  const result = sum();
  return i === tokens.length ? result : NaN;
}

function isRelativeInput(text) {
  const t = String(text).trim();
  return t.startsWith("--") || /^[+*/]/.test(t);
}

// --- Nome di un glifo al posto del numero, come in Glyphs ----------------------
// "H" o "=H": lo stesso margine di H (nello stesso master). "=|H": il margine
// opposto di H (nel sinistro, il destro di H). "H+10", "=H*2": con un calcolo.
// Va bene anche il carattere: "è" vale come "egrave".

function resolveGlyphName(text, fontController) {
  const glyphMap = fontController.glyphMap || {};
  if (!text) return null;
  if (glyphMap[text]) return text;
  const chars = [...text];
  if (chars.length === 1) {
    const codePoint = chars[0].codePointAt(0);
    for (const [name, codePoints] of Object.entries(glyphMap)) {
      if (codePoints?.includes(codePoint)) return name;
    }
  }
  return null;
}

function parseGlyphReference(text, fontController) {
  let t = String(text).trim();
  if (t.startsWith("=")) t = t.slice(1).trim();
  let opposite = false;
  if (t.startsWith("|")) {
    opposite = true;
    t = t.slice(1).trim();
  }
  if (!t) return null;
  const whole = resolveGlyphName(t, fontController);
  if (whole) return { glyphName: whole, opposite, operation: "" };
  // il nome più lungo seguito da un calcolo: "H+10", "a.ss01*2"
  for (let i = t.length - 1; i > 0; i--) {
    if (!"+-*/".includes(t[i])) continue;
    const glyphName = resolveGlyphName(t.slice(0, i).trim(), fontController);
    const operation = t.slice(i).replace(/\s+/g, "");
    if (glyphName && Number.isFinite(calculate(`1${operation}`))) return { glyphName, opposite, operation };
  }
  return null;
}

// Margini e larghezza di un glifo in una posizione: dal master, se c'è,
// altrimenti interpolati
async function glyphMetricsAt(fontController, glyphName, location) {
  const varGlyph = await fontController.getGlyph(glyphName);
  if (!varGlyph) return null;
  let controller = null;
  let sourceIndex;
  try {
    sourceIndex = varGlyph.getSourceIndex(location);
  } catch (error) {
    sourceIndex = undefined;
  }
  if (sourceIndex !== undefined) {
    const layerName = varGlyph.sources[sourceIndex].layerName;
    if (varGlyph.glyph.layers[layerName]) {
      controller = await fontController.getLayerGlyphController(glyphName, layerName, sourceIndex);
    }
  }
  if (!controller) controller = await fontController.getGlyphInstance(glyphName, location);
  if (!controller) return null;
  const bounds = controller.bounds;
  const xAdvance = controller.xAdvance;
  return {
    lsb: bounds ? bounds.xMin : null,
    rsb: bounds ? xAdvance - bounds.xMax : null,
    width: xAdvance,
  };
}

async function referenceValue(fontController, reference, field, location) {
  const metrics = await glyphMetricsAt(fontController, reference.glyphName, location);
  if (!metrics) return null;
  let key = field;
  if (reference.opposite && field === "lsb") key = "rsb";
  else if (reference.opposite && field === "rsb") key = "lsb";
  const value = metrics[key];
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  if (!reference.operation) return value;
  const result = calculate(`(${Math.round(value * 1000) / 1000})${reference.operation}`);
  return Number.isFinite(result) ? result : null;
}

// --- Margini collegati, come le "metrics keys" di Glyphs ----------------------
// Scrivendo "H" nel margine sinistro di I, il margine resta collegato a H:
// quando cambia H, I si aggiorna da solo, in tutti i master.
// I collegamenti sono salvati nel font, in customData["fontra.plugin.metricsKeys"]:
//   { "I": { "lsb": { "glyph": "H" }, "rsb": { "glyph": "H", "opposite": true, "op": "+5" } } }
// Lo stesso codice è nei plugin "Barra info" e "Testi di kerning": in ogni
// finestra ne lavora uno solo.

const MK_DATA_KEY = "fontra.plugin.metricsKeys";
const MK_META = "metricsKeysPlugin";
const MK_ENGINE = "__fontraMetricsKeysEngine";
const MK_FIELDS = ["lsb", "rsb", "width"];
const MK_DELAY_MS = 120;
const MK_GLYPHS_PER_CHUNK = 40;

class MKBuilder {
  constructor() {
    this.forward = [];
    this.backward = [];
  }
}

function mkClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function mkSet(builder, path, key, newValue, oldValue) {
  builder.forward.push({ p: path, f: "=", a: [key, mkClone(newValue)] });
  builder.backward.unshift(
    oldValue === undefined ? { p: path, f: "d", a: [key] } : { p: path, f: "=", a: [key, mkClone(oldValue)] }
  );
}

function mkDelete(builder, path, key, oldValue) {
  builder.forward.push({ p: path, f: "d", a: [key] });
  builder.backward.unshift({ p: path, f: "=", a: [key, mkClone(oldValue)] });
}

function mkAll(fontController) {
  const all = fontController.customData?.[MK_DATA_KEY];
  return all && typeof all === "object" ? all : {};
}

function mkLinksFor(fontController, glyphName) {
  return mkAll(fontController)[glyphName] || {};
}

// Il collegamento come si scrive: "=H", "=|H", "=H+10"
function mkText(link) {
  if (!link?.glyph) return "";
  return `=${link.opposite ? "|" : ""}${link.glyph}${link.op || ""}`;
}

function mkLinkFromReference(reference) {
  const link = { glyph: reference.glyphName };
  if (reference.opposite) link.opposite = true;
  if (reference.operation) link.op = reference.operation;
  return link;
}

function mkReference(link) {
  return { glyphName: link.glyph, opposite: !!link.opposite, operation: link.op || "" };
}

// Cosa cambia nei collegamenti scrivendo in un campo: il nome di un glifo
// collega il campo, un numero lo scollega. Destro e larghezza si escludono,
// perché decidono tutti e due la larghezza del glifo.
function mkUpdatesForInput(field, reference) {
  const updates = { [field]: reference ? mkLinkFromReference(reference) : null };
  if (field === "rsb") updates.width = null;
  else if (field === "width") updates.rsb = null;
  return updates;
}

// Aggiunge al builder le modifiche ai collegamenti dei glifi. Restituisce i
// collegamenti nuovi di ogni glifo.
function mkPlanLinks(fontController, builder, glyphNames, updates) {
  const customData = fontController.customData;
  const all = customData?.[MK_DATA_KEY];
  const base = ["customData", MK_DATA_KEY];
  let created = false;
  const result = {};
  for (const name of glyphNames) {
    const old = all?.[name];
    const next = { ...(old || {}) };
    for (const [field, link] of Object.entries(updates)) {
      // un glifo non si collega a se stesso
      if (link && link.glyph !== name) next[field] = link;
      else if (!link) delete next[field];
    }
    result[name] = next;
    if (JSON.stringify(old || {}) === JSON.stringify(next)) continue;
    if (!all && !created) {
      if (!customData) continue;
      mkSet(builder, ["customData"], MK_DATA_KEY, {}, undefined);
      created = true;
    }
    if (Object.keys(next).length) mkSet(builder, base, name, next, old);
    else if (old) mkDelete(builder, base, name, old);
  }
  return result;
}

// Sposta in orizzontale contorni, componenti, ancore e guide (non la larghezza)
function mkShift(builder, base, glyph, dx) {
  const path = mkClone(glyph.path);
  if (path?.coordinates?.length) {
    for (let i = 0; i < path.coordinates.length; i += 2) path.coordinates[i] += dx;
    mkSet(builder, base, "path", path, glyph.path);
  }
  (glyph.components || []).forEach((component, index) => {
    const t = component.transformation || {};
    mkSet(builder, [...base, "components", index, "transformation"], "translateX", (t.translateX || 0) + dx, t.translateX || 0);
  });
  if (glyph.anchors?.length) {
    mkSet(builder, base, "anchors", glyph.anchors.map((a) => ({ ...mkClone(a), x: a.x + dx })), glyph.anchors);
  }
  if (glyph.guidelines?.length) {
    mkSet(
      builder,
      base,
      "guidelines",
      glyph.guidelines.map((g) => (Number.isFinite(g.x) ? { ...mkClone(g), x: g.x + dx } : mkClone(g))),
      glyph.guidelines
    );
  }
}

// Applica i collegamenti di un glifo in tutti i suoi master.
// found: il glifo di riferimento ha dato almeno un valore.
async function mkPlanGlyph(fontController, glyphName, links, builder) {
  const refs = {};
  for (const field of MK_FIELDS) {
    const link = links?.[field];
    if (link?.glyph && link.glyph !== glyphName && link.glyph in fontController.glyphMap) refs[field] = mkReference(link);
  }
  const result = { changed: false, found: false };
  if (!Object.keys(refs).length) return result;
  const varGlyph = await fontController.getGlyph(glyphName);
  if (!varGlyph) return result;
  const seen = new Set();
  for (const [sourceIndex, source] of varGlyph.sources.entries()) {
    const layer = varGlyph.glyph.layers[source.layerName];
    if (source.inactive || !layer || seen.has(source.layerName)) continue;
    seen.add(source.layerName);
    const glyph = layer.glyph;
    const controller = await fontController.getLayerGlyphController(glyphName, source.layerName, sourceIndex);
    const bounds = controller?.bounds;
    const location = varGlyph.getDenseSourceLocationForSource(source);
    let dx = 0;
    let xAdvance = glyph.xAdvance;
    if (refs.lsb && bounds) {
      const target = await referenceValue(fontController, refs.lsb, "lsb", location);
      if (target !== null) {
        result.found = true;
        dx = Math.round(target - bounds.xMin);
      }
    }
    xAdvance += dx;
    if (refs.width) {
      const target = await referenceValue(fontController, refs.width, "width", location);
      if (target !== null) {
        result.found = true;
        xAdvance = Math.max(0, Math.round(target));
      }
    } else if (refs.rsb && bounds) {
      const target = await referenceValue(fontController, refs.rsb, "rsb", location);
      if (target !== null) {
        result.found = true;
        xAdvance = Math.round(bounds.xMax + dx + target);
      }
    }
    const base = ["glyphs", glyphName, "layers", source.layerName, "glyph"];
    if (dx) mkShift(builder, base, glyph, dx);
    if (xAdvance !== glyph.xAdvance) mkSet(builder, base, "xAdvance", xAdvance, glyph.xAdvance);
    if (dx || xAdvance !== glyph.xAdvance) result.changed = true;
  }
  return result;
}

function mkGlyphNamesOfChange(change, prefix = [], names = new Set()) {
  const path = [...prefix, ...(change.p || [])];
  if (path[0] === "glyphs") {
    if (path.length > 1) names.add(path[1]);
    else if (change.f && change.a?.[0] !== undefined) names.add(change.a[0]);
  }
  for (const child of change.c || []) mkGlyphNamesOfChange(child, path, names);
  return names;
}

function mkGlyphNameOfSubChange(change) {
  const path = change.p || [];
  if (path[0] !== "glyphs") return null;
  return path.length > 1 ? path[1] : change.a?.[0] ?? null;
}

// Il server di Fontra tiene in memoria 128 glifi per volta: le modifiche
// grandi partono a blocchi
async function mkPost(fontController, change, rollbackChange, label) {
  const names = new Set((change.c || []).map(mkGlyphNameOfSubChange).filter((n) => n !== null));
  if (names.size <= MK_GLYPHS_PER_CHUNK) {
    await fontController.postChange(change, rollbackChange, label);
    return;
  }
  let chunk = [];
  let chunkNames = new Set();
  const send = async () => {
    if (!chunk.length) return;
    await fontController.postChange({ c: chunk, [MK_META]: change[MK_META] }, { c: [] }, label);
    chunk = [];
    chunkNames = new Set();
  };
  for (const sub of change.c || []) {
    const name = mkGlyphNameOfSubChange(sub);
    if (name !== null && !chunkNames.has(name) && chunkNames.size >= MK_GLYPHS_PER_CHUNK) await send();
    if (name !== null) chunkNames.add(name);
    chunk.push(sub);
  }
  await send();
}

// Tiene aggiornati i margini collegati. Reagisce solo alle modifiche fatte in
// questa finestra: le altre finestre ricevono il risultato dal server.
class MetricsKeysEngine {
  static install(fontController) {
    if (!fontController) return null;
    if (!fontController[MK_ENGINE]) fontController[MK_ENGINE] = new MetricsKeysEngine(fontController);
    return fontController[MK_ENGINE];
  }

  constructor(fontController) {
    this.fc = fontController;
    this.pending = new Set();
    this.running = false;
    this.snapshot = this.takeSnapshot();
    fontController.addChangeListener(
      { glyphs: null, customData: null },
      (change, isExternalChange) => this.onChange(change, isExternalChange),
      false
    );
  }

  takeSnapshot() {
    const snapshot = new Map();
    for (const [name, links] of Object.entries(mkAll(this.fc))) snapshot.set(name, JSON.stringify(links));
    return snapshot;
  }

  onChange(change, isExternalChange) {
    const previous = this.snapshot;
    this.snapshot = this.takeSnapshot();
    if (isExternalChange || !change || change[MK_META]) return;
    // glifi con un collegamento nuovo o cambiato (anche da un annulla)
    for (const name of new Set([...previous.keys(), ...this.snapshot.keys()])) {
      if (previous.get(name) !== this.snapshot.get(name)) this.pending.add(name);
    }
    for (const name of mkGlyphNamesOfChange(change)) this.pending.add(name);
    if (this.pending.size) this.schedule();
  }

  schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.run(), MK_DELAY_MS);
  }

  usersOf(name) {
    try {
      return [...(this.fc.iterGlyphsUsedByRecursively?.(name) || [])];
    } catch (error) {
      return [];
    }
  }

  async run() {
    if (this.running) {
      this.schedule();
      return;
    }
    this.running = true;
    try {
      const fc = this.fc;
      const changed = [...this.pending];
      this.pending.clear();
      const all = mkAll(fc);
      if (!Object.keys(all).length) return;

      // chi dipende da chi
      const dependents = new Map();
      for (const [name, links] of Object.entries(all)) {
        if (!(name in fc.glyphMap)) continue;
        for (const field of MK_FIELDS) {
          const ref = links?.[field]?.glyph;
          if (!ref || ref === name) continue;
          if (!dependents.has(ref)) dependents.set(ref, new Set());
          dependents.get(ref).add(name);
        }
      }

      // Da aggiornare: i glifi cambiati che hanno collegamenti e, a catena, chi
      // dipende da loro (anche attraverso i componenti: se cambia H, cambia
      // anche un glifo che contiene H)
      const affected = new Set();
      const expanded = new Set();
      const expand = (name) => {
        if (expanded.has(name)) return;
        expanded.add(name);
        for (const dependent of dependents.get(name) || []) {
          affected.add(dependent);
          expand(dependent);
        }
        for (const user of this.usersOf(name)) {
          if (all[user] && user in fc.glyphMap) affected.add(user);
          expand(user);
        }
      };
      for (const name of changed) {
        if (all[name] && name in fc.glyphMap) affected.add(name);
        expand(name);
      }
      if (!affected.size) return;

      // prima i glifi di riferimento, poi chi li usa
      const order = [];
      const placed = new Set();
      const place = (name) => {
        if (placed.has(name)) return;
        placed.add(name);
        for (const field of MK_FIELDS) {
          const ref = all[name]?.[field]?.glyph;
          if (ref && affected.has(ref)) place(ref);
        }
        order.push(name);
      };
      for (const name of affected) place(name);

      let forward = [];
      let backward = [];
      for (const name of order) {
        const builder = new MKBuilder();
        const { changed: glyphChanged } = await mkPlanGlyph(fc, name, all[name], builder);
        if (!glyphChanged || !builder.forward.length) continue;
        // subito nel font, così chi viene dopo legge i valori nuovi
        await fc.applyChange({ c: builder.forward, [MK_META]: true });
        forward = forward.concat(builder.forward);
        backward = builder.backward.concat(backward);
      }
      if (!forward.length) return;
      const label = "Margini collegati";
      await mkPost(fc, { c: forward, [MK_META]: { label } }, { c: backward, [MK_META]: { label } }, label);
    } catch (error) {
      console.error("[Margini collegati]", error);
    } finally {
      this.running = false;
    }
  }
}

const METRICS_CSS = `
  :host { display: block; font-size: 0.95em; }
  .who { margin: 0 0 6px; min-height: 1.2em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .who .uni { opacity: 0.55; margin-left: 6px; }
  .grid {
    display: grid; grid-template-columns: auto 1fr 1fr 1fr; gap: 4px 5px; align-items: center;
  }
  .col { text-align: center; opacity: 0.6; font-size: 0.85em; }
  .lab { opacity: 0.7; font-size: 0.9em; padding-right: 2px; }
  .groups { grid-column: 2 / 5; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
  input {
    width: 100%; min-width: 0; box-sizing: border-box; font: inherit; text-align: center;
    color: var(--text-input-foreground-color, inherit);
    background: var(--text-input-background-color, #f0f0f0);
    border: 1px solid transparent; border-radius: 5px; padding: 2px 4px; outline: none;
  }
  input:focus { border-color: #3b82f6; }
  input.error { border-color: #e03131; }
  input:disabled { opacity: 0.45; }
  input::placeholder { opacity: 0.55; font-style: italic; }
  .note { margin-top: 6px; font-size: 0.82em; opacity: 0.65; line-height: 1.3; }
  .all { display: flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 0.9em; cursor: pointer; user-select: none; }
  .all input { width: auto; margin: 0; }
  .note:empty { display: none; }
  .note.error-note { opacity: 1; color: #e03131; }
  .tools { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
  .tools button {
    font: inherit; font-size: 0.9em; color: inherit; cursor: pointer; border-radius: 5px;
    border: 1px solid #8884; background: transparent; padding: 2px 7px;
  }
  .tools button:hover { background: #8882; }
  input.linked { color: #3b82f6; }
  .link { text-align: center; font-size: 0.8em; color: #3b82f6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .link-row[hidden] { display: none; }
`;

class MetricsElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${METRICS_CSS}</style>
      <div class="who" id="who"></div>
      <div class="grid">
        <span></span><span class="col">Sinistro</span><span class="col">Larghezza</span><span class="col">Destro</span>
        <span class="lab">Margine</span>
        <input id="lsb" title="Margine sinistro (LSB): un numero, +10, --10, oppure il nome di un glifo (H) per collegarlo al suo margine" />
        <input id="width" title="Larghezza: un numero, +10, --10, oppure il nome di un glifo (H) per collegarla alla sua larghezza" />
        <input id="rsb" title="Margine destro (RSB): un numero, +10, --10, oppure il nome di un glifo (H) per collegarlo al suo margine" />
        <span class="lab link-row" hidden>Collegato</span>
        <span class="link link-row" id="link-lsb" hidden></span>
        <span class="link link-row" id="link-width" hidden></span>
        <span class="link link-row" id="link-rsb" hidden></span>
        <span class="lab">Gruppo</span>
        <div class="groups">
          <input id="groupL" title="Gruppo di kerning del lato sinistro" spellcheck="false" />
          <input id="groupR" title="Gruppo di kerning del lato destro" spellcheck="false" />
        </div>
      </div>
      <label class="all" title="Margini e larghezza cambiano in tutti i master del glifo, non solo in quello scelto in Source">
        <input type="checkbox" id="all-masters" /> Tutti i master
      </label>
      <div class="note" id="note"></div>
      <div class="tools">
        <button id="check-kerning" title="Eccezioni, valori senza gruppo, master vuoti: prima vedi, poi scegli">Controlla kerning…</button>
        <button id="interpolate-kerning" title="Calcola dagli angoli i master intermedi del kerning: prima vedi cosa cambia">Master intermedi…</button>
      </div>`;
    this.$ = (sel) => this.shadowRoot.querySelector(sel);
  }
}

class OverviewMetrics {
  constructor(controller) {
    this.controller = controller;
    this.fc = controller.fontController;
    this.settings = controller.fontOverviewSettingsController;
    if (!customElements.get(METRICS_TAG)) customElements.define(METRICS_TAG, MetricsElement);
    this.element = document.createElement(METRICS_TAG);
    this.values = {};
    // "Tutti i master": acceso se non l'hai spento tu
    this.allMasters = loadJSON(METRICS_SETTINGS_KEY, {}).allMasters !== false;
    const checkbox = this.element.$("#all-masters");
    checkbox.checked = this.allMasters;
    checkbox.addEventListener("change", () => {
      this.allMasters = checkbox.checked;
      saveJSON(METRICS_SETTINGS_KEY, { allMasters: this.allMasters });
      this.scheduleRefresh();
    });
    checkbox.addEventListener("keydown", (event) => event.stopPropagation());
    const openDialog = (mode) =>
      new KerningToolsDialog({ fc: this.fc, apply: (builder, label) => this.post(builder, label) }, mode).open();
    this.element.$("#check-kerning").addEventListener("click", () => openDialog("check"));
    this.element.$("#interpolate-kerning").addEventListener("click", () => openDialog("interpolate"));
    this.setupInputs();
    this.insertInSidebar();
    this.installChunkedUndo();
    // Margini collegati: quando cambia un glifo, chi è collegato a lui si aggiorna
    MetricsKeysEngine.install(this.fc);

    // La panoramica di Fontra non riceve le modifiche al kerning fatte altrove
    loadKerning(this.fc)
      .then(() => this.fc.subscribeChanges?.({ kerning: null }, false))
      .catch(() => {});
    this.fc.getKerningController("kern").then((kc) => (this.kc = kc), () => {});

    const schedule = () => this.scheduleRefresh();
    this.settings.addKeyListener(["glyphSelection", "fontLocationSourceMapped"], schedule);
    // Se la selezione cambia mentre sei in un campo ma non hai ancora scritto,
    // il campo segue la nuova selezione; se hai già scritto, il valore va ai
    // glifi su cui stavi scrivendo.
    this.settings.addKeyListener("glyphSelection", () => {
      const active = this.element.shadowRoot.activeElement;
      if (active && active.type !== "checkbox" && !active.dataset.dirty) this.editingNames = this.selectedNames;
    });
    this.fc.addChangeListener({ glyphs: null }, schedule, false);
    this.fc.addChangeListener({ glyphMap: null }, schedule, false);
    this.fc.addChangeListener({ customData: null }, schedule, false);
    this.fc.addChangeListener(
      { kerning: null },
      (change) => {
        if (change?.[METRICS_META]) this.kc?.clearCaches();
        schedule();
      },
      false,
      true
    );
    this.scheduleRefresh();
  }

  async insertInSidebar() {
    for (let i = 0; i < 100; i++) {
      const accordion = this.controller.navigation?.accordion;
      if (accordion?.items?.length) {
        if (accordion.items.some((item) => item.id === "kerning-metrics")) return;
        const closed = this.controller.fontOverviewSettings?.closedNavigationSections;
        const item = {
          label: "Margini e gruppi di kerning",
          id: "kerning-metrics",
          content: this.element,
          open: !closed?.has?.("kerning-metrics"),
        };
        // Fontra nasconde alcune sezioni direttamente nella pagina (per esempio
        // "Hidden font axes" quando non ci sono assi nascosti): ridisegnando
        // l'elenco quello stato si perderebbe, quindi lo copiamo nelle voci.
        for (const it of accordion.items) {
          const rendered = it.id ? accordion.querySelector?.(`#${it.id}`) : null;
          if (rendered) it.hidden = rendered.hidden;
        }
        // Subito dopo Source e Font axes
        const items = [...accordion.items];
        const groupIndex = items.findIndex((it) => it.id === "group-by");
        items.splice(groupIndex >= 0 ? groupIndex : items.length, 0, item);
        accordion.items = items;
        return;
      }
      await sleep(200);
    }
    console.warn("[Testi di kerning] Barra laterale della panoramica non trovata.");
  }

  get selectedNames() {
    if (this.controller.getSelectedExistingGlyphNames) return this.controller.getSelectedExistingGlyphNames();
    const glyphMap = this.fc.glyphMap;
    return [...(this.settings.model.glyphSelection || [])].filter((n) => n in glyphMap);
  }

  // Posizione per disegnare (come le caselle della panoramica)
  get location() {
    return this.settings.model.fontLocationSourceMapped || {};
  }

  // Posizione per trovare il master: quella vera, non "mappata" (nei font con
  // assi collegati tra loro le due sono diverse)
  get sourceLocation() {
    return this.settings.model.fontLocationSource || this.location;
  }

  // --- lettura ---------------------------------------------------------------

  scheduleRefresh() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refresh(), 80);
  }

  async metricsFor(name) {
    const varGlyph = await this.fc.getGlyph(name);
    if (!varGlyph) return null;
    const location = this.location;
    let sourceIndex;
    try {
      sourceIndex = varGlyph.getSourceIndex(this.sourceLocation);
      if (sourceIndex === undefined && this.sourceLocation !== location) {
        sourceIndex = varGlyph.getSourceIndex(location);
      }
    } catch (error) {
      sourceIndex = undefined;
    }
    let controller;
    let layerName = null;
    if (sourceIndex !== undefined) {
      layerName = varGlyph.sources[sourceIndex].layerName;
      controller = await this.fc.getLayerGlyphController(name, layerName, sourceIndex);
    } else {
      controller = await this.fc.getGlyphInstance(name, location);
    }
    if (!controller) return null;
    const bounds = controller.bounds;
    const xAdvance = controller.xAdvance;
    return {
      name,
      location: sourceIndex !== undefined ? varGlyph.getDenseSourceLocationForSource(varGlyph.sources[sourceIndex]) : location,
      hasMasters: varGlyph.sources.some((source) => !source.inactive && varGlyph.glyph.layers[source.layerName]),
      editable: sourceIndex !== undefined && !!varGlyph.glyph.layers[layerName],
      layerName,
      layerGlyph: layerName ? varGlyph.glyph.layers[layerName]?.glyph : null,
      bounds,
      lsb: bounds ? Math.round(bounds.xMin) : null,
      rsb: bounds ? Math.round(xAdvance - bounds.xMax) : null,
      width: Math.round(xAdvance),
    };
  }

  async refresh() {
    const token = (this.refreshToken = (this.refreshToken || 0) + 1);
    const names = this.selectedNames;
    const $ = this.element.$;
    const who = $("#who");
    const note = $("#note");
    const fields = ["lsb", "width", "rsb", "groupL", "groupR"];

    if (!names.length) {
      who.textContent = "Nessun glifo selezionato";
      for (const id of fields) this.setField(id, "", "", true);
      for (const id of ["lsb", "width", "rsb"]) {
        delete $(`#${id}`).dataset.key;
        $(`#${id}`).classList.remove("linked");
      }
      for (const el of this.element.shadowRoot.querySelectorAll(".link-row")) el.hidden = true;
      note.textContent = "";
      this.infos = [];
      return;
    }

    const infos = [];
    for (const name of names) {
      const info = await this.metricsFor(name);
      if (token !== this.refreshToken) return; // nel frattempo è cambiato qualcosa
      if (info) infos.push(info);
    }
    this.infos = infos;
    if (!this.kc) {
      try {
        this.kc = await this.fc.getKerningController("kern");
      } catch (error) {
        this.kc = null;
      }
    }

    if (names.length === 1) {
      const codePoint = this.fc.glyphMap[names[0]]?.[0];
      const unicode = codePoint !== undefined ? `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}` : "";
      who.innerHTML = `<b>${escapeHTML(names[0])}</b><span class="uni">${unicode}</span>`;
    } else {
      const shown = names.slice(0, 8).map((n) => {
        const cp = this.fc.glyphMap[n]?.[0];
        return cp !== undefined ? String.fromCodePoint(cp) : n;
      });
      who.innerHTML = `<b>${names.length} glifi</b> <span class="uni">${escapeHTML(shown.join(" "))}${names.length > 8 ? " …" : ""}</span>`;
    }

    const editable = infos.filter((i) => i.editable);
    const combine = (values) => {
      const defined = values.filter((v) => v !== null && v !== undefined);
      if (!defined.length) return { value: "", placeholder: "–" };
      return defined.every((v) => v === defined[0]) && defined.length === values.length
        ? { value: String(defined[0]), placeholder: "" }
        : { value: "", placeholder: "multipli" };
    };
    const editableAll = infos.filter((i) => i.hasMasters);
    const readOnly = (this.allMasters ? !editableAll.length : !editable.length) || this.fc.readOnly;
    for (const id of ["lsb", "width", "rsb"]) {
      const { value, placeholder } = combine(infos.map((i) => i[id]));
      this.setField(id, value, placeholder, readOnly);
    }
    // Margini collegati: il campo è blu, sotto c'è a cosa è collegato
    const allLinks = mkAll(this.fc);
    let anyLink = false;
    for (const id of ["lsb", "width", "rsb"]) {
      const texts = infos.map((i) => mkText(allLinks[i.name]?.[id]));
      const some = texts.some(Boolean);
      const same = texts.length > 0 && texts.every((t) => t === texts[0]);
      const input = $(`#${id}`);
      if (same && texts[0]) input.dataset.key = texts[0];
      else delete input.dataset.key;
      input.classList.toggle("linked", some);
      $(`#link-${id}`).textContent = !some ? "" : same ? texts[0] : "in parte";
      $(`#link-${id}`).title = same && texts[0] ? `Collegato: ${texts[0]}. Scrivi un numero per scollegarlo.` : "";
      anyLink = anyLink || some;
    }
    for (const el of this.element.shadowRoot.querySelectorAll(".link-row")) el.hidden = !anyLink;
    const groupsLeft = infos.map((i) => this.kc?.rightPairGroupMapping?.[i.name] || "");
    const groupsRight = infos.map((i) => this.kc?.leftPairGroupMapping?.[i.name] || "");
    const sameL = groupsLeft.every((g) => g === groupsLeft[0]);
    const sameR = groupsRight.every((g) => g === groupsRight[0]);
    this.setField("groupL", sameL ? groupsLeft[0] : "", sameL ? "" : "multipli", this.fc.readOnly);
    this.setField("groupR", sameR ? groupsRight[0] : "", sameR ? "" : "multipli", this.fc.readOnly);

    note.classList.remove("error-note");
    if (this.errorText && Date.now() < (this.errorUntil || 0)) {
      note.textContent = this.errorText;
      note.classList.add("error-note");
    } else if (this.allMasters) {
      note.textContent = editable.length
        ? "Margini e larghezza cambiano in tutti i master."
        : "Qui non c'è un master: i valori sono interpolati. Margini e larghezza cambiano in tutti i master.";
    } else if (!editable.length) {
      note.textContent = "Qui non c'è un master: scegli un master in Source per modificare i margini.";
    } else if (editable.length < infos.length) {
      const n = infos.length - editable.length;
      note.textContent = `${n} ${n === 1 ? "glifo non ha" : "glifi non hanno"} un master in questa posizione: i loro margini non vengono modificati.`;
    } else {
      note.textContent = "";
    }
  }

  setField(id, value, placeholder, disabled) {
    const input = this.element.$(`#${id}`);
    input.disabled = !!disabled;
    input.placeholder = placeholder || "";
    // non disturbare chi sta scrivendo
    if (this.element.shadowRoot.activeElement === input && (input.dataset.dirty || (input.dataset.key && input.value === input.dataset.key))) return;
    input.value = value ?? "";
    input.dataset.original = input.value;
    input.classList.remove("error");
  }

  // --- scrittura --------------------------------------------------------------

  setupInputs() {
    for (const input of this.element.shadowRoot.querySelectorAll("input:not([type=checkbox])")) {
      const id = input.id;
      const isNumber = ["lsb", "width", "rsb"].includes(id);
      input.addEventListener("focus", () => {
        delete input.dataset.dirty;
        // un campo collegato mostra il collegamento ("=H"), da modificare o sostituire
        if (input.dataset.key) input.value = input.dataset.key;
        input.dataset.original = input.value;
        // I glifi su cui stai lavorando: se poi clicchi un altro glifo per uscire
        // dal campo, il valore va comunque a questi
        this.editingNames = this.selectedNames;
        setTimeout(() => input.select(), 0);
      });
      input.addEventListener("input", () => (input.dataset.dirty = "1"));
      input.addEventListener("blur", () => {
        // Come nella Barra info: se hai scritto qualcosa (anche lo stesso valore) o
        // premuto Invio, si applica. Così riscrivere il valore allinea tutti i master.
        const changed =
          !!input.dataset.dirty && (input.value.trim() !== "" || input.value !== (input.dataset.original ?? ""));
        delete input.dataset.dirty;
        const names = this.editingNames;
        this.editingNames = null;
        if (changed) this.commit(id, input.value, input, names);
        else if (input.dataset.key) this.scheduleRefresh();
      });
      input.addEventListener("keydown", (event) => {
        event.stopPropagation(); // le scorciatoie della panoramica (⌫, ⌘A, …) non devono scattare
        if (event.key === "Enter") {
          event.preventDefault();
          input.dataset.dirty = "1";
          input.blur();
        } else if (event.key === "Escape") {
          event.preventDefault();
          delete input.dataset.dirty;
          input.value = input.dataset.original ?? "";
          input.blur();
        } else if (isNumber && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          event.preventDefault();
          const step = event.shiftKey ? 10 : 1;
          this.commit(id, event.key === "ArrowUp" ? `+${step}` : `--${step}`, input, this.editingNames);
        }
      });
    }
  }

  async commit(id, text, input, names = null) {
    names = names?.length ? names : this.selectedNames;
    // un nuovo valore cancella il messaggio d'errore di prima
    this.errorText = null;
    input?.classList.remove("error");
    try {
      if (id === "groupL" || id === "groupR") await this.commitGroup(id, text, input, names);
      else await this.commitMetric(id, text, input, names);
    } catch (error) {
      console.error("[Testi di kerning]", error);
      this.showError(input, `Non è stato possibile applicare il valore: ${error?.message || error}`);
    }
    this.scheduleRefresh();
  }

  // Il campo diventa rosso e sotto compare il motivo, per qualche secondo
  showError(input, text) {
    input?.classList.add("error");
    this.errorText = text;
    this.errorUntil = Date.now() + 12000;
    const note = this.element.$("#note");
    note.textContent = text;
    note.classList.add("error-note");
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.errorText = null;
      this.scheduleRefresh();
    }, 12000);
  }

  // I livelli da modificare: solo il master scelto in Source, o tutti i master
  async metricTargets(names) {
    // Valori letti adesso, per i glifi su cui stavi lavorando
    const infos = [];
    for (const name of names) {
      const info = await this.metricsFor(name);
      if (info) infos.push(info);
    }
    if (!this.allMasters) return infos.filter((i) => i.editable);
    const targets = [];
    for (const info of infos) {
      const varGlyph = await this.fc.getGlyph(info.name);
      if (!varGlyph) continue;
      const seen = new Set();
      for (const [sourceIndex, source] of varGlyph.sources.entries()) {
        const layer = varGlyph.glyph.layers[source.layerName];
        if (source.inactive || !layer || seen.has(source.layerName)) continue;
        seen.add(source.layerName);
        const controller = await this.fc.getLayerGlyphController(info.name, source.layerName, sourceIndex);
        const bounds = controller?.bounds;
        const xAdvance = controller?.xAdvance ?? layer.glyph.xAdvance;
        targets.push({
          name: info.name,
          location: varGlyph.getDenseSourceLocationForSource(source),
          layerName: source.layerName,
          layerGlyph: layer.glyph,
          bounds,
          lsb: bounds ? Math.round(bounds.xMin) : null,
          rsb: bounds ? Math.round(xAdvance - bounds.xMax) : null,
          width: Math.round(xAdvance),
        });
      }
    }
    return targets;
  }

  async commitMetric(id, text, input, names) {
    if (this.fc.readOnly) return;
    const relative = isRelativeInput(text);
    const absolute = relative ? null : evaluateInput(text, null);
    // Il nome di un glifo ("H", "=H", "=|H", "H+10"): il suo valore, master per master
    const reference = !relative && absolute === null ? parseGlyphReference(text, this.fc) : null;
    if (!relative && absolute === null && !reference) {
      this.showError(
        input,
        `«${text}» non è un valore valido: scrivi un numero (40), un calcolo (590/2), un'operazione (+10, --10, *2, /2) o il nome di un glifo (H).`
      );
      return;
    }
    const labels = { lsb: "Margine sinistro", rsb: "Margine destro", width: "Larghezza" };

    // Il nome di un glifo collega il campo, come in Glyphs: il valore segue
    // quel glifo, in tutti i master, anche quando lo modifichi dopo.
    if (reference) {
      const targets = names.filter((name) => name !== reference.glyphName && name in this.fc.glyphMap);
      if (!targets.length) {
        this.showError(input, `Un glifo non può essere collegato a se stesso.`);
        return;
      }
      const builder = new ChangeBuilder();
      const links = mkPlanLinks(this.fc, builder, targets, mkUpdatesForInput(id, reference));
      let found = false;
      for (const name of targets) {
        const { found: glyphFound } = await mkPlanGlyph(this.fc, name, links[name], builder);
        found = found || glyphFound;
      }
      if (!found) {
        this.showError(input, `«${reference.glyphName}» non ha contorni, quindi non ha margini da copiare.`);
        return;
      }
      if (builder.isEmpty) return;
      await this.post(builder, `${labels[id]} collegato a ${reference.glyphName}`);
      return;
    }

    // Un valore: uguale per tutti. Un'operazione: dal valore di ogni glifo e master.
    const infos = await this.metricTargets(names);
    if (!infos.length) return;
    const builder = new ChangeBuilder();
    for (const info of infos) {
      const own = info[id];
      if (own === null && id !== "width") continue; // glifo vuoto: niente margini
      let target = relative ? evaluateInput(text, own) : absolute;
      if (target === null || !Number.isFinite(target)) continue;
      target = Math.round(target);
      if (target === own) continue;
      const glyph = info.layerGlyph;
      const base = ["glyphs", info.name, "layers", info.layerName, "glyph"];
      if (id === "width") {
        builder.set(base, "xAdvance", target, glyph.xAdvance);
      } else if (id === "rsb") {
        builder.set(base, "xAdvance", Math.round(info.bounds.xMax + target), glyph.xAdvance);
      } else {
        this.shiftLayer(builder, base, glyph, target - own);
      }
    }
    // Un numero scollega il campo (e, per destro e larghezza, anche l'altro)
    mkPlanLinks(this.fc, builder, [...new Set(infos.map((info) => info.name))], mkUpdatesForInput(id, null));
    if (builder.isEmpty) return;
    await this.post(builder, labels[id] + (this.allMasters ? " (tutti i master)" : ""));
  }

  // Sposta tutto il glifo in orizzontale (come il margine sinistro in Glyphs)
  shiftLayer(builder, base, glyph, dx) {
    if (!dx) return;
    const path = clone(glyph.path);
    if (path?.coordinates?.length) {
      for (let i = 0; i < path.coordinates.length; i += 2) path.coordinates[i] += dx;
      builder.set(base, "path", path, clone(glyph.path));
    }
    (glyph.components || []).forEach((component, index) => {
      const t = component.transformation;
      builder.set([...base, "components", index, "transformation"], "translateX", (t.translateX || 0) + dx, t.translateX || 0);
    });
    if (glyph.anchors?.length) {
      builder.set(base, "anchors", glyph.anchors.map((a) => ({ ...clone(a), x: a.x + dx })), clone(glyph.anchors));
    }
    if (glyph.guidelines?.length) {
      builder.set(
        base,
        "guidelines",
        glyph.guidelines.map((g) => (Number.isFinite(g.x) ? { ...clone(g), x: g.x + dx } : clone(g))),
        clone(glyph.guidelines)
      );
    }
    builder.set(base, "xAdvance", glyph.xAdvance + dx, glyph.xAdvance);
  }

  async commitGroup(id, text, input, names) {
    if (this.fc.readOnly) return;
    const groupName = String(text).trim();
    if (groupName && !GROUP_NAME.test(groupName)) {
      this.showError(input, `«${groupName}» non è un nome di gruppo valido: usa lettere, numeri, punto, trattino e trattino basso.`);
      return;
    }
    if (!names.length) return;
    const kerning = await loadKerning(this.fc);
    const builder = new ChangeBuilder();
    // Lato sinistro del glifo = gruppi "side 2", lato destro = "side 1" (come in Fontra)
    const side = id === "groupL" ? "groupsSide2" : "groupsSide1";
    let table = kerning.kern;
    if (!table) {
      table = { sourceIdentifiers: [], groupsSide1: {}, groupsSide2: {}, values: {} };
      builder.set(["kerning"], "kern", clone(table), undefined);
    }
    const original = table[side] || {};
    const work = Object.fromEntries(Object.entries(original).map(([g, m]) => [g, [...m]]));
    for (const name of names) {
      for (const [g, members] of Object.entries(work)) {
        if (g !== groupName && members.includes(name)) work[g] = members.filter((n) => n !== name);
      }
      if (groupName) {
        const members = work[groupName] || [];
        if (!members.includes(name)) {
          const index = members.findIndex((other) => name < other);
          if (index >= 0) members.splice(index, 0, name);
          else members.push(name);
        }
        work[groupName] = members;
      }
    }
    const path = ["kerning", "kern", side];
    for (const g of new Set([...Object.keys(original), ...Object.keys(work)])) {
      const before = original[g];
      const after = work[g];
      if (JSON.stringify(before) === JSON.stringify(after)) continue;
      if (!after?.length) {
        if (before) builder.delete(path, g, clone(before));
      } else {
        builder.set(path, g, after, clone(before));
      }
    }
    if (builder.isEmpty) return;
    await this.post(builder, groupName ? `Gruppo di kerning ${groupName}` : "Togli dal gruppo di kerning");
  }

  async post(builder, label) {
    const { change, rollbackChange } = builder.build(label);
    await this.fc.applyChange(change);
    const controller = this.controller;
    if (typeof controller.postChange === "function" && controller.undoStack) {
      if (countGlyphs(change) <= GLYPHS_PER_CHUNK) {
        await controller.postChange({ change, rollbackChange }, label);
      } else {
        controller.undoStack.pushUndoRecord({ change, rollbackChange, info: { label } });
        await postChunked(this.fc, change, label);
      }
    } else {
      await postChunked(this.fc, change, label);
    }
  }

  // ⌘Z delle modifiche grandi: anche l'annullamento parte a blocchi
  installChunkedUndo() {
    const controller = this.controller;
    const original = controller.doUndoRedo;
    if (typeof original !== "function" || !controller.undoStack) return;
    controller.doUndoRedo = async (isRedo) => {
      const top = controller.undoStack.getTopUndoRedoRecord(isRedo);
      const isOurs = top?.change?.[METRICS_META] && countGlyphs(top.change) > GLYPHS_PER_CHUNK;
      if (!isOurs) return original.call(controller, isRedo);
      const record = controller.undoStack.popUndoRedoRecord(isRedo);
      const change = isRedo ? record.change : record.rollbackChange;
      await this.fc.applyChange(change);
      await postChunked(this.fc, change, record.info.label);
    };
  }
}

function itemKey(item) {
  return item.type === "pair" ? `${item.left} ${item.right}` : `t:${item.text}`;
}

function isTyping() {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return !!element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT" || element.isContentEditable);
}

// ---------------------------------------------------------------------------
// Avvio
// ---------------------------------------------------------------------------

export function start(editor, pluginPath) {
  if (editor[EDITOR_KEY]) return;
  editor[EDITOR_KEY] = new KerningTextsPlugin(editor);
}

export function startOverview(controller) {
  if (!controller || window[OVERVIEW_KEY] === true) return;
  window[OVERVIEW_KEY] = true;
  controller[OVERVIEW_KEY] = new OverviewMetrics(controller);
}

// Per i test
export { LIST_DEFINITIONS, FontView, buildLetterList, evaluateInput };
