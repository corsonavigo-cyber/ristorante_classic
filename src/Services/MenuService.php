<?php 
declare(strict_types=1);
namespace App\Services;
use App\Repositories\MenuRepositories;
/*use App\Enums\Categoria;
use App\Enums\InMenu;
use App\Enums\Alcol;*/

class MenuService {
    public function __construct(private MenuRepositories $menuRepo, private LoggerService $logger){} #inietta il repository dei tavoli

    public function visualizzaPiatti(): array {
        try {
            return $this->menuRepo->visualizzaMenuPiatti() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero piatti: {$e->getMessage()}");
            return []; 
        }
    }

    public function visualizzaBevande(): array {
        try {
            return $this->menuRepo->visualizzaMenuBevande() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Bevande: {$e->getMessage()}");
            return []; 
        }
    }
 

    public function visualizzaListaAllergeni(): array {
        try {
            return $this->menuRepo->visualizzaAllergeni() ?? [];
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Allergeni: {$e->getMessage()}"); 
            return []; 
        }
    }

    public function selezionaPiatto(int $id_piatto): ?array {
        try {
            return $this->menuRepo->selezionaPiattoId($id_piatto);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Piatto ID {$id_piatto}: {$e->getMessage()}");
            return null;
        }
    }

    public function selezionaBevanda(int $id_bevanda): ?array {
        try {
            return $this->menuRepo->selezionaBevandaId($id_bevanda);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Bevanda ID {$id_bevanda}: {$e->getMessage()}");
            return null;
        }
    }

    public function selezionaAllergene(int $id_allergene): ?array {
        try {
            return $this->menuRepo->selezionaAllergeneId($id_allergene);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero Allergene ID {$id_allergene}: {$e->getMessage()}");
            return null;
        }
    }

    public function piattiPerCategoria(Categoria $categoria): ?array {
        try {
            return $this->menuRepo->selezionaPiattiPerCategoria($categoria);
        } catch (\Throwable $e) {
            $this->logger->error("Errore recupero piatti categoria {$categoria->value}: {$e->getMessage()}");
            return [];
        }
    }


    public function nuovoAllergene(string $nome_allergene):int{

        #salto l'autorizzazione in base al ruolo
       try {
             $newIdAllergene = $this->menuRepo->inserisciAllergene($nome_allergene);
             $this->logger->info("Allergene {$nome_allergene}: inserito con successo");
             return $newIdAllergene;
             
        }catch (\Throwable $e) {
             $this->logger->error("Allergene {$nome_allergene} non inserito: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento allergene: {$e->getMessage()}");
        }
        
   
    }

