# Testi di kerning — plugin per Fontra

Due strumenti per spaziatura e kerning, come in Glyphs:

- **nell'editor**, un pannello con testi pronti per il kerning: scegli una lista e lavori una coppia alla volta, già selezionata nello strumento Kerning di Fontra;
- **nella panoramica del font**, una sezione nella barra a sinistra con margini, larghezza e gruppi di kerning dei glifi selezionati, anche di più glifi insieme;
- **per i font con più master**: il kerning in più master insieme, i master intermedi calcolati dagli angoli e un controllo del kerning (eccezioni, valori rimasti senza gruppo, master vuoti).

## Aprire il pannello

Menu **View → Testi di kerning**, oppure **⌥⌘K** (Ctrl+Alt+K su Windows e Linux). Lo stesso comando lo chiude. Il pannello si sposta trascinandolo dal titolo e ricorda dov'era.

## Come si lavora

1. Scegli la **categoria** e la **lista**.
2. Il pannello scrive la prima coppia nell'editor tra due lettere di controllo, per esempio `HH AV HH`, attiva lo strumento **Kerning** e seleziona la coppia.
3. **← →** cambiano il valore di 1, con **⇧** di 10, con **⌥** di 5 (sono i comandi dello strumento Kerning di Fontra).
4. **↓** passa alla coppia successiva, **↑** alla precedente. Puoi anche cliccare una voce della lista.

Le coppie che hai già passato restano **spuntate** (✓) e il contatore dice quante ne hai viste. Le spunte valgono **per master**: il contatore mostra il master in cui sei (per esempio `viste 12 (BW)`), e una coppia vista nel Bold Wide non risulta vista nel Light. **Riprendi** torna alla prima coppia non ancora vista; **Azzera spunte** ricomincia la lista nel master in cui sei. Le spunte sono salvate per ogni font, e il pannello ricorda a che punto eri di ogni lista.

- **Contesto**: le lettere di controllo intorno alla coppia. `HH nn 11` (dritte, il default), `OO oo 00` (tonde), `HO no 10` (miste) o nessuna. Per maiuscole, minuscole e cifre si usano quelle giuste: `HH Ta nn`, `nn ry nn`, `11 7. 11`.
- **Per volta**: 1 coppia, oppure 10 o 30 righe insieme per vedere più coppie a colpo d'occhio. Anche così ↑ ↓ passano da una riga all'altra.

## Le informazioni sulla coppia

Sotto la lista il pannello mostra, per la coppia selezionata:

- il **valore** di kerning nel master in cui ti trovi;
- se il valore è **tra i gruppi**, **tra due glifi** o è un'**eccezione**;
- i **gruppi** della coppia;
- **a quali altre coppie vale lo stesso valore**: "Vale per 18 coppie: AC AĆ AČ AG…". Così sai subito cosa stai cambiando;
- **il valore in tutti i master**, in una griglia: per DIESEL, peso (100, 400, 900) in verticale e larghezza (50, 100, 200) in orizzontale. Il master in cui sei è riquadrato; in azzurro i master a cui vanno le modifiche (vedi sotto). Un valore grigio è 0: lì la coppia non ha kerning.

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

## Kerning su più master

Con 9 master ogni coppia va sistemata 9 volte. Il pannello ha tre strumenti per ridurre il lavoro.

### Master: dove vanno le modifiche

Sotto **Contesto** c'è il menu **Master**. Decide a quali master va lo spostamento fatto con ← →:

| Scelta | ← → cambiano |
|---|---|
| **Solo il master in cui sei** (default) | solo quel master, come in Fontra |
| **Tutti i master** | tutti e 9, con lo stesso spostamento: +5 aggiunge 5 a ogni master, partendo dal suo valore |
| **Stesso peso del master in cui sei** | la riga della griglia: dal Light, i tre Light (Compact, normale, Wide) |
| **Stessa larghezza del master in cui sei** | la colonna: dal Regular Wide, Light Wide, Regular Wide e Bold Wide |

- Ogni master parte dal suo valore, e la coppia giusta (gruppo o eccezione) si sceglie master per master, come fa Fontra.
- Un ⌘Z annulla lo spostamento in tutti i master insieme.
- Vale solo con il pannello aperto e solo per le frecce: trascinando la coppia con il mouse cambia solo il master in cui sei.
- Con più master, la coppia passata con ↓ risulta vista in tutti i master che hai modificato.

### Master intermedi

Il metodo più veloce: fai il kerning dei **4 angoli** (Light Compact, Light Wide, Bold Compact, Bold Wide) e fai calcolare gli altri.

Ogni master intermedio si calcola dagli angoli in proporzione alla sua posizione su ogni asse. Per esempio il Light (peso 100, larghezza 100) sta a un terzo tra Light Compact e Light Wide, perché la larghezza va da 50 a 200.

