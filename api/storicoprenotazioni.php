<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/bootstrap.php';

$file = dirname(__DIR__) . '/storage/logs/storicoprenotazioni.txt';

header('Content-Type: application/json');

if (!file_exists($file)) {
    echo json_encode([
        'success' => false,
        'message' => 'File non trovato'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'contenuto' => file_get_contents($file)
]);
?>