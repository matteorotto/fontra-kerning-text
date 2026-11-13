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
          <div class="list" id="items"></div>
          <div class="row">
            <button class="button" id="prev" title="Coppia precedente (↑)">↑ Prec.</button>
            <button class="button primary" id="next" title="Coppia successiva (↓)">↓ Succ.</button>
            <button class="button" id="resume" title="Vai alla prima coppia non ancora vista">Riprendi</button>
            <span class="counter" id="counter"></span>
          </div>
          <div class="info" id="info"></div>
          <div class="row hint">
            <span>← → regolano (⇧ ×10, ⌥ ×5) · ↑ ↓ coppia · tasto destro sulla coppia: eccezione</span>
          </div>
          <div class="row hint">
            <span id="hidden-note" style="flex:1"></span>
            <button class="button" id="reset-done" title="Togli le spunte da questa lista">Azzera spunte</button>
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
    this.settings = {
      open: false, category: "Maiuscole", list: "uc-classic", context: "straight",
      perPage: 1, x: null, y: null, letter: "T", side: "both", current: {},
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
      delete this.done[this.settings.list];
      this.saveDone();
      this.renderList();
    });
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

  doneSet() {
    return new Set(this.done[this.settings.list] || []);
  }

  saveDone() {
    saveJSON(`${DONE_KEY}:${this.project}`, this.done);
  }

  markDone(item) {
    if (!item) return;
    const list = this.done[this.settings.list] || (this.done[this.settings.list] = []);
    const key = itemKey(item);
    if (!list.includes(key)) {
      list.push(key);
      this.saveDone();
    }
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
    this.panel.$("#counter").textContent = this.items.length
      ? `${this.current + 1} / ${this.items.length} · viste ${done}`
      : "";
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
      coverage;
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
        <input id="lsb" title="Margine sinistro (LSB)" />
        <input id="width" title="Larghezza" />
        <input id="rsb" title="Margine destro (RSB)" />
        <span class="lab">Gruppo</span>
        <div class="groups">
          <input id="groupL" title="Gruppo di kerning del lato sinistro" spellcheck="false" />
          <input id="groupR" title="Gruppo di kerning del lato destro" spellcheck="false" />
        </div>
      </div>
      <label class="all" title="Margini e larghezza cambiano in tutti i master del glifo, non solo in quello scelto in Source">
        <input type="checkbox" id="all-masters" /> Tutti i master
      </label>
      <div class="note" id="note"></div>`;
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
    this.setupInputs();
    this.insertInSidebar();
    this.installChunkedUndo();

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
      controller = await varGlyph.getLayerGlyphController(layerName, sourceIndex);
    } else {
      controller = await this.fc.getGlyphInstance(name, location);
    }
    if (!controller) return null;
    const bounds = controller.bounds;
    const xAdvance = controller.xAdvance;
    return {
      name,
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
    if (this.element.shadowRoot.activeElement === input && input.dataset.dirty) return;
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
        const controller = await varGlyph.getLayerGlyphController(source.layerName, sourceIndex);
        const bounds = controller?.bounds;
        const xAdvance = controller?.xAdvance ?? layer.glyph.xAdvance;
        targets.push({
          name: info.name,
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
    if (!relative && absolute === null) {
      this.showError(input, `«${text}» non è un valore valido: scrivi un numero (40), un calcolo (590/2) o un'operazione (+10, --10, *2, /2).`);
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
    if (builder.isEmpty) return;
    const labels = { lsb: "Margine sinistro", rsb: "Margine destro", width: "Larghezza" };
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
