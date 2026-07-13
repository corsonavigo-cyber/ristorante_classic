<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$title = 'Visualizza Comande Bar';
$id = $_GET['id'] ?? null; //per preselezionare il tavolo


require_once __DIR__ . '/../bootstrap.php'; // prima le dipendenze
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';    // ora $authService è disponibile

?>
<main>
  <div class="piatti">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
  
        <div id="contenitore">
            <div id="bevande">

                <h3>Bevande:</h3>  
               
                <div id="bevande_bar">
            
               </div>
            </div>
        </div>    
           
       
      </div>
   
      </form>
  
   
<script>
    const API = '/ristorante_classic/api/tavoli.php';
    const API_ORDINI = '/ristorante_classic/api/ordini.php';
    const API_MENU = '/ristorante_classic/api/menu.php';

</script>
<script src="/ristorante_classic/public/assets/js/tavoli.js" defer></script>    
<script src="/ristorante_classic/public/assets/js/ordiniprima.js" defer></script> 
<script src="/ristorante_classic/public/assets/js/ordiniutil.js" defer></script> 


</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>