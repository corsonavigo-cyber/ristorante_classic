//salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php

//--------------------READ-------------------------------------

//per caricare e selezionare dove avverrà l'insert dei menu
const fuorimenupiatto = document.getElementById("form-inserisci-fuorimenu-piat");
const fuorimenubevanda = document.getElementById("form-inserisci-fuorimenu-bev");
const inserisciordine = document.getElementById("form_inserisci_ordine");
const form_modifica_ordine = document.getElementById("form_modifica_ordine");

//funzione di controllo multipla negli inserimenti/modifiche form_inserisci_ordine
let momento = [];
let bevande = [];
let piatti = []; // FIX: mancava, usata in aggiornaVoceComanda() ma mai dichiarata
// ATTENZIONE: va popolata da qualche parte (es. dentro precaricaPiattiForm, che oggi costruisce solo l'HTML)
let momenti = [];
let tavoli = [];
let comanda = [];
let momentoAttivo = null;
let idTavoloComanda = null;
let idOrdineInserito = null;

let initialized = false;
const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');

//controllo che siamo nella pagina giusta per attivare i listener
/** if (fuorimenu) {
      document.addEventListener('DOMContentLoaded',mostraDataOra);
      document.addEventListener('DOMContentLoaded', eliminaStoricoPrenotazione);
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaPrenotazioniConTavolo);
      document.addEventListener('DOMContentLoaded', caricaPrenotazioniSenzaTavolo);
      //il bottone togli dal menu lo attivo solo se seno nell'elenco attivo
      document.addEventListener('click', togliPrenotazioneDalTavoloClick);
      document.addEventListener('click', eliminaPrenotazioneClick);
      document.addEventListener('click', disattivaPrenotazione);
      document.addEventListener('click', attivaPrenotazione);

  }else*/ if (fuorimenupiatto) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciPiattoFuoriMenuClick);
} else if (fuorimenubevanda) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciBevandaFuoriMenuClick);
} else if (inserisciordine) {
    
    
   
 document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
 document.addEventListener('DOMContentLoaded', ripristinaOrdine);
 document.addEventListener('input', gestisciInputGlobali);
 document.addEventListener('click', globalClick);
 if(secondo_step.className('piatti')){
    document.addEventListener('DOMContentLoaded', precaricaPiattiForm);
    document.addEventListener('DOMContentLoaded', precaricaBevandeForm);
    document.addEventListener('DOMContentLoaded',  disegnaMomenti);
    }
     document.addEventListener('DOMContentLoaded', () => {
        const runCheck = () => {
            const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
                .map(el => parseInt(el.value));
            controllaPostiTavoloDisponibili(tavoliSelezionati);
        };

        // FIX: delegation  (es. #tavoli_checkbox), funziona anche per checkbox iniettate dopo
        document.getElementById('tavoli_checkbox').addEventListener('change', (e) => {
            if (e.target.name === 'tavoliSelezionati[]') runCheck();
        });

       
         });

    // TODO: questo ramo è vuoto. Probabilmente qui vanno agganciati
    // precaricaTavoliForm / precaricaBevandeForm / precaricaPiattiForm / disegnaMomenti
    // e i listener globalClick / gestisciInputGlobali. Da verificare e completare.
}
        
/**
   

    document.addEventListener('DOMContentLoaded', precaricaTavoliForm);

  }else if(form_modifica_prenotazione){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPrenotazioneClick);
      document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
     

        document.getElementById('numero-persone').addEventListener('input', runCheck);

        document.querySelectorAll('#data-in-prenotazione, #ora-prenotazione')
            .forEach(campo => campo.addEventListener('change', runCheck));
    });

  */

//Caricare reiderizza tutte le prenotazioni attivie

async function precaricaTavoliForm(id_tavolo) {
    // legge l'id dall'URL: modificaprenotazione.php?id=5
    const risposta = await fetch(`${API}`);
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento

    const lavagna = document.getElementById('tavoli_checkbox');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande
    lavagna.innerHTML = data.map(tavolo => `
       <li><label><input type="checkbox" name="tavoliSelezionati[]" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');

    const attivaInput = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id_tavolo}"]`);
    if (attivaInput) attivaInput.checked = true;

    if (form_modifica_ordine) {
        await initModifica();
    }
}

