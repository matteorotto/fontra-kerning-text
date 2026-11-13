# Testi di kerning — plugin per Fontra

Due strumenti per spaziatura e kerning, come in Glyphs:

- **nell'editor**, un pannello con testi pronti per il kerning: scegli una lista e lavori una coppia alla volta, già selezionata nello strumento Kerning di Fontra;
- **nella panoramica del font**, una sezione nella barra a sinistra con margini, larghezza e gruppi di kerning dei glifi selezionati, anche di più glifi insieme.

## Aprire il pannello

Menu **View → Testi di kerning**, oppure **⌥⌘K** (Ctrl+Alt+K su Windows e Linux). Lo stesso comando lo chiude. Il pannello si sposta trascinandolo dal titolo e ricorda dov'era.

## Come si lavora

1. Scegli la **categoria** e la **lista**.
2. Il pannello scrive la prima coppia nell'editor tra due lettere di controllo, per esempio `HH AV HH`, attiva lo strumento **Kerning** e seleziona la coppia.
3. **← →** cambiano il valore di 1, con **⇧** di 10, con **⌥** di 5 (sono i comandi dello strumento Kerning di Fontra).
4. **↓** passa alla coppia successiva, **↑** alla precedente. Puoi anche cliccare una voce della lista.

Le coppie che hai già passato restano **spuntate** (✓) e il contatore dice quante ne hai viste. **Riprendi** torna alla prima coppia non ancora vista; **Azzera spunte** ricomincia la lista. Le spunte sono salvate per ogni font, e il pannello ricorda a che punto eri di ogni lista.

- **Contesto**: le lettere di controllo intorno alla coppia. `HH nn 11` (dritte, il default), `OO oo 00` (tonde), `HO no 10` (miste) o nessuna. Per maiuscole, minuscole e cifre si usano quelle giuste: `HH Ta nn`, `nn ry nn`, `11 7. 11`.
- **Per volta**: 1 coppia, oppure 10 o 30 righe insieme per vedere più coppie a colpo d'occhio. Anche così ↑ ↓ passano da una riga all'altra.

## Le informazioni sulla coppia

Sotto la lista il pannello mostra, per la coppia selezionata:

- il **valore** di kerning nel master in cui ti trovi;
- se il valore è **tra i gruppi**, **tra due glifi** o è un'**eccezione**;
- i **gruppi** della coppia;
- **a quali altre coppie vale lo stesso valore**: "Vale per 18 coppie: AC AĆ AČ AG…". Così sai subito cosa stai cambiando.

Per fare un'eccezione per una coppia sola, tasto destro sulla coppia nell'editor: è il comando di Fontra.

## Le liste

| Categoria | Liste |
|---|---|
| Spaziatura | Una riga per lettera (HH·HOHO·OO, nn·nono·oo, 00·0101·11), punteggiatura, parole di controllo (Hamburgefonstiv). Per sistemare i margini prima del kerning. |
| Maiuscole | Coppie classiche (190, quelle che quasi sempre vanno corrette) · Tutte le coppie · Combinazioni (AVA, LTL, …) |
| Maiuscola + minuscola | Coppie classiche (Ta, Te, Vo, Yo, Fa, …) · Tutte le coppie · Minuscola + maiuscola |
| Minuscole | Coppie classiche (av, ry, fo, ky, …) · Tutte le coppie |
| Numeri | Tutte le coppie di cifre · Cifre e punteggiatura (7. 1, (1 €7 …) · Cifre e lettere · Prezzi, date e orari |
| Punteggiatura e virgolette | Maiuscola + punteggiatura · Punteggiatura + maiuscola · lo stesso per le minuscole · Virgolette e apostrofi |
| Parentesi, trattini e barre | Parentesi · Trattini · Barre, & e simboli |
| Accentate e casi limite | Maiuscole accentate accanto a T V W Y · T V W Y F P + minuscola accentata · Minuscole accentate (f, ascendenti, virgolette) · ď ľ ť Ľ con tutto · Casi estremi (fï, f), (j), L’T, T”, …) |
| Italiano | Apostrofi (L’ALBA, dell’anno, po’, c’è) · Parole e frasi |
| Altre lingue | Inglese, francese, tedesco, spagnolo, portoghese, polacco, ceco/slovacco, rumeno, turco, olandese, ungherese |
| Alternative del font | Ogni glifo con suffisso (.ss01, .alt, .lf, …) con i suoi vicini tipici |
| Una lettera | Scrivi una lettera (o `/nome` di un glifo): tutte le sue coppie con maiuscole, minuscole, cifre e punteggiatura, a destra, a sinistra o da tutti e due i lati. Ideale per lettere difficili come T, V, f. |
| Testi miei | I tuoi testi, uno per riga. `/nome` scrive un glifo senza Unicode, per esempio `TAVOLA /a.ss01`. |

**"Tutte le coppie" vuol dire davvero tutte**: ogni combinazione di lettere del font. Ma ne mostra **una per ogni coppia di gruppi di kerning**: se C, G, O e Q sono nello stesso gruppo, AC, AG, AO e AQ compaiono una volta sola, perché un solo valore le sistema tutte. Più gruppi hai, più le liste si accorciano.

