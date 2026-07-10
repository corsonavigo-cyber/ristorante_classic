async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
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

  
