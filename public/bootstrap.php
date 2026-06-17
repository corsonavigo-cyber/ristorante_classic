
<?php
require_once __DIR__.'/../vendor/autoload.php';

use Dotenv\Dotenv;
use Config\Database;
use App\Repositories\UserRepositories;
use App\Services\AuthService;
use App\Services\LoggerService;  


$dotenv =Dotenv::createImmutable(__DIR__.'/../');
$dotenv->load();

if(session_status() === PHP_SESSION_NONE){
    session_start();
}

$logger = new LoggerService(); 
$pdo = Database::getInstance();

$userRepository = new UserRepositories($pdo);

$authService = new AuthService(
    $userRepository,
    $logger
);
