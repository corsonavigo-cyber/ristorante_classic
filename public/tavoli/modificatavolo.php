<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
$id=$_GET['id'];
$title = 'Modifica Tavolo '.$id;
?>
<?php 
require_once __DIR__ . '/../head.php';
require_once __DIR__ . '/../navbar.php';
require_once __DIR__ . '/../bootstrap.php';
//pagina di esempio AJAX fetch API
?>
 <main>
 <div class="tavoli">
   <div class="supporto-titolo">
     <h2><?= $title ?></h2>
     <p>compila i campi richiesti per modificare il tavolo</p>
   </div>
   <div class="tavolo">
     <form action="" method="POST">
        <label for="numero-tavolo">Numero del Tavolo : </label>
        <input type="number" step="1" id="numero-tavolo" name="numero-tavolo">

        <label for="posti-max-tavolo">Posti Massimi del Tavolo : </label>
        <input type="number" step="1" id="numero-tavolo" name="numero-tavolo">

        <label for="posti-min-tavolo">Posti Minimi del Tavolo : </label>
        <input type="number" step="1" id="numero-tavolo" name="numero-tavolo">

        <button type="submit" class="btn-modifica" data-id="<?= $id ?>">Modifica</button>
     </form>
   </div>
  </div>
</main>
<script>
    const API = '/ristorante_classic/api/tavoli.php';
</script>
<script src="/ristorante_classic/public/assets/js/tavoli.js" defer></script>    

</main>
<?php 
require_once __DIR__ . '/../footer.php';
 ?>