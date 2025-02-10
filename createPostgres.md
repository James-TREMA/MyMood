# Création d'un conteneur PostgreSQL avec Docker

## Commande pour créer et démarrer le conteneur PostgreSQL

```bash
docker run --name mood_tracker_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Test12345 \
  -e POSTGRES_DB=mood_tracker \
  -p 3000:5432 \
  -d postgres
```

### Description des paramètres :
- `--name mood_tracker_db` : Donne un nom au conteneur pour le référencer facilement.
- `-e POSTGRES_USER=postgres` : Spécifie l'utilisateur de la base de données PostgreSQL.
- `-e POSTGRES_PASSWORD=Test12345` : Définit le mot de passe pour cet utilisateur.
- `-e POSTGRES_DB=mood_tracker` : Crée une base de données initiale nommée `mood_tracker`.
- `-p 3000:5432` : Redirige le port 5432 du conteneur vers le port 3000 de l'hôte.
- `-d postgres` : Utilise l'image officielle PostgreSQL et exécute le conteneur en mode détaché.

## Commande pour accéder à PostgreSQL dans le conteneur

```bash
docker exec -it mood_tracker_db psql -U postgres -d mood_tracker
```

### Description des paramètres :
- `docker exec -it mood_tracker_db` : Exécute une commande dans le conteneur `mood_tracker_db`.
- `psql -U postgres -d mood_tracker` : Lance l'outil PostgreSQL pour se connecter à la base de données `mood_tracker` avec l'utilisateur `postgres`.

