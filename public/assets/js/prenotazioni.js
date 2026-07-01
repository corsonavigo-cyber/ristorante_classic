 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const lavagna_prenotazioni_tavolo = document.getElementById('lavagna_prenotazioni_tavolo');
  const lavagna_prenotazioni_notavolo = document.getElementById('lavagna_prenotazioni_notavolo');

  const form_inserisci_prenotazione= document.getElementById('form_inserisci_prenotazione');
  const storico = document.getElementById('storico');
  const form_modifica_prenotazione= document.getElementById('form_modifica_prenotazione');
  const da_inserire_data = document.getElementById("data-in-prenotazione");

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
  //controllo che siamo nella pagina giusta per attivare i lissener
  if (lavagna_prenotazioni_tavolo) {
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaPrenotazioniConTavolo);
      document.addEventListener('DOMContentLoaded', caricaPrenotazioniSenzaTavolo);
      //il bottone togli dal menu lo attivo solo se seno nell'elenco attivo
      document.addEventListener('click', togliPrenotazioneDalTavoloClick);
      document.addEventListener('click', eliminaPrenotazioneClick);
      document.addEventListener('click', disattivaPrenotazione);
      document.addEventListener('click', attivaPrenotazione);

  }else if(form_inserisci_prenotazione){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciPrenotazioneClick);
      document.addEventListener('input', controllaTavoloDataDisponibile);
      
  }else if(form_modifica_prenotazione){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPrenotazioneClick);
      document.addEventListener('DOMContentLoaded', initModifica);
      document.addEventListener('input', controllaTavoloDataDisponibile);   
  }else if(storico){
      document.addEventListener('DOMContentLoaded', caricaStorico);
  }

 //Caricare reiderizza tutte le prenotazioni attivie

  async function caricaPrenotazioniConTavolo(){
    //carico i prenotazioni
    const rispprenotazioni = await fetch(`${API}?type=prenotazioni`);
    const jsonprenotazioni = await rispprenotazioni.json();
    
    const prenotazioniDaOggi = jsonprenotazioni.data.filter(prenotazioneg=>prenotazioneg.data_in_prenotazione >= today());
    
    lavagna_prenotazioni_notavolo.innerHTML = prenotazioniDaOggi.filter(prenotazione => prenotazione.id_tavolo !== null ).map(prenotazione=>`
        <!--elementi prenotazioni-->
    <div class="prenotazione" id="${prenotazione.id_prenotazione}">
       
       <h3 class="comment"><b>${prenotazione.nome_prenotazione}</b></h3>

       <p class="comment">Ora: ${prenotazione.ora_prenotazione.slice(0, 5)}</p>
       <p class="comment">Data: ${prenotazione.data_in_prenotazione.split('-').reverse().join('/')} </p> 
       
       <button class="${prenotazione.attiva ? 'btn-disattiva-prenotazione' : 'btn-attiva-prenotazione'}" data-id="${prenotazione.id_prenotazione}">  ${prenotazione.attiva ? 'Disattiva' : 'Attiva'} </button>
       <ul id="elenco_prenotazioni" class="elenco_prenotazioni">
         ${prenotazione.tavoli ? prenotazione.tavoli.split(', ').map(a => `<li class="comment">Tavolo : ${a}</li>`).join(''):'<li>Non Associata a un tavolo</li>'}
       </ul>
       <!--link AJAX per inviare la modifica prenotazione-->
       <a class="btn" href="modificaprenotazione.php?id=${prenotazione.id_prenotazione}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione' della prenotazione-->
       <button class="btn-elimina-relazione-tavolo" data-id="${prenotazione.id_prenotazione}">Dissocia Tavolo</button>
       <button class="btn-elimina-prenotazione" data-id="${prenotazione.id_prenotazione}">Elimina 🗑️</button>
    </div>`).join('');
       
  }

  async function togliPrenotazioneDalTavoloClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-elimina-relazione-tavolo');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi togliere il tavolo a questa prenotazione?')){
          return;
        }
        //recupero il data set da data-id
        const id_elimina = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_elimina){
          throw new Error('Tavolo non dissociato, manca ID!');
        }  
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const eliminaRelazione = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_elimina}`, {
                method: 'DELETE'
            });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!eliminaRelazione.ok) {
                const json = await eliminaRelazione.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${eliminaRelazione.status}`);
            }
        //se il flusso del programma non viene interrotto ricarico le prenotazioni
        await caricaPrenotazioniConTavolo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
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
        window.location.reload();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  

 async function caricaPrenotazioniSenzaTavolo(e){
    //carico i prenotazioni
    const rispprenotazioni = await fetch(`${API}?type=prenotazioni`);
    const jsonprenotazioni = await rispprenotazioni.json();
    
    const prenotazioniDaOggi = jsonprenotazioni.data.filter(prenotazioneg=>prenotazioneg.data_in_prenotazione >= today());
    
    lavagna_prenotazioni_tavolo.innerHTML = prenotazioniDaOggi.filter(prenotazione => prenotazione.id_tavolo === null ).map(prenotazione=>`
        <!--elementi prenotazioni-->
    <div class="prenotazione" id="${prenotazione.id_prenotazione}">
       
       <h3 class="comment"><b>${prenotazione.nome_prenotazione}</b></h3>

       <p class="comment">${prenotazione.ora_prenotazione.slice(0, 5)}</p>
       <p class="comment">Prezzo: ${prenotazione.data_in_prenotazione.split('-').reverse().join('/')} </p> 
       <!--va fatto così perché dentro un litteral il foreach non funziona per il problema dell'hosting, risulta undefine-->
       <button class="${prenotazione.attiva ? 'btn-disattiva-prenotazione' : 'btn-attiva-prenotazione'}" data-id="${prenotazione.id_prenotazione}">  ${prenotazione.attiva ? 'Disattiva' : 'Attiva'} </button>
       <ul id="elenco_prenotazioni" class="elenco_prenotazioni">
         ${prenotazione.tavoli ? prenotazione.tavoli.split(', ').map(a => `<li class="comment">Tavolo : ${a}</li>`).join(''):'<li>Prenotazione Non Associata a un tavolo</li>'}
       </ul>
       <!--link AJAX per inviare la modifica prenotazione-->
       <a class="btn" href="modificaprenotazione.php?id=${prenotazione.id_prenotazione}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione' della prenotazione-->
       
       <button class="btn-elimina-prenotazione" data-id="${prenotazione.id_prenotazione}">Elimina 🗑️</button>
    </div>`).join('');
       
  }

  async function togliPrenotazioneDalTavolo(id_disattiva){
    
    
    try{
        if(!parseInt(id_disattiva)){
          throw new Error('Tavolo non dissociato, manca ID!');
        }  
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const eliminaRelazione = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo&id=${id_disattiva}`, {
                method: 'DELETE'
            });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!eliminaRelazione.ok) {
                const json = await eliminaRelazione.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${eliminaRelazione.status}`);
            }
       return true;
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
        return false;
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

  async function inserisciPrenotazioneClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-inserisci-prenotazione');
        
        //escludo click per errore
        if(!btn) return;

        //recupero il nome del piatto dal form INPUT
        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
        

        //questa funzione di js genera un alet bool
        if(!confirm(`vuoi inserire ${nome_prenotazione}?`)){
          return;
        }
        //recupero gli altri dati dal form INPUT
        const ora_prenotazione = document.getElementById('ora-prenotazione').value;
        const data_in_prenotazione = document.getElementById('data-in-prenotazione').value;
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el =>  parseInt(el.value));        
        const attivo = document.querySelector('input[name="attiva"]:checked').value;
        const numero_persone = document.getElementById('numero-persone').value;


      //validazione dati
      // Nome prenotazione
        if (typeof nome_prenotazione !== "string" || nome_prenotazione === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }

        // data
        if (!data_in_prenotazione || data_in_prenotazione < today()) {
            throw new Error("La data non è valida");
        }

        const numPersone = parseInt(numero_persone, 10);
        if (Number.isNaN(numPersone) || numPersone <= 0) {
            throw new Error("Inserisci un numero persone valido");
        }
   
        if(tavoliSelezionati.length>=1){
            //salvo il response dentro risposta, chiamo la fetch su un id specifico 
            const risposta = await fetch(`${API}?type=prenotazione_tavolo`, {
                method: 'POST',
                headers:{
                  'Content-Type': 'application/json'
                    },
                body: JSON.stringify({
                        nome_prenotazione: String(nome_prenotazione),
                        data_in_prenotazione: String(data_in_prenotazione),
                        tavoliSelezionati: tavoliSelezionati,
                        attivo : attivo ,
                        numero_persone: numero_persone
                })
            });

            if (!risposta.ok) {
              //prendo la risposta json 
              const json = await risposta.json().catch(()=>null);
              throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
            }
            //se il flusso del programma non viene interrotto ritorno alla pagina gestione bevande non attivi
            alert('Prenotazione inserita con successo nel Tavolo!');
           
        }else if(tavoliSelezionati === 0){

            const risposta = await fetch(`${API}?type=prenotazione`, {
              method: 'POST',
              headers:{
                'Content-Type': 'application/json'
                  },
            body: JSON.stringify({
                        nome_prenotazione: String(nome_prenotazione),
                        data_in_prenotazione: String(data_in_prenotazione),
                        attivo : attivo ,
                        numero_persone: numero_persone
                })
            });
            if (!risposta.ok) {
                //prendo la risposta json 
                const json = await risposta.json().catch(()=>null);
                throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
              }
              //se il flusso del programma non viene interrotto ritorno alla pagina gestione bevande non attivi
              alert('Prenotazione inserita con successo ancora non è stato assegnato nessun Tavolo!');

        }else{
          throw new Error('tavoliSelezionati.length da un valore inaspettato');
        }
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ritorno alla pagina gestione bevande non attivi
        alert('Prenotazione inserita con successo!');
        //reindirizzo il cliente
        window.location.href = "gestioneprenotazioni.php";
       
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  async function controllaTavoloDataDisponibile(tavoli){
    const risposta = await fetch(`${API}?type=prenotazioni`);
    const jsonprenotazioni = await risposta.json();
    const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el =>  parseInt(el.value));
    const jsonTavoliPrenotati = jsonprenotazioni.data.filter(p =>
        p.id_tavoli && tavoliSelezionati.some(id => p.id_tavoli.includes(String(id)) || p.id_tavoli.includes(id))
    );        
    const prenotazioniDaOggi = jsonTavoliPrenotati.filter(prenotazioneg=>prenotazioneg.data_in_prenotazione >= today());
    const avviso = document.getElementById("avviso");
    //selettore di classe con il puinto
    const sezione = document.querySelector('#controllo');
    
    
    if(!da_inserire_data.value.trim()){
       sezione.classList.add('warning');
       avviso.innerHTML=`La prenotazione deve avere una data!`;
       return;
    }
    
    const conflitto = prenotazioniDaOggi.some(p => p.data_in_prenotazione === da_inserire_data.value);
    if (conflitto) {
      sezione.classList.add('warning');
      avviso.innerHTML = `Questo tavolo è già prenotato per la data selezionata!`;
      return;
    }
    
    sezione.classList.remove('warning');
    avviso.innerHTML="";
    sezione.classList.add('controllopositivo');
       

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
    document.getElementById('ora_prenotazione').value  = data.ora_prenotazione;
    document.getElementById('data-in-prenotazione').value = parseFloat(data.data_in_prenotazione);
    document.getElementById('numero-persone').value = parseFloat(data.numero-persone);
    
    
    const tavoliEsistenti = data.id_tavoli ? data.id_tavoli.split(',').map(a => parseInt(a.trim())) : [];
    console.log(tavoliEsistenti)
    console.log('tipo:', typeof data.id_tavoli);
    console.log('valore:', data.id_tavoli );
    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
    checkbox.checked = tavoliEsistenti.includes(parseInt(checkbox.value));
    });

    const attivaInput = document.querySelector(`input[name="attiva"][value="${data.attiva}"]`);
    if (attivaInput) attivaInput.checked = true;
     
}

