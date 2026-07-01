<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';


$title = 'Gestione Prenotazioni';
?>


<main> 
    <div class="supporto-titolo">
        <h2  class="title"><?= $title ?></h2>
    
    <div class="schermata-divisa">
    
    <div>
    <a class="btn" href="visualizzastorico.php">Visualizza lo Storico delle Prenotazioni</a>
    <a class="btn" href="inserisciprenotazioni.php">Inserisci una Nuova Prenotazione</a>
   
    <div class="prenotazioni" id="lavagna_prenotazioni_tavolo">
       
    </div>

    <div class="menubevande" id="lavagna_prenotazioni_notavolo">
       
    </div>
    </div>
    </div>
<script>
    const API = '/ristorante_classic/api/prenotazioni.php';
</script>
<script src="/ristorante_classic/public/assets/js/prenotazioni.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

