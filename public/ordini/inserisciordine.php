<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Inserisci Comanda';
$id = $_GET['id'] ?? null; //per preselezionare il tavolo

?>
<?php 
require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile
//pagina di esempio AJAX fetch API
$id = $_GET['id'] ?? null;
?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per inserire Inserire la Comanda</p>
     
   </div>
   <div class="piatto">
     <form action="" id="form_inserisci_ordine" method="POST">
        <button id="salva" > Salva </button>
       <div id="primo-step"> 
        <label for="numero-persone">Numero Persone : </label>
        <input type="number"  id="numero-persone" name="numero-persone" required> 


        <fieldset>
            <legend>Vuoi assegnare/aggiungere l'ordine a un altro tavolo/i? </legend>
             <fieldset id="tavoli_checkbox">
                
             </fieldset> 
             <div class="controllopositivo" id="controllo"><p id="avviso"></p> </div>
            <div class="controllopositivo" id="controllo1"><p id="avviso1"></p> </div>
        </fieldset>
        <button id="avanti" class="btn-avanti" data-id="<?= (int)$id ?>">Avanti<button>
       <div>
    </div>
    
      <div id="compila" class="hide">
        <div id="momenti-servizio">
            <div id="1">

            </div>
            <div id="2">

            </div>
            <div id="3">

            </div>
            <div id="4">

            </div>
            <div id="5">

            </div>
            <div id="6">

            </div>
             <button id="avanti" class="btn-avanti">Avanti<button> 
             <button id="indietro" class="btn-indietro">Indietro<button> 
        </div>
        <div id="contenitore">
            <div id="piatti">
                //per la modifica veloce della quantità del momento e dell'elimina
                //(localstorage)da aggiungere un campo note che funziona solo allo scopo di stampare , al limite si salva nella sezione online  e poi si cancella ogni giorno
                <div>   
                <h3>Piatti:</h3>  
                <a class="btn" href="nuovopiattofuorimenu.php">+ piatto</a>
                <div id="piatti_input">
            
                </div> 
            </div>
            <div id=bevande>

                <h3>Bevande:</h3>  
                <a class="btn" href="nuovabevandafuorimenu.php">+ bevanda</a>
                <div id="bevande_input">
            
               </div>
            </div>
        </div>    
           
      <button type="button"  class="btn-modifica-ordine" >Inserisci & Stampa Comanda</button>
      </div>
      </div>
      </form>
    </div>
   
<script>
    const API = '/ristorante_classic/api/tavoli.php';
    const API_ORDINI = '/ristorante_classic/api/ordini.php';
    const API_MENU = '/ristorante_classic/api/menu.php';

</script>
<script src="/ristorante_classic/public/assets/js/tavoli.js" defer></script>    
<script src="/ristorante_classic/public/assets/js/ordini.js" defer></script> 


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>