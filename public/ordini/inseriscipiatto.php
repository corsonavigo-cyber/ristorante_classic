<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Piatto In Comanda';
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

     <a class="btn" href="nuovopiattofuorimenu.php">+ Nuovo Piatto Fuori Menu</a>

     <p>Compila i campi richiesti per inserire il Piatto</p>
   </div>
   <div class="piatto">
     <div class="menu" id="lavagna_menu_attivo">
       
    </div>
    <label for="momento">momento_del_servizio deve essere una select  : </label>
    <input type="number"  id="momento" name="momento" required> 

   <!--da mettere dentro ogni piatto che poi selezionare
    <label for="quantita">Quantità: </label>
    <input type="number"  id="prezzo" name="prezzo" required> €-->

        <button type="button" class="btn-inserisci-piatto-ordine" >Inserisci</button>
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