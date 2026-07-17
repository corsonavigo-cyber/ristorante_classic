 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei tavoli
  const lavagna = document.getElementById('lavagna_tavoli');
  const form_inserisci= document.getElementById('form_inserisci');
  const form_modifica= document.getElementById('form_modifica');
  const da_inserire = document.getElementById("numero-tavolo");
  const lavagna_ordini = document.getElementById('lavagna_tavoli_ordini');

  //controllo che siamo nella pagina elenco tavoli prima di avviare il riempimento

  if (lavagna) {
      //aggiungo illissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaTavoli);
      //il bottone elimina lo attivo solo se seno nell'elenco tavoli
      document.addEventListener('click', eliminaTavoloClick);
      document.addEventListener('click', eliminaPrenotazioneClick);

  }else if(form_inserisci){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciTavoloClick);
      document.addEventListener('input', controllaNumeroDisponibile);
  }else if(form_modifica){
      //attiva il bottone inserisci
      document.addEventListener('DOMContentLoaded', precaricaTavolo);
      document.addEventListener('click', modificaTavoloClick);
      document.addEventListener('input', controllaNumeroDisponibile);    
       
  }else if(lavagna_ordini){
      //attiva il bottone inserisci
      document.addEventListener('DOMContentLoaded', caricaTavoliConOrdini);
      //il bottone elimina lo attivo solo se seno nell'elenco tavoli
      document.addEventListener('click', eliminaTavoloClick);   
      document.addEventListener('click', eliminaOrdineClick);
  }
  
  
  
 //Caricae reiderizza tutti i tavoli, funzione

  async function caricaTavoli(){
    const risposta = await fetch(API);
    const json = await risposta.json();
    const lavagna = document.getElementById('lavagna_tavoli');
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = json.data.map(tavolo=>`
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment"><b>Numero Tavolo ${tavolo.numero_tavolo}</b></h3>

       <p class="comment">Posti max ${tavolo.posti_max} prenotabili</p>
       <p class="comment">Posti min ${tavolo.posti_min} prenotabili</p> 
       <!--per visualizzazione in caso di tavolo prenotato-->
       <div class=tavolo id=prenotato data-id-tavolo="${tavolo.id_tavolo}">  </div> 
       <!--link AJAX per inviare la modifica tavolo-->
       <a class="btn" href="modificatavolo.php?id=${tavolo.id_tavolo}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione del tavolo-->

       <button class="btn-elimina" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
    </div>`).join('');
    json.data.forEach(tavolo => caricaPrenotazioniTavolo(tavolo.id_tavolo));
  }

  async function caricaTavoliConOrdini(){
    const risposta = await fetch(API);
    const json = await risposta.json();
   
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna_ordini.innerHTML = json.data.map(tavolo=>`
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment"><b>Numero Tavolo ${tavolo.numero_tavolo}</b></h3>

       <p class="comment">Posti max ${tavolo.posti_max} prenotabili</p>
       <p class="comment">Posti min ${tavolo.posti_min} prenotabili</p> 
       <!--per visualizzazione in caso di tavolo prenotato-->
       <div class=tavolo id=ordine data-id-tavolo="${tavolo.id_tavolo}">  </div> 
       <!--link AJAX per inviare la modifica tavolo-->
       <a class="btn" href="modificatavolo.php?id=${tavolo.id_tavolo}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione del tavolo-->

       <button class="btn-elimina" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
    </div>`).join('');
    json.data.forEach(tavolo => caricaOrdiniTavolo(tavolo.id_tavolo));
  }

  //carica la le prenotazioni
  function today(){
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2026-06-30"
  }

  async function caricaPrenotazioniTavolo(id_tavolo){
    const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_tavolo}`);
    const json = await risposta.json();

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
    // (un id duplicato per ogni tavolo è invalido in HTML)
    const contenitore = document.querySelector(`#prenotato[data-id-tavolo="${id_tavolo}"]`);
    if (!contenitore) return;

    const prenotazioniOggi = json.data.filter(prenotazione=>data_in_prenotazione === today());  

    if (prenotazioniOggi.length > 0){
        contenitore.innerHTML = json.data.map(p => `
            <h4 class="comment"><b>${p.nome_prenotazione}</b></h4>
            <p class="comment">${p.numero_persone} persone</p>
            <p class="comment">Ora arrivo ${p.ora_prenotazione}</p>
            <p class="comment">${p.data_in_prenotazione}</p>
            <a class="btn" href="modificaprenotazione.php?id=${p.id_prenotazione}">Modifica ✏️</a>
            <button class="btn-elimina-prenotazione" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
        `).join('');
    } else {
        contenitore.innerHTML = `<h4>LIBERO</h4>`;
    }
}

