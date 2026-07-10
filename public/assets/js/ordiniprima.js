 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const fuorimenupiatto = document.getElementById("form-inserisci-fuorimenu-piat");
  const fuorimenubevanda = document.getElementById("form-inserisci-fuorimenu-bev");
  const inserisciordine = document.getElementById("form_inserisci_ordine");
  const form_modifica_ordine = document.getElementById("form_modifica_ordine");
  //funzione di controlo multipla negli inserimenti/modifiche form_inserisci_ordine
  let momento = [];
  let bevande =[];
  let momenti = [];
  let tavoli=[];
  let comanda=[];
  let momentoAttivo=null;
  let idTavoloComanda= null;
  let idOrdineInserito = null;

  let initialized = false;
  //controllo che siamo nella pagina giusta per attivare i lissener
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

  }else*/ if(fuorimenupiatto){
      //attiva il bottone inserisci
       document.addEventListener('click', inserisciPiattoFuoriMenuClick);
     }else if (fuorimenubevanda){
      //attiva il bottone inserisci
       document.addEventListener('click', inserisciBevandaFuoriMenuClick);
     }else if(inserisciordine){
       
     }
/**
    document.addEventListener('DOMContentLoaded', () => {
        const runCheck = () => {
            const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
                .map(el => parseInt(el.value));
            controllaTavoloDataDisponibile(tavoliSelezionati);
            controllaPostiTavoloDisponibili(tavoliSelezionati);
        };

        // FIX: delegation  (es. #tavoli_checkbox), funziona anche per checkbox iniettate dopo
        document.getElementById('tavoli_checkbox').addEventListener('change', (e) => {
            if (e.target.name === 'tavoliSelezionati[]') runCheck();
        });

        document.getElementById('numero-persone').addEventListener('input', runCheck);

        document.querySelectorAll('#data-in-prenotazione, #ora-prenotazione')
            .forEach(campo => campo.addEventListener('change', runCheck));
    });

    document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
      
  }else if(form_modifica_prenotazione){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPrenotazioneClick);
      document.addEventListener('DOMContentLoaded', precaricaTavoliForm);
      document.addEventListener('DOMContentLoaded', () => {
        const runCheck = () => {
            const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')]
                .map(el => parseInt(el.value));
            controllaTavoloDataDisponibile(tavoliSelezionati);
            controllaPostiTavoloDisponibili(tavoliSelezionati);
        };

        // FIX: funziona anche per checkbox iniettate dopo
        document.getElementById('tavoli_checkbox').addEventListener('change', (e) => {
            if (e.target.name === 'tavoliSelezionati[]') runCheck();
        });

        
        document.getElementById('numero-persone').addEventListener('input', runCheck);

        document.querySelectorAll('#data-in-prenotazione, #ora-prenotazione')
            .forEach(campo => campo.addEventListener('change', runCheck));
    });

  */

 //Caricare reiderizza tutte le prenotazioni attivie

  async function precaricaTavoliForm(id_tavolo) {
    // legge l'id dall'URL:modificaprenotazione.php?id=5
    //funzione dell'URL in js per la ricerca al suo interno
    

    const risposta = await fetch(`${API}`);
    
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    
    const lavagna = document.getElementById('tavoli_checkbox');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = data.map(tavolo=>`
       <li><label><input type="checkbox" name="tavoliSelezionati[]" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');
    
    const attivaInput = document.querySelector(`input[name="tavoliSelezionati[]"][value="${id_tavolo}"]`);
    if (attivaInput) attivaInput.checked = true;    

    if(form_modifica_ordine){
      await initModifica();
    }
  }

  function disegnaMomenti(){
    const risposta = await fetch(`${API_ORDINI}?type='momenti'`);
    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonmomenti = await risposta.json();
    const contmomento = document.getElementById('momenti-servizio');
    contmomento.innerHTML =jsonmomenti.map(m=>`<div class="mmomenti"><button class="btn-momento ${momentoAttivo===m.id_momento ? 'attivo' : ''}" data-id="${m.id_momento}">${m.nome_momento}</button></div>`).join("<br>");
   }

  async function precaricaBevandeForm() {


    const rispostabevande = await fetch(`${API}?type=bevande`);
    
    if (!rispostabevande.ok) {
        throw new Error("Errore nel caricamento delle bevande");
    }
    const jsonbevande = await rispostabevande.json();
    const lavagnabevande = document.getElementById('bevande');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda=>`
    <div class="bevanda" >
    <button type="button" class="btn-inserisci-bevandamenu-ordine" data-id="${bevanda.id_bevanda}">
     <h3 class="comment"><b> ${bevanda.nome_bevanda}</b></h3>
     <p class="comment">${bevanda.descrizione}</p>
     <p class="comment">Prezzo: ${bevanda.prezzo} € </p> 
     <ul  class="elenco_allergeni">
        ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
     </ul>
     <p class="comment">Contiene Alcol: ${bevanda.alcol} </p>            
    </button>
    <label for="quantita"> Quantità </label>   
    <input type="number" step="1" name="quantita-bev" class="quantita-bev" id="quantita-bev" data-id="${b.id_bevanda}" value="0" min="0" required> 
    </div>`).join('');
  }
   
  async function precaricaPiattiForm() {


    const rispostapiatti = await fetch(`${API}?type=piatti`);
    
    if (!rispostapiatti.ok) {
        throw new Error("Errore nel caricamento delle bevandei piatti");
    }
    const jsonpiatti = await rispostapiatti.json();
    const lavagnapiatti = document.getElementById('piatti');
    //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnapiatti.innerHTML = jsonpiatti.data.filter(piatti => piatti.in_menu === 'si').map(piatto=>`
    <div class="piatto" >
    <button id="btn-inserisci-piatto-ordine  data-id="${piatto.id_piatto}"> 
    <h3 class="comment"><b> ${piatto.nome_piatto}</b></h3>
    <p class="comment">${piatto.descrizione}</p>
    <p class="comment">Prezzo: ${piatto.prezzo} € </p> 
    <p  class="elenco_allergeni">
        ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `${a}`).join(','):'Nessun allergene'}
    </p>          
    </button>
    <label for="quantita"> Quantità </label>   
    <input type="number" step="1" name="quantita" class="quantita" id="quantita" data-id="${p.id_piatto}" value="0" min="0" required> 
    </div>
    `).join('');
  }

  function globalClick(e){
    const btn_avanti=e.target.closest('btn-avanti');
    const primo_step = document.getElementById('primo-step');
    const secondo_step = document.getElementById('secondo-step');
    const btn_aggiorna = e.target.closest('aggiorna');    
    const btn_indietro = e.target.closest('btn-indietro');  


    if(btn_avanti){
        primo_step.classList.add('hide');
        secondo_step.classList.remove('hide');
        return;
    }


    const btn_momento = e.target.closest('btn-momento');

    if(btn_indietro){
        momentoAttivo = null;
        document.querySelectorAll(".btn-momento").forEach(b=>b.classList.add('attivo'));
        return;
    }

    if(btn_momento){
        momentoAttivo = Number(btn_momento.dataset.id);
        document.querySelectorAll(".btn-momento").forEach(b=>b.classList.remove('attivo'));
        btn_momento.classList.add('attivo');
        if(btn_aggiorna){
             aggiornaComanda();
             return;
        }
        return;
    }
    const btn_piatto = e.target.closest('btn-inserisci-piatto-ordine');
    if(btn_piatto){
        const id_piattoDaInserire = Number(btn_piatto.dataset.id);
        const quantita = document.querySelector(`.quantita[data-id="${id_piattoDaInserire}"]`);
        if (Number(quantita.value) === 0) quantita.value = 1;
        aggiornaVoceComanda("piatto", id, Number(quantita.value));
        return;
    }
    const btn_bevanda = e.target.closest(".btn-bevanda");
    if (btn_bevanda) {
        if (!controllaMomentoSelezionato()) return;
        const id_bevanda = Number(btn_bevanda.dataset.id);
        const quantita_bev = document.querySelector(`.quantita[data-id="${id_bevanda}"]`);
        if (Number(quantita_bev.value) === 0) quantita_bev.value = 1;
        aggiornaVoceComanda("bevanda", id, Number(quantita_bev.value));
        return;
    }

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

//--------------------------COMADA-------------------

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
            nomeItem = bevanda  ? bevanda.nome_bevanda : "";
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
    console.log("Comanda Aggiornata:", comanda);
}
// Ripristina i valori numerici degli input grafici quando si cambia momento del servizio
function aggiornaInputPernuovoMomento() {
    // Azzera tutti gli input grafici correnti prima del ricalcolo
    document.querySelectorAll(".quantita-piatto, .quantita-bevanda").forEach(input => input.value = 0);

}

  
  


 
    
 
  
  //cambia i tavoli all'input della checkbok
  async function cambiaOrdineDalTavolo(id_ordine,tavoli){
    
    //come utilizzare fetch(URL,METHOD)
    try{
        if(!id_ordine){
          throw new Error('Ordine non variato, manca ID!');
        }  
        if(!tavoli){
          throw new Error('Ordine non variato, manca ID!');
        }  
      
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const aggiornaRelazione = await fetch(`${API_ORDINI}?type=tavolo&id=${id_ordine}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_ordine: parseInt(id_ordine), 
                    tavoli : tavoli
                  })
            });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!aggiornaRelazione.ok) {
                const json = await aggiornaRelazione.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${aggiornaRelazione.status}`);
            }
        
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
/*

   //------------------DELETE-------------------------------------

    async function eliminaPrenotazioneClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn_elimina = e.target.closest('.btn-elimina-prenotazione');
        //escludo click per errore
        if(!btn_elimina) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare questa prenotazione?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = btn_elimina.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }
            
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo_prenotazioni&id=${id_elimina}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico le prenotazioni
        window.location.reload();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }


  async function eliminaStoricoPrenotazione(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        
        const oggi = new Date().toISOString().slice(0, 10); 
        const ultimaEsecuzione = localStorage.getItem('ultimaPuliziaPrenotazioni');

        if (ultimaEsecuzione === oggi) return; // già eseguita oggi, esci

          
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`${API}?type=pulisci`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        localStorage.setItem('ultimaPuliziaPrenotazioni', oggi);
        //se il flusso del programma non viene interrotto ricarico le prenotazioni
        window.location.reload();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
  

 

 

  async function disattivaPrenotazione(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn_disattiva = e.target.closest('.btn-disattiva-prenotazione');
        //escludo click per errore
        if(!btn_disattiva) return;
        //questa funzione di js genera un alet bool
        if(!confirm('disattivare questa prenotazione?')){
          return;
        }
       
        //recupero il data set da data-id
        const id_disattiva =btn_disattiva.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Non è stato possibile disattivare la Prenotazione , manca ID!');
        }
        if(await togliPrenotazioneDalTavolo(id_disattiva)){
    
              //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
              const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=prenotazioni&id=${id_disattiva}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    id_prenotazione: parseInt(id_disattiva), 
                    attiva : 0
                  })
              });
              //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
              if (!risposta.ok) {
                //prendo la risposta json 
                const json = await risposta.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
              }
              //se il flusso del programma non viene interrotto ricarico i piatti
              window.location.reload();
            }
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
    async function attivaPrenotazione(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn_attiva = e.target.closest('.btn-attiva-prenotazione');
        //escludo click per errore
        if(!btn_attiva) return;
        //questa funzione di js genera un alet bool
        if(!confirm('Attivare questa prenotazione?')){
          return;
        }
       
        //recupero il data set da data-id
        const id_attiva =btn_attiva.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_attiva){
          throw new Error('Non è stato possibile attivare la Prenotazione , manca ID!');
        }
       
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=prenotazioni&id=${id_attiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_prenotazione: parseInt(id_attiva), 
              attiva : 1 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i piatti
        window.location.reload();
    
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
  
  async function precaricaTavoliForm() {
    // legge l'id dall'URL:modificaprenotazione.php?id=5
    //funzione dell'URL in js per la ricerca al suo interno
    

    const risposta = await fetch(`${API_tavoli}`);
    
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    
    const lavagna = document.getElementById('tavoli_checkbox');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = data.map(tavolo=>`
       <li><label><input type="checkbox" name="tavoliSelezionati[]" value="${tavolo.id_tavolo}" data-posti="${tavolo.posti_max}">Numero Tavolo ${tavolo.numero_tavolo} posti ${tavolo.posti_max}</label></li>`).join('');
    
    const attivaInput = document.querySelector(`input[name="attiva"][value="1"]`);
    if (attivaInput) attivaInput.checked = true;    

    if(form_modifica_prenotazione){
      await initModifica();
    }
}

 //funzione ottimizzato con claude, tolte le ridondazze e sistemati i controlli in particolare la data 
*/async function inserisciPiattoFuoriMenu(nome_piatto,descrizione,prezzo){
    
    //come utilizzare fetch(URL,METHOD)
    try{


        //salvo il response dentro risposta, chiamo la fetch su un id specifico 
        const risposta = await fetch(`${API}?type=piatti`, {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    nome_piatto: String(nome_piatto),
                    descrizione: String(descrizione),
                    prezzo: prezzo,
                    allergeni: [],
                    in_menu: 'no',
                    categoria: 'altro'
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        
        return risposta.json().id;
        
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  async function inserisciBevandaFuoriMenu(nome_bevanda,descrizione,prezzo,alcol){
    
    //come utilizzare fetch(URL,METHOD)
    try{


        //salvo il response dentro risposta, chiamo la fetch su un id specifico 
        const risposta = await fetch(`${API}?type=bevande`, {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                nome_bevanda: String(nome_bevanda),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                alcol: alcol
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        const json = await risposta.json();
        return json.id;
        
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
  

  

  }