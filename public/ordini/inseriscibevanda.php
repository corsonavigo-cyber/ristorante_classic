<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Bevanda In Comanda';
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

     <a class="btn" href="nuovabevandafuorimenu.php">+ Nuova Bevanda Fuori Menu</a>

     <p>Compila i campi richiesti per inserire la Bevanda</p>
   </div>
   <div class="piatto">
     <div class="menu" id="lavagna_bevande_attive_ordine">
       
    </div>

   <!--da mettere dentro ogni bevanda che poi selezionare
   select momento del servizio placeholder subito
    <label for="quantita">Quantità: </label>
    <input type="number"  id="prezzo" name="prezzo" required> €-->

        <button type="button" class="btn-inserisci-bevanda-ordine" >Inserisci</button>
     </form>
   </div>
  </div>
<script>
    const API = '/ristorante_classic/api/menu.php';
    const API_ORDINI = '/ristorante_classic/api/ordini.php';
</script>
<script src="/ristorante_classic/public/assets/js/menu.js" defer></script>    
<script src="/ristorante_classic/public/assets/js/ordini.js" defer></script> 

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>