- **Questa coppia** (nel pannello, accanto a "Master intermedi"): solo la coppia selezionata.
- **Tutto il font…**: tutte le coppie.

Prima di cambiare qualcosa si apre una finestra con la tabella di tutte le coppie e di tutti i master: in blu i valori nuovi, barrati quelli di adesso. Due opzioni, tutte e due spente di default:

- **Sovrascrivi anche i valori già messi**: se spenta, riempie solo i master vuoti e non tocca niente di quello che hai fatto.
- **Calcola anche il Regular**: se spenta, il Regular (il master predefinito) resta come l'hai fatto tu. Il peso 400 non è a metà tra 100 e 900, quindi il Regular conviene farlo a mano.

Gli angoli non vengono mai toccati. Una coppia a cui manca il valore in un angolo che serve viene saltata, e la finestra lo dice. **Applica** cambia tutto in un passo, che si annulla con ⌘Z.

### Controlla kerning

**Controlla kerning…** (in fondo al pannello, o nella panoramica) apre una finestra con tre elenchi. Ogni riga mostra i valori nei 9 master. Niente cambia finché non scegli e premi **Applica**, e tutto si annulla con ⌘Z.

1. **Eccezioni che scavalcano un gruppo.** Una coppia scritta per un glifo singolo vince sul valore del suo gruppo: quando cambi il gruppo, questa coppia non cambia. Sotto ogni eccezione c'è il valore che avrebbe dal gruppo.
   - **uguale al gruppo**: cancellandola non cambia niente di quello che vedi, e da lì in poi segue il gruppo. **Seleziona le uguali al gruppo** le spunta tutte insieme.
   - **diversa**: in rosso i master dove è diversa dal gruppo. Spuntala solo se vuoi davvero che torni al valore del gruppo.
2. **Valori legati a gruppi che non esistono più.** Quando un gruppo si svuota, Fontra non sposta il suo kerning: il valore resta nel file ma non vale per nessuna coppia. Per ognuno scegli:
   - **Lascia così**;
   - **Cancella**;
   - **Sposta su …**: sul gruppo in cui si trova ora il glifo con lo stesso nome del gruppo (per esempio `@B @O` su `@O @O`, perché ora la B è nel gruppo destro della O). Il menu dice per quante coppie varrebbe: guardalo bene prima di sceglierlo;
   - **Eccezione …**: tra i due glifi con lo stesso nome dei gruppi, quando esistono (per esempio `A V`).
3. **Coppie con master vuoti.** In un master vuoto la coppia vale 0, quindi il kerning salta da un master all'altro. A volte è voluto, per esempio un valore che serve solo in Light Compact. Per ognuna scegli:
   - **Lascia così**;
   - **Riempi i vuoti dagli angoli**: sotto la riga vedi i valori che verrebbero messi;
   - **Metti … nei vuoti**: quando i master che hanno un valore hanno tutti lo stesso.

   Le eccezioni non compaiono qui: in un'eccezione un master vuoto vuol dire "usa il valore del gruppo", ed è giusto così.

## Un ordine di lavoro consigliato

1. **Spaziatura**: sistema i margini finché le righe di controllo sono uniformi.
2. **Gruppi di kerning**: assegnali (Barra info). Con "Ancore e accentate" le accentate entrano da sole nei gruppi della lettera base.
3. **Coppie classiche**: maiuscole, maiuscola + minuscola, minuscole.
4. **Punteggiatura e virgolette**, **numeri**.
5. **Tutte le coppie** per non lasciare buchi.
6. **Accentate e casi limite**, **Italiano**, **Altre lingue**: per controllare il risultato e fare le eccezioni.

