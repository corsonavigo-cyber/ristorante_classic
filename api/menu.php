<?php
declare(strict_types=1);




//per il debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__.'/../public/bootstrap.php';
use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Alcol;

//devo sempre esserci per far funzionare la rest api.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: '. $_ENV['APP_CORS_ORIGIN']); // in produzione sarà concesso solo altuo dominio
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// Preflight CORS deve essere sempre presente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

//Configurazione connessioni tramite Bootstrap,
//per le REST API, ma alcune sono già nel file bootstrap

$method= $_SERVER['REQUEST_METHOD'];

//se possibile recupera l'id
$id = isset($_GET['id']) ? (int)$_GET['id'] :null;
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
//fuction di supporto per la risposta  rispondi se la richiesta genera una risposta del server <400
function risposta(mixed $data,int $status=200):void {
    http_response_code($status);
    echo json_encode(['success'=>$status<400, 'data'=>$data]);
    exit;
}

//utilizza un try catch per le operazioni CORS
try{
   switch($method){
       case 'GET':
        if (!$type) {
                    throw new \InvalidArgumentException('Parametro type mancante');
                }
        match($type) {
            'piatti'=> $id ? risposta($menuService->visualizzaPiattoConRelazioni($id)) : risposta($menuService->visualizzaPiatti()),
            'bevande'=> $id ? risposta($menuService->visualizzaBevandaConRelazioni($id)): risposta($menuService->visualizzaBevande()),
            'allergeni'=> $id ? risposta($menuService->selezionaAllergene($id)):risposta($menuService->visualizzaListaAllergeni()),
            'categoria' => risposta($menuService->piattiPerCategoria(Categoria::from($_GET['categoria'] ?? ''))),
            default=> throw new \InvalidArgumentException('Tipo non valido')
        };
        break;
        
      case 'POST':
            
                $body = json_decode(file_get_contents('php://input'), true);

                if (!$type) {
                    throw new \InvalidArgumentException('Parametro type mancante');
                }

                if (!$body || $body === []) {
                    risposta('JSON non valido', 400);
                    break;
                }

                match($type) {
                    'piatti'    => risposta($menuService->nuovoPiatto($body['nome_piatto'],(float)$body['prezzo'],$body['descrizione'],InMenu::from($body['in_menu']),Categoria::from($body['categoria']),$body['allergeni'] ?? [])),
                    
                    'bevande'   => risposta($menuService->nuovaBevanda($body['nome_bevanda'],(float)$body['prezzo'],$body['descrizione'],Alcol::from($body['alcol']),InMenu::from($body['in_menu']),$body['allergeni'] ?? [])),

                    'allergeni' => risposta($menuService->nuovoAllergene($body['nome_allergene'])),
                    
                    default     => throw new \InvalidArgumentException('Tipo non valido')
                };

            
            break;

      case 'PUT':
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$type) {
                    throw new \InvalidArgumentException('Parametro type mancante');
                }

        if (!$body || $body === []) {
                    risposta('JSON non valido', 400);
                    break;
                }

        match($type) {
            'piatti'    => risposta($menuService->modificaPiatto($id, $body['nome_piatto'],(float)$body['prezzo'],$body['descrizione'], InMenu::from($body['in_menu']),Categoria::from($body['categoria']),$body['allergeni'] ?? [] )),
            
            'bevande'   => risposta($menuService->modificaBevanda($id,$body['nome_bevanda'],(float)$body['prezzo'],$body['descrizione'],Alcol::from($body['alcol']),InMenu::from($body['in_menu']),$body['allergeni'] ?? [])),

            
           
             default     => throw new \InvalidArgumentException('Tipo non valido')
        };
        break;

      case 'PATCH':
        $body= json_decode(file_get_contents('php://input'),true);
        if (!$type) {
                    throw new \InvalidArgumentException('Parametro type mancante');
                }

        if (!$body || $body === []) {
                    risposta('JSON non valido', 400);
                    break;
                }
        match($type) {

            'piatti'  => risposta($menuService->togliPiattoMenu($id, InMenu::from($body['in_menu']))),
            'bevande' => risposta($menuService->togliBevandaMenu($id, InMenu::from($body['in_menu']))),
           
             default     => throw new \InvalidArgumentException('Tipo non valido')
        };

        break;

      case 'DELETE':
        
                if (!$id) {
                    risposta('ID mancante', 400);
                    break;
                }
                if (!$type) {
                    throw new \InvalidArgumentException('Parametro type mancante');
                }

                match($type) {
                    'piatti'    => risposta($menuService->cancellaPiatto($id)),
                    'bevande'   => risposta($menuService->cancellaBevanda($id)),
                    'allergeni' => risposta($menuService->cancellaAllergene($id)),
                    default     => throw new \InvalidArgumentException('Tipo non valido')
                };

       
        break;

      default:
        risposta('Metodo non supportato', 405);
}


} catch (\ValueError $e) {
    risposta('Valore enum non valido: ' . $e->getMessage(), 422);
} catch (\InvalidArgumentException $e) {
    risposta($e->getMessage(), 400);
} catch (\RuntimeException $e) {
    risposta($e->getMessage(), 404);
} catch (\Exception $e) {
    risposta($e->getMessage(), 500);
}
