<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Bevanda';
$id = $_GET['id'] ?? null;
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
     <p>compila i campi richiesti per inserire la Bevanda</p>
   </div>
   <div class="Bevanda">
     <form action="" id="form_inserisci-fuorimenu-bev" method="POST">
        <label for="nome-bevanda" >Nome del Bevanda : </label>
        <input type="text"  id="nome-bevanda" name="nome-bevanda" required>

        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione del bevanda" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number"  id="prezzo" name="prezzo" required> €
        
        <label for="quantita"> Quantità : </label>
        <input type="number"  id="quantita" name="quantita" required> Porsioni
       
        <fieldset>
        

       <fieldset>
            <legend>La Bevanda Contiene Alcol?</legend>
            <label><input type="radio" id="alcol-si" name="alcol" value="si"> Sì</label>
            <label><input type="radio" id="alcol-no" name="alcol" value="no"> No</label>
        </fieldset>
        
        <button type="button" id="btn-inserisci-bevandamenu-ordine" class="btn-inserisci-bevandamenu-ordine" data-id=<?=(int)$id?>>Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante_classic/api/ordini.php';
</script>
<script src="/ristorante_classic/public/assets/js/ordini.js" defer></script>    


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>