Con più master: fai i passi 3–5 sui 4 angoli, poi **Master intermedi → Tutto il font…**, poi sistema il Regular a mano. Ogni tanto usa **Controlla kerning** per togliere le eccezioni rimaste uguali al gruppo.

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
- **Il nome di un glifo** (`H`), come in Glyphs: il margine resta collegato a H e lo segue quando lo modifichi. Vedi sotto.
- **↑ / ↓** nei margini e nella larghezza: ±1, con **⇧** ±10.
- **Riscrivere il valore già mostrato, o premere Invio senza cambiarlo, lo applica**, come nella Barra info. Con **Tutti i master** acceso è il modo più veloce per allineare i master: se il Regular mostra 30, Invio dà 30 anche agli altri. Entrare in un campo e uscire senza scrivere non cambia niente.
- Se dopo aver scritto clicchi un altro glifo, il valore va ai glifi su cui stavi scrivendo, non a quello appena cliccato.
- Se un valore non può essere applicato, il campo diventa rosso e sotto compare il motivo in rosso per qualche secondo.
- **Margine sinistro**: sposta tutto il disegno, ancore e componenti compresi, come in Glyphs. **Larghezza**: cambia lo spazio a destra. **Margine destro**: cambia la larghezza.
- **Gruppo**: scrivi il nome per mettere i glifi selezionati in quel gruppo (se non c'è, viene creato). Svuota il campo per toglierli dal gruppo. Con il plugin "Ancore e accentate", le accentate seguono la loro lettera base.
- **⌘Z** annulla.

### Margini collegati

Nei campi **Sinistro**, **Destro** e **Larghezza** puoi scrivere il nome di un glifo invece del numero, come in Glyphs. Il campo resta **collegato** a quel glifo: quando lo modifichi, i glifi collegati si aggiornano da soli.

Per esempio, H ha 40 a sinistra e a destra. Selezioni `I`, scrivi `H` nel margine sinistro e nel destro: la I prende 40 e 40. Se poi porti H a 45, anche la I passa a 45, in tutti i master.

| Scrivi | Nel margine sinistro | Nel margine destro |
|---|---|---|
| `H` o `=H` | l'LSB di H | l'RSB di H |
| `=\|H` | l'RSB di H (lato opposto) | l'LSB di H |
| `H+10`, `=H-5`, `H*2` | l'LSB di H con il calcolo | l'RSB di H con il calcolo |

- **Come si riconosce**: il valore è blu e sotto i campi compare la riga **Collegato** con il collegamento, per esempio `=H`. Cliccando nel campo vedi e puoi cambiare il collegamento. Con più glifi selezionati, se solo alcuni sono collegati la riga dice *in parte*.
- **Più glifi insieme**: selezioni I, l, i, scrivi `H` nel margine sinistro, e tutti e tre restano collegati a H.
- **Vale per tutti i master** del glifo, anche con **Tutti i master** spento: il Bold della I segue il Bold della H. Se H non ha un master in quella posizione, si usa il suo valore interpolato.
- **Per scollegare** scrivi un numero (o usa ↑ ↓). Destro e larghezza si escludono, perché decidono tutti e due la larghezza: un collegamento o un numero in uno dei due toglie il collegamento dall'altro.
- **Si aggiorna sempre**: qualunque modifica a H (dalla panoramica, dall'editor, con la Barra info, annullando) aggiorna i glifi collegati. Anche a catena (B collegata a D, D collegata a H) e attraverso i componenti (un glifo collegato a `kacute` segue la `k`).
- **Il glifo collegato tiene il suo valore**: se sposti i punti della I nell'editor, il margine torna quello di H, come in Glyphs.
- Va bene anche il carattere: `è` vale come `egrave`. I numeri restano numeri: `1` è il valore 1, non il glifo `one`. Se il nome non esiste, il campo diventa rosso e sotto compare il motivo.
- **⌘Z** annulla il collegamento insieme ai valori.
- I collegamenti sono salvati nel font (nei dati personalizzati, chiave `fontra.plugin.metricsKeys`), quindi restano quando lo riapri. Con "Rinomina e duplica glifi" 1.0.2 seguono i cambi di nome e passano alle copie.
- Nell'editor gli stessi collegamenti si vedono e si modificano dalla Barra info 1.4.0.

### Tutti i master

Sotto i campi c'è l'interruttore **Tutti i master**, acceso di default (la scelta resta salvata).

- **Acceso**: margini e larghezza cambiano in **tutti i master** di ogni glifo selezionato. Un valore (`40`) dà a tutti i master lo stesso margine; un'operazione (`+10`) parte dal valore di ciascun master. Funziona anche se in **Source** sei in una posizione intermedia: i valori mostrati sono interpolati, ma la modifica va su tutti i master.
- **Spento**: cambia solo il master scelto in **Source**, come in Glyphs. Se per qualche glifo quella posizione non è un master, quel glifo non viene toccato e la sezione te lo dice.

I **gruppi di kerning** valgono sempre per tutti i master: in Fontra, come in Glyphs, il gruppo è del glifo, non del singolo master.

Sotto la sezione ci sono anche **Controlla kerning…** e **Master intermedi…**: sono le stesse finestre del pannello (vedi "Kerning su più master"), e anche qui si annullano con ⌘Z.

Funziona con Fontra Pak 2026.10 e successivi.

Come per gli altri plugin, la sezione compare nella panoramica dopo che hai aperto un glifo da lì (o dopo aver aperto la panoramica dal menu **Font** di un editor).

## Installazione

1. Crea un repository **pubblico** su GitHub, per esempio `fontra-kerning-texts`.
2. Carica `plugin.json` e `kerning-texts.js` (va bene anche questo README) nella radice del repository.
3. Crea una release con tag `v1.5.0`.
4. In Fontra apri **Fontra → Plugin Manager**, premi **+** e scrivi `https://cdn.jsdelivr.net/gh/TUONOME/fontra-kerning-texts@v1.5.0`.
5. Ricarica l'editor.

Per aggiornare da una versione precedente: crea la release `v1.5.0`, rimuovi dal Plugin Manager l'indirizzo con il tag vecchio e aggiungi quello nuovo.
