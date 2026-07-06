<?php
namespace App\Enums;

enum Categoria: string {
    case antipasto = 'antipasto';
    case prima = 'primo';
    case seconda   = 'secondo';
    case dolce   = 'dolce';
    case altro   = 'altro';
    case prioritario   = 'prioritario';
}
?>
