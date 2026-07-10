if(storico){
     const filtro = document.getElementById('ricerca-storico').value;
     document.addEventListener('DOMContentLoaded', () => caricaStorico());
     
     document.getElementById('ricerca-storico').addEventListener('input', function() {
    caricaStorico(this.value.trim()); // function() → this è l'input ✓
    });
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