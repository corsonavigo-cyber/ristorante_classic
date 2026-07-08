 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const fuorimenu = document.getElementById("form-inserisci-fuorimenu");
  //funzione di controlo multipla negli inserimenti/modifiche
  

  let initialized = false;

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

  }else*/ if(fuorimenu){
      //attiva il bottone inserisci
     document.addEventListener('click', inserisciPiattoFuoriMenuClick);}
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

  }else if(storico){
     const filtro = document.getElementById('ricerca-storico').value;
     document.addEventListener('DOMContentLoaded', () => caricaStorico());
     
     document.getElementById('ricerca-storico').addEventListener('input', function() {
    caricaStorico(this.value.trim()); // function() → this è l'input ✓
    });
  }*/

 //Caricare reiderizza tutte le prenotazioni attivie

  
  //cambia i tavoli all'input della checkbok
  async function cambiaOrdineDalTavoloInput(id_ordine,tavoli){
    
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
*/async function inserisciPiattoFuoriMenuClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci-piattomenu-ordine');
        
        //escludo click per errore
        if(!btn) return;

        //recupero il nome del piatto dal form INPUT
        const nome_piatto = document.getElementById('nome-piatto').value.trim();
        

        //questa funzione di js genera un alet bool
        if(!confirm(`vuoi inserire ${nome_piatto}?`)){
          return;
        }
        //recupero gli altri dati dal form INPUT
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        


      //validazione dati
      // Nome piatto
        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }

        // Descrizione
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }

        // Prezzo
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }


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
        const id_piatto = risposta.lastisertID
        await inserisciOrdinePiatto(id_piatto);
        //reindirizzo il cliente
        window.location.href = "inseriscipiatto.php";
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
  async function inserisciOrdinePiatto(id_piatto){
    try{
        const btn = e.target.closest('.btn-inserisci-piattomenu-ordine');
        const id_ordine = btn.daset_id;
        // FIX: body condiviso, evita duplicazione tra i due rami
        const body = {
            id_ordine: id_ordine,
            id_piatto : id_piatto
        };

        const conTavolo = tavoli.length >= 1;
        

        const risposta = await fetch(`${API}?type=${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.href = "gestioneordini.php";

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
  }

  async function inserisciOrdineClick(e){
    try{
        const btn = e.target.closest('.btn-inserisci-ordine');
        if(!btn) return;

        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));
        const numero_persone = document.getElementById('numero-persone').value;

        // --- validazione ---
      
        const numPersone = parseInt(numero_persone);
        if (Number.isNaN(numPersone) || numPersone <= 0) {
            throw new Error("Inserisci un numero persone valido");
        }

        // FIX: body condiviso, evita duplicazione tra i due rami
        const body = {
            numero_persone: numPersone // FIX: uso il valore già validato/castato, non la stringa grezza
        };

        const conTavolo = tavoli.length >= 1;
        

        const risposta = await fetch(`${API}?type=${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.href = "gestioneordini.php";

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}

 async function controllaTavoloDataDisponibile(tavoliSelezionati){
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');

    // guard: niente data, niente controllo
    if(!da_inserire_data.value.trim()){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `La prenotazione deve avere una data!`;
        return false;
    }

    // guard: nessun tavolo selezionato, nessun conflitto possibile
    if(tavoliSelezionati.length === 0){
        sezione.classList.remove('warning');
        avviso.innerHTML = "";
        return true;
    }

    const risposta = await fetch(`${API}?type=prenotazioni`);
    const jsonprenotazioni = await risposta.json();

    const jsonTavoliPrenotati = jsonprenotazioni.data.filter(p =>
        p.id_tavoli && tavoliSelezionati.some(id => p.id_tavoli.includes(id)) // FIX: tipi normalizzati a monte (int), un solo controllo
    );
    const ora_p = document.getElementById('ora-prenotazione').value;
   
    
    // FIX: conflitto su data + ora, non solo data
    const conflitto = jsonTavoliPrenotati.some(p =>
        p.data_in_prenotazione === da_inserire_data.value && 
       getTurno(p.ora_prenotazione) === getTurno(ora_p)
    );

    if (conflitto) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Questo tavolo è già prenotato per data e ora selezionate!`;
        return false;
    }

    sezione.classList.remove('warning');
    avviso.innerHTML = "";
    sezione.classList.add('controllopositivo');
    return true;
}

function getTurno(orario) {
    const [h] = orario.slice(0, 5).split(':').map(Number);
    return h < 15 ? 'pranzo' : 'cena';
}

 async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
}

async function controllaPostiTavoloDisponibili(tavoliSelezionati){
    const avviso = document.getElementById("avviso1");
    const sezione = document.querySelector('#controllo1');

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

function getTurno(orario) {
    const [h] = orario.slice(0, 5).split(':').map(Number);
    return h < 15 ? 'pranzo' : 'cena';
}

 async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
}



 async function precaricaFormModificaPrenotazione() {
    // legge l'id dall'URL:modificaprenotazione.php?id=5
    //funzione dell'URL in js per la ricerca al suo interno
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?type=prenotazioni&id=${id}`);
    
    const json = await risposta.json();
    const data = json.data; // ← prendi il primo elemento
    
    document.getElementById('nome-prenotazione').value = data.nome_prenotazione;
    document.getElementById('ora-prenotazione').value  = data.ora_prenotazione;
    document.getElementById('data-in-prenotazione').value = data.data_in_prenotazione;
    document.getElementById('numero-persone').value = parseFloat(data.numero_persone);
    const attivaInput = document.querySelector(`input[name="attiva"][value="${data.attiva}"]`);
    if (attivaInput) attivaInput.checked = true;
    
    const tavoliEsistenti = data.id_tavoli ? data.id_tavoli.split(',').map(a => parseInt(a.trim())) : [];
    
    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
    checkbox.checked = tavoliEsistenti.includes(parseInt(checkbox.value));
    });   
    
}

