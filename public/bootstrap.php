
<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Config\Database;

use App\Repositories\TavoloRepositories;
use App\Repositories\UserRepositories;
use App\Repositories\MenuRepositories;

use App\Services\AuthService;
use App\Services\LoggerService;  
use App\Services\TavoloService;
use App\Services\MenuService;



$dotenv =Dotenv::createImmutable(__DIR__.'/../');
$dotenv->load();

if(session_status() === PHP_SESSION_NONE){
    session_start();
}
//chiamo in modo centralizzato la connessione
$logger = new LoggerService(); 
$pdo = Database::getInstance();
//chiamo le repositories
$userRepository = new UserRepositories($pdo);
$tavoloRepository= new TavoloRepositories($pdo);
$menuRepository= new MenuRepositories($pdo);

//chiamo i service
$authService = new AuthService($userRepository, $logger);
$tavoloService= new TavoloService($tavoloRepository, $logger);
$menuService= new MenuService($menuRepository, $logger);
/*inserisco l'aurorizzazione nelle pagine

$paginePubbliche = ['/login.php'];
//serve a non includere login.php nelle pagine da autorizzare ed ad evitare il loop
if (!in_array(basename($_SERVER['PHP_SELF']), array_map('basename', $paginePubbliche))) {
    if (!$authService->requireAuth()) {
        header("Location: /login.php");
        exit;
    }
}*/