    public function nuovoPiatto(string $nome_piatto, float $prezzo, string $descrizione, InMenu $in_menu, Categoria $categoria, array $allergeni_selezionati):bool{

        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->inserisciPiatto($nome_piatto, $prezzo, $descrizione, $in_menu, $categoria, $allergeni_selezionati);
             
        }catch (\Throwable $e) {
             $this->logger->error("Piatto {$nome_piatto} non inserito: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento piatto: {$e->getMessage()}");
        }
        $this->logger->info("Piatto {$nome_piatto}: inserito con successo");
        return true;
   
    }

     public function nuovaBevanda(string $nome_bevanda, float $prezzo, string $descrizione, Alcol $alcol, InMenu $in_menu, array $allergeni_selezionati):bool{

        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->inserisciBevanda($nome_bevanda, $prezzo, $descrizione, $alcol,  $in_menu, $allergeni_selezionati);
             
        }catch (\Throwable $e) {
             $this->logger->error("Bevanda {$nome_bevanda} non inserita: {$e->getMessage()}");
             throw new \RuntimeException("Errore inserimento bevanda: {$e->getMessage()}");
        }
        $this->logger->info("Bevanda {$nome_bevanda}: inserita con successo");
        return true;
   
    }



    public function cancellaAllergene(int $id_allergene):bool{
       
       $id_ricerca= $this->selezionaAllergene($id_allergene);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione Allergene fallita: allergene '{$id_allergene}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->eliminaAllergene($id_allergene);
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Allergene {$id_allergene} fallita: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Allergene {$id_allergene}: eliminato con successo");
        return true;
        
        
    }

    public function cancellaPiatto(int $id_piatto):bool{
       
       $id_ricerca= $this->selezionaPiatto($id_piatto);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione Piatto fallita: piatto '{$id_piatto}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->eliminaPiatto($id_piatto);
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Piatto {$id_piatto} fallita: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Piatto {$id_piatto}: eliminato con successo");
        return true;
        
        
    }

    public function cancellaBevanda(int $id_bevanda):bool{
       
       $id_ricerca= $this->selezionaBevanda($id_bevanda);
       
       if(!$id_ricerca){
            $this->logger->warning("Eliminazione Bevanda fallita: bevanda '{$id_bevanda}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->eliminaBevanda($id_bevanda);
             
        }catch (\Throwable $e) {
             $this->logger->error("Eliminazione Bevanda {$id_bevanda} fallita: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Bevanda {$id_bevanda}: eliminata con successo");
        return true;
        
        
    }
    

    public function modificaBevanda(int $id_bevanda, string $nome_bevanda, float $prezzo, string $descrizione, Alcol $alcol, InMenu $in_menu, array $allergeni_selezionati):bool{
       
       $id_ricerca= $this->selezionaBevanda($id_bevanda);
       
       if(!$id_ricerca){
            $this->logger->warning("Modifica Bevanda fallita: bevanda '{$id_bevanda}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaBevanda($id_bevanda, $nome_bevanda, $prezzo, $descrizione, $alcol, $in_menu, $allergeni_selezionati);
             
        }catch (\Throwable $e) {
             $this->logger->error("Bevanda id {$id_bevanda} non aggiornata: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Bevanda id {$id_bevanda}: aggiornata con successo");
        return true;
        
        
    }

    public function modificaPiatto(int $id_piatto, string $nome_piatto, float $prezzo, string $descrizione, InMenu $in_menu, Categoria $categoria, array $allergeni_selezionati):bool{
       
       $id_ricerca= $this->selezionaPiatto($id_piatto);
       
       if(!$id_ricerca){
            $this->logger->warning("Moidifica Piatto fallita: piatto '{$id_piatto}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaPiatto($id_piatto, $nome_piatto, $prezzo, $descrizione, $in_menu, $categoria, $allergeni_selezionati);
             
        }catch (\Throwable $e) {
             $this->logger->error("Piatto id {$id_piatto} non aggiornato: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Piatto id {$id_piatto}: aggiornato con successo");
        return true;
        
        
    }

    public function togliPiattoMenu(int $id_piatto, InMenu $in_menu):bool{
       
       $id_ricerca= $this->selezionaPiatto($id_piatto);
       
       if(!$id_ricerca){
            $this->logger->warning("Non è possibile rimuovere il Piatto : piatto '{$id_piatto}' non trovato");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaStatoPiatto($id_piatto, $in_menu);
             
        }catch (\Throwable $e) {
             $this->logger->error("Piatto id {$id_piatto} non rimosso dal menu: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Piatto id {$id_piatto}: rimosso dal menu con successo");
        return true;
        
        
    }

    public function togliBevandaMenu(int $id_bevanda, InMenu $in_menu):bool{
       
       $id_ricerca= $this->selezionaBevanda($id_bevanda);
       
       if(!$id_ricerca){
            $this->logger->warning("Non è possibile rimuovere la  Bevanda: bevanda '{$id_bevanda}' non trovata");
            return false;
        }
        #salto l'autorizzazione in base al ruolo
       try {
             $this->menuRepo->aggiornaStatoBevanda($id_bevanda, $in_menu);
             
        }catch (\Throwable $e) {
             $this->logger->error("Bevanda id {$id_bevanda} non rimossa dal menu: {$e->getMessage()}");
             return false;
        }
        $this->logger->info("Bevanda id {$id_bevanda}: rimossa dal menu con successo");
        return true;
        
        
    }
   
    #Altri servicies da implementare alla fine ..
   
}