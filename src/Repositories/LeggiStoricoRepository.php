<?php
declare(strict_types=1);

namespace App\Repositories;

class LeggiStoricoRepository
{
    private string $file;

    public function __construct(string $file)
    {
        $this->file = $file;
    }

    // legge il contenuto grezzo del file storico, lancia se non esiste/non leggibile
    public function leggiStorico(): string
    {
        if (!file_exists($this->file)) {
            throw new \RuntimeException('File storico non trovato');
        }

        $contenuto = file_get_contents($this->file);

        if ($contenuto === false) {
            throw new \Exception('Errore nella lettura del file storico');
        }

        return $contenuto;
    }
}