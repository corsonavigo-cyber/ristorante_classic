<?php

namespace App\Enum;

enum InMenu: string {
    case Si = 'si';
    case No = 'no';
}
/*dopo per il controllo
$in_menu = InMenu::tryFrom($input) ?? InMenu::No; 
$categoria = Categoria::tryFrom($input) ?? Categoria::Antipasto; */
?>