async function disegnaMomenti() {
    const risposta = await fetch(`${API_ORDINI}?type=momenti`); // FIX: c'erano apici letterali dentro la query string ('momenti')
    if (!risposta.ok) { // FIX: controllava "rispostabevande" (undefined), doveva essere "risposta"
        throw new Error("Errore nel caricamento dei momenti");
    }
    const jsonmomenti = await risposta.json();
    const contmomento = document.getElementById('momenti-servizio');
    // ATTENZIONE: assumo che l'endpoint risponda con {data: [...]} come gli altri, verifica lato PHP
    contmomento.innerHTML = jsonmomenti.data.map(m => `<div class="mmomenti"><button class="btn-momento ${momentoAttivo === m.id_momento ? 'attivo' : ''}" data-id="${m.id_momento}">${m.nome_momento}</button></div>`).join("<br>");
}

async function precaricaBevandeForm() {

    const rispostabevande = await fetch(`${API}?type=bevande`);

    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonbevande = await rispostabevande.json();
    const lavagnabevande = document.getElementById('bevande');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda => `
    <div class="bevanda" >
    <button type="button" class="btn-inserisci-bevandamenu-ordine" data-id="${bevanda.id_bevanda}">
     <h3 class="comment"><b> ${bevanda.nome_bevanda}</b></h3>
     <p class="comment">${bevanda.descrizione}</p>
     <p class="comment">Prezzo: ${bevanda.prezzo} € </p>
     <ul  class="elenco_allergeni">
        ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join('') : '<li>Nessun allergene</li>'}
     </ul>
     <p class="comment">Contiene Alcol: ${bevanda.alcol} </p>
    </button>
    <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita-bev" class="quantita-bev" id="quantita-bev" data-id="${bevanda.id_bevanda}" value="0" min="0" required>
    </div>`).join(''); // FIX: era "b.id_bevanda", "b" non esisteva (la variabile del map è "bevanda")
}

