<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Prenotazione';
?>
<?php 
require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile
//pagina di esempio AJAX fetch API
?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire la Prenotazione</p>
   </div>
   <div class="piatto">
     <form action="" id="form_inserisci_prenotazione" method="POST">
        <label for="nome-prenotazione" >Nome della prenotazione : </label>
        <input type="text"  id="nome-prenotazione" name="nome-prenotazione" required>

        <label for="ora-prenotazione">Ora Prenotazione : </label>
        <input type="time" name="ora-prenotazione" id="ora-prenotazione" min="12:00"  max="21:30"  step="900">
    
        <label for="data-in-prenotazione">Data Prenotazione : </label>
        <input type="date" name="data-in-prenotazione" id="data-in-prenotazione" min="<?= date('Y-m-d') ?>" max="2026-12-31" required>
    
        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>

        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Vuoi assegnare subito la prenotazione a un tavolo? </legend>

            <label><input type="radio" id="attiva-si" name="in_menu" value=1> Sì</label>
            <label><input type="radio" id="attiva-no" name="in_menu" value=0> No</label>
        </fieldset>

        <fieldset id="tavoli">
            <!--fare una lista dinamica di checkbox con js per vedere i tavoli in modo dinamico. Poi mettere una funzione che controlli se il numero di persone ha bisogno di 1 o pui tavoli  -->
            <legend>Tavoli</legend>
            <!--tavoliSelezionati[] serve  ariempire un array di tavoli-->
            <label><input type="checkbox" name="tavoliSelezionati[]" value="1"></label>
            
        </fieldset> 

        <button type="button" class="btn-inserisci-prenotazione" >Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante_classic/api/menu.php';
</script>
<script src="/ristorante_classic/public/assets/js/menu.js" defer></script>    


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>