async function modificaPrenotazioneClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{
        
        //seleziono l'elemento bottone per l'inserisci
        const btn = e.target.closest('.btn-modifica-prenotazione');
        
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi modificare questa Prenotazione?')){
          return;
        }
      
        const id_modifica= btn.dataset.id;
        if(!id_modifica){
          throw new Error('ID tavolo mancante');
           }
        //recupero i dati dal form INPUT
        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
        const ora_prenotazione = document.getElementById('ora-prenotazione').value;
        const data_in_prenotazione = document.getElementById('data-in-prenotazione').value;
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const tavoliSelezionati = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el =>  parseInt(el.value));        
        const attivo = document.querySelector('input[name="attiva"]:checked').value;
        const numero_persone = document.getElementById('numero-persone').value;
      

       // 5. validazione
        if (!nome_prenotazione) throw new Error('Il nome della bevanda è obbligatoria');
        if (isNaN(numero_persone) ||  numero_persone <= 0) throw new Error('Inserisci un numero di persone valido');
       
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        if(tavoliSelezionati.length >= 1){
          const risposta =  await fetch(`${API}?type=prenotazioni_tavolo&id=${id_modifica}`, {
              method: 'PUT',
              headers:{
                'Content-Type': 'application/json'
                  },
              body: JSON.stringify({
                          id_prenotazione: parseInt(id_modifica),
                          nome_prenotazione: String(nome_prenotazione),
                          data_in_prenotazione: String(data_in_prenotazione),
                          tavoliSelezionati: tavoliSelezionati,
                          attivo : attivo ,
                          numero_persone: numero_persone
                  })
          });
            //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
          if (!risposta.ok) {
            //prendo la risposta json 
            const errJson = await risposta.json().catch(()=>null);
            throw new Error(errJson?.data ?? `Errore HTTP ${risposta.status}`);
          }
          if (!json.success) {
              throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
          }
          //se il flusso del programma torno alla gestione tavoli non attivi
          alert('Prenotazione modificata con successo!');
          //reindirizzo il cliente
          window.location.href = "gestioneprenotazioni.php";
          
        }else if(tavoliSelezionati.length===0){
          const risposta =  await fetch(`${API}?type=prenotazioni&id=${id_modifica}`, {
              method: 'PUT',
              headers:{
                'Content-Type': 'application/json'
                  },
              body: JSON.stringify({
                          id_prenotazione: parseInt(id_modifica),
                          nome_prenotazione: String(nome_prenotazione),
                          data_in_prenotazione: String(data_in_prenotazione),
                          attivo : attivo ,
                          numero_persone: numero_persone
                  })
          });
            //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
          if (!risposta.ok) {
            //prendo la risposta json 
            const errJson = await risposta.json().catch(()=>null);
            throw new Error(errJson?.data ?? `Errore HTTP ${risposta.status}`);
          }
          if (!json.success) {
              throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
          }
          //se il flusso del programma torno alla gestione tavoli non attivi
          alert('Prenotazione modificata con successo!');
          //reindirizzo il cliente
          window.location.href = "gestioneprenotazioni.php";
          

      }
      
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  async function caricaStorico() {
    const response = await fetch(`${API}?type=prenotazioni&id=${id_modifica}`);
    const data = await response.json();

    if (data.success) {
        console.log(data.contenuto);
    } else {
        console.error(data.message);
    }
  }


   //esempio di funzione ricerca nel file storico caricato

   async function caricaStorico() {
    try {
        // path assoluto come da tua indicazione, non ${API} che punta a un altro endpoint
        const risposta = await fetch('/api/storicoprenotazioni.php');

        // fetch non lancia errori sui 4xx/5xx, va controllato a mano
        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();

        // adatta il rendering alla struttura reale di json.data (array di record storico)
        storico.innerHTML = json.data.map(record => `
            <div class="storico-item" id="${record.id}">
                <h3 class="comment">${record.nome_prenotazione ?? record.titolo}</h3>
                <p class="comment">Data: ${record.data.split('-').reverse().join('/')}</p>
            </div>
        `).join('');

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}