Nelle liste delle accentate invece le coppie non vengono unite per gruppo: servono proprio a trovare le accentate per cui il valore del gruppo non va bene, cioè dove l'accento urta la lettera accanto (Tï, fî, ľl, …). Lì crei un'eccezione.

**Le liste si adattano al font**: le coppie con glifi che il font non ha vengono saltate, e una nota sotto il pannello dice quali caratteri mancano. Le liste delle accentate e delle alternative si costruiscono dai glifi che il font ha davvero.

## Un ordine di lavoro consigliato

1. **Spaziatura**: sistema i margini finché le righe di controllo sono uniformi.
2. **Gruppi di kerning**: assegnali (Barra info). Con "Ancore e accentate" le accentate entrano da sole nei gruppi della lettera base.
3. **Coppie classiche**: maiuscole, maiuscola + minuscola, minuscole.
4. **Punteggiatura e virgolette**, **numeri**.
5. **Tutte le coppie** per non lasciare buchi.
6. **Accentate e casi limite**, **Italiano**, **Altre lingue**: per controllare il risultato e fare le eccezioni.

## Margini e gruppi nella panoramica

Nella barra a sinistra della panoramica, sotto **Source** e **Font axes**, c'è la sezione **Margini e gruppi di kerning**. Mostra, per i glifi selezionati e per il master scelto in **Source**:

| | Sinistro | Larghezza | Destro |
|---|---|---|---|
| **Margine** | LSB | larghezza | RSB |
| **Gruppo** | gruppo del lato sinistro | | gruppo del lato destro |

- **Un glifo**: nome, Unicode e i suoi valori.
- **Più glifi**: dove i valori sono uguali li vedi; dove sono diversi il campo dice *multipli*.

Tutti i campi si possono modificare. Si conferma con **Invio**, con **Tab** o uscendo dal campo; **Esc** annulla.

- **Un valore** (`30`, `590/2`) vale per tutti i glifi selezionati: è il modo più veloce per dare lo stesso margine a un gruppo di lettere.
- **Un'operazione relativa** (`+10`, `--10`, `*2`, `/2`) parte dal valore di ciascun glifo: `+10` aggiunge 10 a ognuno. Per sottrarre scrivi `--10` (`-10` è un numero negativo).
- **↑ / ↓** nei margini e nella larghezza: ±1, con **⇧** ±10.
- **Riscrivere il valore già mostrato, o premere Invio senza cambiarlo, lo applica**, come nella Barra info. Con **Tutti i master** acceso è il modo più veloce per allineare i master: se il Regular mostra 30, Invio dà 30 anche agli altri. Entrare in un campo e uscire senza scrivere non cambia niente.
- Se dopo aver scritto clicchi un altro glifo, il valore va ai glifi su cui stavi scrivendo, non a quello appena cliccato.
- **Margine sinistro**: sposta tutto il disegno, ancore e componenti compresi, come in Glyphs. **Larghezza**: cambia lo spazio a destra. **Margine destro**: cambia la larghezza.
- **Gruppo**: scrivi il nome per mettere i glifi selezionati in quel gruppo (se non c'è, viene creato). Svuota il campo per toglierli dal gruppo. Con il plugin "Ancore e accentate", le accentate seguono la loro lettera base.
- **⌘Z** annulla.

### Tutti i master

Sotto i campi c'è l'interruttore **Tutti i master**, acceso di default (la scelta resta salvata).

- **Acceso**: margini e larghezza cambiano in **tutti i master** di ogni glifo selezionato. Un valore (`40`) dà a tutti i master lo stesso margine; un'operazione (`+10`) parte dal valore di ciascun master. Funziona anche se in **Source** sei in una posizione intermedia: i valori mostrati sono interpolati, ma la modifica va su tutti i master.
- **Spento**: cambia solo il master scelto in **Source**, come in Glyphs. Se per qualche glifo quella posizione non è un master, quel glifo non viene toccato e la sezione te lo dice.

I **gruppi di kerning** valgono sempre per tutti i master: in Fontra, come in Glyphs, il gruppo è del glifo, non del singolo master.

Come per gli altri plugin, la sezione compare nella panoramica dopo che hai aperto un glifo da lì (o dopo aver aperto la panoramica dal menu **Font** di un editor).

## Installazione

1. Crea un repository **pubblico** su GitHub, per esempio `fontra-kerning-texts`.
2. Carica `plugin.json` e `kerning-texts.js` (va bene anche questo README) nella radice del repository.
3. Crea una release con tag `v1.2.1`.
4. In Fontra apri **Fontra → Plugin Manager**, premi **+** e scrivi `https://cdn.jsdelivr.net/gh/TUONOME/fontra-kerning-texts@v1.2.1`.
5. Ricarica l'editor.

Per aggiornare da una versione precedente: crea la release `v1.2.1`, rimuovi dal Plugin Manager l'indirizzo con il tag vecchio e aggiungi quello nuovo.
