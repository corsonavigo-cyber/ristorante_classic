 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const lavagna_prenotazioni_tavolo = document.getElementById('lavagna_prenotazioni_tavolo');
  const lavagna_prenotazioni_notavolo = document.getElementById('lavagna_prenotazioni_notavolo');

  const form_inserisci_prenotazione= document.getElementById('form_inserisci_prenotazione');
 
  const form_modifica_prenotazione= document.getElementById('form_modifica_prenotazione');
  const da_inserire = document.getElementById("nome-prenotazione");

  let initialized = false;

  function initModifica() {
    if (initialized) return;
    initialized = true;
    precaricaFormModifica();
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

  }else if(form_inserisci){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciPiattoClick);
      document.addEventListener('input', controllaTavoloDataDisponibile);
      /*document.addEventListener('click', inserisciAllergeneClick);*/
  }else if(form_modifica){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPrenotazioneClick);
      document.addEventListener('DOMContentLoaded', initModifica);
      /*document.addEventListener('click', modificaBevandaClick);*/
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

       <p class="comment">${prenotazione.ora_prenotazione.slice(0, 5)}</p>
       <p class="comment">Prezzo: ${prenotazione.data_in_prenotazione.split('-').reverse().join('/')} </p> 
       
       <button id="btn-disattiva-prenotazione" data-id="${prenotazione.id_prenotazione}">${prenotazione.attiva? "Disattiva": "Attiva"}</button> 
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
       <button id="btn-attiva-prenotazione" data-id="${prenotazione.id_prenotazione}">${prenotazione.attiva? "Disattiva": "Attiva"}</button> 
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
                    attiva : '0' 
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
              attiva : '1' 
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