<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Modifica Comanda';
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
     <p>compila i campi richiesti per inserire modificare la Comanda</p>
   </div>
   <div class="piatto">
     <form action="" id="form_modifica_ordine" method="POST">
          
        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Vuoi assegnare/aggiungere l'ordine a un altro tavolo/i? </legend>

            <label><input type="radio" id="attiva-si" name="attiva" value=1> Sì</label>
            <label><input type="radio" id="attiva-no" name="attiva" value=0> No</label>
        </fieldset>
        <div id="momento_del_servizio">
            //per la modifica veloce della quantità del momento e dell'elimina
            <div>   
            <h3>Piatti:</h3>  
            <a class="btn" href="inseriscipiatto.php">+ piatto</a>
            <div id="piatti_input">
        
            </div> 
            </div>
            <fieldset id="tavoli_checkbox">
        
            <div>   

            <h3>Bevande:</h3>  
            <a class="btn" href="inseriscipiatto.php">+ bevanda</a>
            <div id="bevande_input">
        
            </div> 
            </div>
            <fieldset id="tavoli_checkbox">
                
            </fieldset> 
            <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
            <div class="controllopositivo" id="controllo1"><p id="avviso1"></p> </div>
                 <button type="button"  class="btn-modifica-ordine" data-id="<?= $id ?>">Modifica</button>
            </div>
            </div>
        </form>
    </div>
   
<script>
    const API = '/ristorante_classic/api/tavoli.php';
    const API_ORDINI = '/ristorante_classic/api/ordini.php';
</script>
<script src="/ristorante_classic/public/assets/js/tavoli.js" defer></script>    
<script src="/ristorante_classic/public/assets/js/ordini.js" defer></script> 


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>