async function precaricaPiattiForm() {

    const rispostapiatti = await fetch(`${API}?type=piatti`);

    if (!rispostapiatti.ok) {
        throw new Error("Errore nel caricamento dei piatti");
    }
    const jsonpiatti = await rispostapiatti.json();
    const lavagnapiatti = document.getElementById('piatti');
    //elementi Piatti per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnapiatti.innerHTML = jsonpiatti.data.filter(piatti => piatti.in_menu === 'si').map(piatto => `
    <div class="piatto" >
    <button type="button" class="btn-inserisci-piatto-ordine" data-id="${piatto.id_piatto}">
    <h3 class="comment"><b> ${piatto.nome_piatto}</b></h3>
    <p class="comment">${piatto.descrizione}</p>
    <p class="comment">Prezzo: ${piatto.prezzo} € </p>
    <p  class="elenco_allergeni">
        ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `${a}`).join(',') : 'Nessun allergene'}
    </p>
    </button>
    <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita" class="quantita" id="quantita" data-id="${piatto.id_piatto}" value="0" min="0" required>
    </div>
    `).join(''); // FIX: id="btn-inserisci-piatto-ordine non chiudeva le virgolette (HTML rotto); allineato al pattern del bottone bevanda (class + data-id). "p.id_piatto" → "piatto.id_piatto"
}
// Chiavi per salvare l'ordine in corso nel browser
const CHIAVE_STEP = 'ordineStep';
const CHIAVE_COMANDA = 'ordineComanda';

// Salva a che punto siamo e cosa c'è nella comanda
function salvaOrdine() {
    const step = document.getElementById('secondo-step').classList.contains('hider') ? 1 : 2;
    localStorage.setItem(CHIAVE_STEP, step);
    localStorage.setItem(CHIAVE_COMANDA, JSON.stringify(comanda));
}

// Al caricamento, ripristina step e comanda salvati
async function ripristinaOrdine() {
    const stepSalvato = localStorage.getItem(CHIAVE_STEP);
    const comandaSalvata = localStorage.getItem(CHIAVE_COMANDA);

    if (comandaSalvata) {
        comanda = JSON.parse(comandaSalvata); // riassegna l'array (è un "let", quindi si può)
    }

    if (stepSalvato === '2') {
        document.getElementById('primo-step').classList.add('hider');
        document.getElementById('secondo-step').classList.remove('hider');

        // FIX: se si riparte già dallo step 2, il contenuto va ridisegnato
        // (di solito lo faceva il click su "avanti", ma qui saltiamo direttamente)
        await precaricaPiattiForm();
        await precaricaBevandeForm();
        await disegnaMomenti();
    }
}

// Da chiamare quando la comanda viene inviata definitivamente al server
function svuotaOrdineSalvato() {
    localStorage.removeItem(CHIAVE_STEP);
    localStorage.removeItem(CHIAVE_COMANDA);
}
function globalClick(e) {
    const btn_avanti = e.target.closest('.btn-avanti'); // FIX: mancava il "." per il selettore di classe
    
    const btn_aggiorna = e.target.closest('.aggiorna'); // FIX: idem
    const btn_indietro = e.target.closest('.btn-indietro'); // FIX: idem
    
    if (btn_avanti) {
        e.preventDefault();
        secondo_step.classList.remove('hider');
        primo_step.classList.add('hider');
        alert("classi modificate!");
        salvaOrdine();
        /*inserisciOrdine();*/
        return;
    }

    const btn_momento = e.target.closest('.btn-momento'); // FIX: idem

    if (btn_indietro) {
        e.preventDefault();
        momentoAttivo = null;
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.add('attivo'));
        return;
    }

    if (btn_momento) {
        e.preventDefault();
        momentoAttivo = Number(btn_momento.dataset.id);
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        btn_momento.classList.add('attivo');
        if (btn_aggiorna) {
            aggiornaComanda();
            return;
        }
        return;
    }
    const btn_piatto = e.target.closest('.btn-inserisci-piatto-ordine'); // FIX: idem
    if (btn_piatto) {
        e.preventDefault();
        const id_piattoDaInserire = Number(btn_piatto.dataset.id);
        const quantita = document.querySelector(`.quantita[data-id="${id_piattoDaInserire}"]`);
        if (Number(quantita.value) === 0) quantita.value = 1;
        aggiornaVoceComanda("piatto", id_piattoDaInserire, Number(quantita.value)); // FIX: era "id" (undefined)
        return;
    }
    const btn_bevanda = e.target.closest(".btn-bevanda");
    if (btn_bevanda) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;
        const id_bevanda = Number(btn_bevanda.dataset.id);
        const quantita_bev = document.querySelector(`.quantita[data-id="${id_bevanda}"]`);
        if (Number(quantita_bev.value) === 0) quantita_bev.value = 1;
        aggiornaVoceComanda("bevanda", id_bevanda, Number(quantita_bev.value)); // FIX: era "id" (undefined)
        return;
    }
} // FIX: mancava questa chiusura → tutte le funzioni sotto erano nidificate dentro globalClick e irraggiungibili

function gestisciInputGlobali(e) {
    // Variazione manuale quantità piatti
    if (e.target.classList.contains("quantita")) {
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda("piatto", Number(e.target.dataset.id), Number(e.target.value));
    }
    // Variazione manuale quantità bevande
    if (e.target.classList.contains("quantita-bev")) {
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda("bevanda", Number(e.target.dataset.id), Number(e.target.value));
    }
}

function controllaMomentoSelezionato() {
    if (momentoAttivo === null) {
        alert("Seleziona prima un momento del servizio (es. Antipasto, Primo)!");
        return false;
    }
    return true;
}

//--------------------------COMANDA-------------------

function aggiornaVoceComanda(tipo, id, quantita) {
    // Cerca se l'elemento dello stesso tipo, id e nello stesso momento di servizio esiste già nell'array comanda
    const indice = comanda.findIndex(id_momento => id_momento.tipo === tipo && id_momento.id === id && id_momento.id_momento === momentoAttivo);

    if (quantita <= 0) {
        // Rimozione (Deselezione quando la quantità torna a 0)
        if (indice !== -1) comanda.splice(indice, 1);
    } else {
        // Recupero il nome dell'elemento dall'anagrafica corretta
        let nomeItem = "";
        if (tipo === "piatto") {
            const piatto = piatti.find(el => el.id === id);
            nomeItem = piatto ? piatto.nome_piatto : "";
        } else {
            const bevanda = bevande.find(el => el.id === id);
            nomeItem = bevanda ? bevanda.nome_bevanda : "";
        }

        if (indice !== -1) {
            // Aggiornamento quantità esistente
            comanda[indice].quantita = quantita;
        } else {
            // Inserimento nuova voce
            comanda.push({
                tipo: tipo,
                id: id,
                nome: nomeItem,
                id_momento: momentoAttivo,
                quantita: quantita
            });
        }
    }
    salvaOrdine();
    console.log("Comanda Aggiornata:", comanda);
}

// Ripristina i valori numerici degli input grafici quando si cambia momento del servizio
function aggiornaInputPernuovoMomento() {
    // Azzera tutti gli input grafici correnti prima del ricalcolo
    document.querySelectorAll(".quantita-piatto, .quantita-bevanda").forEach(input => input.value = 0);
}

/*
//funzione ottimizzata con Claude, tolte le ridondanze e sistemati i controlli (in particolare la data)
*/

async function inserisciPiattoFuoriMenu(nome_piatto, descrizione, prezzo) {
    try {
        const risposta = await fetch(`${API}?type=piatti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_piatto: String(nome_piatto),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                categoria: 'altro'
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        // FIX: .json() ritorna una Promise, serve await prima di leggere .id
        const json = await risposta.json();
        return json.id;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciBevandaFuoriMenu(nome_bevanda, descrizione, prezzo, alcol) {
    try {
        const risposta = await fetch(`${API}?type=bevande`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_bevanda: String(nome_bevanda),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                alcol: alcol
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
        return json.id;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdine() { 
    try {
        const numero_persone = document.getElementById('numero-persone').value;

        const numPersone = parseInt(numero_persone);
        if (Number.isNaN(numPersone) || numPersone <= 0) {
            throw new Error("Inserisci un numero persone valido");
        }

        const body = {
            numero_persone: numPersone
        };

        // ATTENZIONE: "type" non era definito da nessuna parte in questa funzione.
        // Se hai un solo flusso di creazione ordine ti basta "?type=ordine".
        // Se invece ti servono più varianti, aggiungi "type" come parametro della funzione.
        const risposta = await fetch(`${API_ORDINI}?type=ordine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
        await inserisciOrdineTavolo(json.id);

        return true;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdinePiatto() {
    try {
        // ATTENZIONE: "nome_piatto" non veniva mai letto dal DOM, era undefined.
        // Assumo un input con id "nome-piatto": verifica che corrisponda al tuo HTML.
        const nome_piatto = document.getElementById('nome-piatto').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_piattomenu.dataset.id);

        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        // FIX: controllava Number.isNaN(prezzo) invece che quantita
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }

        const id_piatto = await inserisciPiattoFuoriMenu(nome_piatto, descrizione, prezzo);

        const body = {
            id_ordine: id_ordine,
            id_piatto: id_piatto,
            id_momento: id_momento,
            quantita: quantita
        };

        const risposta = await fetch(`${API_ORDINI}?type=ordinepiatto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.href = "gestioneordini.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function cambiaOrdineDalTavolo(id_ordine, tavoli) {
    try {
        if (!id_ordine) {
            throw new Error('Ordine non variato, manca ID!');
        }
        if (!tavoli) {
            throw new Error('Ordine non variato, manca ID!');
        }

        const aggiornaRelazione = await fetch(`${API_ORDINI}?type=tavolo&id=${id_ordine}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_ordine: parseInt(id_ordine),
                tavoli: tavoli
            })
        });

        if (!aggiornaRelazione.ok) {
            const json = await aggiornaRelazione.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${aggiornaRelazione.status}`);
        }

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineBevanda() {
    try {
        // ATTENZIONE: "nome_bevanda" non veniva mai letto dal DOM, era undefined.
        // Assumo un input con id "nome-bevanda": verifica che corrisponda al tuo HTML.
        const nome_bevanda = document.getElementById('nome-bevanda').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_bevandamenu.dataset.id);
        const alcol = document.querySelector('input[name="alcol"]:checked').value;

        if (typeof nome_bevanda !== "string" || nome_bevanda === "") {
            throw new Error("Il nome della bevanda è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        // FIX: controllava Number.isNaN(prezzo) invece che quantita
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }

        const id_bevanda = await inserisciBevandaFuoriMenu(nome_bevanda, descrizione, prezzo, alcol);

        const body = {
            id_ordine: id_ordine,
            id_bevanda: id_bevanda,
            id_momento: id_momento,
            quantita: quantita
        };

        const risposta = await fetch(`${API_ORDINI}?type=ordinebevanda`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.href = "gestioneordini.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineTavolo(id_ordine) {
    try {
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));

        const body = {
            id_ordine: id_ordine,
            tavoli: tavoli
        };

        const risposta = await fetch(`${API_ORDINI}?type=tavolo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        return true;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function precaricaFormModificaPrenotazione() {
    // legge l'id dall'URL: modificaprenotazione.php?id=5
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?type=prenotazioni&id=${id}`);
    const json = await risposta.json();
    const data = json.data;

    document.getElementById('nome-prenotazione').value = data.nome_prenotazione;

    document.getElementById('numero-persone').value = parseFloat(data.numero_persone);

    const attivaInput = document.querySelector(`input[name="attiva"][value="${data.attiva}"]`);
    if (attivaInput) attivaInput.checked = true;

    const tavoliEsistenti = data.id_tavoli ? data.id_tavoli.split(',').map(a => parseInt(a.trim())) : [];

    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = tavoliEsistenti.includes(parseInt(checkbox.value));
    });
}

async function modificaPrenotazioneClick(e) {
    try {
        const btn = e.target.closest('.btn-modifica-prenotazione');
        if (!btn) return;
        if (!confirm('vuoi modificare questa Prenotazione?')) return;

        const id_modifica = btn.dataset.id;
        if (!id_modifica) throw new Error('ID Prenotazione mancante');

        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
       
        const tavoliSelezionati = Array.from(document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')).map(el => parseInt(el.value));
        const attivo = parseInt(document.querySelector('input[name="attiva"]:checked').value, 10);
        const numero_persone = parseInt(document.getElementById('numero-persone').value, 10);

        if (!nome_prenotazione) throw new Error('Il nome della prenotazione è obbligatorio');
        if (!ora_prenotazione) throw new Error("L'ora della prenotazione è obbligatoria");
        if (Number.isNaN(numero_persone) || numero_persone <= 0) throw new Error('Inserisci un numero di persone valido');

        const type = 'prenotazioni_tavolo';

        const body = {
            nome_prenotazione: String(nome_prenotazione),
            ora_prenotazione: `${ora_prenotazione}`,
            data_in_prenotazione: String(data_in_prenotazione),
            attiva: attivo, // chiave "attiva" per matchare $body['attiva'] lato PHP
            numero_persone: numero_persone,
            tavoli: tavoliSelezionati
        };

        const risposta = await fetch(`${API}?type=${type}&id=${id_modifica}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await risposta.json().catch(() => null);

        if (!risposta.ok || !json?.success) {
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        alert('Prenotazione modificata con successo!');
        window.location.href = "gestioneprenotazioni.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

//------------------------------DELETE-----------------------------------------
async function eliminaPrenotazioneClick(e) {
    try {
        const btn_elimina = e.target.closest('.btn-elimina-prenotazione');
        if (!btn_elimina) return;
        if (!confirm('vuoi eliminare questa prenotazione?')) return;

        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo_prenotazioni&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function eliminaStoricoPrenotazione(e) {
    try {
        const oggi = new Date().toISOString().slice(0, 10);
        const ultimaEsecuzione = localStorage.getItem('ultimaPuliziaPrenotazioni');

        if (ultimaEsecuzione === oggi) return; // già eseguita oggi, esci

        const risposta = await fetch(`${API}?type=pulisci`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        localStorage.setItem('ultimaPuliziaPrenotazioni', oggi);
        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}