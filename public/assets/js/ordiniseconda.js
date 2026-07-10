/*

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
  

  


 async function inserisciOrdine(){
    try{
        const btn = e.target.closest('.btn-avanti');
        if(!btn) return;

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

        const risposta = await fetch(`${API_ORDINI}?type=${type}ordine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        const json = await risposta.json()
        await inserisciOrdineTavolo(json.id);
        
        return true;
    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdinePiatto(){
    try{
        
        //recupero gli altri dati dal form INPUT
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_piattomenu.dataset.id);
        
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
        //quantita
        if (typeof quantita !== "number" || Number.isNaN(prezzo) ||  quantita <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }

        const id_piatto = await inserisciPiattoFuoriMenu(nome_piatto,descrizione,prezzo)
        
        const body = {
            id_ordine: id_ordine,
            id_piatto : id_piatto,
            id_momento : id_momento,
            quantita : quantita
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

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
  }

async function inserisciOrdineBevanda()){
    try{
       
        //recupero gli altri dati dal form INPUT
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        //metodo per selezionare i checked della checkbox dal form in js [... converte la node list in un array accessibile importante
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_bevandamenu.dataset.id);
        const alcol = document.querySelector('input[name="alcol"]:checked').value;
      //validazione dati
      // Nome bevanda
        if (typeof nome_bevanda !== "string" || nome_bevanda === "") {
            throw new Error("Il nome del bevanda è obbligatorio");
        }

        // Descrizione
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }

        // Prezzo
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        //quantita
        if (typeof quantita !== "number" || Number.isNaN(prezzo) ||  quantita <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }

        const id_bevanda = await inserisciBevandaFuoriMenu(nome_bevanda,descrizione,prezzo,alcol)
        
        const body = {
            id_ordine: id_ordine,
            id_bevanda : id_bevanda,
            id_momento : id_momento,
            quantita : quantita
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

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
  }


 


async function inserisciOrdineTavolo(id_ordine){
    try{
        
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));

        const body = {
            id_ordine :id_ordine,
            tavoli: tavoli // FIX: uso il valore già validato/castato, non la stringa grezza
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

    } catch (errore){
        console.error(errore);
        alert(errore.message);
    }
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
  

//------------------------------DELETE-----------------------------------------
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
  
