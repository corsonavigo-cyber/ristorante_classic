<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
require_once __DIR__ . '/../bootstrap.php';

require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';

//si occupa di mostrare al gestore quello che vedranno i clienti
$title = 'Storico Prenotazioni';
?>


<main> 
    <div class="supporto-titolo">
        <h2  class="title"><?= $title ?></h2>
    
    </div>
    
    <div>
      <label for="ricerca"> Ricerca: </label>
      <input type="text" id="ricerca_storico" nome="ricerca">
    </div>
    <div class="menu" id="storico">
       
   
    </div>
<script>
    const API = '/ristorante_classic/api/prenotazioni.php';
</script>
<script src="/ristorante_classic/public/assets/js/prenotazioni.js" defer></script>    

</main>

<?php 
require_once __DIR__ . '/../footer.php';
 ?>

