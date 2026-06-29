<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class PrenotazioniRepositories {

     public function __construct(private PDO $pdo){}
     //PRENOTAZIONI COLLEGATE E NON AI TAVOLI
     public function visualizzaPrenotazioni():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM tavoli_prenotati ORDER BY  data_in_prenotazione, ora_prenotazione ');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

    public function visualizzaPrenotazione(int $id_prenotazione):?array
    {
        $stmt =$this->pdo->prepare('SELECT * FROM tavoli_prenotati WHERE id_prenotazione = :id_prenotazione LIMIT 1');
        $stmt->execute(['id_prenotazione' => $id_prenotazione]);
        return $stmt->fetch() ?:null;
    }
   
    public function visualizzaPrenotazioniData(string $data_in_prenotazione):?array
    //il js dovra mostrare con con un class warning quelle che non sono state collegate a un conto entro 1 ora dall'orario di prenotazione
     {
        $stmt =$this->pdo->prepare('SELECT * FROM tavoli_prenotati WHERE data_in_prenotazione = :data_in_prenotazione ORDER BY ora_prenotazione, numero_persone DESC ');
        $stmt->execute(['data_in_prenotazione' => $data_in_prenotazione]);
        return $stmt->fetchAll() ?:null;
     }


                //INSERIMENTI

    public function inserisciPrenotazioneTavolo(int $id_prenotazione,array $tavoli):bool{
        
        //la js dovra controllare se in quel giorno il tavolo è disponibile per la prenotazione 
        //prevedo che i tavoli siano un array in modo che posso selezionarlo 1 o più
        foreach($tavoli as $id_tavolo) {
        //dovrà controllare che l'ora di accesso si superiore alle prenotazioni
        //nel conto dovro solo inviare il valore da prenotazione, si/no
        $stmt = $this->pdo->prepare('INSERT INTO tavoli_prenotazione (id_prenotazione, id_tavolo) VALUES (:id_prenotazione, :id_tavolo)');
        $stmt->execute([
            'id_prenotazione'=> $id_prenotazione,
            'id_tavolo'=>$id_tavolo
        ]);
        }
        return $stmt->rowCount()>0;
     }

 
    public function inserisciPrenotazione(string $nome_prenotazione, string $ora_prenotazione, string $data_in_prenotazione, int $attiva, int $numero_persone):bool{

        $stmt = $this->pdo->prepare('INSERT INTO tavoli_prenotazione (nome_prenotazione, ora_prenotazione, data_in_prenotazione, attiva, numero_persone) VALUES (:nome_prenotazione, :ora_prenotazione, :data_in_prenotazione, :attiva, :numero_persone)');
        $stmt->execute([
            'nome_prenotazione'=>$nome_prenotazione,
            'ora_prenotazione'=>$ora_prenotazione,
            'data_in_prenotazione'=>$data_in_prenotazione,
            'attiva'=>$attiva,
            'numero_persone'=>$numero_personeu
        ]);
        $id_bevanda = (int)$this->pdo->lastInsertId();

        //inserimento nella tabella delle relazioni nell' inserimento ho intezione di aggiungere una selezione multipla per ottenere un array di id allergene
        foreach($allergeni_selezionati as $id_allergene) {
        $stmt2 = $this->pdo->prepare('INSERT INTO allergene_bevanda (id_allergene, id_bevanda) VALUES (:id_allergene, :id_bevanda)');
        $stmt2->execute([
        ':id_allergene' => $id_allergene,
        ':id_bevanda'   => $id_bevanda
        ]);
        }
        return $id_bevanda > 0;
     }


     //DELETE
//---------------------------------------arrivata qui---------------------------------------------------
     
//domani prevedere elimina la relazione in base id_prenotazione e poi elimina le relazioni e le prenotazioni, inserendole in un file storico in base al giorno s eè passato
//delete di supporto per le relazioni
     public function eliminaRelazionePrenotazioneTavolo(int $id_prenotazione):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergene_piatto WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto
        ]);
        return $stmt->rowCount()>0;
     }
     

     public function eliminaRelazioneAllergeneBevanda(int $id_bevanda):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM allergene_bevanda WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda
        ]);
        return $stmt->rowCount()>0;
     }

     public function eliminaPiatto(int $id_piatto):bool
     {
        $this->eliminaRelazioneAllergenePiatto($id_piatto);
        $stmt = $this->pdo->prepare('DELETE FROM piatto WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto
        ]);
        return $stmt->rowCount()>0;
     }

     public function eliminaBevanda(int $id_bevanda):bool
     {
        $this->eliminaRelazioneAllergeneBevanda($id_bevanda);
        $stmt = $this->pdo->prepare('DELETE FROM bevanda WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda
        ]);
        return $stmt->rowCount()>0;
     }


     //UPDATE

     //1.cambio stato se in menu o no
     public function aggiornaStatoBevanda(int $id_bevanda, InMenu $in_menu): bool
     {
        $stmt = $this->pdo->prepare('UPDATE bevanda SET in_menu = :in_menu WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }

     public function aggiornaStatoPiatto(int $id_piatto, InMenu $in_menu): bool
     {
        $stmt = $this->pdo->prepare('UPDATE piatto SET in_menu = :in_menu WHERE id_piatto = :id_piatto');
        $stmt->execute([
            'id_piatto' => $id_piatto,
            'in_menu' => $in_menu->value
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }
     //2.aggiorna il l'elemento del menu
    public function aggiornaPiatto(int $id_piatto, string $nome_piatto, float $prezzo, string $descrizione, InMenu $in_menu, Categoria $categoria, array $allergeni_selezionati): bool
      {
         $stmt = $this->pdo->prepare('UPDATE piatto SET nome_piatto = :nome_piatto, prezzo = :prezzo, descrizione = :descrizione, in_menu = :in_menu, categoria = :categoria WHERE id_piatto = :id_piatto');
         $stmt->execute([
            'id_piatto'   => $id_piatto,
            'nome_piatto' => $nome_piatto,
            'prezzo'      => $prezzo,
            'descrizione' => $descrizione,
            'in_menu'     => $in_menu->value,
            'categoria'   => $categoria->value
         ]);

         // elimina e reinserisci sempre, indipendentemente da rowCount
         $this->eliminaRelazioneAllergenePiatto($id_piatto);

         foreach ($allergeni_selezionati as $id_allergene) {
            $stmt2 = $this->pdo->prepare('INSERT INTO allergene_piatto (id_allergene, id_piatto) VALUES (:id_allergene, :id_piatto)');
            $stmt2->execute([
                  ':id_allergene' => (int)$id_allergene,
                  ':id_piatto'    => $id_piatto
            ]);
         }

         return true;
      }
     public function aggiornaBevanda(int $id_bevanda, string $nome_bevanda, float $prezzo, string $descrizione, Alcol $alcol, InMenu $in_menu, array $allergeni_selezionati): bool
     {
        $stmt = $this->pdo->prepare('UPDATE bevanda SET nome_bevanda = :nome_bevanda, prezzo = :prezzo, descrizione = :descrizione, in_menu = :in_menu, alcol = :alcol WHERE id_bevanda = :id_bevanda');
        $stmt->execute([
            'id_bevanda' => $id_bevanda,
            'nome_bevanda' => $nome_bevanda,
            'prezzo' => $prezzo,
            'descrizione' => $descrizione,
            'alcol'=>$alcol->value,
            'in_menu'=>$in_menu->value
            
        ]);
        $this->eliminaRelazioneAllergeneBevanda($id_bevanda);
        
        foreach($allergeni_selezionati as $id_allergene) {
        $stmt2 = $this->pdo->prepare('INSERT INTO allergene_bevanda (id_allergene, id_bevanda) VALUES (:id_allergene, :id_bevanda)');
        $stmt2->execute([
            ':id_allergene' => $id_allergene,
            ':id_bevanda'   => $id_bevanda
        ]);
        }
        return true; 
        

     }

     
     
}