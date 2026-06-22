<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Gestione Tavoli';
?>

<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>


<body>

    <h2>Tavoli</h2>
    
    <div class="tavoli" id="lavagna_tavoli">
       
    </div>
    <a link="inserisciTavolo.php">Inserisci un Tavolo</a>

<script>
    const API = '/ristorante_classic/api/tavoli.php';
</script>
<script src="/ristorante_classic/public/assets/js/tavoli.js"></script>    


<?php 
require_once __DIR__ . '/../footer.php';
 ?>
