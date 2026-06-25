 
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare e selezionare dove avverà l'insert dei menu
  const lavagna_menu_attivo = document.getElementById('lavagna_menu_attivo');
  const lavagna_piatti_nonattivo = document.getElementById('lavagna_piatti_nonattivo');
  const lavagna_bevande_nonattive = document.getElementById('lavagna_bevande_nonattive');
  const form_inserisci= document.getElementById('form_inserisci');
  const form_modifica= document.getElementById('form_modifica');
  const da_inserire = document.getElementById("nome_piatto");

  //controllo che siamo nella pagina elenco Menu prima di avviare il riempimento
  if (lavagna_menu_attivo) {
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaMenuAttivo);
      //il bottone togli dal menu lo attivo solo se seno nell'elenco attivo
      document.addEventListener('click', togliPiattoClick);
      document.addEventListener('click', togliBevandaClick);
  }else if(form_inserisci){
      //attiva il bottone inserisci
      document.addEventListener('click', inserisciPiattoClick);
      document.addEventListener('click', inserisciBevandaClick);
      document.addEventListener('click', inserisciAllergeneClick);
  }else if(form_modifica){
      //attiva il bottone inserisci
      document.addEventListener('click', modificaPiattoClick);
      document.addEventListener('click', modificaBevandaClick);
      document.addEventListener('input', controllaPiattoesistente);
      
  }else if(lavagna_menu_nonattivo){
      //aggiungo il lissener al caricamento se siamo nell'ambiente giusto
      document.addEventListener('DOMContentLoaded', caricaMenuNonAttivo);
      //il bottone elimina lo attivo solo se seno nell'elenco menu non attivo
      document.addEventListener('click', eliminaPiattoClick);
      document.addEventListener('click', eliminaBevandaClick);
      document.addEventListener('click', aggiungiPiattoClick);
      document.addEventListener('click', aggiungiBevandaClick);
  }
  
  
  
 //Caricare reiderizza tutti i tavoli attivi, funzione

  async function caricaMenuAttivo(){
    //carico i piatti
    const rispostapiatti = await fetch(`${API}?type=piatti`);
    const jsonpiatti = await rispostapiatti.json();
    /*//carico gli allergeni
    const rispostaallergeni = await fetch(`${API}?type=allergeni`);
    const jsonallergeni = await risposta.jsobevande*/
    //carico le bevande per mettere &in_menu='si' va strutturato nell'api menu.php e nel service.php
    const rispostabevande = await fetch(`${API}?type=bevande`);
    const jsonbevande = await rispostabevande.json();

    const lavagnabevande = document.getElementById('lavagna_bevande_attive');
    const lavagna = document.getElementById('lavagna_menu_attivo');
    

    //da sviluppare successivamente il pulsante che collega il piatto al tavolo   
    
    lavagna.innerHTML = jsonpiatti.data.filter(piatto => piatto.in_menu === 'si').map(piatto=>`
        <!--elementi piatti-->
    <div class="piatto" id="${piatto.id_piatto}">
       
       <h3 class="comment"><b>${piatto.nome_piatto}</b></h3>

       <p class="comment">${piatto.descrizione}</p>
       <p class="comment">Prezzo: ${piatto.prezzo} € </p> 
       <!--va fatto così perché dentro un litteral il foreach non funziona per il problema dell'hosting, risulta undefine-->
       <ul id="elenco_allergeni" class="elenco_allergeni">
          ${piatto.allergeni ? piatto.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul>
       <p class="comment">${piatto.categoria.toUpperCase()}</p> 
       <!--link AJAX per inviare la modifica piatto-->
       <a class="btn" href="modificapiatto.php?id=${piatto.id_piatto}">Modifica ✏️</a>

       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-disattiva-piatto" data-id="${piatto.id_piatto}">Disattiva 🚫</button>
    </div>`).join('');
        //elementi Bevande per fare il filtro dalla REST API va previsto sia nel menu.php (api) che nel serviceMenu
    lavagnabevande.innerHTML = jsonbevande.data.filter(bevanda => bevanda.in_menu === 'si').map(bevanda=>`
        <!--elementi bevande-->
    <div class="bevanda" id="${bevanda.id_bevanda}">
       
       <h3 class="comment"><b> ${bevanda.nome_bevanda}</b></h3>

       <p class="comment">${bevanda.descrizione}</p>
       <p class="comment">Prezzo: ${bevanda.prezzo} € </p> 
       <ul id="elenco_allergeni" class="elenco_allergeni">
         ${bevanda.allergeni ? bevanda.allergeni.split(', ').map(a => `<li class="comment">${a}</li>`).join(''):'<li>Nessun allergene</li>'}
       </ul>
       <p class="comment">Contiene Alcol: ${bevanda.alcol} </p> 
       <!--link AJAX per inviare la modifica piatto-->
       <a class="btn" href="modificapiatto.php?id=${bevanda.id_bevanda}">Modifica ✏️</a>

       <!--button AJAX per richiedere la disattivazione dal menu del tavolo-->

       <button class="btn-disattiva-bevanda" data-id="${bevanda.id_bevanda}">Disattiva 🚫</button>
    </div>`).join('');
  }

  async function togliPiattoClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-disattiva-piatto');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi nascondere ai clienti questo piatto?')){
          return;
        }
        //recupero il data set da data-id
        const id_disattiva = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Piatto non nascosto, manca ID!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=piatti&id=${id_disattiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_piatto: parseInt(id_disattiva), 
              in_menu : 'no' 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico i piatti
        await caricaMenuAttivo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  //togli la bevanda dal menu dei clienti
  async function togliBevandaClick(e){
    
    //come utilizzare fetch(URL,METHOD)
    try{

        //seleziono l'elemento bottone per il disattiva
        const btn = e.target.closest('.btn-disattiva-bevanda');
        //escludo click per errore
        if(!btn) return;
        //questa funzione di js genera un alet bool
        if(!confirm('vuoi nascondere ai clienti questa bevanda?')){
          return;
        }
        //recupero il data set da data-id
        const id_disattiva = btn.dataset.id;
        //blocco l'esecuzione se non arriva l'id
        if(!id_disattiva){
          throw new Error('Bevanda non nascosta, manca ID!');
        }

    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito 
        const risposta = await fetch(`/ristorante_classic/api/menu.php?type=bevande&id=${id_disattiva}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id_piatto: parseInt(id_disattiva), 
              in_menu : 'no' 
            })
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json().catch(()=>null);
          throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }
        //se il flusso del programma non viene interrotto ricarico le bevande
        await caricaMenuAttivo();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }

  //------------------DELETE-------------------------------------

 /* async function eliminaTavoloClick(e){
    
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
       
        
        //dati precaricati
        const id= btn.dataset.id;
        if(!id){
          throw new Error('ID tavolo mancante');
           }
        const API_ID=`${API}?id=${id}`;
        const precaricato = await fetch(API_ID);
        const json = await precaricato.json();
        console.log(json)
        //problema, non visualizza il valore nel campo input
        numero_tavolo.value = json.data.numero_tavolo;
        posti_max_tavolo.value = json.data.posti_max;
        posti_min_tavolo.value = json.data.posti_min;

        //validavi gli elementi DOM, non i valori — serve .value
        if (!numero_tavolo.value || !posti_max_tavolo.value || !posti_min_tavolo.value || numero_tavolo.value<0 || numero_tavolo.value>200 || posti_max_tavolo.value < 0|| posti_max_tavolo.value>30 ||posti_min_tavolo.value < 0|| posti_min_tavolo.value>30 ) {
            throw new Error('Tutti i campi sono obbligatori, inserisci dei valori congrui');
        }
    
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta =  await fetch(API_ID, {
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
    
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }*/