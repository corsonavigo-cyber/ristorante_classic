//salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php

//--------------------SELETTORI-------------------------------------

//per caricare e selezionare dove avverrà l'insert dei menu
const fuorimenupiatto = document.getElementById("form-inserisci-fuorimenu-piat");
const fuorimenubevanda = document.getElementById("form-inserisci-fuorimenu-bev");
const inserisciordine = document.getElementById("form_inserisci_ordine");
const form_modifica_ordine = document.getElementById("form_modifica_ordine");
const contenitore_bev = document.getElementById('bevande_bar');
const primo_step = document.getElementById('primo-step');
const secondo_step = document.getElementById('secondo-step');
//funzione di controllo multipla negli inserimenti/modifiche form_inserisci_ordine
let confirmGiaChiesto = false;
let bevande = [];
let piatti = []; 
let comanda = [];
let momentoAttivo = 1;
let idOrdineInserito = null;
let id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
///_-----------------LOCAL STORAGE--------------

const CHIAVE_ORDINE = "id_ordine";
/*function initLocal() {
    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el=> parseInt(el.value));
    const comandaprecedente = localStorage.getItem('id_ordine');
    const comandaTrovata = comandaprecedente.id_tavolo === tavoliSelezionati ? true : false;
        if(comandaTrovata ){
                const conferma = confirm("Su questo travolo hai già una comanda in corso, vuoi continuare con quella?");
                if (conferma) {
                    btn_avanti.dataset.id = parseInt(comandaprecedente.id_ordine);
                    ripristinaOrdine(comandaprecedente);
                    return;
                }
        }        
   }
*/

//controllo che siamo nella pagina giusta per attivare i listener
if (fuorimenupiatto) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciPiattoFuoriMenu);
} else if (fuorimenubevanda) {
    //attiva il bottone inserisci
    document.addEventListener('click', inserisciBevandaFuoriMenu);
}else if (contenitore_bev) {
    document.addEventListener('DOMContentLoaded', precaricaBevandeBar);
} else if (inserisciordine) {
    
    document.addEventListener('DOMContentLoaded', () => {
    const runCheck = () => {
        console.log("sonoqui 5");
        controllaPostiTavoloDisponibili();
    };
    document.getElementById('numero-persone').addEventListener('input', runCheck);
    // FIX: delegation  (es. #tavoli_checkbox), funziona anche per checkbox iniettate dopo
    document.getElementById('tavoli_checkbox').addEventListener('change', (e) => {
        if (e.target.name === 'tavoliSelezionati[]') runCheck() ;
       });
        });  
  
    document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
    document.addEventListener('input', gestisciInputGlobali);
    document.addEventListener('click', globalClick);

}



async function precaricaBevandeBar() {
    
    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    if (!risposta.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const json = await risposta.json();
    

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
   
    
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
   
    id_tavolo_arrivato_url= new URLSearchParams(window.location.search).get('id');
    lavagna.innerHTML = data.map(tavolo => `
       <li><label><input type="checkbox" name="tavoliSelezionati[]" id="id_${tavolo.id_tavolo}" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');
    console.log("ID Tavolo arrivato dall'URL:", id_tavolo_arrivato_url);
    await selezionatavolo(id_tavolo_arrivato_url);

    
}
async function selezionatavolo(id_tavolo_arrivato_url){
    if(!id_tavolo_arrivato_url) return;
    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = parseInt(id_tavolo_arrivato_url) === parseInt(checkbox.value)? true : false;
        });

    document.getElementById('numero-persone').value = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id_tavolo_arrivato_url}"]`).dataset.posti;
    }
    
async function disegnaMomenti() {
    const risposta = await fetch(`${API_ORDINI}?type=momenti`); 
    if (!risposta.ok) { 
        throw new Error("Errore nel caricamento dei momenti");
    }
    const jsonmomenti = await risposta.json();
    const contmomento = document.getElementById('momenti-servizio');
    if (!contmomento) return;
    const momentoAttivojson =jsonmomenti.data.find(m=> m.id_momento === momentoAttivo);
    const stringaTitolo = momentoAttivojson ? `<br><h3>${momentoAttivojson.nome_servizio.toUpperCase()}</h3>` : '';
    
    
    const selettori_momento=jsonmomenti.data.map(m => `<br><div class="mmomenti"><button class="btn-momento ${momentoAttivo === m.id_momento ? 'attivo' : ''}" data-id="${m.id_momento}">${m.nome_servizio}</button></div>`).join("<br>");
    contmomento.innerHTML = `<div class="momenti-servizio">${selettori_momento}</div><div> ${stringaTitolo}</div>`;
}

async function disegnaPreComanda() {

    const visualizza_modifiche_json = document.getElementById('riassunto-ordine');
    if (!visualizza_modifiche_json) return;
    
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
            ${e.nome} - X ${e.quantita} - ${e.prezzo} €
        </li>
    `).join("")}

`).join("");

}

