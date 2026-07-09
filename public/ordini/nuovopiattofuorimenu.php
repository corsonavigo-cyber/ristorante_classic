<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Piatto';
$id = $_GET['id'] ?? null; //id ordine che deve arrivare
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
     <p>compila i campi richiesti per inserire il Piatto</p>
   </div>
   <div class="piatto">
     <form action="" id="form-inserisci-fuorimenu-piat" method="POST">
        <label for="nome-piatto" >Nome del Piatto : </label>
        <input type="text"  id="nome-piatto" name="nome-piatto" required>

        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione del piatto" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number"  id="prezzo" name="prezzo" required> 
        
        <label for="quantita"> Quantità : </label>
        <input type="number"  id="quantita" name="quantita" required> Porsioni
       
        <fieldset>
        <legend >Momento di Servizio </legend>

            <label><input type="radio" id="antipasto" name="momento" value=1>Antipasto</label>
            <label><input type="radio" id="primo" name="momento" value=2 >Primo</label>
            <label><input type="radio" id="secondo" name="momento" value=3>Secondo</label>
            <label><input type="radio" id="dolce" name="momento" value=4>Dolce</label>
            <label><input type="radio" id="altro" name="momento" value=5 checked>Altro</label>
            <label><input type="radio" id="prioritario" name="momento" value=6 >Prioritario</label>
        </fieldset>
        
       
        <button type="button" class="btn-inserisci-piattomenu-ordine" data-id=<?=(int)$id?>>Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante_classic/api/menu.php';
    const API_ORDINI = '/ristorante_classic/api/ordini.php';
</script>
<script src="/ristorante_classic/public/assets/js/ordini.js" defer></script>    


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>