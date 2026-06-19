
<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Config\Database;

use App\Repositories\TavoloRepositories;
use App\Repositories\UserRepositories;

use App\Services\AuthService;
use App\Services\LoggerService;  
use App\Services\TavoloService;


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

//chiamo i service
$authService = new AuthService($userRepository, $logger);
$tavoloService= new TavoloService($tavoloRepository, $logger);