async function caricaOrdiniTavolo(id_tavolo){
    const risposta = await fetch(`${API_ORDINI}?type=oggi`);
    const json = await risposta.json();

    // seleziono il div giusto tramite il data-attribute, non un id fisso "prenotato"
    // (un id duplicato per ogni tavolo è invalido in HTML)
    const contenitore = document.querySelector(`#ordine[data-id-tavolo="${id_tavolo}"]`);
    if (!contenitore) return;
    const ordiniOggi = json.data.filter(ordini=>ordini.data_e_ora.split(' ')[0] === today());
    const ordiniOggiTav = ordiniOggi.filter(ordine=>Number(ordine.id_stato) === 1 && Number(ordine.id_tavolo) === Number(id_tavolo));  
    const ordiniRaggruppati = Object.values(ordiniOggiTav.reduce((acc, comanda) => {

        if (!acc[comanda.id_ordine]) {
            acc[comanda.id_ordine] = {
                ...comanda,
                servizi: [],
                piatti: [],
                bevande:[]
            };
        }

        acc[comanda.id_ordine].servizi.push(comanda.nome_servizio);
        acc[comanda.id_ordine].piatti.push(comanda.piatti);
        acc[comanda.id_ordine].bevande.push(comanda.bevande);
        return acc;
    }, {})
    );
    if (ordiniRaggruppati.length > 0){
        contenitore.innerHTML = ordiniRaggruppati.map(comanda => `
          
            <h4 class="comment"><b>Tav: ${comanda.numero_tavolo}</b></h4>
            <h4 class="comment"><b>${comanda.servizi.join(', ')}</b></h4>
            <p class="comment">${comanda.numero_persone} persone</p>
            <p class="comment">Piatti:<br>${comanda.piatti.join('<br>')}<br></p>
            <p class="comment">Bevande:<br>${comanda.bevande.join('<br>')}</p>
            <p class="comment">ora di arrivo ${comanda.data_e_ora.split(' ')[1]}</p>
            <p class="comment">stato comanda ${comanda.nome_stato}</p>
            <a class="btn" href="modificaordine.php?id=${comanda.id_ordine}">Modifica ✏️</a>
            <button class="btn-elimina-ordine" data-id="${comanda.id_ordine}">Elimina 🗑️</button>
        `).join('');
    } else {
        contenitore.innerHTML = `<a class="btn" href="inserisciordine.php?id=${id_tavolo}">+ Nuova Comanda</a>`;
    }
}
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
        await caricaPrenotazioniTavolo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

   async function eliminaOrdineClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn_elimina_ordine = e.target.closest('.btn-elimina-ordine');
        //escludo click per errore
        if(!btn_elimina_ordine) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare questo ordine?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = Number(btn_elimina_ordine.dataset.id);
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }
        if (!Number.isInteger(id_elimina)) {
            throw new Error('Id Mancante o non valido nel bottone!');
        }
            
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`${API_ORDINI}?type=composto&id=${id_elimina}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico gli ordini
        await caricaOrdiniTavolo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }


  async function eliminaTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'elimina
        const btn = e.target.closest('.btn-elimina');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi eliminare quest tavolo?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Id Mancante nel bottone!');
        }
         // NUOVO: controllo se il tavolo ha prenotazioni attive collegate
        const checkRisposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_elimina}`);
        const checkJson = await checkRisposta.json();
        const prenotazioniCollegate = checkJson.data ?? [];

        // se ci sono prenotazioni, avviso l'utente che verranno scollegate
        if (prenotazioniCollegate.length > 0) {
            if (!confirm('Questo tavolo ha prenotazioni collegate. Eliminandolo verranno rimosse anche le relazioni con le prenotazioni. Continuare?')) {
                return;
            }
            // elimino prima le relazioni tavolo-prenotazione
            const eliminaRelazione = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_elimina}`, {
                method: 'DELETE'
            });
            if (!eliminaRelazione.ok) {
                const json = await eliminaRelazione.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${eliminaRelazione.status}`);
            }
        } else {
            // nessuna prenotazione collegata, conferma standard
            if(!confirm('vuoi eliminare quest tavolo?')){
              return;
            }
        }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`/ristorante_classic/api/tavoli.php?id=${id_elimina}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i tavoli
        await caricaTavoli();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
 

  //------------------POST INSERT-------------------------------------

async function inserisciTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi inserire questo tavolo?')){
          return;
        }
        //recupero i dati dal form INPUT
        const numero_tavolo = document.getElementById('numero-tavolo').value;
        const posti_max_tavolo = document.getElementById('posti-max-tavolo').value;
        const posti_min_tavolo = document.getElementById('posti-min-tavolo').value;
         
        //validazione dati
        if (!numero_tavolo || !posti_max_tavolo || !posti_min_tavolo || numero_tavolo<0 || numero_tavolo>200 || posti_max_tavolo < 0|| posti_max_tavolo>30 ||posti_min_tavolo < 0|| posti_min_tavolo>30 ) {
            throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
        }


        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await await fetch(API, {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    numero_tavolo: parseInt(numero_tavolo),
                    posti_max: parseInt(posti_max_tavolo),
                    posti_min: parseInt(posti_min_tavolo)
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i tavoli
        alert('tavolo inserito con successo!');
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
 //-----------------FUNZIONE DI SUPPORTO INSERISCI/MODIFICA------------------

 async function controllaNumeroDisponibile(){
    const risposta = await fetch(API);
    const json = await risposta.json();
    const numeri = json.data.map(item => item.numero_tavolo);
    const avviso = document.getElementById("avviso");
    //selettore di classe con il puinto
    const sezione = document.querySelector('#controllo');
    
    
    if(!da_inserire.value){
       sezione.classList.add('warning');
       avviso.innerHTML=`il tavolo deve avere un numero!`;
       return;
    }
    if(numeri.includes(parseInt(da_inserire.value))){
       sezione.classList.remove('controllopositivo');
       sezione.classList.add('warning');
       avviso.innerHTML=`il tavolo ${da_inserire.value} è già esistente!`;
      
    }else{
       sezione.classList.remove('warning');
       avviso.innerHTML="";
       sezione.classList.add('controllopositivo');
       
    }

 }

 //------------------UPDATE------------------------------------------------------

async function precaricaTavolo() {
    // legge l'id dall'URL: modificabevanda.php?id=5
    //funzione dell'URL in js per la ricerca al suo interno
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?id=${id}`);
    
    const json = await risposta.json();
    //è un array per accedere bisogna usare [0]
    const data = json.data; // ← prendi il primo elemento
    console.log(data);
    document.getElementById('numero-tavolo').value = parseInt(data.numero_tavolo);
    document.getElementById('posti-max-tavolo').value  = parseInt(  data.posti_max);
    document.getElementById('posti-min-tavolo').value = parseInt(data.posti_min);
    
}




 async function modificaTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-modifica');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi modificare questo tavolo?')){
          return;
        }
        //recupero i dati dal form INPUT
        const numero_tavolo = document.getElementById('numero-tavolo');
        const posti_max_tavolo = document.getElementById('posti-max-tavolo');
        const posti_min_tavolo = document.getElementById('posti-min-tavolo');     
       
    
        const id= btn.dataset.id;
        if(!id){
          throw new Error('ID tavolo mancante');
           }


        //validavi gli elementi DOM, non i valori — serve .value
        if (!numero_tavolo.value || !posti_max_tavolo.value || !posti_min_tavolo.value || numero_tavolo.value<0 || numero_tavolo.value>200 || posti_max_tavolo.value < 0|| posti_max_tavolo.value>30 ||posti_min_tavolo.value < 0|| posti_min_tavolo.value>30 ) {
            throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
        }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta =  await fetch(`${API}?id=${id}`, {
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                    numero_tavolo: parseInt(numero_tavolo.value),
                    posti_max: parseInt(posti_max_tavolo.value),
                    posti_min: parseInt(posti_min_tavolo.value)
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const errJson = await risposta.json().catch(()=>null);
          throw new Error(errJson?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i tavoli
        alert('tavolo modificato con successo!');
        window.location.href = "gestionetavoli.php";
    
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }