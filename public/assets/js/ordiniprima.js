//salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php

//--------------------READ-------------------------------------

//per caricare e selezionare dove avverrà l'insert dei menu
const fuorimenupiatto = document.getElementById("form-inserisci-fuorimenu-piat");
const fuorimenubevanda = document.getElementById("form-inserisci-fuorimenu-bev");
const inserisciordine = document.getElementById("form_inserisci_ordine");
const form_modifica_ordine = document.getElementById("form_modifica_ordine");
const contenitore_bev = document.getElementById('bevande_bar');

//funzione di controllo multipla negli inserimenti/modifiche form_inserisci_ordine
let momento = [];
let bevande = [];
let piatti = []; // FIX: mancava, usata in aggiornaVoceComanda() ma mai dichiarata
// ATTENZIONE: va popolata da qualche parte (es. dentro precaricaPiattiForm, che oggi costruisce solo l'HTML)
let momenti = [];
let tavoli = [];
let comanda = [];
let momentoAttivo = 1;
let idTavoloComanda = null;
let idOrdineInserito = null;
let id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
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
}else if (contenitore_bev) {
    document.addEventListener('DOMContentLoaded', precaricaBevandeBar);
} else if (inserisciordine) {

    document.addEventListener('DOMContentLoaded', () => {
    const runCheck = () => {
        const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        controllaPostiTavoloDisponibili(tavoliSelezionati);
    };

    // FIX: delegation  (es. #tavoli_checkbox), funziona anche per checkbox iniettate dopo
    document.getElementById('tavoli_checkbox').addEventListener('change', (e) => {
        if (e.target.name === 'tavoliSelezionati[]') runCheck();
    });

    
        });  
    document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
    document.addEventListener('DOMContentLoaded', controllaPostiTavoloDisponibili);
    document.addEventListener('input', gestisciInputGlobali);
    document.addEventListener('click', globalClick);

    } else if(secondo_step.className.includes("piattir")){
    document.addEventListener('DOMContentLoaded', precaricaPiattiForm);
    document.addEventListener('DOMContentLoaded', precaricaBevandeForm);
    document.addEventListener('DOMContentLoaded',  disegnaMomenti);
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

async function precaricaBevandeBar() {
    
    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    if (!risposta.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const json = await risposta.json();
    

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
    // (un id duplicato per ogni tavolo è invalido in HTML)
    
    if (!contenitore_bev) return;
    const ordiniOggi = json.data.filter(ordini=>ordini.data_e_ora.split(' ')[0] === today());
    const ordiniRaggruppati = Object.values(ordiniOggi.reduce((acc, comanda) => {

        if (!acc[comanda.id_ordine]) {
            acc[comanda.id_ordine] = {
                ...comanda,
                servizi: [],
                bevande:[]
            };
        }

        acc[comanda.id_ordine].servizi.push(comanda.nome_servizio);
        acc[comanda.id_ordine].bevande.push(comanda.bevande);
        return acc;
    }, {})
    );
    if (ordiniRaggruppati.length > 0){
        contenitore.innerHTML = ordiniRaggruppati.map(comanda => `
          
            <h4 class="comment"><b>Tav: ${comanda.numero_tavolo}</b></h4>
            <h4 class="comment"><b>${comanda.servizi.join(', ')}</b></h4>
            <p class="comment">${comanda.numero_persone} persone</p>
            <p class="comment">Bevande:<br>${comanda.bevande.join('<br>')}</p>
            <p class="comment">ora di arrivo ${comanda.data_e_ora.split(' ')[1]}</p>
            <p class="comment">stato comanda ${comanda.nome_stato}</p>
            <a class="btn" href="modificaordine.php?id=${comanda.id_ordine}">Modifica ✏️</a>
            <button class="btn-elimina-ordine" data-id="${comanda.id_ordine}">Elimina 🗑️</button>
        `).join('');
    } else {
    }

}


async function precaricaTavoliForm(id_tavolo_arrivato_url) {
    // legge l'id dall'URL: modificaprenotazione.php?id=5
    const risposta = await fetch(`${API}`);
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento

    const lavagna = document.getElementById('tavoli_checkbox');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande
    lavagna.innerHTML = data.map(tavolo => `
       <li><label><input type="checkbox" name="tavoliSelezionati[]" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');

    const attivaInput = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id_tavolo_arrivato_url}"]`);
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
    const momentoAttivojson =jsonmomenti.data.find(m=> m.id_momento === momentoAttivo);
    const stringaTitolo = momentoAttivojson ? `<br><h3>${momentoAttivojson.nome_servizio.toUpperCase()}</h3>` : '';
    
    // ATTENZIONE: assumo che l'endpoint risponda con {data: [...]} come gli altri, verifica lato PHP
    const selettori_momento=jsonmomenti.data.map(m => `<br><div class="mmomenti"><button class="btn-momento ${momentoAttivo === m.id_momento ? 'attivo' : ''}" data-id="${m.id_momento}">${m.nome_servizio}</button></div>`).join("<br>");
    contmomento.innerHTML = `<div class="momenti-servizio">${selettori_momento}</div><div> ${stringaTitolo}</div>`;
}

async function disegnaPreComanda() {

    const visualizza_modifiche_json = document.getElementById('riassunto-ordine');

    const ordine = JSON.parse(localStorage.getItem(CHIAVE_ORDINE));

    if (!ordine || !ordine.comanda || ordine.comanda.length === 0) {
        visualizza_modifiche_json.innerHTML = `<li>Non hai ancora aggiunto nessun elemento</li>`;
        return;
    }

   const raggruppati = ordine.comanda.reduce((acc, e) => {

    if (!acc[e.id_momento]) {
        acc[e.id_momento] = [];
    }

    acc[e.id_momento].push(e);

    return acc;

}, {});


visualizza_modifiche_json.innerHTML = Object.entries(raggruppati).map(([id_momento, elementi]) => `

    <h4>Momento ${id_momento}</h4>

    ${elementi.map(e => `
        <li>
            ${e.nome} - X ${e.quantita}
        </li>
    `).join("")}

`).join("");

}

async function precaricaBevandeForm() {

    const rispostabevande = await fetch(`${API_MENU}?type=bevande`);

    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonbevande = await rispostabevande.json();
    const lavagnabevande = document.getElementById('bevande_input');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda => `
    <div class="bevanda" >
    <button type="button" class="btn-inserisci-bevandamenu-ordine" data-id="${bevanda.id_bevanda}">
     <h3 class="comment" data-name="${bevanda.nome_bevanda}"><b> ${bevanda.nome_bevanda}</b></h3>
     <p class="comment"  >${bevanda.descrizione}</p>
     <p class="comment" data-prezzo="${bevanda.prezzo}">Prezzo: ${bevanda.prezzo} € </p>
     <ul  class="elenco_allergeni">
        ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join('') : '<li>Nessun allergene</li>'}
     </ul>
     <p class="comment">Contiene Alcol: ${bevanda.alcol} </p>
     <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita-bev" class="quantita-bev" id="quantita-bev" data-id="${bevanda.id_bevanda}" value="0" min="0" required>
    
    </button>
    </div>`).join(''); // FIX: era "b.id_bevanda", "b" non esisteva (la variabile del map è "bevanda")
}

async function precaricaPiattiForm() {

    const rispostapiatti = await fetch(`${API_MENU}?type=piatti`);

    if (!rispostapiatti.ok) {
        throw new Error("Errore nel caricamento dei piatti");
    }
    const jsonpiatti = await rispostapiatti.json();
    const lavagnapiatti = document.getElementById('piatti_input');
    //elementi Piatti per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnapiatti.innerHTML = jsonpiatti.data.filter(piatti => piatti.in_menu === 'si').map(piatto => `
    <div class="piatto" >
    <button type="button" class="btn-inserisci-piatto-ordine" data-id="${piatto.id_piatto}">
    <h3 class="comment" id="nome"  data-name="${piatto.nome_piatto}"><b> ${piatto.nome_piatto}</b></h3>
    <p class="comment">${piatto.descrizione}</p>
    <p class="comment" id="prezzo" data-prezzo="${piatto.prezzo}>Prezzo: ${piatto.prezzo} € </p>
    <p  class="elenco_allergeni">
        ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `${a}`).join(',') : 'Nessun allergene'}
    </p>
    <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita" class="quantita" id="quantita" data-id="${piatto.id_piatto}" value="0" min="0" required>
    
    </button>
    </div>
    `).join(''); // FIX: id="btn-inserisci-piatto-ordine non chiudeva le virgolette (HTML rotto); allineato al pattern del bottone bevanda (class + data-id). "p.id_piatto" → "piatto.id_piatto"
}
// Chiavi per salvare l'ordine in corso nel browser
const CHIAVE_ORDINE = "id_ordine";

// Salva a che punto siamo e cosa c'è nella comanda
function salvaOrdine(id_ordine, salvatavoli = true) {

    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
        .map(el => parseInt(el.value));
    
    const step = document.getElementById('secondo-step').classList.contains('hider') ? 1 : 2;
    const ordine = {
        id: id_ordine,
        step: step,
        comanda: comanda,
        if(salvatavoli){
           tavoli: tavoliSelezionati
        }
    };
    

    localStorage.setItem(CHIAVE_ORDINE, JSON.stringify(ordine));
}



// Al caricamento, ripristina step e comanda salvati
async function ripristinaOrdine() {

    const id_tavolo_arrivato_url = parseInt(new URLSearchParams(window.location.search).get('id'));

    const ordine = JSON.parse(localStorage.getItem(CHIAVE_ORDINE));

    if (!ordine) return;

    if (ordine.tavoli.includes(id_tavolo_arrivato_url)) {

        comanda = ordine.comanda;

        if (ordine.step === 2) {
                document.getElementById('primo-step').classList.add('hider');
                document.getElementById('secondo-step').classList.remove('hider');

                await precaricaPiattiForm();
                await precaricaBevandeForm();
                await disegnaMomenti();
            }
        }
    }


// Da chiamare quando la comanda viene inviata definitivamente al server
function svuotaOrdineSalvato() {
    localStorage.removeItem(CHIAVE_ORDINE);

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
        momentoAttivo = 1;
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.add('attivo'));
        return;
    }

    if (btn_momento) {
        e.preventDefault();
        momentoAttivo = Number(btn_momento.dataset.id);
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        btn_momento.classList.add('attivo');
        disegnaMomenti();
        salvaOrdine();
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
    const btn_bevanda = e.target.closest(".btn-inserisci-bevandamenu-ordine");
    if (btn_bevanda) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;
        const id_bevanda = Number(btn_bevanda.dataset.id);
        const quantita_bev = document.querySelector(`.quantita-bev[data-id="${id_bevanda}"]`);
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
        let prezzoItem = 0;
        if (tipo === "piatto") {
            const piatto = piatti.find(el => el.id === id);
            if (piatto) {
                nomeItem = piatto.nome_piatto;
                prezzoItem = piatto.prezzo;
            }
        } else {
            const bevanda = bevande.find(el => el.id === id);
              if (bevanda) {
                nomeItem = bevanda.nome_bevanda;
                prezzoItem = bevanda.prezzo;
            }
        }

        if (indice !== -1) {
            // Aggiornamento quantità esistente
            comanda[indice].quantita = quantita;
        } else {
            // Inserimento nuova voce
            comanda.push({
                tipo: tipo,
                id: id,
                nome: nome, 
                prezzo : prezzo,
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
        //da sviluppare
        await inserisciOrdineStato(json.id);
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

async function inserisciOrdineStato(id_ordine) {
    try {

        const body = {
            id_ordine: id_ordine,
            stato: parseInt(1)
        };

        const risposta = await fetch(`${API_ORDINI}?type=stato`, {
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
/*modificare per funzione*/
async function precaricaFormModificaPiatti() {
    /*legge l'id dall'URL: modificaprenotazione.php?id=5
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
    });*/
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


//utilità

function initModifica() {
    if (initialized) return;
    initialized = true;
    precaricaFormModificaPrenotazione();
   }

  function today(){
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2026-06-30"
  }

  function oggi(){
    const d = new Date();
    return d.toLocaleString("it-IT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
    async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
   }



    async function controllaTavoloDisponibile(tavoliSelezionati){
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');

    // guard: niente tavoli
    if(tavoliSelezionati.length === 0){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `l'ordine ha bisogno di essere associato almeno tavolo!`;
        return false;
    }

    const risposta = await fetch(`${API}?type=stato&id=1`);
    const jsonordini = await risposta.json();

    const jsonTavoliConOrdine = jsonordini.data.filter(p =>
        p.id_tavoli && tavoliSelezionati.some(id => p.id_tavoli.includes(id)) // FIX: tipi normalizzati a monte (int), un solo controllo
    );
   
   
    
    if (jsonTavoliConOrdine.length>0) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Questo tavolo ha già un ordine attivo!`;
        return false;
    }

    sezione.classList.remove('warning');
    avviso.innerHTML = "";
    sezione.classList.add('controllopositivo');
    return true;
}





 async function controllaPostiTavoloDisponibili(tavoliSelezionati){
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');
    const ordine = JSON.parse(localStorage.getItem(CHIAVE_ORDINE));

    if (ordine && ordine.tavoli.some(tavolo => tavoliSelezionati.includes(tavolo))) {
        const conferma = confirm('Questo tavolo ha già un inserimento in corso, vuoi utilizzarlo?');
        if(!conferma){
           svuotaOrdineSalvato();
           return false;
        }
        ripristinaOrdine();
        return true;
    }


    if(tavoliSelezionati.length === 0){
        sezione.classList.remove('warning', 'controllopositivo');
        avviso.innerHTML = "";
        return true;
    }

    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10); // FIX: cast esplicito
    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
        sezione.classList.add('warning');
        avviso.innerHTML = `Inserisci un numero di persone valido`;
        return false;
    }

    // FIX: somma posti letti da data-posti delle checkbox selezionate, non dagli id grezzi
    const postiTotali = tavoliSelezionati.reduce((acc, id) => {
        const checkbox = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id}"]`);
        return acc + (parseInt(checkbox?.dataset.posti, 10) || 0);
    }, 0);
    console.log(postiTotali)
    // FIX: confronto diretto, niente più chained comparison invalido
    if (numeroPersone > postiTotali) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Hai bisogno di più tavoli per ${numeroPersone} persone ti mancano da inserire ${numeroPersone-postiTotali}. Se vuoi procedere comunque, premi inserisci.`;
        return false;
    }

    sezione.classList.remove('warning');
    avviso.innerHTML = "";
    sezione.classList.add('controllopositivo');
    return true;
}



