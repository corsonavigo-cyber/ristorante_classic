<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Piatti Che Non Sono Visibili ai Clienti';
?>

<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>
 <!--gestione dei piatti non attivi-->

<main>
    <!--il bottone elimina viene gestito direttamente nel js per le prossime tabelle lo predisporro per sottrazione come avviene realente nei magazzini-->
    <div class="supporto-titolo">
        <h2><?= $title ?></h2>
    </div>
    
    <a class="btn" href="gestionemenuchevedonoiclienti.php">Torna Ai Piatti Visualizzabili Dai Clienti</a>
    <a class="btn" href="inseriscipiatto.php">+ Inserisci Nuovo Piatto</a>
   
    <div class="menu" id="lavagna_piatti_nonattivi">
       
    </div>
    
<script>
    const API = '/ristorante_classic/api/menu.php';
</script>
<script src="/ristorante_classic/public/assets/js/menu.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

