<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
use App\Enums\Stato;
use App\Enums\Momento;
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class OrdiniRepositories {

     public function __construct(private PDO $pdo){}
     //ordin COLLEGATE E NON AI TAVOLI
     public function visualizzaTuttiGliOrdini():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora >= CURDATE() AND id_ordine = :id_ordine');
        $stmt->execute(['id_ordine' => $id_ordine]);
        return $stmt->fetchAll() ?:null;
     }
    
     public function visualizzaTuttiGliOrdiniOggi():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora >= CURDATE()');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniDiIeri():?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora < CURDATE()');
        $stmt->execute();
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaTuttiGliOrdiniStato(Stato $nome_stato):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora >= CURDATE() AND nome_stato = :nome_stato ');
        $stmt->execute(['nome_stato' => $nome_stato->value]);
        return $stmt->fetchAll() ?:null;
     }
     public function visualizzaTuttiGliOrdiniMomento(Momento $nome_momento):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora >= CURDATE() AND nome_momento = :nome_momento ');
        $stmt->execute(['nome_momento' => $nome_momento->value]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaIlMomentoDiUnOrdine(int $id_ordine,int $id_momento):?array
     {
        $stmt =$this->pdo->prepare('SELECT * FROM api_tot WHERE data_e_ora >= CURDATE()  AND id_ordine = :id_ordine AND id_momento = :id_momento');
        $stmt->execute([
            'nome_momento' => $id_momento,
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaPiattiDiUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT piatti FROM api_tot WHERE data_e_ora >= CURDATE()  AND id_ordine = :id_ordine ');
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaBevandeDiUnOrdine(int $id_ordine):?array
     {
        $stmt =$this->pdo->prepare('SELECT bevande FROM api_tot WHERE data_e_ora >= CURDATE()  AND id_ordine = :id_ordine ');
        $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        return $stmt->fetchAll() ?:null;
     }

     public function visualizzaOrdiniTavoloAperto(int $id_tavolo, Stato $nome_stato):?array
     {
        $stmt =$this->pdo->prepare(<<<'SQL'
            SELECT  * FROM api_tot
            WHERE data_e_ora >= CURDATE() AND nome_stato = :nome_stato AND id_tavolo = :id_tavolo
        SQL);
        $stmt->execute([
            'id_tavolo' => $id_tavolo,
            'nome_stato' => $nome_stato
        ]);
        return $stmt->fetchAll() ?:null;
     }
     
                 //INSERIMENTI

    public function relazioneOrdineTavolo(int $id_ordine, array $tavoli):bool{

        
        //la js dovra controllare se in quel giorno il tavolo è disponibile per la ordine
        //prevedo che i tavoli siano un array in modo che posso selezionarlo 1 o più
        //dovrà controllare che l'ora di accesso si superiore alle ordine
        //nel conto dovro solo inviare il valore da ordin, si/no
          // FIX: prepare fuori dal loop (PDO permette riuso dello stesso prepared statement)
        $stmt = $this->pdo->prepare('INSERT INTO ordine_tavolo (id_ordine, id_tavolo) VALUES (:id_ordine, :id_tavolo)');
 
        $righeInserite = 0;
        foreach ($tavoli as $id_tavolo) {
            $stmt->execute([
                'id_ordine' => $id_ordine,
                'id_tavolo' => $id_tavolo
            ]);
            $righeInserite += $stmt->rowCount();
        }
        // FIX: true solo se TUTTI i tavoli sono stati inseriti correttamente
        return $righeInserite === count($tavoli);
    }

 
    public function relazioneOrdineStato(int $id_ordine, int $id_stato):bool{

        $stmt = $this->pdo->prepare('INSERT INTO  stato_ordine (id_ordine, id_stato) VALUES (:id_ordine, :id_stato)');
        $stmt->execute([
            'id_ordine'=>$id_ordine,
            'id_stato'=>$id_stato
        ]);
        return $stmt->rowCount()>0;
     }


     public function inserisciOrdine(int $numero_persone):int{

        $stmt = $this->pdo->prepare('INSERT INTO  ordine (numero_persone) VALUES (:numero_persone)');
        $stmt->execute([
            'numero_persone'=>$numero_persone
        ]);
        return $id_ordine = (int)$this->pdo->lastInsertId();
     }

     public function inserisciOrdineBevande(int $id_ordine,int $id_bevanda,int $id_momento, int $quantita):int{

        $stmt = $this->pdo->prepare('INSERT INTO dettaglio_ordine_bar (id_ordine, id_bevanda, id_momento, quantita) VALUES (:id_ordine, :id_bevanda, :id_momento, :quantita)');
        $stmt->execute([
            'id_ordine'=>$id_ordine,
            'id_bevanda'=>$id_bevanda,
            'id_momento'=>$id_momento,
            'quantita'=>$quantita,
            ]);
        return $stmt->rowCount()>0;     
        }

     

     public function inserisciOrdinePiatto(int $id_ordine,int $id_piatto,int $id_momento, int $quantita):int{

        $stmt = $this->pdo->prepare('INSERT INTO dettaglio_ordine_cucina (id_ordine, id_piatto, id_momento, quantita) VALUES (:id_ordine, :id_piatto, :id_momento, :quantita)');
        $stmt->execute([
            'id_ordine'=>$id_ordine,
            'id_piatto'=>$id_piatto,
            'id_momento'=>$id_momento,
            'quantita'=>$quantita,
            ]);
        return $stmt->rowCount()>0;     
        }




  

     //DELETE

     
//domani prevedere elimina la relazione in base id_ordine e poi elimina le relazioni e ordine, inserendole in un file storico in base al giorno s eè passato
//delete di supporto per le relazioni
     public function eliminaRelazioneOrdineTavolo(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM ordine_tavolo WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
         
     }
     

     public function eliminaOrdine(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM ordine WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneOrdinePiatto(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM dettaglio_ordine_cucina WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneOrdineBevanda(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM dettaglio_ordine_bar WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
     }
     //elimana la relazione quando voglio cancellare l'ordine (per esempio se è sbagliato)
     public function eliminaRelazioneOrdineStato(int $id_ordine):bool
     {
        $stmt = $this->pdo->prepare('DELETE FROM stato_ordine WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
        ]);
        
     }

     public function eliminaRelazioneBevandeMomento(int $id_momento):bool{

        $stmt = $this->pdo->prepare('DELETE FROM  dettaglio_ordine_bar WHERE id_momento = :id_momento');
        return $stmt->execute([
            'id_momento' => $id_momento
            ]);  
        }

     public function eliminaRelazioneBevandaMomento(int $id_bevanda):bool{

        $stmt = $this->pdo->prepare('DELETE FROM  dettaglio_ordine_bar WHERE id_bevanda = :id_bevanda');
        return $stmt->execute([
            'id_ordine' => $id_ordine
            ]);  
        }

     public function eliminaRelazionePiattiOrdine(int $id_ordine):bool{

        $stmt = $this->pdo->prepare('DELETE FROM dettaglio_ordine_cucina WHERE id_ordine = :id_ordine');
        return $stmt->execute([
            'id_ordine' => $id_ordine
            ]);  
        }

     public function eliminaRelazionePiattiMomento(int $id_momento):bool{

        $stmt = $this->pdo->prepare('DELETE FROM  dettaglio_ordine_cucina WHERE id_momento = :id_momento');
        return $stmt->execute([
            'id_momento' => $id_momento
            ]);  
        }
     
     public function eliminaRelazionePiattoOrdine(int $id_piatto):bool{

        $stmt = $this->pdo->prepare('DELETE FROM dettaglio_ordine_cucina WHERE id_piatto = :id_piatto');
        return  $stmt->execute([
            'id_ordine' => $id_ordine
            ]);    
        }
   
     //UPDATE
     //nel service deve inviare anche il conto allo scontrino e chiudersi, poi automaticamnete gli ordini di "ieri" saranno cancellati e inseriti nello storico
     public function aggiornaRelazioneOrdineStato(int $id_ordine, int $id_stato):bool
     {
        $stmt = $this->pdo->prepare('UPDATE stato_ordine SET id_stato = :id_stato WHERE id_ordine = :id_ordine');
        $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_stato' => $id_stato
        ]);
        return $stmt->rowCount()>0;
     }
     
     
     //2.aggiorna la Ordine
    public function aggiornaOrdine(int $id_ordine, int $numero_persone): bool
      {
         $stmt = $this->pdo->prepare('UPDATE ordine SET  numero_persone = :numero_persone WHERE id_ordine = :id_ordine');
         $stmt->execute([
            'id_ordine' => $id_ordine,
            'numero_persone'=>$numero_persone
         ]);
         return $stmt->rowCount()>0;
      }

   public function aggiornaTavoloOrdine(int $id_ordine, array $tavoli): bool
   {
      // niente beginTransaction/commit qui dentro -> la transazione
      // viene gestita un livello più in alto, nel Service, perché lì
      // viene chiamata insieme ad aggiornaOrdine() e devono essere atomiche insieme
      $this->eliminaRelazioneOrdineTavolo($id_ordine);
      $esito = $this->relazioneOrdioneTavolo($id_ordine, $tavoli);

      if (!$esito) {
         // lancia eccezione invece di tornare false ->
         // così il catch nel Service intercetta e fa rollBack() su TUTTO
         throw new \RuntimeException("Aggiornamento tavoli fallito per ordine {$id_ordine}");
      }

      return true;
   }
     
// PATCH  Ordini

    public function relazioneBevandeMomentoAggiorna(int $id_bevanda,int $id_momento):bool{

        $stmt = $this->pdo->prepare('UPDATE  dettaglio_ordine_bar SET id_momento = :id_momento WHERE id_bevanda =:id_bevanda ');
        $stmt->execute([
            'id_bevanda'=>$id_bevanda,
            'id_momento'=>$id_momento
            
            ]);
        return $stmt->rowCount()>0;     
        }

    public function relazionePiattoMomentoAggiorna(int $id_piatto,int $id_momento):bool{

        $stmt = $this->pdo->prepare('UPDATE dettaglio_ordine_cucina SET id_momento =:id_momento WHERE  id_piatto =:id_piatto');
        $stmt->execute([
            'id_piatto'=>$id_piatto,
            'id_momento'=>$id_momento
            
            ]);
        return $stmt->rowCount()>0;     
        }


    public function relazioneMomentoBevAggiorna(int $id_ordine,int $id_momento_vecchio,int $id_momento_nuovo ):bool{

    $stmt = $this->pdo->prepare('UPDATE  dettaglio_ordine_bar SET id_momento = :id_momento_nuovo  WHERE id_ordine =:id_ordine AND id_momento =: id_momento_vecchio');
         $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_momento_vecchio' => $id_momento_vecchio,
            'id_momento_nuovo' => $id_momento_nuovo
         ]);
        return $stmt->rowCount()>0;     
        }

    public function relazioneMomentoPiatAggiorna(int $id_ordine,int $id_momento_vecchio,int $id_momento_nuovo ):bool{

    $stmt = $this->pdo->prepare('UPDATE  dettaglio_ordine_cucina SET id_momento = :id_momento_nuovo  WHERE id_ordine =:id_ordine AND id_momento =: id_momento_vecchio');
         $stmt->execute([
            'id_ordine' => $id_ordine,
            'id_momento_vecchio' => $id_momento_vecchio,
            'id_momento_nuovo' => $id_momento_nuovo
         ]);
        return $stmt->rowCount()>0;     
        }
        
    

    public function cambiaQuantitaBevanda(int $id_bevanda,int $quantita):bool{

        $stmt = $this->pdo->prepare('UPDATE dettaglio_ordine_bar SET id_bevanda =:id_bevanda WHERE quantita =: quantita ');
        $stmt->execute([
            'id_bevanda'=>$id_bevanda,
            'quantita'=>$quantita
            
            ]);
        return $stmt->rowCount()>0;     
        }

    public function cambiaQuantitaPiatto(int $id_piatto,int $quantita):bool{

        $stmt = $this->pdo->prepare('UPDATE dettaglio_ordine_cucina SET id_piatto =:id_piatto WHERE quantita =: quantita');
        $stmt->execute([
            'id_piatto'=>$id_piatto,
            'quantita'=>$quantita
            
            ]);
        return $stmt->rowCount()>0;     
        }

        

}

/* 

 Chiudere un ordine

Io farei proprio una funzione dedicata.










*/