async function precaricaBevandeForm() {
    const comanda =localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    const rispostabevande = await fetch(`${API_MENU}?type=bevande`);
    const btn_fuorimenu_p = document.getElementById('linkbev');
    btn_fuorimenu_p.setAttribute('href', `nuovopiattofuorimenu.php?id=${comanda.id_ordine}`);

    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonbevande = await rispostabevande.json();
    bevande = jsonbevande;
    const lavagnabevande = document.getElementById('bevande_input');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda => `
    <div class="bevanda" >
    <button type="button" class="btn-inserisci-bevandamenu-ordine" ">
     <h3 class="comment" data-name="${bevanda.nome_bevanda}" data-id="${bevanda.id_bevanda} data-tipo="bevanda"><b> ${bevanda.nome_bevanda}</b></h3>
     <p class="comment" data-id="${bevanda.id_bevanda} >${bevanda.descrizione}</p>
     <p class="comment" data-prezzo="${bevanda.prezzo}" data-id="${bevanda.id_bevanda}>Prezzo: ${bevanda.prezzo} € </p>
     <ul  class="elenco_allergeni" >
        ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join('') : '<li>Nessun allergene</li>'}
     </ul>
     <p class="comment">Contiene Alcol: ${bevanda.alcol} </p>
     <label for="quantita"  > Quantità </label>
    <input type="number" step="1" name="quantita-bev" class="quantita-bev" id="quantita-bev" data-id="${bevanda.id_bevanda}" data-tipo="bevanda" value="0" min="0" required>
    
    </button>
    </div>`).join(''); // FIX: era "b.id_bevanda", "b" non esisteva (la variabile del map è "bevanda")
}

