<?php 
declare(strict_types=1); #serve a attivare il controllo dei tipi
namespace App\Repositories; #namespace è come un "cartella virtuale" per organizzare il codice e evitare conflitti di nomi
use PDO; #importa la classe PDO per lavorare con il database
#creo una nuova classe UserRepositories che rappresenta un repository per gestire gli utenti nel database
class UserRepositories {

     public function __construct(private PDO $pdo){}
     #metodo per ottenere un utente dal database dato il suo username, restituisce un array associativo o null se non trovato
     public function getByUsername(string $username): ?array 
     {
        #preparo la connessione
        $stmt = $this->pdo->prepare('SELECT * FROM utente WHERE username = :username LIMIT 1'); #prepara una query SQL con un parametro
        $stmt->execute(['username' => $username]); #esegue la query sostituendo il parametro con il valore passato
        return $stmt->fetch() ?: null; #restituisce il risultato come array associativo o null se non trovato

     }

     public function getById(int $id):?array
     {
        $stmt =$this->pdo->prepare('
         SELECT * FROM utente WHERE id =:id LIMIT 1');
         $stmt->execute(['id' => $id]);
         return $stmt->fetch() ?:null;
     }

     public function inserisciUTente(string $username, string $email, string $passwordhash, string $ruolo, int $attivo):int{

        $stmt = $this->pdo->prepare('
            INSERT INTO utente (username,email,password,ruolo,attivo) VALUES
            (:username,:email,:password,:ruolo, :attivo)
        ');
        $stmt->execute([
            'username'=>$username,
            'email'=>$email,
            'password'=>$passwordhash,
            'ruolo'=>$ruolo,
            'attivo'=>$attivo
        ]);
        return $this->pdo->lastInsertId();
     }

     public function aggiornaUtente(int $id, string $username, string $email, string $passwordhash, string $ruolo, int $attivo): bool
     {
        $stmt = $this->pdo->prepare('
            UPDATE utente SET username = :username, email = :email, password = :password, ruolo = :ruolo, attivo = :attivo WHERE id = :id
        ');
        $stmt->execute([
            'id' => $id,
            'username' => $username,
            'email' => $email,
            'password' => $passwordhash,
            'ruolo' => $ruolo,
            'attivo' => $attivo
        ]);
        return $stmt->rowCount()>0; #restituisce true se almeno una riga è stata aggiornata, altrimenti false
     }
     public function cambiaStatoAttivo(int $id, int $attivo):bool
     {
        $stmt = $this->pdo->prepare('
            UPDATE utente SET attivo = :attivo WHERE id = :id
        ');
        $stmt->execute([
            'id' => $id,
            'attivo' => $attivo
        ]);
        return $stmt->rowCount()>0;
     }
     public function aggiornaPassword(int $id, string $passwordhash):bool
     {
        $stmt = $this->pdo->prepare('
           UPDATE utente SET PASSWORD = :password WHERE id = :id');
           $stmt->execute([
            'id'=>$id,
            'password'=>$passwordhash
           ]);
          return $stmt->rowCount()>0; 
     }
}