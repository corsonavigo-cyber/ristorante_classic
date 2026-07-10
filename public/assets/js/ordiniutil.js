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

    async function mostraDataOra() {
    
    const dataOggi = document.getElementById('oggi');
    dataOggi.innerHTML = `<p>${oggi()}</p>`
     
   }



    async function controllaTavoloDisponibile(tavoliSelezionati){
    const avviso = document.getElementById("avviso");
    const sezione = document.querySelector('#controllo');

    // guard: niente tavoli
    if(tavoliSelezionati.length === 0){
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `l'ordine ha bisogno di essere associato almeno tavolo!`;
        return false;
    }

    const risposta = await fetch(`${API}?type=stato&id=1`);
    const jsonordini = await risposta.json();

    const jsonTavoliConOrdine = jsonordini.data.filter(p =>
        p.id_tavoli && tavoliSelezionati.some(id => p.id_tavoli.includes(id)) // FIX: tipi normalizzati a monte (int), un solo controllo
    );
   
   
    
    if (jsonTavoliConOrdine.length>0) {
        sezione.classList.remove('controllopositivo');
        sezione.classList.add('warning');
        avviso.innerHTML = `Questo tavolo ha già un ordine attivo!`;
        return false;
    }

    sezione.classList.remove('warning');
    avviso.innerHTML = "";
    sezione.classList.add('controllopositivo');
    return true;
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



}