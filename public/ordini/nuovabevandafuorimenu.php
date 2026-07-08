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
     <form action="" id="form_inserisci" method="POST">
        <label for="nome-bevanda" >Nome del Bevanda : </label>
        <input type="text"  id="nome-bevanda" name="nome-bevanda" required>

        <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
        <label for="descrizione">Descrizione : </label>
        <textarea placeholder="inserisci qui la descrizione del bevanda" id="descrizione" name="descrizione"></textarea>

        <label for="prezzo">Prezzo : </label>
        <input type="number"  id="prezzo" name="prezzo" required> €
        
        <!--da mettere dentro ogni bevanda che poi selezionare
   select momento del servizio placeholder subito
    <label for="quantita">Quantità: </label>
    <input type="number"  id="prezzo" name="prezzo" required> €-->

        
      
        <legend class="hide">Il bevanda va Immediatamente inserito nel Menu Clienti? </legend>

            <label><input type="radio" id="in-menu-si" name="in_menu" value="si"> Sì</label>
            <label><input type="radio" id="in-menu-no" name="in_menu" value="no" checked> No</label>
        </fieldset>

        <fieldset class="hide">
            <legend>A Quale Categoria Appartiene il Bevanda </legend>

            <label><input type="radio" id="antipasto" name="categoria" value="antipasto">Antipasto</label>
            <label><input type="radio" id="primo" name="categoria" value="primo">Primo</label>
            <label><input type="radio" id="secondo" name="categoria" value="secondo">Secondo</label>
            <label><input type="radio" id="dolce" name="categoria" value="dolce">Dolce</label>
            <label><input type="radio" id="altro" name="categoria" value="altro" checked>altro</label>
        </fieldset>

        <button type="button" class="btn-inserisci-bevandamenu-ordine" >Inserisci</button>
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