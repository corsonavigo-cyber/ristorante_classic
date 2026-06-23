 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei tavoli
  const lavagna = document.getElementById('lavagna_tavoli');
  const form_inserisci= document.getElementById('form_inserisci');
  //controllo che siamo nella pagina elenco tavoli prima di avviare il riempimento
  if (lavagna) {
      //aggiungo illissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaTavoli);
      //il bottone elimina lo attivo solo se seno nell'elenco tavoli
      document.addEventListener('click', eliminaTavoloClick);
  }else if(form_inserisci){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciTavoloClick);
      
  }
  
  
  
 //Caricae reiderizza tutti i tavoli, funzione

  async function caricaTavoli(){
    const risposta = await fetch(API);
    const json = await risposta.json();
    const lavagna = document.getElementById('lavagna_tavoli')
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = json.data.map(tavolo=>`
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment"><b>Numero Tavolo ${tavolo.numero_tavolo}</b></h3>

       <p class="comment">Posti max ${tavolo.posti_max} prenotabili</p>
       <p class="comment">Posti min ${tavolo.posti_min} prenotabili</p> 
       <!--link AJAX per inviare la modifica tavolo-->
       <a class="btn" href="modificatavolo.php?id=${tavolo.id_tavolo}">Modifica ✏️</a>

       <!--button AJAX per richiedere l'eliminazione del tavolo-->

       <button class="btn-elimina" data-id="${tavolo.id_tavolo}">Elimina 🗑️</button>
    </div>`).join('');
  }
  //------------------DELETE-------------------------------------

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
 