async function precaricaPiattiForm() {
    const comanda = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    const id_ordine = comanda.id_ordine? comanda.id_ordine : '';
    const rispostapiatti = await fetch(`${API_MENU}?type=piatti`);
    const btn_fuorimenu = document.getElementById('linkbev');
    btn_fuorimenu.setAttribute('href', `nuovabevandafuorimenu.php?id=${comanda.id_ordine}`);

    if (!rispostapiatti.ok) {
        throw new Error("Errore nel caricamento dei piatti");
    }
    const jsonpiatti = await rispostapiatti.json();
    piatti = jsonpiatti;
    const lavagnapiatti = document.getElementById('piatti_input');
    //elementi Piatti per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnapiatti.innerHTML = jsonpiatti.data.filter(piatti => piatti.in_menu === 'si').map(piatto => `
    <div class="piatto" >
    <button type="button" class="btn-inserisci-piatto-ordine" data-id="${piatto.id_piatto}" data-tipo="piatti" >
    <h3 class="comment" id="nome"  data-name="${piatto.nome_piatto}"><b> ${piatto.nome_piatto}</b></h3>
    <p class="comment">${piatto.descrizione}</p>
    <p class="comment" id="prezzo" data-prezzo="${piatto.prezzo}">Prezzo: ${piatto.prezzo} € </p>
    <p  class="elenco_allergeni">
        ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `${a}`).join(',') : 'Nessun allergene'}
    </p>
    <label for="quantita"> Quantità </label>
    <input type="number" step="1" name="quantita" class="quantita" id="quantita" data-id="${piatto.id_piatto}" data-tipo="piatto" value="0" min="0" required>
    
    </button>
    </div>
    `).join(''); // FIX: id="btn-inserisci-piatto-ordine non chiudeva le virgolette (HTML rotto); allineato al pattern del bottone bevanda (class + data-id). "p.id_piatto" → "piatto.id_piatto"
}




// Salva a che punto siamo e cosa c'è nella comanda
function salvaOrdine(id_ordine, salvatavoli = true) {

    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
        .map(el => parseInt(el.value));
    let ordine = {};
    const step = document.getElementById('secondo-step').classList.contains('hider') ? 1 : 2;
     if(salvatavoli){
        ordine = {
           id_ordine: id_ordine,
           step: step,
           comanda: comanda,
           tavoli: tavoliSelezionati
         }
        }else{
            constordine = {
                id_ordine: id_ordine,
                step: step,
                comanda: comanda}
            };
    

    localStorage.setItem(CHIAVE_ORDINE, JSON.stringify(ordine));
}



// Al caricamento, ripristina step e comanda salvati
async function ripristinaOrdine(ordine) {
        console.log("sono qui 3");
        const risposta = await fetch(`${API_ORDINI}?type=oggi`);
        if (!risposta.ok) {
            throw new Error("Errore nel caricamento dell'ordine");
            return;
        }
        const ordineJson = await risposta.json();
        console.log("sono qui2");

        if (!ordineJson.data || ordineJson.data.length === 0) {
            console.log("sono qui");
            alert("Ordine non trovato");
            primo_step.classList.remove('hider');
            secondo_step.classList.add('hider');
            return;
        }
        console.log("sono qui")
        

        comanda = ordine.comanda;
        idOrdineInserito = ordine.id_ordine;
        if (Number(ordine.step) === 2) {
               primo_step.classList.add('hider');
               secondo_step.classList.remove('hider');
                console.log("comandaripristinata",comanda);
                await disegnaMomenti();
                precaricaBevandeForm();
                precaricaPiattiForm();
                disegnaPreComanda();
                //inserisci i valori nei tag generati da precarica
            }
    }
    


// Da chiamare quando la comanda viene inviata definitivamente al server
function svuotaOrdineSalvato() {
    localStorage.removeItem(CHIAVE_ORDINE);

}
/*da inserire in controlla tavoli disponibili*/
function disattivaBottoneTavolo(tavoli) {

    tavoli.forEach(id_tavolo => {

        const checkbox = document.getElementById(`id_${String(id_tavolo)}`);

        if (!checkbox) {
            throw new Error(`Checkbox ${id_tavolo} non trovata`);
        }

        checkbox.disabled = true;
    });
}
async function globalClick(e) {
    const btn_avanti = e.target.closest('.btn-avanti');
    const div =document.getElementById('piatti_input');
    
    const divbev =document.getElementById('bevande_input');
    
    const btn_aggiorna = e.target.closest('.aggiorna'); 
    const btn_indietro = e.target.closest('.btn-indietro'); 
    
    if (btn_avanti) {
        
        e.preventDefault();
        //controllo per evitare che il json salvato invii la funzione sena il permesso dell'utente
        
        const idOrdine = Number(btn_avanti.dataset.id);
        idOrdineInserito = id_ordine;
        if (idOrdine > 0) {

            alert("Ordine già inserito.");
            disegnaMomenti();
            precaricaPiattiForm();
            precaricaBevandeForm();
   
            secondo_step.classList.remove('hider');
            primo_step.classList.add('hider');

            console.log(idOrdine);

            salvaOrdine(idOrdine, false);

            return;
        }


        const id_ordine = await inserisciOrdine();
        
        if(Number.isNaN(id_ordine)){
            return alert("Non è un numero. Riprova.");
        }
        secondo_step.classList.remove('hider');
        primo_step.classList.add('hider');
        console.log(id_ordine);

        alert("Nuovo ordine inserito");

        btn_avanti.dataset.id = id_ordine;

        salvaOrdine(id_ordine, true);
        disegnaMomenti();
        precaricaPiattiForm();
        precaricaBevandeForm();
        return;
    }

    const btn_momento = e.target.closest('.btn-momento'); 

    if (btn_indietro) {
        e.preventDefault();
        primo_step.classList.remove('hide');
        secondo_step.classList.add('hide');
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        momentoAttivo = 1;
        return;
    }

    if (btn_momento) {
        e.preventDefault();
        momentoAttivo = Number(btn_momento.dataset.id);
        document.querySelectorAll(".btn-momento").forEach(b => b.classList.remove('attivo'));
        btn_momento.classList.add('attivo');
        salvaOrdine(id_ordine, false);
        disegnaMomenti();
        aggiornaInputPernuovoMomento();
        return;
    }
    const btn_piatto = e.target.closest('.btn-inserisci-piatto-ordine'); 
    if (btn_piatto) {
        e.preventDefault();
        const id_piattoDaInserire = Number(btn_piatto.dataset.id);
        const quantita = document.querySelector(`.quantita[data-id="${id_piattoDaInserire}"]`);
        const id_ordine = Number(btn_avanti.dataset.id);
        console.log(id_ordine);
        console.log(Number(btn_avanti.dataset.id));
        if (Number(quantita.value) === 0) quantita.value = 1;
        aggiornaVoceComanda(
            "piatto",
            null, // nome: lo recupera comunque aggiornaVoceComanda dall'anagrafica piatti
            Number(e.target.dataset.id),
            Number(e.target.value),
            null, // prezzo: recuperato dall'anagrafica
            momentoAttivo, // presuppone che questa variabile sia disponibile nello scope (globale o closure)
            idOrdineInserito       
        );        
        return;
    }
    const btn_bevanda = e.target.closest(".btn-inserisci-bevandamenu-ordine");
    if (btn_bevanda) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) return;
        const id_bevanda = Number(btn_bevanda.dataset.id);
        const quantita_bev = document.querySelector(`.quantita-bev[data-id="${id_bevanda}"]`);
        if (Number(quantita_bev.value) === 0) quantita_bev.value = 1;
        aggiornaVoceComanda(
            "bevanda",
            null,
            Number(e.target.dataset.id),
            Number(e.target.value),
            null,
            momentoAttivo,
            idOrdineInserito
        );        
        return;
    }

    const btn__inserisci_ordine = e.target.closest(".btn-inserisci-ordine");
    if (btn__inserisci_ordine) {
        e.preventDefault();
        if (!controllaMomentoSelezionato()) {
            if(!confirm("vuoi stampare la comada ? ")) return false;
        };
        /*inserisciComandaDb();*/
        return;
    }
} // FIX: mancava questa chiusura → tutte le funzioni sotto erano nidificate dentro globalClick e irraggiungibili

function gestisciInputGlobali(e) {
    // Variazione manuale quantità piatti
    if (e.target.classList.contains("quantita")) {
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda(
            "piatto",
            null, // nome: lo recupera comunque aggiornaVoceComanda dall'anagrafica piatti
            Number(e.target.dataset.id),
            Number(e.target.value),
            null, // prezzo: recuperato dall'anagrafica
            momentoAttivo, // presuppone che questa variabile sia disponibile nello scope (globale o closure)
            id_ordine       // idem, verifica che sia accessibile qui
        );
    }

    // Variazione manuale quantità bevande
    if (e.target.classList.contains("quantita-bev")) {
        if (!controllaMomentoSelezionato()) { e.target.value = 0; return; }
        aggiornaVoceComanda(
            "bevanda",
            null,
            Number(e.target.dataset.id),
            Number(e.target.value),
            null,
            momentoAttivo,
            id_ordine
        );
    }

  
} // <- mancava questa graffa di chiusura

function controllaMomentoSelezionato() {
    if (momentoAttivo === null) {
        alert("Seleziona prima un momento del servizio (es. Antipasto, Primo)!");
        return false;
    }
    return true;
}

//--------------------------COMANDA-------------------
async function inserisciComandaDb(id_ordine, comanda){

    
    
    if (!comanda || comanda.length === 0) {
        alert("elementi non selezionati");
        return;
    }
    if (!id_ordine && id_ordine !== 0 && !(btn_avanti.dataset.id === "#" ) && (btn_avanti.dataset.id !== id_ordine)) {
        alert("ID ordine non valido");
        return;
    } 
    await inserisciOrdinePiatto(comanda.filter(e => e.tipo === "piatto").map(e => e.id));
    await inserisciOrdineBevanda(comanda.filter(e => e.tipo === "bevanda").map(e => e.id));
    await stampaComanda(id_ordine, comanda);
}

async function stampaComanda(id_ordine,comanda){

}

function aggiornaVoceComanda(tipo, nome, id, quantita, prezzo, momentoAttivo, id_ordine) {
    // Cerca se l'elemento dello stesso tipo, id e nello stesso momento di servizio esiste già nell'array comanda
    const indice = comanda.findIndex(el => el.tipo === tipo && el.id === id && el.id_momento === momentoAttivo);
    // (rinominato il parametro della callback da id_momento a el: prima "ombreggiava" il campo id_momento dell'oggetto, confondendo la lettura)
    
    if (quantita <= 0) {
        // Rimozione (Deselezione quando la quantità torna a 0)
        if (indice !== -1) comanda.splice(indice, 1);
    } else {
        // Recupero il nome dell'elemento dall'anagrafica corretta, sovrascrivendo i parametri passati
        if (tipo === "piatto") {
            const piatto = piatti.find(el => el.id === id);
            if (piatto) {
                nome = piatto.nome_piatto;
                prezzo = piatto.prezzo;
            }
        } else {
            const bevanda = bevande.find(el => el.id === id);
            if (bevanda) {
                nome = bevanda.nome_bevanda;
                prezzo = bevanda.prezzo;
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
                prezzo: prezzo,
                id_momento: momentoAttivo,
                quantita: quantita
            });
        }
    }

    salvaOrdine(id_ordine, false); // prima non passavi id_ordine: dentro salvaOrdine arrivava undefined
    console.log("Comanda Aggiornata:", comanda);
}

// Ripristina i valori numerici degli input grafici quando si cambia momento del servizio
function aggiornaInputPernuovoMomento(comanda) {
    const btn_avanti = document.querySelector('avanti');
    if( btn_avanti.dataset.id = "#"){
        // Azzera tutti gli input grafici correnti prima del ricalcolo
        document.querySelectorAll(".quantita, .quantita-bev").forEach(input => input.value = 0);
    }
    if(comanda.id_ordine ===  btn_avanti.dataset.id){
        if(comanda.comanda.length > 0){
            // Popola gli input grafici con i valori della comanda
            comanda.comanda.forEach(voce => {
                const input = document.querySelector(`[data-id="${voce.id}"][data-tipo="${voce.tipo}"]`);
                if (input) {
                    input.value = voce.quantita;
                }
            });
        }
    }
    
}



async function inserisciPiattoFuoriMenu() {
    try {
        //recupero i dati dal DOM
        const nome_piatto = document.getElementById('nome-piatto').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }

        
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
 
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
        const id_piatto = json.id;
        await inserisciOrdinePiatto(id_piatto);
        return id_piatto;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciBevandaFuoriMenu() {
    try {
        const nome_bevanda = document.getElementById('nome-bevanda').value;
        const descrizione = document.getElementById('descrizione').dataset.id;
        const prezzo = document.getElementById('prezzo');
        const alcol = document.querySelector('input[name="alcol"]:checked');

        if (typeof nome_bevanda !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
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
        const id_bevanda = json.id;
        await inserisciOrdineBevanda(id_bevanda);
        return id_bevanda;

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
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        if (tavoli.length === 0) {
            throw new Error("Seleziona almeno un tavolo");
        }
        
        console.log("Tavoli selezionati:", tavoli);
        const body = {
            id_stato: parseInt(1),
            numero_persone:  parseInt(numPersone),
            tavoli: tavoli
        };

        
        const risposta = await fetch(`${API_ORDINI}?type=ordinecompleto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
     
        const id_ordine = parseInt(json.data.id_ordine)
     
        return id_ordine;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdinePiatto(id_piatto) {
    try {
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked');
        if(!id_momento){
            alert('devi selezionare quando va somministrata la bevanda!')
            return;
        }
        const id_ordine_arrivato_url = parseInt(new URLSearchParams(window.location.search).get('id'));
        if(!id_ordine_arrivato_url){
           return;
        }
        
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }


        const body = {
            id_ordine: id_ordine_arrivato_url,
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
        const json = await risposta.json();
        const id_ordine = json.id;
        return id_ordine;

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

async function inserisciOrdineBevanda(id_bevanda) {
    try {
        
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = parseInt(document.getElementById('btn-inserisci-bevandamenu-ordine').dataset.id);
        if(!id_momento){
            alert('devi selezionare quando va somministrata la bevanda!');
            return;
        }
        const id_ordine_arrivato_url = parseInt(new URLSearchParams(window.location.search).get('id'));

        
        
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }
        

        const body = {
            id_ordine: id_ordine_arrivato_url,
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

async function inserisciOrdineTavolo() {
    try {
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        const id_ordine = parseInt(document.getElementById('btn-avanti').dataset.id);
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

async function inserisciOrdineStato(id_ordine,id_stato = 1) {
    try {

        const body = {
            id_ordine: id_ordine,
            id_stato: parseInt(id_stato)
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
async function precaricaFormModificaComanda() {
   
    const id_ordine = new URLSearchParams(window.location.search).get('id');
    if (!id_ordine) return;

    const risposta = await fetch(`${API}?type=ordine&id=${id_ordine}`);
    const json = await risposta.json();
    const ordine = json.data;
    if (ordine || ordine.length === 0) return;
    //step_1
    document.getElementById('numero-persone').value =  parseFloat(ordine.numero_persone || 0) ;

    const tavoliComanda = [...new Set(tavoli.map(tavolo => tavolo.id_tavolo))];

    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = tavoliComanda.includes(parseInt(checkbox.value));
    });
    //step_2 
    comanda = json.data.map(voce => ({
        tipo: voce.tipo.toLowerCase(),
        id: voce.tipo === "PIATTO"
            ? parseInt(voce.id_piatto)
            : parseInt(voce.id_bevanda),
        nome: voce.tipo === "PIATTO"
            ? voce.nome_bevanda
            : voce.nome_bevanda,
        prezzo: parseFloat(voce.prezzo),
        quantita: parseInt(voce.quantita),
        id_momento: parseInt(voce.id_momento)
    }));
     

    document.querySelectorAll(".quantita, .quantita-bev").forEach(input => input.value = 0);
    comanda.forEach(voce => {
        const input = document.querySelector(`[data-id="${voce.id}"][data-tipo="${voce.tipo}"]`);
        if (input) {
            input.value = voce.quantita;
        }
    });

}

/*async function modificaPrenotazioneClick(e) {
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
*/
//------------------------------DELETE-----------------------------------------
async function eliminaOrdineClick(id_ordine) {
    try {       

        const risposta = await fetch(`${API_ORDINI}?type=ordine&id=${id_ordine}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        return;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}





async function eliminaComandaClick(e) {
    try {
        const btn_elimina = e.target.closest('.btn-elimina-ordine');
        if (!btn_elimina) return;
        if (!confirm('vuoi eliminare questa prenotazione?')) return;

        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=composto&id=${id_elimina}`, {
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

async function eliminaBevandaDallaComandaClick(e) {
    try {
        const btn_elimina_bevanda = e.target.closest('.btn-dissocia-bevanda');
        if (!btn_elimina) return;
        
        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=ordine_bevanda&id=${id_elimina}`, {
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

async function eliminaPiattoDallaComandaClick(e) {
    try {
        const btn_elimina_piatto = e.target.closest('.btn-dissocia-piatto');
        if (!btn_elimina) return;
        
        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`${API_ORDINI}?type=ordine_piatto&id=${id_elimina}`, {
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


async function eliminaStoricoOrdini(e) {
    try {
        const oggi = new Date().toISOString().slice(0, 10);
        const ultimaEsecuzione = localStorage.getItem('ultimaPuliziaOrdini');

        if (ultimaEsecuzione === oggi) return; // già eseguita oggi, esci

        const risposta = await fetch(`${API_ORDINI}?type=pulisci`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        localStorage.setItem('ultimaPuliziaOrdini', oggi);
        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}


//utilità



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





 async function controllaPostiTavoloDisponibili(){

    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
    console.log(tavoliSelezionati)
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');
    const ordine = localStorage.getItem(CHIAVE_ORDINE) ? JSON.parse(localStorage.getItem(CHIAVE_ORDINE)) : [];
    console.log("entrato controllo funzione");
    if(tavoliSelezionati.length === 0){
        sezione.classList.add('warning', 'controllopositivo');
        avviso.innerHTML = "devi obbligatoriamente selezionare almeno un tavolo per procedere!";
        
        return false;
       
    }
    console.log("sonoqui 4");
    console.log("ordine", ordine);

    if (!ordine || Object.keys(ordine).length === 0) {
        console.log("ordine vuoto");
        return;
    }   
    console.log("sonoqui 5");
    console.log("ordine",ordine);
    const btn_avanti = document.getElementById('avanti');
    btn_avanti.dataset.id = ordine.id_ordine;
    const stessiTavoli = tavoliSelezionati.every(t => ordine.tavoli.includes(t));

    if (confirmGiaChiesto && ordine && Object.keys(ordine).length > 0) {
        const btn_avanti = document.getElementById('avanti');
        btn_avanti.dataset.id = ordine.id_ordine;
        
        await disegnaMomenti();
        precaricaBevandeForm();
        precaricaPiattiForm();
        disegnaPreComanda();
        await ripristinaOrdine(ordine);
        return true;
        }

    if (stessiTavoli && !confirmGiaChiesto){
        confirmGiaChiesto = true;
        console.log("entrato controllo funzione tavolo in uso");
        const conferma = confirm(`Il tavolo ${ordine.tavoli} ha già un inserimento in corso, vuoi utilizzarlo ?`);
        if(!conferma){
           const btn_avanti = document.getElementById('avanti');
           btn_avanti.dataset.id = ordine.id_ordine;
           svuotaOrdineSalvato();
           
           precaricaTavoliForm();
           disattivaBottoneTavolo(ordine.tavoli);
           return false;
        }
        ripristinaOrdine(ordine);
        return true;
    
    }
    let tavoliSelezione = tavoliSelezionati;
    

    const numeroPersone = parseInt(document.getElementById('numero-persone').value, 10); // FIX: cast esplicito
    if (Number.isNaN(numeroPersone) || numeroPersone <= 0) {
        sezione.classList.add('warning');
        avviso.innerHTML = `Inserisci un numero di persone valido`;
        return false;
    }

    // FIX: somma posti letti da data-posti delle checkbox selezionate, non dagli id grezzi
    const postiTotali = tavoliSelezione.reduce((acc, id) => {
        const checkbox = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id}"]`);
        return acc + (parseInt(checkbox?.dataset.posti, 10) || 0);
    }, 0);
    console.log(tavoliSelezione);
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