async function modificaPrenotazioneClick(e){
    try{
        const btn = e.target.closest('.btn-modifica-prenotazione');
        if(!btn) return;
        if(!confirm('vuoi modificare questa Prenotazione?')) return;

        const id_modifica = btn.dataset.id;
        if(!id_modifica) throw new Error('ID Prenotazione mancante');

        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
        const ora_prenotazione = document.getElementById('ora-prenotazione').value.length === 5 ? `${document.getElementById('ora-prenotazione').value}:00` : document.getElementById('ora-prenotazione').value;
        const data_in_prenotazione = document.getElementById('data-in-prenotazione').value;
        const tavoliSelezionati = Array.from(document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')).map(el => parseInt(el.value)); 
        const attivo = parseInt(document.querySelector('input[name="attiva"]:checked').value, 10); // FIX: cast a int, coerente col backend (era stringa)
        const numero_persone = parseInt(document.getElementById('numero-persone').value, 10); // FIX: cast qui, non solo in validazione

        if (!nome_prenotazione) throw new Error('Il nome della prenotazione è obbligatorio');
        if (!ora_prenotazione) throw new Error('L\'ora della prenotazione è obbligatoria'); // FIX: mancava, richiesta dal backend in entrambi i rami
        if (Number.isNaN(numero_persone) || numero_persone <= 0) throw new Error('Inserisci un numero di persone valido');

        const conTavolo = tavoliSelezionati.length >= 1;
        const type = 'prenotazioni_tavolo';

        // FIX: body unificato, elimina la duplicazione tra i due rami
        const body = {
            nome_prenotazione: String(nome_prenotazione),
            ora_prenotazione: `${ora_prenotazione}`,
            data_in_prenotazione: String(data_in_prenotazione),
            attiva: attivo, // FIX: chiave "attiva" per matchare il parametro PHP $body['attiva'], non "attivo"
            numero_persone: numero_persone,
            tavoli: tavoliSelezionati 
        };

        const risposta = await fetch(`${API}?type=${type}&id=${id_modifica}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await risposta.json().catch(() => null); // FIX: dichiarato una volta sola, prima del check

        if (!risposta.ok || !json?.success) { // FIX: un solo controllo invece di due if separati con bug
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        alert('Prenotazione modificata con successo!');
        window.location.href = "gestioneprenotazioni.php";

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}
  

   //esempio di funzione ricerca nel file storico caricato
  //1 H persa per capire che siccome riscriveva va lasciata una chace fuori
  let storicoCache = []; // cache globale

  async function caricaStorico(filtro = '') {
    try {
        // fetch solo se cache vuota
        if (storicoCache.length === 0) {
            const risposta = await fetch(`${API}?type=storico`);
            if (!risposta.ok) throw new Error(`Errore HTTP ${risposta.status}`);
            const json = await risposta.json();
            storicoCache = json.data;
        }

        const righe = filtro
            ? storicoCache.filter(r => r.toLowerCase().includes(filtro.toLowerCase()))
            : storicoCache;

        storico.innerHTML = [...righe].reverse().map(riga => { // spread evita di mutare la cache
            const match = riga.match(/^\[(.+?)\]\s+\[(.+?)\]\s+(.+)$/);
            if (!match) return `<div class="storico-item"><p class="comment">${riga}</p></div>`;

            const [, dataOra, tipo, messaggio] = match;
            const classeTipo = tipo.toLowerCase().replace(/\s+/g, '-');
            return `
                <div class="storico-item storico-${classeTipo}">
                    <span class="storico-data">${dataOra}</span>
                    <span class="storico-tipo">${tipo}</span>
                    <p class="comment">${messaggio.trim()}</p>
                </div>
            `;
        }).join('');

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
   }   