/*
//funzione ottimizzata con Claude, tolte le ridondanze e sistemati i controlli (in particolare la data)
*/

async function inserisciPiattoFuoriMenu(nome_piatto, descrizione, prezzo) {
    try {
        const risposta = await fetch(`${API}?type=piatti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_piatto: String(nome_piatto),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                categoria: 'altro'
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        // FIX: .json() ritorna una Promise, serve await prima di leggere .id
        const json = await risposta.json();
        return json.id;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciBevandaFuoriMenu(nome_bevanda, descrizione, prezzo, alcol) {
    try {
        const risposta = await fetch(`${API}?type=bevande`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_bevanda: String(nome_bevanda),
                descrizione: String(descrizione),
                prezzo: prezzo,
                allergeni: [],
                in_menu: 'no',
                alcol: alcol
            })
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
        return json.id;

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdine(e) { // FIX: mancava il parametro "e", usato sotto in e.target
    try {
        const btn = e.target.closest('.btn-avanti');
        if (!btn) return;

        const numero_persone = document.getElementById('numero-persone').value;

        const numPersone = parseInt(numero_persone);
        if (Number.isNaN(numPersone) || numPersone <= 0) {
            throw new Error("Inserisci un numero persone valido");
        }

        const body = {
            numero_persone: numPersone
        };

        // ATTENZIONE: "type" non era definito da nessuna parte in questa funzione.
        // Se hai un solo flusso di creazione ordine ti basta "?type=ordine".
        // Se invece ti servono più varianti, aggiungi "type" come parametro della funzione.
        const risposta = await fetch(`${API_ORDINI}?type=ordine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        const json = await risposta.json();
        await inserisciOrdineTavolo(json.id);

        return true;
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdinePiatto() {
    try {
        // ATTENZIONE: "nome_piatto" non veniva mai letto dal DOM, era undefined.
        // Assumo un input con id "nome-piatto": verifica che corrisponda al tuo HTML.
        const nome_piatto = document.getElementById('nome-piatto').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_piattomenu.dataset.id);

        if (typeof nome_piatto !== "string" || nome_piatto === "") {
            throw new Error("Il nome del piatto è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        // FIX: controllava Number.isNaN(prezzo) invece che quantita
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }

        const id_piatto = await inserisciPiattoFuoriMenu(nome_piatto, descrizione, prezzo);

        const body = {
            id_ordine: id_ordine,
            id_piatto: id_piatto,
            id_momento: id_momento,
            quantita: quantita
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

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function cambiaOrdineDalTavolo(id_ordine, tavoli) {
    try {
        if (!id_ordine) {
            throw new Error('Ordine non variato, manca ID!');
        }
        if (!tavoli) {
            throw new Error('Ordine non variato, manca ID!');
        }

        const aggiornaRelazione = await fetch(`${API_ORDINI}?type=tavolo&id=${id_ordine}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_ordine: parseInt(id_ordine),
                tavoli: tavoli
            })
        });

        if (!aggiornaRelazione.ok) {
            const json = await aggiornaRelazione.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${aggiornaRelazione.status}`);
        }

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineBevanda() {
    try {
        // ATTENZIONE: "nome_bevanda" non veniva mai letto dal DOM, era undefined.
        // Assumo un input con id "nome-bevanda": verifica che corrisponda al tuo HTML.
        const nome_bevanda = document.getElementById('nome-bevanda').value;
        const descrizione = document.getElementById('descrizione').value;
        const prezzo = parseFloat(document.getElementById('prezzo').value);
        const quantita = parseFloat(document.getElementById('quantita').value);
        const id_momento = document.querySelector('input[name="momento"]:checked').value;
        const id_ordine = parseInt(btn_ordine_bevandamenu.dataset.id);
        const alcol = document.querySelector('input[name="alcol"]:checked').value;

        if (typeof nome_bevanda !== "string" || nome_bevanda === "") {
            throw new Error("Il nome della bevanda è obbligatorio");
        }
        if (typeof descrizione !== "string" || descrizione.trim() === "") {
            throw new Error("La descrizione è obbligatoria");
        }
        if (typeof prezzo !== "number" || Number.isNaN(prezzo) || prezzo <= 1) {
            throw new Error("Inserisci un prezzo valido");
        }
        // FIX: controllava Number.isNaN(prezzo) invece che quantita
        if (typeof quantita !== "number" || Number.isNaN(quantita) || quantita <= 1) {
            throw new Error("Inserisci una quantità valida");
        }

        const id_bevanda = await inserisciBevandaFuoriMenu(nome_bevanda, descrizione, prezzo, alcol);

        const body = {
            id_ordine: id_ordine,
            id_bevanda: id_bevanda,
            id_momento: id_momento,
            quantita: quantita
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

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function inserisciOrdineTavolo(id_ordine) {
    try {
        const tavoli = [...document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')].map(el => parseInt(el.value));

        const body = {
            id_ordine: id_ordine,
            tavoli: tavoli
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

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function precaricaFormModificaPrenotazione() {
    // legge l'id dall'URL: modificaprenotazione.php?id=5
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    const risposta = await fetch(`${API}?type=prenotazioni&id=${id}`);
    const json = await risposta.json();
    const data = json.data;

    document.getElementById('nome-prenotazione').value = data.nome_prenotazione;

    document.getElementById('numero-persone').value = parseFloat(data.numero_persone);

    const attivaInput = document.querySelector(`input[name="attiva"][value="${data.attiva}"]`);
    if (attivaInput) attivaInput.checked = true;

    const tavoliEsistenti = data.id_tavoli ? data.id_tavoli.split(',').map(a => parseInt(a.trim())) : [];

    document.querySelectorAll('input[name="tavoliSelezionati[]"]').forEach(checkbox => {
        checkbox.checked = tavoliEsistenti.includes(parseInt(checkbox.value));
    });
}

async function modificaPrenotazioneClick(e) {
    try {
        const btn = e.target.closest('.btn-modifica-prenotazione');
        if (!btn) return;
        if (!confirm('vuoi modificare questa Prenotazione?')) return;

        const id_modifica = btn.dataset.id;
        if (!id_modifica) throw new Error('ID Prenotazione mancante');

        const nome_prenotazione = document.getElementById('nome-prenotazione').value.trim();
       
        const tavoliSelezionati = Array.from(document.querySelectorAll('input[name="tavoliSelezionati[]"]:checked')).map(el => parseInt(el.value));
        const attivo = parseInt(document.querySelector('input[name="attiva"]:checked').value, 10);
        const numero_persone = parseInt(document.getElementById('numero-persone').value, 10);

        if (!nome_prenotazione) throw new Error('Il nome della prenotazione è obbligatorio');
        if (!ora_prenotazione) throw new Error("L'ora della prenotazione è obbligatoria");
        if (Number.isNaN(numero_persone) || numero_persone <= 0) throw new Error('Inserisci un numero di persone valido');

        const type = 'prenotazioni_tavolo';

        const body = {
            nome_prenotazione: String(nome_prenotazione),
            ora_prenotazione: `${ora_prenotazione}`,
            data_in_prenotazione: String(data_in_prenotazione),
            attiva: attivo, // chiave "attiva" per matchare $body['attiva'] lato PHP
            numero_persone: numero_persone,
            tavoli: tavoliSelezionati
        };

        const risposta = await fetch(`${API}?type=${type}&id=${id_modifica}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await risposta.json().catch(() => null);

        if (!risposta.ok || !json?.success) {
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        alert('Prenotazione modificata con successo!');
        window.location.href = "gestioneprenotazioni.php";

    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

//------------------------------DELETE-----------------------------------------
async function eliminaPrenotazioneClick(e) {
    try {
        const btn_elimina = e.target.closest('.btn-elimina-prenotazione');
        if (!btn_elimina) return;
        if (!confirm('vuoi eliminare questa prenotazione?')) return;

        const id_elimina = btn_elimina.dataset.id;
        if (!id_elimina) {
            throw new Error('Id Mancante nel bottone!');
        }

        const risposta = await fetch(`/ristorante_classic/api/prenotazioni.php?type=tavolo_prenotazioni&id=${id_elimina}`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}

async function eliminaStoricoPrenotazione(e) {
    try {
        const oggi = new Date().toISOString().slice(0, 10);
        const ultimaEsecuzione = localStorage.getItem('ultimaPuliziaPrenotazioni');

        if (ultimaEsecuzione === oggi) return; // già eseguita oggi, esci

        const risposta = await fetch(`${API}?type=pulisci`, {
            method: 'DELETE'
        });

        if (!risposta.ok) {
            const json = await risposta.json().catch(() => null);
            throw new Error(json?.data ?? `Errore HTTP ${risposta.status}`);
        }

        localStorage.setItem('ultimaPuliziaPrenotazioni', oggi);
        window.location.reload();
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    }
}