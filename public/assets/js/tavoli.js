 //sarebbe possibile fare un file js a parte?
  //salvo la API IN UNA VARIABILE---lo faccio in modo dinamico php nel file gestione tavoli.php
  
 //--------------------READ-------------------------------------
  
  //per caricare i tavoli
  document.addEventListener('DOMContentLoaded', ()=>{
    caricaTavoli();

  });
 
  
 //Caricae reiderizza tutti i tavoli, funzione
  async function caricaTavoli(){
    ;const risposta = await fetch(API);
    const json = await risposta.json();
    const lavagna = document.getElementById('lavagna_tavoli')
    //da aggiungere la visualizzazione delle prenotazioni e dei conti e delle comande  
    lavagna.innerHTML = json.data.map(tavolo=>`
    <div class="tavolo" id="${tavolo.id_tavolo}">
       
       <h3 class="comment">${tavolo.numero_tavolo}</h3>

       <p class="comment">${tavolo.posti_max}</p>
       <p class="comment">${tavolo.posti_min}</p> 
       <!--link AJAX per inviare la modifica tavolo-->
       <a class="btn" link="modificaTavolo.php?id=${tavolo.id_tavolo}">Modifica ✏️</a>
       <!--button AJAX per richiedere l'eliminazione del tavolo-->
       <button onclick="elimina(${tavolo.id_tavolo})">Elimina 🗑️</button>
    </div>`).join('');
  }
  //------------------DELETE-------------------------------------

  async function elimina(id){
    //questa funzione di js genera un alet bool
    if(!confirm('vuoi eliminare quest tavolo?')){
      return;
    }
    //come utilizzare fetch(URL,METHOD)
    try{
        //salvo il response dentro risposta, chiamo la fetch su un id specifico e scelgo il metodo delete definito in tavoli.php
        const risposta = await fetch(`/api/tavoli.php?id=${id}`, {
            method: 'DELETE'
        });
        //se la risposta non è ok dat che il 400 e il 500 non interrompono il codice, lo interrompo con l'if e trow new error
        if (!risposta.ok) {
          //prendo la risposta json 
          const json = await risposta.json();
          throw new Error(`ERRORE HTTP ${risposta.status}`);
          return;
        }
        //se il flusso del programma non viene interrotto ricarico i tavoli
        await caricaTavoli();
    }catch (errore){
        console.error(errore);
        //mostro la risposta json
        alert(errore.message);
    }
    
  }
 

  //------------------CREATE-------------------------------------

